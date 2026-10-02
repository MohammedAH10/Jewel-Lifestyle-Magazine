# Setup Guide — Jewel Lifestyle Magazine

Everything needed to run this project locally and deploy it to Vercel.
For how the system works, see [README.md](./README.md).

---

## 1. Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | 20 LTS or newer | `node -v` |
| npm | 10 or newer | `npm -v` |
| MongoDB | Atlas cluster, or local | — |
| ImageKit | Account with a URL endpoint | — |

Node 18 or older will fail. The code uses `Blob`, `FormData` and global
`fetch`, which require Node 18+, and Node 20 is what Vercel provides.

---

## 2. Install

```bash
git clone <your-repo-url>
cd Jewel-Lifestyle-Magazine
npm install
```

The repository is an ES module project (`"type": "module"` in `package.json`),
so all backend files use `import`/`export`.

---

## 3. Environment variables

```bash
cp .env.example .env
```

Then fill in `.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/jewel-magazine?retryWrites=true&w=majority
JWT_SECRET=<long random string>

IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/<your_id>

VOTE_IP_SALT=<long random string>
```

### Where to get each value

**`MONGODB_URI`** — MongoDB Atlas → Connect → Drivers → Node.js. Replace
`<password>` with the real password from **Database Access**, and URL-encode it
if it contains `@ : / # ?`.

**`JWT_SECRET`** — generate one:

```bash
openssl rand -hex 32
```

**`VOTE_IP_SALT`** — another independent value, also from
`openssl rand -hex 32`. It salts the hashes of voter IP addresses. It is not
something to download; you make it. Read the warning below before setting it.

**The three `IMAGEKIT_*` values** — ImageKit dashboard → **Developer Options**:

| Variable | Where | Looks like |
|---|---|---|
| `IMAGEKIT_PUBLIC_KEY` | API Keys → Public key | `public_xxxxxxxxxxxx` |
| `IMAGEKIT_PRIVATE_KEY` | API Keys → Private key | `private_xxxxxxxxxxxx` |
| `IMAGEKIT_URL_ENDPOINT` | Endpoint, at top of dashboard | `https://ik.imagekit.io/<id>` |

Notes on the endpoint:

- It must start with `https://ik.imagekit.io/`
- No trailing slash
- It is a public URL prefix, not a secret. The private key is the secret.

### About `VOTE_IP_SALT`

**What it is.** A random string mixed into the SHA-256 hash of each voter's IP
address before it is stored, so the votes collection holds only irreversible
hashes rather than personal IP data.

**Where to get it.** You generate it yourself — there is nothing to download or
request:

```bash
openssl rand -hex 32
```

Paste the output into `VOTE_IP_SALT`.

**Can you leave it blank?** The code falls back to `JWT_SECRET`, and voting
still works. Set it explicitly anyway: reusing one secret for two unrelated
purposes means a leaked `JWT_SECRET` also exposes vote-hash inputs, and if
`JWT_SECRET` ever needs rotating, every existing voter hash silently stops
matching and the same people can vote again.

**One important warning.** Treat this value as permanent. If you change or lose
it, previously stored hashes no longer match new ones, so the one-vote-per-device
limit resets for everyone and stored votes cannot be matched back to their
devices. Store it in Vercel's environment settings and in a password manager.
Do not commit `.env`.

### Verify your `.env`

```bash
node -e "require('dotenv').config(); const k=['MONGODB_URI','JWT_SECRET','IMAGEKIT_PUBLIC_KEY','IMAGEKIT_PRIVATE_KEY','IMAGEKIT_URL_ENDPOINT','VOTE_IP_SALT']; k.forEach(n=>console.log((process.env[n]?'  OK   ':'  MISS ')+n))"
```

Every line should read `OK`. If ImageKit is configured but the other three
ImageKit values are blank, check for a stray trailing space or a missing
`IMAGEKIT_` prefix.

You can confirm ImageKit credentials against the live API:

```bash
node -e "
require('dotenv').config();
const img = new FormData();
img.append('file', new Blob([Buffer.from('test')], 'test.txt'), 'connectivity-test.txt');
img.append('fileName', 'connectivity-test.txt');
img.append('useUniqueFileName', 'true');
fetch('https://upload.imagekit.io/api/v1/files/upload', {
  method: 'POST',
  headers: { Authorization: 'Basic ' + Buffer.from(process.env.IMAGEKIT_PRIVATE_KEY + ':').toString('base64') },
  body: img,
}).then(r => r.json()).then(j => console.log(j.url ? 'ImageKit OK -> ' + j.url : 'ImageKit FAILED: ' + j.message));
"
```

A returned URL means the credentials are good. Delete that test file from the
ImageKit dashboard afterwards. Note that `fileName` must be sent both on the
`Blob` and as its own field — ImageKit rejects nameless blobs with
`"Your request is missing fileName paramater"`.

---

## 4. MongoDB setup

### Using Atlas

1. Create a free M0 cluster.
2. **Database Access** → add a user with a generated password.
3. **Network Access** → allow access. For local development add your own IP. For
   Vercel you must also allow `0.0.0.0/0`, because Vercel's egress addresses are
   not fixed. Use a strong database password, since this permits access from
   anywhere.
4. Copy the connection string into `MONGODB_URI`.

### Using a local MongoDB

```
MONGODB_URI=mongodb://127.0.0.1:27017/jewel-magazine
```

ImageKit is still required; only the database is local.

---

## 5. Run locally

Two processes: the API on 5000, the Vite dev server on 5173.

```bash
# terminal 1 — API
npm run server

# terminal 2 — frontend
npm run dev
```

Open <http://localhost:5173>. Vite proxies `/api` to `http://localhost:5000`
(see `vite.config.js`), so the frontend calls relative paths exactly as it does
in production.

### Both at once

```bash
./start.sh
```

Starts both in the background, checks `/api/health`, prints the URLs, and
reports the PIDs. Logs go to `/tmp/jewel-server.log` and `/tmp/jewel-vite.log`.

> `start.sh` prints a default admin login. Change that password before exposing
> the site anywhere.

### Create the first admin

```js
// node create-admin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './server/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
await User.create({
  email: 'you@example.com',
  name: 'Your Name',
  password: await bcrypt.hash('choose-a-strong-password', 10),
  role: 'admin',
});
await mongoose.disconnect();
console.log('Admin created');
```

Log in at `/Login`, then manage content at `/AdminDashboard`.

---

## 6. Seed demo content (optional)

```bash
node server/seed.js
```

Uploads every file in `images/` to ImageKit under a `seed` folder, writes the
returned URLs into MongoDB, and creates sample interviews, magazine issues, team
members and heroes. Requires working ImageKit keys; without them it warns and
falls back to `placehold.co` images.

The script is safe to re-run but will duplicate content rows.

---

## 7. Seed the Spotlight Awards categories

`npm run seed:awards`

Each sub-folder of `JewelSpotlightAwardsNominees/` is one award category and
each image in it is one nominee. Images upload to ImageKit under
`spotlight-awards/` and only the URL is stored.

```bash
JewelSpotlightAwardsNominees/
  Beauty and Makeup Brand of the Year/
    photo1.jpg
    photo2.jpg
  MSME of the Year Awards/
    ...
```

What to expect:

- **Nominees get numbered placeholder names** like `MSME of 1`. The filenames
  carry no information about who or what they depict, and the schema requires
  a name. Replace each one in **Admin → Awards**, where you can also set the
  title and company.
- **Four categories are multi-select** (brand of the year, both fashion brand
  categories, food and beverage). Change `vote_type` in the admin panel if a
  category should be single choice.
- **Re-running is safe.** Categories are matched by name and existing nominee
  labels are skipped, so adding images to a folder and re-running adds only the
  new ones.
- **The folder is not committed** (see `.gitignore`); keep your own copy of the
  source images.

Set the year explicitly if it is not the current one:

```bash
AWARDS_YEAR=2026 npm run seed:awards
```

Categories whose folder is empty are still created, with no nominees. Add
those nominees in the admin panel or drop images into the folder and re-run.

---

## 8. Migrate existing images to ImageKit

If the database already holds `data:` URLs or Cloudinary links, convert them:

```bash
npm run migrate:images
```

Covers `HeroSlide.image_url`, `MagazineIssue.cover_image_url`,
`ExecutiveInterview.headshot_url` and `cover_image_url`,
`TeamMember.photo_url`, `AwardWinner.photo_url`, and
`AwardCategory.nominees[].image`.

Details worth knowing:

- **Idempotent.** Values already hosted on ImageKit are skipped, so re-running
  is safe.
- **Back up Atlas first.** The script overwrites fields in place.
- **Cloudinary copies, does not delete.** Originals stay in your Cloudinary
  account; delete them there yourself once satisfied.
- **Order matters for the frontend.** Only `ik.imagekit.io` URLs get on-the-fly
  compression, so migrate before expecting smaller images. Until then, legacy
  images still load at full size.
- **Why it is worth doing.** Base64 images in MongoDB risk the 16MB document
  limit. Four 1920×1920 PNG nominees as base64 is roughly 19.7MB, which fails
  to insert and breaks the awards page.

---

## 9. Build and verify

```bash
npm run build     # output to dist/
npm run preview   # serve dist/ locally
npm run lint      # ESLint
```

The build must succeed; `npm run lint` currently reports pre-existing
unused-import errors in files unrelated to this work and is not a build gate.

Check a production build end to end:

```bash
npm run build && npm run preview
```

Then, against the preview server:

```bash
curl -i http://localhost:4173/api/health
```

---

## 10. Deploy to Vercel

### Steps

1. Push the branch to GitHub.
2. Vercel → **Add New** → **Project** → import the repository.
3. Framework preset: **Vite**. Vercel reads `vercel.json`, so build command,
   output directory and rewrites are already defined.
4. **Settings** → **Environment Variables** → add all of:

   ```
   MONGODB_URI
   JWT_SECRET
   IMAGEKIT_PUBLIC_KEY
   IMAGEKIT_PRIVATE_KEY
   IMAGEKIT_URL_ENDPOINT
   VOTE_IP_SALT
   ```

   Mark all of them for **Production**, **Preview** and **Development**.

5. **Network Access** on the Atlas cluster must allow Vercel's egress
   (`0.0.0.0/0`).
6. Deploy.

> A local `.env` is not visible to Vercel. Omitting these variables produces a
> site that builds successfully and returns 503 on every API call — the most
> common deployment failure here.

### Environment variables by environment

Set `VOTE_IP_SALT` to the **same value** in Production and Preview. Different
salts mean votes cast in preview do not block votes in production.

### After deploying

```bash
curl -i https://<your-domain>/api/health
curl -sI https://<your-domain>/assets/ | grep -i cache-control
```

A healthy `api/health` returns `200` with `Cache-Control: no-store`. Public
content endpoints should show `s-maxage`:

```bash
curl -sI https://<your-domain>/api/award-categories | grep -iE "cache-control|cdn"
```

### Redeploying

Any change to environment variables requires a redeploy to take effect.

---

## 11. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Every section shows "Please refresh the page" | API failing wholesale | Check `/api/health`; inspect Vercel function logs |
| `503 Database unavailable` | `MONGODB_URI` missing or unreachable | Verify the variable exists; confirm the Atlas IP access list allows `0.0.0.0/0` |
| Boot error: "does not name a database" | `MONGODB_URI` has no database path | Add it: `...mongodb.net/jewel-magazine?...`. Without it MongoDB silently uses a database called `test` and every write lands there. The API now refuses to start rather than do this |
| New votes or admin edits are not in `jewel-magazine` | Wrong database in the env var | Confirm the URI ends in `/jewel-magazine`. Atlas shows the database under the cluster, so check the database name, not just the cluster |
| Pages load locally, 503 in production | Env vars not set on Vercel | Add all six variables, redeploy |
| "ImageKit is not configured" on upload | An `IMAGEKIT_*` value is blank | Re-copy from ImageKit → Developer Options; check for trailing spaces |
| `"Your request is missing fileName paramater"` | `fileName` not sent to ImageKit | Must be set on both the `Blob` and as a form field |
| `"MongooseServerSelectionError: Server selection timed out"` | Atlas unreachable | IP access list, or a cold cluster still starting |
| `EAI_AGAIN` / timeouts from local scripts | Intermittent network or IPv6 loss | Retry; the upload and DB code already retry with backoff |
| `Vote rejected: already voted` | That device voted in that category | Expected. Votes are one per device per category |
| Admin shows a pending vote count | Votes queued, not yet written | Normal. It drains on the next vote, tally or export |
| Export shows 0 votes | Queue never drained | Open the Votes tab first, or re-export |
| `Vote rejected` for everyone in a category | Shared carrier NAT | See the CGNAT note in README section 9 |
| "MongoDB document is too large" | Base64 image still in a document | Run `npm run migrate:images` |
| Images not shrinking after migration | URLs are not `ik.imagekit.io` | Check the stored value; non-ImageKit URLs are left untouched by `imageUrl` |
| `npm run lint` shows errors | Pre-existing unused imports | Not a build gate; fix separately if wanted |
| 404 on a client-side route | Rewrite missing | `vercel.json` must keep `/(.*)` → `/index.html` |

### Resetting the vote limit

Deleting all `awardvotes` documents clears the limit, but is rarely what you
want. It cannot be undone per voter: changing `VOTE_IP_SALT` invalidates
existing hashes, and old hashes cannot be recomputed. Deleting the collection
is the only true reset, and it destroys the vote records.

---

## 12. Routine tasks

**Add an award category:** Admin → Awards → create a category, set
`vote_type` to `single` or `multi`, add nominees, toggle `active`. Inactive
categories reject votes with 400.

**Publish an interview:** Admin → Interviews → set status to `Published`.
Scheduling also needs `scheduled_date`.

**Set the current magazine issue:** Admin → Magazine → toggle `is_current` on
one issue. `GET /api/magazines/current` returns that document.

**Change the admin password:** No self-service UI exists. Hash a new password
with `bcryptjs` and update the `User` document, or write a small script.

**Rotate `JWT_SECRET`:** Safe for auth — it invalidates existing sessions so
everyone logs in again. It also resets the vote limit if `VOTE_IP_SALT` is
unset, so set `VOTE_IP_SALT` first.

---

## 13. Command reference

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server on 5173 |
| `npm run server` | Express API on 5000 |
| `./start.sh` | Both, in the background |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint across the repo |
| `npm run migrate:images` | Convert stored images to ImageKit |
| `npm run seed:awards` | Create award categories from the nominee folders |
| `node server/seed.js` | Seed demo content |
