# Jewel Lifestyle Magazine — Technical Documentation

A React single-page application and Express/MongoDB backend for a digital
lifestyle magazine. The site serves editorial content (magazine issues,
interviews, hero slides, team), a public award-voting system, and an
authenticated admin dashboard. Images are stored on ImageKit and delivered
through its CDN.

- How to install, configure and deploy: [SETUP.md](./SETUP.md)
- Performance architecture, caching and voting design: this document

---

## 1. Architecture

```
Browser
  |
  |  GET /                       static SPA (Vercel CDN)
  |  GET /assets/*               hashed JS/CSS, immutable for 1 year
  v
Vercel Edge  ---- cache miss ---->  Express API (api/index.js serverless fn)
  |                                        |
  |  /api/* rewrite                        |  Mongoose
  v                                        v
  <----- CDN-Cache-Control -------------  MongoDB Atlas
```

Two independent pieces ship from one repository:

| Piece | Location | Runs on |
|---|---|---|
| Frontend | `src/` | Vite build to `dist/`, served by Vercel's CDN |
| Backend | `server/`, `api/` | One Express app; a serverless function on Vercel, `node server/index.js` locally |

There is one Express app, not two. `server/index.js` exports the app and calls
`app.listen()` only when `process.VERCEL` is unset. `api/index.js` imports that
same app as the Vercel handler, so a route behaves identically in both
environments and there is no second code path to keep in sync.

### Why a single Vercel function

`vercel.json` rewrites every `/api/*` path to `/api`:

```json
"rewrites": [
  { "source": "/api/(.*)", "destination": "/api" },
  { "source": "/(.*)",     "destination": "/index.html" }
]
```

One function means one warm instance and one connection pool, which is the
right trade for a read-mostly magazine. It also means a cold start after
inactivity: the first request pays for a module load plus a MongoDB handshake.
`server/config/db.js` is written specifically to make that cold path cheap and
self-healing (section 3).

---

## 2. Project layout

```
api/index.js              Vercel serverless entry point
migrate-images.mjs        one-off base64/Cloudinary -> ImageKit migration
vercel.json               build command, rewrites, function config, cache headers

server/
  index.js                Express app assembly, mounts all routes
  config/db.js            connection manager (retry, shared promise, live state)
  config/imagekit.js      ImageKit REST upload helpers
  middleware/auth.js      authenticate / adminOnly / optionalAuth
  middleware/cache.js     publicCache / noCache header helpers
  middleware/clientIp.js  client IP extraction, normalisation, hashing
  models/                 13 Mongoose schemas
  routes/                 11 route modules
  seed.js                 demo content, uploads its images to ImageKit

src/
  api/client.js           fetch wrapper, timeout, safeGet
  utils/imageUrl.js       ImageKit transformation helper + presets
  utils/index.ts          createPageUrl
  page.config.js          route table and lazy-loading boundaries
  pages/                  12 route components
  components/             ui/ (shadcn-style primitives), home/, interviews/, admin/
  components/ProtectedRoute.jsx
```

### Stack

- **Frontend** React 18, Vite 6, React Router 6, Tailwind CSS 3, Framer Motion,
  Lucide icons, Radix UI primitives, Recharts, React Quill
- **Backend** Express 4, Mongoose 8, JWT (`jsonwebtoken`), `bcryptjs`, Multer
- **Hosting** Vercel (SPA + serverless function), MongoDB Atlas
- **Media** ImageKit (upload API + delivery transformations)
- **Type checking** TypeScript 5 is present for editor tooling only. Runtime
  code is `.js`/`.jsx`; there is no type-checking step in the build.

---

## 3. MongoDB connection management

This is the most important piece of infrastructure in the project, and the
original version of it caused a full site outage.

### The failure it fixes

Vercel keeps a serverless module alive between invocations. MongoDB Atlas
closes idle connections after roughly 30 minutes. The old code tracked
connectivity in a module-level boolean:

```js
let dbConnected = false;
// ...
if (!dbConnected) { await mongoose.connect(uri); dbConnected = true; }
```

Once a socket was reaped, the flag stayed `true` forever. `connectDB()` was
skipped, queries buffered against a dead connection, and every request timed
out. Because the flag was shared, **every** API route failed at once — which is
exactly the "Please refresh the page to try again" message that appeared on all
sections of the site. Restarting the function cleared it, which is why the site
sometimes recovered on its own.

### The current approach

`server/config/db.js`:

1. Check `mongoose.connection.readyState === 1` on every call. A dead socket
   reports `0`, so state is never stale.
2. Memoise the in-flight connection in a module-level promise, so concurrent
   requests during a cold start share one handshake instead of opening several.
3. Retry with backoff, so a briefly unreachable Atlas does not fail the request.
4. Attach `disconnected` and `error` listeners that clear the memo, so the next
   request reconnects immediately rather than waiting for backoff.

`api/index.js` awaits `connectDB()` before dispatching. If the connection cannot
be established it returns **503** with a diagnostic body naming `MONGODB_URI` and
the Atlas IP access list, instead of hanging until the function times out. A
fast, informative 503 is far easier to diagnose than a 30-second hang.

Pool settings are bounded (`maxPoolSize: 10`, `minPoolSize: 1`,
`serverSelectionTimeoutMS: 10000`) so an idle function does not hold Atlas
sockets open and a burst does not exhaust them.

> **Deployment note:** Atlas must allow the Vercel runtime to reach it. Since
> Vercel egress addresses are dynamic, set the Atlas IP access list to
> `0.0.0.0/0` (with strong credentials) or the API will fail in production while
> working perfectly on your laptop.

---

## 4. Image storage and delivery

### Storage

Images live on **ImageKit**, not in MongoDB. Documents store only a URL
(typically 60–105 bytes). `server/config/imagekit.js` calls the ImageKit REST
upload API directly with `fetch`; no ImageKit SDK is installed, which keeps the
serverless bundle small.

Three functions are exported:

| Function | Purpose |
|---|---|
| `isConfigured()` | True when all three `IMAGEKIT_*` vars are present |
| `uploadBuffer(buffer, { fileName, folder })` | Upload raw bytes, return CDN URL |
| `uploadDataUrl(dataUrl, options)` | Decode a base64 data URL, then upload |
| `migrateRemoteUrl(remoteUrl, options)` | Fetch a remote image, re-upload it |

`fileName` is sent both as the `Blob` filename and as a separate form field.
ImageKit rejects uploads whose `Blob` has no name with
`"Your request is missing fileName paramater"`, so the duplicate field is
deliberate, not redundant.

`POST /api/upload` is admin-only and passes Multer's in-memory buffer straight
through. `server/seed.js` uploads the files in `images/` to a `seed` folder and
stores the returned URLs, falling back to a placeholder if ImageKit is not
configured.

### Why images were removed from MongoDB

The previous code converted uploads to `data:` URLs and wrote them into Mongo
documents. Base64 inflates by ~37%, and MongoDB has a hard 16MB document limit:

| Image | Raw | As base64 |
|---|---|---|
| Qorazon_Tshirt_Black.png (1920×1920) | 4.9MB | 6.7MB |
| Qorazon_Secondary (1920×1920) | 2.5MB | 3.4MB |

Four nominees of that size in one category is **19.7MB as base64** — over the
limit, so the insert fails and the awards page breaks. It was also a direct
cause of high Vercel origin transfer, since multi-megabyte JSON was re-sent on
every request.

### Delivery: on-the-fly transformations

Storing a URL is only half the job. A `<img src=".../photo.png">` downloads the
full-resolution original, so a 1920×1920 PNG still cost hundreds of kilobytes per
image after the storage fix.

`src/utils/imageUrl.js` appends an ImageKit transformation:

```js
imageUrl(record.cover_image_url, presets.card)
// https://ik.imagekit.io/<id>/seed/cover_abc.jpg?tr=w-800,q-70,f-webp
```

Presets: `card` (w800), `thumbnail` (w400), `avatar` (w200 h200, `c-main` crop),
`hero` (w1920), `detail` (w1400). All default to `f-webp` at `q-70`.

Measured on the two 1920×1920 test PNGs:

| Image | Original delivered | `presets.card` | `presets.avatar` |
|---|---|---|---|
| Qorazon_Tshirt | 278.6KB | 12.1KB | 1.9KB |
| Qorazon_Secondary | 175.8KB | 10.2KB | 1.6KB |

Two safety behaviours are worth knowing:

- **Only ImageKit URLs are transformed.** Cloudinary URLs, `placehold.co`
  placeholders, `data:` URLs, `null` and `undefined` are returned untouched, so
  legacy records cannot break rendering. This also means non-ImageKit images get
  no compression benefit — run the migration to fix that.
- **WebP degrades to JPEG** when the browser lacks support, detected once via
  `canvas.toDataURL('image/webp')`.

Applied in `InterviewCard`, `CoverStoriesCarousel`, `SpotlightAwards`,
`DigitalMagazine`, `InterviewDetail` (hero) and `Advertise` (team avatars).
Admin components intentionally load originals, since those views are for
identifying a specific file and the traffic is negligible.

`loading="lazy"` is set on below-the-fold images; the interview hero uses
`fetchPriority="high"` because it is the LCP element.

### Transformation parameters

| Parameter | Effect |
|---|---|
| `w-N` / `h-N` | Target dimensions |
| `q-N` | Quality 1–100 |
| `f-webp` / `f-jpg` / `f-png` | Output format |
| `c-main` | Crop focus when both dimensions are given |

---

## 5. Caching strategy

Vercel's edge honours `s-maxage`, not `max-age`, so the distinction matters.
`server/middleware/cache.js` provides two helpers.

`publicCache(seconds, staleSeconds)` — for public GETs:

```
Cache-Control:      public, max-age=0, s-maxage=60, stale-while-revalidate=300
CDN-Cache-Control:  public, s-maxage=60, stale-while-revalidate=300
```

`max-age=0` tells the browser to revalidate, while the edge serves the cached
copy and refreshes in the background. `stale-while-revalidate` is what converts
misses into hits: a stale entry is served immediately and one background request
refreshes it.

`noCache` — for anything private:

```
Cache-Control:      no-store, no-cache, must-revalidate
CDN-Cache-Control:  no-store
```

Applied to `auth` and all admin mutating routes, vote submission, and vote
tallies. An authenticated vote count must never be served from an edge cache.

Current TTLs (`s-maxage` / `stale-while-revalidate`):

| Endpoint | s-maxage | stale |
|---|---|---|
| `/api/award-categories` | 60s | 300s |
| `/api/heroes` | 120s | 300s |
| `/api/executives` | 120s | 300s |
| `/api/executives/:id` | 300s | 900s |
| `/api/magazines` | 180s | 600s |
| `/api/magazines/current`, `/api/magazines/:id` | 300s | 900s |
| `/api/team` | 600s | 1800s |
| `/api/awards/categories`, `/api/awards/winners` | 300s | 900s |

`/api/awards/nominations` is `no-store` rather than cached, since it exposes
contact details of people who submitted nominations.

### Payload reductions

List endpoints use `.select()` to drop large body fields, since the frontend
never renders them:

| Endpoint | Before | After |
|---|---|---|
| `GET /api/executives` | 9.2KB | 2.9KB |
| `GET /api/magazines` | 2.3KB | 2.3KB |

Detail endpoints keep their bodies — the article text is the page.

### Static assets

From `vercel.json`:

```
/assets/*    Cache-Control: public, max-age=31536000, immutable
/index.html  Cache-Control: public, max-age=0, s-maxage=3600, stale-while-revalidate=86400
```

Asset filenames are content-hashed by Vite, so a year-long immutable cache is
safe. `index.html` revalidates hourly so a deploy reaches users quickly.

---

## 6. Bundle size and code splitting

`src/page.config.js` eager-loads only `Home`; all other pages use
`React.lazy`. This matters more than it looks: `AdminDashboard` pulls in jspdf,
html2canvas and Recharts, none of which a reader needs.

| | Before | After |
|---|---|---|
| Initial JS (raw) | 655KB | 391KB |
| Initial JS (gzip) | 188KB | 125KB |
| Admin chunk | bundled into main | 103KB, lazy |

Hero images are the other half of first-paint cost, which is what the ImageKit
transformations address.

---

## 7. Frontend error isolation

`Promise.all` on the home page meant a single failed request rejected the whole
batch and blanked every section — the same all-or-nothing symptom as the
database bug. `src/api/client.js` now exposes `safeGet`, which resolves to
`null` on failure instead of throwing:

```js
const [heroes, mags, team] = await Promise.all([
  api.safeGet('/heroes'),     // never throws
  api.safeGet('/magazines'),
  api.safeGet('/team'),
]);
```

Sections that load render normally; only the failed ones show the refresh
prompt. `api.safeGet` also enforces a timeout, so a hung request surfaces as a
section-level failure rather than an indefinite spinner.

---

## 8. Queued voting

### Why votes are queued

Voting used to write straight to `awardvotes`. That made a spike in traffic a
spike of inserts, and every insert contends on the unique index — enough
concurrent writes will exhaust connections on a small cluster.

`POST /api/award-categories/vote` now returns **202** after one small insert
into `queuedvotes`. That is the only write on the request path. A drain then
moves entries into `awardvotes` in batches of 100, so the index is touched once
per batch instead of once per vote, and the burst is smoothed rather than
passed through.

The queue lives in MongoDB, not process memory, so an instance being recycled
or a deploy cannot lose a vote. Entries do not expire; a drain runs whenever
the instance is alive to run one, and the next request or admin view picks up
whatever is left.

```
voter  -> POST /vote -> 202 --+
                              +-> queuedvotes --drain(100)--> awardvotes
admin  -> GET /:id/votes ----+        ^
                               drain also runs here and on export
```

### Drain

Documents are claimed with `findOneAndDelete`, which is atomic, so two
instances draining at once cannot both take the same vote. A failed write is
re-queued rather than dropped, except on a duplicate-key error, where the
queued copy is discarded because the device already has a stored vote.

### What the voter sees

The confirmation popup states the vote has been recorded, not counted. That is
accurate: 202 means accepted and durable, not yet written.

### What the admin sees

`GET /api/award-categories/:id/votes` flushes the queue before reading, then
returns `{ votes, queued }`. The panel shows the pending count beside the
total, so a tally is never quietly missing votes.

### Export

`GET /api/award-categories/export/votes.zip` is admin-only and flushes the
queue first. The archive contains:

| File | Contents |
|---|---|
| `spotlight-awards-votes.xlsx` | Overview, Tally and All votes worksheets |
| `votes-tally.csv` | One row per nominee, with share of category votes |
| `votes-detail.csv` | One row per individual vote |
| `README.txt` | What each file holds, and a note on the queue |

Categories with no votes appear as `(no votes yet)` so an empty shortlist reads
as a gap rather than an oversight.

Both the ZIP container and the XLSX are written by hand in
`server/utils/zip.js` and `server/utils/voteExport.js`, so no compression or
spreadsheet dependency is added to the serverless bundle. Cell text is escaped,
and a leading `=`, `+`, `-` or `@` is prefixed with an apostrophe so a
voter-supplied name cannot become a formula in Excel.

---

## 9. Award voting and the IP limit

### Model

`AwardCategory` holds nominees inline, each with a name, title, company, image
and bio. `vote_type` is `single` or `multi`. `AwardVote` records the selected
nominee names plus a `voter_ip_hash`.

### One vote per device

`server/middleware/clientIp.js`:

1. **Extract** — `x-forwarded-for` (left-most entry is the original client), then
   `x-real-ip`, then the socket address.
2. **Normalise** — strip the `::ffff:` IPv4-mapped prefix, strip a `%zone` index,
   lowercase. This stops `::ffff:1.2.3.4` and `1.2.3.4` voting twice.
3. **Hash** — `SHA-256(VOTE_IP_SALT + ':' + normalised)`.

Only the hash is stored. Raw addresses would keep personal data in the votes
collection.

### Enforcement

Two layers, because either alone is insufficient:

- An up-front `findOne` returns a clear **409** for a repeat voter.
- A **partial unique index** on `{ category_id: 1, voter_ip_hash: 1 }` is the
  actual guarantee — two concurrent requests can both pass the existence check,
  and only the index rejects the loser. `err.code === 11000` is mapped to the
  same 409.

The index is `partialFilterExpression: { voter_ip_hash: { $type: 'string' } }` so
documents written before this feature, which have no hash, remain valid.

The limit is **per category**. A reader can vote in each award category but only
once per category.

Verified end to end: first vote 201, repeat 409, `::ffff:`-mapped duplicate 409,
different IP 201, concurrent double vote 201/409, invalid nominee 400, rejected
votes not persisted.

### Honest limitations

IP limiting deters casual repeat voting; it is not identity verification.

- **VPNs and proxies** bypass it outright.
- **Mobile carrier CGNAT** puts many unrelated users behind one public IP, so
  legitimate voters can be blocked from each other.
- **Households** share an address.

If vote integrity materially affects the outcome, verify email addresses at vote
time and store that claim instead.

### Changing the salt

`VOTE_IP_SALT` is read at module load. Changing it re-hashes nothing, so every
previously stored hash stops matching and existing voters can vote again. Treat
it as permanent once votes exist. If it is unset the code falls back to
`JWT_SECRET`, which works but mixes two unrelated purposes — set it explicitly.

---

## 10. Authentication

`server/middleware/auth.js` exposes `authenticate`, `adminOnly` and
`optionalAuth`. `authenticate` verifies the `Authorization: Bearer <token>`
header against `JWT_SECRET`; `adminOnly` additionally requires `role: 'admin'`.
`/api/auth/register` and `/api/auth/login` issue tokens; `/api/auth/me`
validates one. Passwords are hashed with `bcryptjs`.

Every mutating route is `authenticate` + `adminOnly`. The single `User` schema
has `role` with `enum: ['admin']`, so the system is admin-only by design — there
are no reader accounts.

Public write endpoints (subscribe, story submission, ad inquiry, nomination,
vote) are deliberately unauthenticated.

---

## 11. Data model

| Model | Purpose | Image fields |
|---|---|---|
| `User` | Admin accounts (bcrypt + JWT) | — |
| `HeroSlide` | Homepage carousel slides | `image_url` |
| `ExecutiveInterview` | Interviews and cover stories | `headshot_url`, `cover_image_url` |
| `MagazineIssue` | Digital magazine issues | `cover_image_url` |
| `TeamMember` | About page team | `photo_url` |
| `AwardCategory` | Award categories with inline nominees | `nominees[].image` |
| `AwardVote` | Votes, keyed by category | — |
| `QueuedVote` | Votes awaiting a write, drained in batches | — |
| `AwardWinner` | Past winners | `photo_url` |
| `AwardNomination` | Public nomination submissions | — |
| `SpotlightAward` | Spotlight copy | — |
| `StorySubmission` | Reader story pitches | `attachment_url` |
| `AdInquiry` | Advertising enquiries | — |
| `Subscriber` | Newsletter list (unique email) | — |

Content models (`ExecutiveInterview`, `MagazineIssue`) share a
`status` of `Draft` / `Scheduled` / `Published`, plus `is_featured`,
`is_cover_story` and `is_current` flags.

---

## 12. API reference

Public unless marked 🔒 admin-only or 🔑 authenticated.

### Auth
| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/register` | Issues a token |
| POST | `/api/auth/login` | Issues a token |
| GET | `/api/auth/me` | 🔑 Validates a token |

### Content
| Method | Path | Cache | Notes |
|---|---|---|---|
| GET | `/api/heroes` | 120s | Active slides only |
| GET | `/api/heroes/all` | no-store | Includes inactive, 🔒 |
| GET | `/api/magazines` | 180s | Slim projection |
| GET | `/api/magazines/current` | 300s | `is_current` issue |
| GET | `/api/magazines/:id` | 300s | Full document |
| GET | `/api/executives` | 120s | Drops `content` |
| GET | `/api/executives/:id` | 300s | Full document |
| GET | `/api/team` | 600s | Ordered |

### Awards and voting
| Method | Path | Cache | Notes |
|---|---|---|---|
| GET | `/api/award-categories` | 60s | `?year=`, `?active=` |
| GET | `/api/award-categories/:id` | 60s | |
| POST | `/api/award-categories/vote` | no-store | 202 queued, 409 repeat, 400 invalid |
| GET | `/api/award-categories/:id/votes` | no-store | 🔒 returns `{ votes, queued }` |
| GET | `/api/award-categories/export/votes.zip` | no-store | 🔒 xlsx + csv archive |
| GET/POST/PUT/DELETE | `/api/awards/categories` | 300s / no-store | 🔒 writes uncached |
| GET/POST/PUT/DELETE | `/api/awards/winners` | 300s / no-store | 🔒 writes uncached |
| GET/POST/PUT/DELETE | `/api/awards/nominations` | no-store | 🔒 contact details, never cached |

### Public submissions
| Method | Path | Notes |
|---|---|---|
| POST | `/api/subscribers` | Newsletter signup |
| POST | `/api/stories` | Story pitch, optional attachment |
| POST | `/api/inquiries` | Advertising enquiry |
| POST | `/api/upload` | 🔒 ImageKit upload, returns `file_url` |

### Health
| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | Always `no-store` |

---

## 13. Configuration reference

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB Atlas connection string |
| `JWT_SECRET` | yes | Signs and verifies auth tokens |
| `IMAGEKIT_PUBLIC_KEY` | for uploads | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | for uploads | ImageKit private key, **server-side only** |
| `IMAGEKIT_URL_ENDPOINT` | for uploads | `https://ik.imagekit.io/<id>`, no trailing slash |
| `VOTE_IP_SALT` | recommended | Salt for vote IP hashing; set once and keep stable |
| `PORT` | no | Local server port, default 5000 |

Copy `.env.example` to `.env` and fill it in. Add the same variables to the
Vercel project's environment settings — a local `.env` is invisible to Vercel.
Never commit `.env`.

---

## 14. Operational notes

**Vercel environment.** The API needs `MONGODB_URI`, `JWT_SECRET`, the three
`IMAGEKIT_*` keys and `VOTE_IP_SALT`. Omitting any of them is the most common
cause of a site that builds fine and returns 503s in production.

**Atlas access list.** Must permit Vercel egress (`0.0.0.0/0` with strong
credentials, or the deployment's address range).

**Cold starts.** The first request after an idle period pays a module load plus
a MongoDB handshake. `server/config/db.js` handles reconnection automatically;
`stale-while-revalidate` on public GETs means most visitors never see it.

**Migrating existing images.** `npm run migrate:images` converts `data:` and
Cloudinary URLs in `HeroSlide`, `MagazineIssue`, `ExecutiveInterview`,
`TeamMember`, `AwardWinner` and `AwardCategory` to ImageKit. It is idempotent —
values already on ImageKit are skipped — so it is safe to re-run. Back up Atlas
first, and note that Cloudinary uploads are copied, not deleted.

**Debugging a blank section.** Check `/api/health`, then the single endpoint the
section needs. A 503 body names the missing config; a 409 on vote means the
device already voted in that category.

**Known gaps.**
- The frontend still posts uploads through the Vercel function. That keeps the
  private key off the client but means image bytes transit the function once.
  Direct browser-to-ImageKit uploads using signed tokens would remove that hop;
  it needs a token endpoint and per-folder limits to avoid an open upload proxy.
- `imageUrl` only transforms `ik.imagekit.io` URLs, so any image still on
  Cloudinary gets no compression until migrated.
- IP-based vote limiting is defeatable; see section 9.
- `npm run lint` reports pre-existing unused-import errors in files unrelated to
  these changes. The build does not depend on lint passing.
