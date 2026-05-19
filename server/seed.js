import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jewel-magazine';
const IMAGES_DIR = path.resolve(__dirname, '..', 'images');
const USE_CLOUDINARY = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

if (USE_CLOUDINARY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function uploadImage(filePath) {
  const filename = path.basename(filePath);
  if (USE_CLOUDINARY) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'jewel-magazine/seed',
        public_id: path.parse(filename).name,
      });
      console.log(`  Uploaded ${filename} -> ${result.secure_url}`);
      return result.secure_url;
    } catch (err) {
      console.error(`  Failed to upload ${filename} to Cloudinary:`, err.message);
      return null;
    }
  }
  const publicPath = `/seed-images/${filename}`;
  console.log(`  Using local path for ${filename} -> ${publicPath}`);
  return publicPath;
}

function img(urls, name) {
  return urls[name] || null;
}
function imgOrPlaceholder(urls, name, placeholder) {
  return urls[name] || placeholder;
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB\n');

  const imageFiles = fs.readdirSync(IMAGES_DIR).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  console.log(`Found ${imageFiles.length} images in images/ directory\n`);

  if (imageFiles.length === 0) {
    console.log('No images found. Exiting.');
    process.exit(0);
  }

  console.log('Uploading images...');
  const imageUrls = {};
  for (const file of imageFiles) {
    const filePath = path.join(IMAGES_DIR, file);
    const url = await uploadImage(filePath);
    if (url) imageUrls[file] = url;
  }
  console.log('');

  const i = (name) => img(imageUrls, name);
  const ip = (name, placeholder) => imgOrPlaceholder(imageUrls, name, placeholder);

  // ── Hero Slides ──
  console.log('Seeding Hero Slides...');
  const HeroSlide = (await import('./models/HeroSlide.js')).default;
  await HeroSlide.deleteMany({});
  await HeroSlide.insertMany([
    {
      title: 'Exclusive Executive Interview',
      subtitle: 'In-depth conversations with industry leaders shaping the future',
      image_url: ip('SMBCOVER.jpg', 'https://placehold.co/1920x1080/0a0a0a/D4AF37?text=Executive+Interview'),
      slide_type: 'Interview',
      link_url: '/ExecutiveInterviews',
      link_text: 'Read Interviews',
      order: 1,
      is_active: true,
    },
    {
      title: 'Spotlight Awards 2025',
      subtitle: 'Celebrating excellence in creativity, business, and influence',
      image_url: ip('NAUFALCOVER1.jpg', 'https://placehold.co/1920x1080/0a0a0a/D4AF37?text=Spotlight+Awards'),
      slide_type: 'Award',
      link_url: '/SpotlightAwards',
      link_text: 'View Awards',
      order: 2,
      is_active: true,
    },
    {
      title: 'Latest Digital Edition',
      subtitle: 'Explore our newest issue featuring visionary leaders',
      image_url: ip('LUBELLCOVER.jpg', 'https://placehold.co/1920x1080/0a0a0a/D4AF37?text=Digital+Magazine'),
      slide_type: 'Magazine',
      link_url: '/DigitalMagazine',
      link_text: 'Read Now',
      order: 3,
      is_active: true,
    },
  ]);
  console.log('  Created 3 hero slides\n');

  // ── Executive Interviews ──
  console.log('Seeding Executive Interviews...');
  const ExecutiveInterview = (await import('./models/ExecutiveInterview.js')).default;
  await ExecutiveInterview.deleteMany({});
  const interviews = [
    {
      name: 'Dr. Fatoumata Bintou',
      title: 'CEO & Founder',
      company: 'AfriTech Innovations',
      category: 'Tech',
      headshot_url: i('DRFATOUMATACOVER1.jpg'),
      cover_image_url: i('DRFATOUMATACOVER1.jpg'),
      excerpt: 'Dr. Fatoumata shares her journey from academia to building Africa\'s leading tech startup.',
      content: `<p>Dr. Fatoumata Bintou is the CEO and Founder of AfriTech Innovations, a leading technology company revolutionizing digital infrastructure across Africa.</p>
<p>In this exclusive interview, she discusses her journey from academia to entrepreneurship, the challenges of building a tech company in emerging markets, and her vision for Africa's digital future.</p>
<h3>On Starting Her Journey</h3>
<p>"I never planned to become an entrepreneur. I was a researcher at heart, but I saw a gap between academic research and real-world impact. That gap became AfriTech."</p>
<h3>On Challenges</h3>
<p>"Building a tech company in Africa comes with unique challenges — infrastructure, funding, talent acquisition. But these challenges are also opportunities. Every problem you solve creates value."</p>
<h3>On the Future</h3>
<p>"Africa's digital transformation is not just coming — it's already here. We're building the foundation for the next generation of innovators."</p>`,
      interview_type: 'Q&A',
      published_date: '2025-03-15',
      is_featured: true,
      is_cover_story: true,
    },
    {
      name: 'Ishaya Mohammed',
      title: 'Creative Director',
      company: 'Heritage Designs',
      category: 'Fashion',
      headshot_url: i('ISHAYACOVER.jpg'),
      cover_image_url: i('ISHAYACOVER.jpg'),
      excerpt: 'Ishaya Mohammed on blending traditional African textiles with modern fashion.',
      content: `<p>Ishaya Mohammed is the Creative Director of Heritage Designs, a fashion house known for blending traditional African textiles with contemporary design.</p>
<p>In this interview, he talks about his creative process, the inspiration behind his collections, and the growing influence of African fashion on the global stage.</p>
<h3>Creative Philosophy</h3>
<p>"Fashion is storytelling. Every piece I create tells a story about our heritage, our people, and our future. The fabrics we use carry generations of meaning."</p>
<h3>African Fashion Rising</h3>
<p>"The world is finally paying attention to African fashion. We've always had the talent and the creativity — now we have the platforms to showcase it."</p>`,
      interview_type: 'Article',
      published_date: '2025-02-20',
      is_featured: true,
      is_cover_story: true,
    },
    {
      name: 'Lubell Umar',
      title: 'Managing Partner',
      company: 'Umar Consulting Group',
      category: 'Business',
      headshot_url: i('LUBELLCOVER.jpg'),
      cover_image_url: i('LUBELLCOVER.jpg'),
      excerpt: 'Strategic insights from one of Nigeria\'s most respected business consultants.',
      content: `<p>Lubell Umar is the Managing Partner of Umar Consulting Group, a strategic advisory firm serving clients across multiple industries.</p>
<p>In this interview, he shares his insights on business strategy, leadership, and the evolving landscape of African commerce.</p>
<h3>On Leadership</h3>
<p>"True leadership is about creating value — for your team, your clients, and your community. The best leaders are those who serve."</p>
<h3>On African Business</h3>
<p>"Africa is the world's next great economic frontier. The businesses that succeed here will be those that understand the unique dynamics of our markets."</p>`,
      interview_type: 'Q&A',
      published_date: '2025-01-10',
      is_featured: true,
      is_cover_story: true,
    },
    {
      name: 'Luchy Okafor',
      title: 'Head of Operations',
      company: 'Zenith Hospitality Group',
      category: 'Hospitality',
      headshot_url: i('LUCHYCOVER-5.jpg'),
      cover_image_url: i('LUCHYCOVER-5.jpg'),
      excerpt: 'Redefining luxury hospitality experiences across West Africa.',
      content: `<p>Luchy Okafor is the Head of Operations at Zenith Hospitality Group, one of West Africa's fastest-growing hospitality companies.</p>
<p>She discusses the evolving standards of luxury hospitality, the importance of authentic experiences, and her journey to leadership.</p>
<h3>On Luxury Hospitality</h3>
<p>"True luxury is not about opulence — it's about authenticity, personalization, and creating memorable experiences that resonate with each guest."</p>
<h3>On Her Journey</h3>
<p>"I started at the front desk, and every role I've held has taught me something valuable about what it takes to deliver exceptional service."</p>`,
      interview_type: 'Article',
      published_date: '2024-11-05',
      is_featured: true,
      is_cover_story: false,
    },
    {
      name: 'Naufal Abubakar',
      title: 'Founder & CEO',
      company: 'Greenfield Ventures',
      category: 'Finance',
      headshot_url: i('NAUFALCOVER1.jpg'),
      cover_image_url: i('NAUFALCOVER1.jpg'),
      excerpt: 'How Naufal is transforming agricultural financing in Sub-Saharan Africa.',
      content: `<p>Naufal Abubakar is the Founder and CEO of Greenfield Ventures, a fintech company revolutionizing agricultural financing.</p>
<p>In this interview, he explains how technology is making it possible for smallholder farmers to access the capital they need to grow their businesses.</p>
<h3>The Problem</h3>
<p>"Millions of farmers across Africa lack access to basic financial services. They have the land, the skills, and the drive — but not the capital to scale."</p>
<h3>The Solution</h3>
<p>"We use satellite data and machine learning to assess farm productivity and creditworthiness. This allows us to provide loans that traditional banks won't."</p>`,
      interview_type: 'Video',
      published_date: '2024-09-22',
      video_url: 'https://www.youtube.com/watch?v=example',
      is_featured: true,
      is_cover_story: true,
    },
    {
      name: 'SMB Collective',
      title: 'Creative Team',
      company: 'SMB Studios',
      category: 'Entertainment',
      headshot_url: i('SMBCOVER.jpg'),
      cover_image_url: i('SMBCOVER.jpg'),
      excerpt: 'The creative force behind some of Nigeria\'s most innovative media campaigns.',
      content: `<p>SMB Collective is the creative team behind SMB Studios, known for producing some of Nigeria's most innovative media and entertainment campaigns.</p>
<p>In this group interview, the team discusses their creative process, the evolution of Nigerian entertainment, and their vision for the future.</p>
<h3>On Creativity</h3>
<p>"Creativity is not a solo endeavor. Our best work comes from collaboration — bringing together different perspectives, talents, and experiences."</p>
<h3>On Nigerian Entertainment</h3>
<p>"The world is hungry for African stories. We're seeing a golden age of Nigerian entertainment, and we're proud to be part of it."</p>`,
      interview_type: 'Q&A',
      published_date: '2024-07-15',
      is_featured: true,
      is_cover_story: false,
    },
  ];
  await ExecutiveInterview.insertMany(interviews);
  console.log(`  Created ${interviews.length} executive interviews\n`);

  // ── Magazine Issues ──
  console.log('Seeding Magazine Issues...');
  const MagazineIssue = (await import('./models/MagazineIssue.js')).default;
  await MagazineIssue.deleteMany({});
  const issues = [
    {
      title: 'Visionaries Edition', issue_number: 'Vol. 1, Issue 1',
      month: 'March', year: 2025,
      cover_image_url: ip('DRFATOUMATACOVER1.jpg', 'https://placehold.co/600x800/0a0a0a/D4AF37?text=Issue+1'),
      description: 'Featuring Dr. Fatoumata Bintou on the cover. Inside: exclusive interviews with industry leaders shaping the future.',
      is_current: true,
    },
    {
      title: 'The Fashion Issue', issue_number: 'Vol. 1, Issue 2',
      month: 'February', year: 2025,
      cover_image_url: ip('ISHAYACOVER.jpg', 'https://placehold.co/600x800/0a0a0a/D4AF37?text=Issue+2'),
      description: 'Exploring the intersection of tradition and modernity in African fashion.',
      is_current: false,
    },
    {
      title: 'Business Leaders', issue_number: 'Vol. 1, Issue 3',
      month: 'January', year: 2025,
      cover_image_url: ip('LUBELLCOVER.jpg', 'https://placehold.co/600x800/0a0a0a/D4AF37?text=Issue+3'),
      description: 'Strategic insights from top business leaders across the continent.',
      is_current: false,
    },
    {
      title: 'Innovation & Enterprise', issue_number: 'Vol. 1, Issue 4',
      month: 'November', year: 2024,
      cover_image_url: ip('NAUFALCOVER1.jpg', 'https://placehold.co/600x800/0a0a0a/D4AF37?text=Issue+4'),
      description: 'How innovators are transforming industries through technology and determination.',
      is_current: false,
    },
    {
      title: 'Creative Vision', issue_number: 'Vol. 1, Issue 5',
      month: 'September', year: 2024,
      cover_image_url: ip('SMBCOVER.jpg', 'https://placehold.co/600x800/0a0a0a/D4AF37?text=Issue+5'),
      description: 'Celebrating the creative minds redefining entertainment and media.',
      is_current: false,
    },
  ];
  await MagazineIssue.insertMany(issues);
  console.log(`  Created ${issues.length} magazine issues\n`);

  // ── Team Members ──
  console.log('Seeding Team Members...');
  const TeamMember = (await import('./models/TeamMember.js')).default;
  await TeamMember.deleteMany({});
  await TeamMember.insertMany([
    { name: 'Aisha Mohammed', role: 'Editor-in-Chief', bio: 'Visionary leader with over 15 years of experience in lifestyle journalism and digital media.', order: 1 },
    { name: 'Khalid Usman', role: 'Creative Director', bio: 'Award-winning designer shaping the visual identity of Jewel Lifestyle Magazine.', order: 2 },
    { name: 'Zainab Abubakar', role: 'Head of Content', bio: 'Storyteller and content strategist passionate about amplifying African voices.', order: 3 },
    { name: 'Ibrahim Danjuma', role: 'Photography Director', bio: 'Visual artist capturing the essence of luxury and lifestyle through the lens.', order: 4 },
  ]);
  console.log('  Created 4 team members\n');

  // ── Spotlight Awards ──
  console.log('Seeding Spotlight Awards...');
  const SpotlightAward = (await import('./models/SpotlightAward.js')).default;
  await SpotlightAward.deleteMany({});
  await SpotlightAward.insertMany([
    { category_name: 'Innovator of the Year', description: 'Recognizing groundbreaking innovation in technology and business.', year: 2025 },
    { category_name: 'Creative Excellence', description: 'Celebrating outstanding achievement in arts, design, and creative industries.', year: 2025 },
    { category_name: 'Business Leadership', description: 'Honoring exceptional leadership and vision in the corporate world.', year: 2025 },
    { category_name: 'Community Impact', description: 'Awarding individuals and organizations making a difference in their communities.', year: 2025 },
    { category_name: 'Rising Star', description: 'Spotlighting emerging talents who are shaping the future.', year: 2025 },
  ]);
  console.log('  Created 5 award categories\n');

  // ── Award Winners ──
  console.log('Seeding Award Winners...');
  const AwardWinner = (await import('./models/AwardWinner.js')).default;
  await AwardWinner.deleteMany({});
  await AwardWinner.insertMany([
    { name: 'Dr. Fatoumata Bintou', title: 'CEO & Founder', company: 'AfriTech Innovations', award_category: 'Innovator of the Year', year: 2025, photo_url: i('DRFATOUMATACOVER1.jpg'), bio: 'For revolutionizing digital infrastructure across Africa.' },
    { name: 'Ishaya Mohammed', title: 'Creative Director', company: 'Heritage Designs', award_category: 'Creative Excellence', year: 2025, photo_url: i('ISHAYACOVER.jpg'), bio: 'For blending traditional African textiles with contemporary fashion.' },
    { name: 'Lubell Umar', title: 'Managing Partner', company: 'Umar Consulting Group', award_category: 'Business Leadership', year: 2025, photo_url: i('LUBELLCOVER.jpg'), bio: 'For exemplary strategic leadership in business consulting.' },
  ]);
  console.log('  Created 3 award winners\n');

  console.log('Seed complete!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
