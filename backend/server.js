const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN || 'stars777-admin-token';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');
const dataDirPath = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
const uploadsDirPath = path.resolve(process.env.UPLOADS_DIR || path.join(__dirname, 'uploads'));
const blogImagesDirPath = path.join(uploadsDirPath, 'blog-images');
const siteSettingsFilePath = path.join(dataDirPath, 'site-settings.json');
const contactSubmissionsFilePath = path.join(dataDirPath, 'contact-submissions.json');
const adminLoginsFilePath = path.join(dataDirPath, 'admin-logins.json');
const visitorsFilePath = path.join(dataDirPath, 'visitors.json');
const adminDevOrigin = String(process.env.ADMIN_DEV_ORIGIN || 'http://127.0.0.1:5173').replace(/\/$/, '');
const adminDevRedirectEnabled = process.env.ADMIN_DEV_REDIRECT !== 'false';
const devServerHealthCache = {
  expiresAt: 0,
  isReachable: false,
};

const supportedImageMimeTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

function buildDefaultTermsPage() {
  return {
    title: 'Terms of Service For Stars777',
    body: [
      'Welcome to Stars777! These Terms of Service ("Terms") govern your use of the Stars777 mobile application ("Application") and the services provided therein ("Services"), operated by Stars777 ("we", "us", "our").',
      '1. Acceptance of Terms\n\nBy downloading, installing, accessing, or using the Application or Services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree with any part of these Terms or our Privacy Policy, please do not use the Application or Services.',
      '2. License\n\nSubject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to use the Application solely for your personal, non-commercial purposes. You may not modify, distribute, reproduce, or create derivative works based on the Application.',
      '3. User Accounts\n\nYou may need to create an account to access certain features of the Application. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
      '4. Prohibited Conduct\n\nYou agree not to:\n- Use the Application or Services for any illegal or unauthorized purpose.\n- Modify, adapt, or hack the Application or modify another website so as to falsely imply that it is associated with the Application.\n- Attempt to gain unauthorized access to our servers or networks.\n- Interfere with or disrupt the integrity or performance of the Application or Services.',
      '5. Intellectual Property\n\nThe Application and all content and materials therein are owned by us or our licensors and are protected by intellectual property laws. You may not use our trademarks, logos, or other proprietary information without our express written permission.',
      '6. Stars777 Privacy\n\nYour use of the Application and Services is subject to our Privacy Policy. By using the Application or Services, you consent to the collection, use, and sharing of your information as described in the Privacy Policy.',
      '7. Termination\n\nWe may terminate or suspend your access to the Application or Services at any time, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.',
      '8. Disclaimer of Warranties\n\nThe Application and Services are provided on an "as is" and "as available" basis. We do not warrant that the Application will be uninterrupted, error-free, secure, or that any defects will be corrected.',
      '9. Limitation of Liability\n\nIn no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, arising out of or in connection with your use of the Application or Services.',
      '10. Stars777 Governing Law\n\nThese Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.',
      '11. Changes to Terms\n\nWe reserve the right to update or modify these Terms at any time without prior notice. We will post the updated Terms on the Application. Your continued use of the Application or Services after any such changes constitutes your acceptance of the new Terms.',
      '12. Contact Us\n\nIf you have any questions about these Terms, please contact us',
    ].join('\n\n'),
  };
}

function buildDefaultContactPage() {
  return {
    title: 'Contact Us',
    intro:
      'We are deeply committed to delivering unparalleled service and unwavering support to ensure your experience exceeds expectations.',
    address: '3680 Schamberger Pass, North Catarina 01894-8381',
    phoneText: 'Talk to us and see how we can work 1800-14-0147',
    emailText: "We're usually replying within 24 hours pagedone1234@gmail.com",
    workingHours: 'Mon To Sat - 10 am To 7 pm Sunday - 11am To 5 pm',
    pressCopy:
      'Are you interested in our latest news or working on a grammarly story and need to get in touch?',
    supportCopy:
      'Are you interested in our latest news or working on a grammarly story and need to get in touch?',
    salesCopy:
      'Are you interested in our latest news or working on a grammarly story and need to get in touch?',
    liveChatImageUrl: '',
    emailCardImageUrl: '',
    callbackCardImageUrl: '',
    faqVisualImageUrl: '',
  };
}

function buildDefaultJackpotSection() {
  return {
    title: 'JACKPOT',
    prizePoolLabel: 'Prize pool:',
    totalAmount: 6122526.03,
    items: [
      {
        id: 'aztecs-millions',
        title: "Aztec's Millions",
        amount: 1797081.18,
        imageUrl: '',
      },
      {
        id: 'megasaur',
        title: 'Megasaur',
        amount: 1027029.02,
        imageUrl: '',
      },
      {
        id: 'jackpot-pinatas-deluxe',
        title: 'Jackpot Pinatas Deluxe',
        amount: 267536.73,
        imageUrl: '',
      },
      {
        id: 'spirit-of-the-inca',
        title: 'Spirit of the Inca',
        amount: 264155.17,
        imageUrl: '',
      },
      {
        id: 'shopping-spree-ii',
        title: 'Shopping Spree II',
        amount: 199525.7,
        imageUrl: '',
      },
    ],
  };
}

fs.mkdirSync(dataDirPath, { recursive: true });
fs.mkdirSync(blogImagesDirPath, { recursive: true });

const blogImageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => {
      callback(null, blogImagesDirPath);
    },
    filename: (_req, file, callback) => {
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).slice(2, 8);
      const originalBaseName = path.basename(file.originalname || 'blog-image', path.extname(file.originalname || '')).toLowerCase();
      const safeBaseName = originalBaseName.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'blog-image';
      const extension = supportedImageMimeTypes.get(file.mimetype) || path.extname(file.originalname || '').toLowerCase() || '.bin';

      callback(null, `${timestamp}-${randomSuffix}-${safeBaseName}${extension}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (supportedImageMimeTypes.has(file.mimetype)) {
      callback(null, true);
      return;
    }

    callback(new Error('unsupported_image_type'));
  },
});

const store = {
  dashboard: {
    activeUsers: 3420,
    weeklyVisitors: 21840,
    conversionRate: '4.8%',
    monthlyRevenue: '$96,400',
  },
  games: [
    {
      id: 1,
      title: 'Ludo King',
      genre: 'Board',
      description: 'Classic multiplayer board game with quick rounds and daily rewards.',
      writeUp: 'Ludo King is a timeless board game experience built for quick fun with friends and family. Enjoy smooth online matches, colorful visuals, and frequent reward drops that keep every session exciting. Whether you play casually or competitively, this game delivers simple rules with high replay value.',
      slug: 'ludo-king',
      updatedAt: '2025-10-07',
      status: 'Published',
      imageUrl: '',
    },
    {
      id: 2,
      title: 'Aviator',
      genre: 'Arcade',
      description: 'Fast crash-style action where timing and strategy decide payouts.',
      writeUp: 'Aviator is a fast-paced crash game where timing is everything. Watch the multiplier rise, decide when to cash out, and balance risk with strategy in every round. The minimal design and instant gameplay make it ideal for players who enjoy quick decisions and high-intensity sessions.',
      slug: 'aviator',
      updatedAt: '2025-10-07',
      status: 'Published',
      imageUrl: '',
    },
    {
      id: 3,
      title: 'Teen Patti',
      genre: 'Card',
      description: 'India\'s favorite card table game with smooth gameplay and live rooms.',
      writeUp: 'Teen Patti brings India\'s most loved card-table excitement to your screen with modern performance and intuitive controls. Join live rooms, test your reading skills, and compete in dynamic rounds with real players. It\'s designed for both beginners and seasoned card game enthusiasts.',
      slug: 'teen-patti',
      updatedAt: '2025-10-07',
      status: 'Published',
      imageUrl: '',
    },
    {
      id: 4,
      title: 'Andar Bahar',
      genre: 'Card',
      description: 'Simple, fast rounds built for quick fun and instant decisions.',
      writeUp: 'Andar Bahar focuses on pure speed and straightforward gameplay. Place your prediction, follow the cards, and enjoy concise rounds that are easy to pick up but always engaging. Its lightweight format makes it perfect for players who want quick entertainment without complexity.',
      slug: 'andar-bahar',
      updatedAt: '2025-10-07',
      status: 'Published',
      imageUrl: '',
    },
    {
      id: 5,
      title: 'Online Rummy',
      genre: 'Card',
      description: 'Skill-based rummy formats with tournaments, bonuses, and daily tables.',
      writeUp: 'Online Rummy offers strategic card gameplay centered on sequencing, set-building, and smart discards. Take part in daily tables and tournament formats while refining your tactical decisions every session. The experience is crafted for players who prefer skill-driven outcomes and consistent progression.',
      slug: 'online-rummy',
      updatedAt: '2025-10-07',
      status: 'Published',
      imageUrl: '',
    },
    {
      id: 6,
      title: 'Gates of Olympus',
      genre: 'Slots',
      description: 'High-volatility slot adventure with lightning multipliers and bonus spins.',
      writeUp: 'Gates of Olympus delivers a high-volatility slot adventure with dramatic multipliers and feature-rich bonus rounds. The game is known for explosive potential, cinematic effects, and rapid transitions between standard spins and reward moments. It is ideal for players who enjoy high-energy slot action.',
      slug: 'gates-of-olympus',
      updatedAt: '2025-10-07',
      status: 'Published',
      imageUrl: '',
    },
  ],
  blogPosts: [
    {
      id: 101,
      title: 'How We Built a Real-Time Matchmaking System',
      author: 'Admin Team',
      category: 'Engineering',
      writeUp: 'We designed a real-time matchmaking layer focused on queue balance, low latency joins, and fair match distribution across regions. This system continuously evaluates player skill bands and session availability before dispatching a game room assignment.',
      publishedAt: '2026-04-12',
      updatedAt: '2026-04-12',
      status: 'Published',
      slug: 'how-we-built-a-real-time-matchmaking-system',
      imageUrl: '',
    },
    {
      id: 102,
      title: 'Designing Better Player Rewards',
      author: 'Product Team',
      category: 'Product',
      writeUp: 'Our rewards model was rebuilt to provide better progression for both daily and long-session players. We combined milestone bonuses, seasonal goals, and activity streak logic to improve retention while keeping payouts transparent.',
      publishedAt: '2026-04-20',
      updatedAt: '2026-04-20',
      status: 'Published',
      slug: 'designing-better-player-rewards',
      imageUrl: '',
    },
  ],
  reviews: [
    {
      id: 301,
      user: 'Mia R.',
      rating: 5,
      comment: 'Smooth gameplay and amazing visuals.',
      date: '2026-04-19',
      updatedAt: '2026-04-19',
      status: 'Published',
      imageUrl: '',
    },
    {
      id: 302,
      user: 'Leon K.',
      rating: 4,
      comment: 'Great update, but loading can be faster.',
      date: '2026-04-21',
      updatedAt: '2026-04-21',
      status: 'Published',
      imageUrl: '',
    },
  ],
  faqs: [
    {
      id: 401,
      question: 'How do I verify my account?',
      answer: 'Open profile settings, upload the required KYC documents, and wait for confirmation from support.',
      status: 'Published',
      updatedAt: '2026-04-26',
    },
    {
      id: 402,
      question: 'What is the minimum deposit?',
      answer: 'The minimum deposit depends on your selected payment option and is displayed on the deposit form before payment.',
      status: 'Published',
      updatedAt: '2026-04-26',
    },
    {
      id: 403,
      question: 'How does Smart Bidding work?',
      answer: 'Smart Bidding can auto-tune bid levels based on the limits and strategy settings you choose in the game options.',
      status: 'Published',
      updatedAt: '2026-04-26',
    },
    {
      id: 404,
      question: 'Can I target specific Keywords?',
      answer: 'Yes, you can filter and target specific categories and keywords through your campaign and search controls.',
      status: 'Published',
      updatedAt: '2026-04-26',
    },
  ],
  siteSettings: {
    siteName: 'Stars777',
    defaultLanguage: 'en-US',
    maintenanceMode: false,
    supportEmail: 'support@stars777.example',
    liveChatLink: 'https://wa.me/',
    termsPage: buildDefaultTermsPage(),
    contactPage: buildDefaultContactPage(),
    jackpotSection: buildDefaultJackpotSection(),
    seo: {
      title: 'Stars777 - Online Gaming, Rummy, Teen Patti and Lottery Games',
      description:
        'Stars777 is an online gaming platform for Indian players with fast withdrawals, fair gameplay, Rummy, Teen Patti, casino games, lotteries, and reliable support.',
      keywords: 'Stars777, online gaming India, Rummy, Teen Patti, casino games, lottery games',
      canonicalUrl: 'https://stars777.com',
      ogImageUrl: '',
    },
    socialLinks: [
      {
        id: 'facebook',
        platform: 'Facebook',
        url: 'https://facebook.com',
        iconUrl: 'https://cdn.simpleicons.org/facebook/white',
      },
      {
        id: 'twitter',
        platform: 'Twitter',
        url: 'https://twitter.com',
        iconUrl: 'https://cdn.simpleicons.org/x/white',
      },
      {
        id: 'instagram',
        platform: 'Instagram',
        url: 'https://instagram.com',
        iconUrl: 'https://cdn.simpleicons.org/instagram/white',
      },
      {
        id: 'telegram',
        platform: 'Telegram',
        url: 'https://telegram.org',
        iconUrl: 'https://cdn.simpleicons.org/telegram/white',
      },
      {
        id: 'youtube',
        platform: 'YouTube',
        url: 'https://youtube.com',
        iconUrl: 'https://cdn.simpleicons.org/youtube/white',
      },
    ],
    withdrawalPartners: [
      { id: 'paytm', name: 'Paytm', url: 'https://paytm.com', imageUrl: '' },
      { id: 'visa', name: 'Visa', url: 'https://visa.com', imageUrl: '' },
      { id: 'payu', name: 'PayU', url: 'https://payu.in', imageUrl: '' },
      { id: 'mastercard', name: 'Mastercard', url: 'https://mastercard.com', imageUrl: '' },
      { id: 'rupay', name: 'RuPay', url: 'https://rupay.co.in', imageUrl: '' },
      { id: 'upi', name: 'UPI', url: 'https://www.npci.org.in/what-we-do/upi/product-overview', imageUrl: '' },
      { id: 'phonepe', name: 'PhonePe', url: 'https://phonepe.com', imageUrl: '' },
    ],
  },
  contactSubmissions: [],
  adminLogins: [],
  visitors: [],
};

loadSiteSettings();
loadContactSubmissions();
loadAdminLogins();
loadVisitors();

app.use('/uploads', express.static(uploadsDirPath, {
  fallthrough: false,
  immutable: true,
  maxAge: '1y',
}));

app.use(trackPublicTraffic);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'website-backend' });
});

app.get('/api/games', (_req, res) => {
  const publishedGames = store.games
    .filter((game) => normalizeStatus(game.status) === 'Published')
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

  res.json(publishedGames);
});

app.get('/api/games/:slug', (req, res) => {
  const slug = String(req.params.slug || '').trim().toLowerCase();
  const game = store.games.find((entry) => String(entry.slug || '').toLowerCase() === slug);

  if (!game || normalizeStatus(game.status) !== 'Published') {
    return res.status(404).json({ message: 'Game not found.' });
  }

  return res.json(game);
});

app.get('/api/blog-posts', (_req, res) => {
  const sortedBlogPosts = store.blogPosts
    .filter((post) => normalizeStatus(post.status) === 'Published')
    .sort(
    (a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0),
    );

  return res.json(sortedBlogPosts);
});

app.get('/api/blog-posts/:slug', (req, res) => {
  const slug = String(req.params.slug || '').trim().toLowerCase();
  const post = store.blogPosts.find((entry) => String(entry.slug || '').toLowerCase() === slug);

  if (!post || normalizeStatus(post.status) !== 'Published') {
    return res.status(404).json({ message: 'Blog post not found.' });
  }

  return res.json(post);
});

app.get('/api/reviews', (_req, res) => {
  const publishedReviews = store.reviews
    .filter((review) => normalizeStatus(review.status) === 'Published')
    .sort((a, b) => new Date(b.updatedAt || b.date || 0) - new Date(a.updatedAt || a.date || 0));

  return res.json(publishedReviews);
});

app.get('/api/faqs', (_req, res) => {
  const publishedFaqs = store.faqs
    .filter((faq) => normalizeStatus(faq.status) === 'Published')
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

  return res.json(publishedFaqs);
});

app.get('/api/site-settings', (_req, res) => {
  res.json(store.siteSettings);
});

app.post('/api/contact', async (req, res) => {
  const payload = sanitizeContactPayload(req.body || {});

  if (!payload.firstName || !payload.lastName || !payload.email || !payload.message) {
    return res.status(400).json({ message: 'First name, last name, email, and message are required.' });
  }

  const submission = {
    id: Date.now(),
    ...payload,
    createdAt: new Date().toISOString(),
    ip: getClientIp(req),
    location: getRequestLocation(req),
    userAgent: String(req.headers['user-agent'] || '').slice(0, 220),
    emailSent: false,
  };

  store.contactSubmissions.unshift(submission);
  store.contactSubmissions = store.contactSubmissions.slice(0, 500);
  saveContactSubmissions();

  submission.emailSent = await sendContactEmail(submission);
  saveContactSubmissions();

  return res.status(201).json({
    message: 'Email sent, Escalated to a support specialist. You can expect a response.',
    emailSent: submission.emailSent,
  });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    recordAdminLogin(req, username);
    return res.json({ token: ADMIN_API_TOKEN });
  }

  return res.status(401).json({ message: 'Invalid admin credentials.' });
});

app.use('/api/admin', (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (token !== ADMIN_API_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized admin request.' });
  }

  return next();
});

app.post('/api/admin/uploads/blog-images', (req, res) => {
  blogImageUpload.single('image')(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Image must be 5MB or smaller.' });
      }

      if (error.message === 'unsupported_image_type') {
        return res.status(400).json({ message: 'Only JPG, PNG, and WEBP images are allowed.' });
      }

      return res.status(500).json({ message: 'Could not upload image.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file was uploaded.' });
    }

    return res.status(201).json({
      url: `/uploads/blog-images/${req.file.filename}`,
    });
  });
});

app.get('/api/admin/navigation', (_req, res) => {
  res.json([
    {
      group: 'menu',
      items: [
        { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
        { id: 'games', label: 'Games', path: '/admin/games' },
        { id: 'blog-posts', label: 'Blog Posts', path: '/admin/blog-posts' },
        { id: 'reviews', label: 'Reviews', path: '/admin/reviews' },
        { id: 'faqs', label: 'FAQ', path: '/admin/faqs' },
        { id: 'contact-messages', label: 'Messages', path: '/admin/contact-messages' },
      ],
    },
    {
      group: 'configuration',
      items: [
        {
          id: 'jackpot',
          label: 'Jackpot',
          path: '/admin/jackpot',
        },
        {
          id: 'contact-page',
          label: 'Contact Page',
          path: '/admin/contact-page',
        },
        {
          id: 'terms-conditions',
          label: 'Terms & Conditions',
          path: '/admin/terms-conditions',
        },
        {
          id: 'seo',
          label: 'SEO',
          path: '/admin/seo',
        },
        {
          id: 'site-settings',
          label: 'Site Settings',
          path: '/admin/site-settings',
        },
      ],
    },
  ]);
});

app.get('/api/admin/dashboard', (_req, res) => {
  res.json(buildDashboardSummary());
});

app.get('/api/admin/contact-submissions', (_req, res) => {
  const sortedSubmissions = [...store.contactSubmissions].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  );

  res.json(sortedSubmissions);
});

app.get('/api/admin/seo', (_req, res) => {
  res.json(store.siteSettings.seo || {});
});

app.put('/api/admin/seo', (req, res) => {
  store.siteSettings = {
    ...store.siteSettings,
    seo: sanitizeSeoPayload(req.body || {}),
  };
  saveSiteSettings();

  return res.json(store.siteSettings.seo);
});

app.get('/api/admin/games', (_req, res) => {
  const sortedGames = [...store.games].sort(
    (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0),
  );

  res.json(sortedGames);
});

app.post('/api/admin/games', (req, res) => {
  const payload = sanitizeGamePayload(req.body || {});

  if (!payload.title) {
    return res.status(400).json({ message: 'Title is required.' });
  }

  const nextId =
    store.games.length === 0
      ? 1
      : Math.max(...store.games.map((game) => Number(game.id) || 0)) + 1;

  const created = {
    id: nextId,
    title: payload.title,
    genre: payload.genre || 'General',
    description: payload.description,
    writeUp: payload.writeUp || payload.description,
    slug: payload.slug || toSlug(payload.title),
    status: payload.status,
    imageUrl: payload.imageUrl,
    updatedAt: new Date().toISOString().slice(0, 10),
  };

  store.games.unshift(created);

  return res.status(201).json(created);
});

app.put('/api/admin/games/:id', (req, res) => {
  const gameId = Number(req.params.id);
  const index = store.games.findIndex((game) => Number(game.id) === gameId);

  if (index < 0) {
    return res.status(404).json({ message: 'Game not found.' });
  }

  const payload = sanitizeGamePayload(req.body || {});
  if (!payload.title) {
    return res.status(400).json({ message: 'Title is required.' });
  }

  const current = store.games[index];
  const updated = {
    ...current,
    title: payload.title,
    genre: payload.genre || 'General',
    description: payload.description,
    writeUp: payload.writeUp || payload.description,
    slug: payload.slug || toSlug(payload.title),
    status: payload.status,
    imageUrl: payload.imageUrl,
    updatedAt: new Date().toISOString().slice(0, 10),
  };

  store.games[index] = updated;

  return res.json(updated);
});

app.delete('/api/admin/games/:id', (req, res) => {
  const gameId = Number(req.params.id);
  const index = store.games.findIndex((game) => Number(game.id) === gameId);

  if (index < 0) {
    return res.status(404).json({ message: 'Game not found.' });
  }

  const [deleted] = store.games.splice(index, 1);
  return res.json(deleted);
});

app.post('/api/admin/games/bulk', (req, res) => {
  const ids = Array.isArray(req.body?.ids)
    ? req.body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
    : [];
  const action = String(req.body?.action || '');

  if (ids.length === 0) {
    return res.status(400).json({ message: 'At least one game id is required.' });
  }

  if (action === 'delete') {
    const deleteSet = new Set(ids);
    const before = store.games.length;
    store.games = store.games.filter((game) => !deleteSet.has(Number(game.id)));
    return res.json({ affected: before - store.games.length });
  }

  const status = normalizeStatus(action);
  const updateSet = new Set(ids);
  let affected = 0;

  store.games = store.games.map((game) => {
    if (!updateSet.has(Number(game.id))) {
      return game;
    }

    affected += 1;
    return {
      ...game,
      status,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
  });

  return res.json({ affected });
});

app.get('/api/admin/blog-posts', (_req, res) => {
  const sortedBlogPosts = [...store.blogPosts].sort(
    (a, b) => new Date(b.updatedAt || b.publishedAt || 0) - new Date(a.updatedAt || a.publishedAt || 0),
  );

  res.json(sortedBlogPosts);
});

app.post('/api/admin/blog-posts', (req, res) => {
  const payload = sanitizeBlogPostPayload(req.body || {});

  if (!payload.title) {
    return res.status(400).json({ message: 'Title is required.' });
  }

  const nextId =
    store.blogPosts.length === 0
      ? 1
      : Math.max(...store.blogPosts.map((post) => Number(post.id) || 0)) + 1;
  const today = new Date().toISOString().slice(0, 10);

  const created = {
    id: nextId,
    title: payload.title,
    author: payload.author || 'Admin Team',
    category: payload.category || 'General',
    writeUp: payload.writeUp,
    status: payload.status,
    slug: payload.slug || toSlug(payload.title),
    imageUrl: payload.imageUrl,
    publishedAt: today,
    updatedAt: today,
  };

  store.blogPosts.unshift(created);

  return res.status(201).json(created);
});

app.put('/api/admin/blog-posts/:id', (req, res) => {
  const postId = Number(req.params.id);
  const index = store.blogPosts.findIndex((post) => Number(post.id) === postId);

  if (index < 0) {
    return res.status(404).json({ message: 'Blog post not found.' });
  }

  const payload = sanitizeBlogPostPayload(req.body || {});

  if (!payload.title) {
    return res.status(400).json({ message: 'Title is required.' });
  }

  const current = store.blogPosts[index];
  const updated = {
    ...current,
    title: payload.title,
    author: payload.author || current.author || 'Admin Team',
    category: payload.category || current.category || 'General',
    writeUp: payload.writeUp || current.writeUp || '',
    status: payload.status,
    slug: payload.slug || toSlug(payload.title),
    imageUrl: payload.imageUrl,
    updatedAt: new Date().toISOString().slice(0, 10),
  };

  store.blogPosts[index] = updated;

  return res.json(updated);
});

app.delete('/api/admin/blog-posts/:id', (req, res) => {
  const postId = Number(req.params.id);
  const index = store.blogPosts.findIndex((post) => Number(post.id) === postId);

  if (index < 0) {
    return res.status(404).json({ message: 'Blog post not found.' });
  }

  const [deleted] = store.blogPosts.splice(index, 1);
  return res.json(deleted);
});

app.post('/api/admin/blog-posts/bulk', (req, res) => {
  const ids = Array.isArray(req.body?.ids)
    ? req.body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
    : [];
  const action = String(req.body?.action || '');

  if (ids.length === 0) {
    return res.status(400).json({ message: 'At least one blog post id is required.' });
  }

  if (action === 'delete') {
    const deleteSet = new Set(ids);
    const before = store.blogPosts.length;
    store.blogPosts = store.blogPosts.filter((post) => !deleteSet.has(Number(post.id)));
    return res.json({ affected: before - store.blogPosts.length });
  }

  const status = normalizeStatus(action);
  const updateSet = new Set(ids);
  let affected = 0;

  store.blogPosts = store.blogPosts.map((post) => {
    if (!updateSet.has(Number(post.id))) {
      return post;
    }

    affected += 1;
    return {
      ...post,
      status,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
  });

  return res.json({ affected });
});



app.get('/api/admin/reviews', (_req, res) => {
  const sortedReviews = [...store.reviews].sort(
    (a, b) => new Date(b.updatedAt || b.date || 0) - new Date(a.updatedAt || a.date || 0),
  );

  res.json(sortedReviews);
});

app.post('/api/admin/reviews', (req, res) => {
  const payload = sanitizeReviewPayload(req.body || {});

  if (!payload.user) {
    return res.status(400).json({ message: 'Reviewer name is required.' });
  }

  if (!payload.comment) {
    return res.status(400).json({ message: 'Review comment is required.' });
  }

  const nextId =
    store.reviews.length === 0
      ? 1
      : Math.max(...store.reviews.map((review) => Number(review.id) || 0)) + 1;
  const today = new Date().toISOString().slice(0, 10);

  const created = {
    id: nextId,
    user: payload.user,
    rating: payload.rating,
    comment: payload.comment,
    status: payload.status,
    imageUrl: payload.imageUrl,
    date: today,
    updatedAt: today,
  };

  store.reviews.unshift(created);

  return res.status(201).json(created);
});

app.put('/api/admin/reviews/:id', (req, res) => {
  const reviewId = Number(req.params.id);
  const index = store.reviews.findIndex((review) => Number(review.id) === reviewId);

  if (index < 0) {
    return res.status(404).json({ message: 'Review not found.' });
  }

  const payload = sanitizeReviewPayload(req.body || {});

  if (!payload.user) {
    return res.status(400).json({ message: 'Reviewer name is required.' });
  }

  if (!payload.comment) {
    return res.status(400).json({ message: 'Review comment is required.' });
  }

  const current = store.reviews[index];
  const updated = {
    ...current,
    user: payload.user,
    rating: payload.rating,
    comment: payload.comment,
    status: payload.status,
    imageUrl: payload.imageUrl,
    updatedAt: new Date().toISOString().slice(0, 10),
  };

  store.reviews[index] = updated;
  return res.json(updated);
});

app.delete('/api/admin/reviews/:id', (req, res) => {
  const reviewId = Number(req.params.id);
  const index = store.reviews.findIndex((review) => Number(review.id) === reviewId);

  if (index < 0) {
    return res.status(404).json({ message: 'Review not found.' });
  }

  const [deleted] = store.reviews.splice(index, 1);
  return res.json(deleted);
});

app.post('/api/admin/reviews/bulk', (req, res) => {
  const ids = Array.isArray(req.body?.ids)
    ? req.body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
    : [];
  const action = String(req.body?.action || '');

  if (ids.length === 0) {
    return res.status(400).json({ message: 'At least one review id is required.' });
  }

  if (action === 'delete') {
    const deleteSet = new Set(ids);
    const before = store.reviews.length;
    store.reviews = store.reviews.filter((review) => !deleteSet.has(Number(review.id)));
    return res.json({ affected: before - store.reviews.length });
  }

  const status = normalizeStatus(action);
  const updateSet = new Set(ids);
  let affected = 0;

  store.reviews = store.reviews.map((review) => {
    if (!updateSet.has(Number(review.id))) {
      return review;
    }

    affected += 1;
    return {
      ...review,
      status,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
  });

  return res.json({ affected });
});

app.get('/api/admin/faqs', (_req, res) => {
  const sortedFaqs = [...store.faqs].sort(
    (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0),
  );

  res.json(sortedFaqs);
});

app.post('/api/admin/faqs', (req, res) => {
  const payload = sanitizeFaqPayload(req.body || {});

  if (!payload.question) {
    return res.status(400).json({ message: 'Question is required.' });
  }

  if (!payload.answer) {
    return res.status(400).json({ message: 'Answer is required.' });
  }

  const nextId =
    store.faqs.length === 0
      ? 1
      : Math.max(...store.faqs.map((faq) => Number(faq.id) || 0)) + 1;

  const created = {
    id: nextId,
    question: payload.question,
    answer: payload.answer,
    status: payload.status,
    updatedAt: new Date().toISOString().slice(0, 10),
  };

  store.faqs.unshift(created);

  return res.status(201).json(created);
});

app.put('/api/admin/faqs/:id', (req, res) => {
  const faqId = Number(req.params.id);
  const index = store.faqs.findIndex((faq) => Number(faq.id) === faqId);

  if (index < 0) {
    return res.status(404).json({ message: 'FAQ not found.' });
  }

  const payload = sanitizeFaqPayload(req.body || {});

  if (!payload.question) {
    return res.status(400).json({ message: 'Question is required.' });
  }

  if (!payload.answer) {
    return res.status(400).json({ message: 'Answer is required.' });
  }

  const current = store.faqs[index];
  const updated = {
    ...current,
    question: payload.question,
    answer: payload.answer,
    status: payload.status,
    updatedAt: new Date().toISOString().slice(0, 10),
  };

  store.faqs[index] = updated;
  return res.json(updated);
});

app.delete('/api/admin/faqs/:id', (req, res) => {
  const faqId = Number(req.params.id);
  const index = store.faqs.findIndex((faq) => Number(faq.id) === faqId);

  if (index < 0) {
    return res.status(404).json({ message: 'FAQ not found.' });
  }

  const [deleted] = store.faqs.splice(index, 1);
  return res.json(deleted);
});

app.post('/api/admin/faqs/bulk', (req, res) => {
  const ids = Array.isArray(req.body?.ids)
    ? req.body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
    : [];
  const action = String(req.body?.action || '');

  if (ids.length === 0) {
    return res.status(400).json({ message: 'At least one faq id is required.' });
  }

  if (action === 'delete') {
    const deleteSet = new Set(ids);
    const before = store.faqs.length;
    store.faqs = store.faqs.filter((faq) => !deleteSet.has(Number(faq.id)));
    return res.json({ affected: before - store.faqs.length });
  }

  const status = normalizeStatus(action);
  const updateSet = new Set(ids);
  let affected = 0;

  store.faqs = store.faqs.map((faq) => {
    if (!updateSet.has(Number(faq.id))) {
      return faq;
    }

    affected += 1;
    return {
      ...faq,
      status,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
  });

  return res.json({ affected });
});

app.get('/api/admin/site-settings', (_req, res) => {
  res.json(store.siteSettings);
});

app.put('/api/admin/site-settings', (req, res) => {
  updateSiteSettings(req.body || {});
  return res.json(store.siteSettings);
});

// Compatibility aliases for existing frontend calls.
app.get('/api/admin/posts-blogs', (_req, res) => {
  res.json(store.blogPosts);
});


app.get('/api/admin/global-settings', (_req, res) => {
  res.json(store.siteSettings);
});

app.put('/api/admin/global-settings', (req, res) => {
  updateSiteSettings(req.body || {});
  return res.json(store.siteSettings);
});

app.use((req, res, next) => {
  if (!fs.existsSync(frontendDistPath)) {
    return next();
  }

  return express.static(frontendDistPath)(req, res, next);
});

app.get(/^(?!\/api).*/, async (req, res) => {
  if (req.path.startsWith('/admin')) {
    res.set('X-Robots-Tag', 'noindex, nofollow, noarchive');

    const redirectTarget = await getLocalAdminRedirectTarget(req);
    if (redirectTarget) {
      return res.redirect(307, redirectTarget);
    }
  }

  if (!fs.existsSync(frontendIndexPath)) {
    return res.status(503).send(
      'Frontend build is not available right now. Run `npm run build --prefix frontend` or start the Vite dev server before refreshing this page.',
    );
  }

  return res.sendFile(frontendIndexPath, (error) => {
    if (error && !res.headersSent) {
      res.status(error.statusCode || 500).send('Could not load the frontend application.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

function toSlug(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function getLocalAdminRedirectTarget(req) {
  if (!adminDevRedirectEnabled || process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!req.path.startsWith('/admin') || !isLocalAdminRequest(req)) {
    return null;
  }

  const canReachDevServer = await isAdminDevServerReachable();
  if (!canReachDevServer) {
    return null;
  }

  return `${adminDevOrigin}${req.originalUrl || req.url || req.path}`;
}

function isLocalAdminRequest(req) {
  const host = String(req.hostname || '').toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

async function isAdminDevServerReachable() {
  const now = Date.now();
  if (devServerHealthCache.expiresAt > now) {
    return devServerHealthCache.isReachable;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 800);
    const response = await fetch(adminDevOrigin, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    devServerHealthCache.isReachable = response.ok;
  } catch {
    devServerHealthCache.isReachable = false;
  }

  devServerHealthCache.expiresAt = now + 5000;
  return devServerHealthCache.isReachable;
}

function normalizeStatus(value) {
  const normalized = String(value || '').toLowerCase().trim();

  if (normalized === 'published' || normalized === 'live') {
    return 'Published';
  }

  if (normalized === 'draft' || normalized === 'beta') {
    return 'Draft';
  }

  return 'Archived';
}

function sanitizeGamePayload(payload) {
  return {
    title: String(payload.title || '').trim(),
    genre: String(payload.genre || '').trim(),
    description: String(payload.description || payload.writeUp || '').trim(),
    writeUp: String(payload.writeUp || payload.description || '').trim(),
    slug: String(payload.slug || '').trim(),
    status: normalizeStatus(payload.status),
    imageUrl: String(payload.imageUrl || '').trim(),
  };
}

function sanitizePromotionPayload(payload) {
  return {
    title: String(payload.title || '').trim(),
    writeUp: String(payload.writeUp || payload.description || '').trim(),
    slug: String(payload.slug || '').trim(),
    status: normalizeStatus(payload.status),
    imageUrl: String(payload.imageUrl || '').trim(),
  };
}

function sanitizeBlogPostPayload(payload) {
  return {
    title: String(payload.title || '').trim(),
    author: String(payload.author || '').trim(),
    category: String(payload.category || '').trim(),
    writeUp: String(payload.writeUp || payload.description || '').trim(),
    status: normalizeStatus(payload.status),
    slug: String(payload.slug || '').trim(),
    imageUrl: String(payload.imageUrl || '').trim(),
  };
}

function sanitizeReviewPayload(payload) {
  const rating = Number(payload.rating);
  const safeRating = Number.isFinite(rating) ? Math.max(1, Math.min(5, Math.round(rating))) : 5;

  return {
    user: String(payload.user || '').trim(),
    rating: safeRating,
    comment: String(payload.comment || '').trim(),
    status: normalizeStatus(payload.status),
    imageUrl: String(payload.imageUrl || '').trim(),
  };
}

function sanitizeSiteSettingsPayload(payload) {
  return {
    siteName: String(payload.siteName || '').trim() || store.siteSettings.siteName,
    defaultLanguage:
      String(payload.defaultLanguage || '').trim() || store.siteSettings.defaultLanguage,
    maintenanceMode: Boolean(payload.maintenanceMode),
    supportEmail: String(payload.supportEmail || '').trim() || store.siteSettings.supportEmail,
    liveChatLink: String(payload.liveChatLink || '').trim(),
    termsPage: sanitizeTermsPageSettings(payload.termsPage || {}),
    contactPage: sanitizeContactPageSettings(payload.contactPage || {}),
    jackpotSection: sanitizeJackpotSectionSettings(payload.jackpotSection || {}),
    seo: sanitizeSeoPayload(payload.seo || {}),
    socialLinks: normalizeSocialLinks(payload.socialLinks),
    withdrawalPartners: normalizeWithdrawalPartners(payload.withdrawalPartners),
  };
}

function sanitizeTermsPageSettings(payload) {
  const fallback = store.siteSettings?.termsPage || buildDefaultTermsPage();

  return {
    title: String(payload.title || '').trim() || fallback.title,
    body: String(payload.body || '').trim() || fallback.body,
  };
}

function updateSiteSettings(payload) {
  const sanitized = sanitizeSiteSettingsPayload(payload);
  store.siteSettings = {
    ...store.siteSettings,
    ...sanitized,
  };
  saveSiteSettings();
}

function loadSiteSettings() {
  try {
    if (!fs.existsSync(siteSettingsFilePath)) {
      return;
    }

    const savedSettings = JSON.parse(fs.readFileSync(siteSettingsFilePath, 'utf8'));
    store.siteSettings = {
      ...store.siteSettings,
      ...savedSettings,
      termsPage: sanitizeTermsPageSettings(savedSettings.termsPage || {}),
      seo: sanitizeSeoPayload(savedSettings.seo || store.siteSettings.seo || {}),
      contactPage: sanitizeContactPageSettings(savedSettings.contactPage || {}),
      jackpotSection: sanitizeJackpotSectionSettings(savedSettings.jackpotSection || {}),
      socialLinks: normalizeSocialLinks(savedSettings.socialLinks),
      withdrawalPartners: normalizeWithdrawalPartners(savedSettings.withdrawalPartners),
    };
  } catch (error) {
    console.warn(`Unable to load site settings: ${error.message}`);
  }
}

function saveSiteSettings() {
  try {
    fs.mkdirSync(dataDirPath, { recursive: true });
    fs.writeFileSync(siteSettingsFilePath, JSON.stringify(store.siteSettings, null, 2));
  } catch (error) {
    console.warn(`Unable to save site settings: ${error.message}`);
  }
}

function normalizeSocialLinks(value) {
  const fallback = normalizeSocialLinkEntries(store.siteSettings.socialLinks || []);
  const normalized = normalizeSocialLinkEntries(value);

  return normalized.length > 0 ? normalized : fallback;
}

function normalizeSocialLinkEntries(value) {
  const entries = Array.isArray(value)
    ? value
    : Object.entries(value || {}).map(([platform, url]) => ({
        platform,
        url,
        iconUrl: defaultSocialIcon(platform),
      }));

  return entries
    .map((entry, index) => {
      const platform = String(entry.platform || entry.id || '').trim();
      const url = String(entry.url || '').trim();
      const iconUrl = String(entry.iconUrl || '').trim() || defaultSocialIcon(platform);

      if (!platform || !url) {
        return null;
      }

      return {
        id: String(entry.id || toSlug(platform) || index + 1).trim(),
        platform,
        url,
        iconUrl,
      };
    })
    .filter(Boolean);
}

function defaultSocialIcon(platform) {
  const key = String(platform || '').toLowerCase().trim();
  const iconMap = {
    facebook: 'https://cdn.simpleicons.org/facebook/white',
    twitter: 'https://cdn.simpleicons.org/x/white',
    x: 'https://cdn.simpleicons.org/x/white',
    instagram: 'https://cdn.simpleicons.org/instagram/white',
    telegram: 'https://cdn.simpleicons.org/telegram/white',
    youtube: 'https://cdn.simpleicons.org/youtube/white',
    whatsapp: 'https://cdn.simpleicons.org/whatsapp/white',
    linkedin: 'https://cdn.simpleicons.org/linkedin/white',
    tiktok: 'https://cdn.simpleicons.org/tiktok/white',
  };

  return iconMap[key] || '';
}

function normalizeWithdrawalPartners(value) {
  const fallback = normalizeWithdrawalPartnerEntries(store.siteSettings.withdrawalPartners || []);
  const normalized = normalizeWithdrawalPartnerEntries(value);

  return normalized.length > 0 ? normalized : fallback;
}

function normalizeWithdrawalPartnerEntries(value) {
  const entries = Array.isArray(value) ? value : [];

  return entries
    .map((entry, index) => {
      const name = String(entry.name || entry.id || '').trim();
      const url = String(entry.url || '').trim();
      const imageUrl = String(entry.imageUrl || '').trim();

      if (!name) {
        return null;
      }

      return {
        id: String(entry.id || toSlug(name) || index + 1).trim(),
        name,
        url,
        imageUrl,
      };
    })
    .filter(Boolean);
}

function sanitizeSeoPayload(payload) {
  const currentSeo = store.siteSettings?.seo || {};

  return {
    title: String(payload.title || '').trim() || currentSeo.title || 'Stars777',
    description:
      String(payload.description || '').trim() ||
      currentSeo.description ||
      'Stars777 online gaming platform.',
    keywords: String(payload.keywords || '').trim() || currentSeo.keywords || '',
    canonicalUrl: String(payload.canonicalUrl || '').trim() || currentSeo.canonicalUrl || '',
    ogImageUrl: String(payload.ogImageUrl || '').trim() || currentSeo.ogImageUrl || '',
  };
}

function sanitizeContactPageSettings(payload) {
  const current = store.siteSettings?.contactPage || buildDefaultContactPage();

  return {
    title: String(payload.title || '').trim() || current.title || 'Contact Us',
    intro: String(payload.intro || '').trim() || current.intro || '',
    address: String(payload.address || '').trim() || current.address || '',
    phoneText: String(payload.phoneText || '').trim() || current.phoneText || '',
    emailText: String(payload.emailText || '').trim() || current.emailText || '',
    workingHours: String(payload.workingHours || '').trim() || current.workingHours || '',
    pressCopy: String(payload.pressCopy || '').trim() || current.pressCopy || '',
    supportCopy: String(payload.supportCopy || '').trim() || current.supportCopy || '',
    salesCopy: String(payload.salesCopy || '').trim() || current.salesCopy || '',
    liveChatImageUrl: String(payload.liveChatImageUrl || '').trim() || current.liveChatImageUrl || '',
    emailCardImageUrl: String(payload.emailCardImageUrl || '').trim() || current.emailCardImageUrl || '',
    callbackCardImageUrl: String(payload.callbackCardImageUrl || '').trim() || current.callbackCardImageUrl || '',
    faqVisualImageUrl: String(payload.faqVisualImageUrl || '').trim() || current.faqVisualImageUrl || '',
  };
}

function sanitizeJackpotSectionSettings(payload) {
  const current = store.siteSettings?.jackpotSection || buildDefaultJackpotSection();
  const defaultSection = buildDefaultJackpotSection();
  const items = normalizeJackpotItems(payload.items, current.items || defaultSection.items);

  return {
    title: String(payload.title || '').trim() || current.title || defaultSection.title,
    prizePoolLabel:
      String(payload.prizePoolLabel || '').trim() ||
      current.prizePoolLabel ||
      defaultSection.prizePoolLabel,
    totalAmount: calculateJackpotTotal(items),
    items,
  };
}

function normalizeJackpotItems(value, fallbackItems = []) {
  const entries = Array.isArray(value) ? value : [];
  const fallback = Array.isArray(fallbackItems) ? fallbackItems : [];
  const normalized = entries
    .map((entry, index) => {
      const title = String(entry?.title || '').trim();
      const imageUrl = String(entry?.imageUrl || '').trim();
      const amount = normalizeJackpotAmount(entry?.amount, 0);

      if (!title) {
        return null;
      }

      return {
        id: String(entry?.id || toSlug(title) || `jackpot-item-${index + 1}`).trim(),
        title,
        amount,
        imageUrl,
      };
    })
    .filter(Boolean);

  return normalized.length > 0 ? normalized : fallback;
}

function normalizeJackpotAmount(value, fallback) {
  const amount = Number(value);
  if (Number.isFinite(amount) && amount >= 0) {
    return Number(amount.toFixed(2));
  }

  const safeFallback = Number(fallback);
  return Number.isFinite(safeFallback) && safeFallback >= 0 ? Number(safeFallback.toFixed(2)) : 0;
}

function calculateJackpotTotal(items) {
  return Number(
    (Array.isArray(items) ? items : []).reduce(
      (sum, item) => sum + normalizeJackpotAmount(item?.amount, 0),
      0,
    ).toFixed(2),
  );
}

function sanitizeContactPayload(payload) {
  return {
    firstName: String(payload.firstName || '').trim().slice(0, 80),
    lastName: String(payload.lastName || '').trim().slice(0, 80),
    email: String(payload.email || '').trim().slice(0, 120),
    message: String(payload.message || payload.description || '').trim().slice(0, 4000),
  };
}

async function sendContactEmail(submission) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL || store.siteSettings.supportEmail;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Stars777 Contact <onboarding@resend.dev>';

  if (!apiKey || !toEmail || typeof fetch !== 'function') {
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: submission.email,
        subject: `New contact message from ${submission.firstName} ${submission.lastName}`,
        text: [
          `Name: ${submission.firstName} ${submission.lastName}`,
          `Email: ${submission.email}`,
          `Location: ${submission.location}`,
          `IP: ${submission.ip}`,
          '',
          submission.message,
        ].join('\n'),
      }),
    });

    if (!response.ok) {
      console.warn(`Contact email failed with status ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.warn(`Unable to send contact email: ${error.message}`);
    return false;
  }
}

function recordAdminLogin(req, username) {
  const login = {
    id: Date.now(),
    username: String(username || 'admin'),
    loggedAt: new Date().toISOString(),
    ip: getClientIp(req),
    location: getRequestLocation(req),
    userAgent: String(req.headers['user-agent'] || '').slice(0, 220),
  };

  store.adminLogins.unshift(login);
  store.adminLogins = store.adminLogins.slice(0, 100);
  saveAdminLogins();
}

function trackPublicTraffic(req, _res, next) {
  const pathName = req.path || '';

  if (
    req.method === 'GET' &&
    !pathName.startsWith('/api/admin') &&
    pathName !== '/api/health' &&
    !pathName.includes('.')
  ) {
    const ip = getClientIp(req);
    const userAgent = String(req.headers['user-agent'] || '').slice(0, 220);
    const visitorId = hashString(`${ip}|${userAgent}`);
    const now = new Date().toISOString();
    const visitor = store.visitors.find((entry) => entry.visitorId === visitorId);

    if (visitor) {
      visitor.lastSeenAt = now;
      visitor.visits = Number(visitor.visits || 0) + 1;
      visitor.path = pathName || '/';
    } else {
      store.visitors.unshift({
        visitorId,
        firstSeenAt: now,
        lastSeenAt: now,
        visits: 1,
        ip,
        location: getRequestLocation(req),
        userAgent,
        path: pathName || '/',
      });
    }

    store.visitors = store.visitors.slice(0, 1000);
    saveVisitors();
  }

  next();
}

function buildDashboardSummary() {
  const visitorStats = calculateVisitorStats();
  const recentVisitors = [...store.visitors]
    .sort((a, b) => new Date(b.lastSeenAt || 0) - new Date(a.lastSeenAt || 0))
    .slice(0, 8);
  const recentLogins = [...store.adminLogins]
    .sort((a, b) => new Date(b.loggedAt || 0) - new Date(a.loggedAt || 0))
    .slice(0, 8);
  const recentSubmissions = [...store.contactSubmissions]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  return {
    ...store.dashboard,
    uniqueVisitors: visitorStats.uniqueVisitors,
    todayUniqueVisitors: visitorStats.todayUniqueVisitors,
    totalVisits: visitorStats.totalVisits,
    adminLoginCount: store.adminLogins.length,
    contactSubmissionCount: store.contactSubmissions.length,
    visitorStats: {
      ...visitorStats,
      recentVisitors,
    },
    adminLogins: {
      total: store.adminLogins.length,
      recent: recentLogins,
    },
    contactSubmissions: {
      total: store.contactSubmissions.length,
      recent: recentSubmissions,
    },
    seo: store.siteSettings.seo,
  };
}

function calculateVisitorStats() {
  const today = new Date().toISOString().slice(0, 10);
  const uniqueVisitors = new Set(store.visitors.map((entry) => entry.visitorId)).size;
  const todayUniqueVisitors = new Set(
    store.visitors
      .filter((entry) => String(entry.lastSeenAt || '').startsWith(today))
      .map((entry) => entry.visitorId),
  ).size;
  const totalVisits = store.visitors.reduce((sum, entry) => sum + Number(entry.visits || 0), 0);

  return {
    uniqueVisitors,
    todayUniqueVisitors,
    totalVisits,
  };
}

function getClientIp(req) {
  const forwardedFor = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = forwardedFor || req.socket?.remoteAddress || req.ip || 'Unknown';

  return ip.replace(/^::ffff:/, '') || 'Unknown';
}

function getRequestLocation(req) {
  const city = req.headers['x-vercel-ip-city'];
  const region = req.headers['x-vercel-ip-country-region'];
  const country = req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'];
  const parts = [city, region, country].map((value) => String(value || '').trim()).filter(Boolean);

  if (parts.length > 0) {
    return parts.join(', ');
  }

  const ip = getClientIp(req);
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
    return 'Local development';
  }

  return 'Unknown location';
}

function hashString(value) {
  let hash = 0;
  const text = String(value || '');

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

function loadContactSubmissions() {
  store.contactSubmissions = readJsonArray(contactSubmissionsFilePath);
}

function saveContactSubmissions() {
  writeJsonFile(contactSubmissionsFilePath, store.contactSubmissions);
}

function loadAdminLogins() {
  store.adminLogins = readJsonArray(adminLoginsFilePath);
}

function saveAdminLogins() {
  writeJsonFile(adminLoginsFilePath, store.adminLogins);
}

function loadVisitors() {
  store.visitors = readJsonArray(visitorsFilePath);
}

function saveVisitors() {
  writeJsonFile(visitorsFilePath, store.visitors);
}

function readJsonArray(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const value = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.warn(`Unable to load ${path.basename(filePath)}: ${error.message}`);
    return [];
  }
}

function writeJsonFile(filePath, value) {
  try {
    fs.mkdirSync(dataDirPath, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
  } catch (error) {
    console.warn(`Unable to save ${path.basename(filePath)}: ${error.message}`);
  }
}

function sanitizeFaqPayload(payload) {
  return {
    question: String(payload.question || '').trim(),
    answer: String(payload.answer || '').trim(),
    status: normalizeStatus(payload.status),
  };
}
