export const PROFILE = {
  name: 'Abhishek Rana',
  role: 'Backend Software Engineer',
  email: 'abhishek.rana.tech@gmail.com',
  phone: '+91 88378 89272',
  linkedin: 'https://www.linkedin.com/in/abhishek-rana-a8ba73203',
  resume: './Abhishek_Rana_Resume.pdf',
}

// section: index into SECTIONS in state.js, which picks the 3D model shown beside it.
export const FEATURED = [
  {
    id: 'enfineo',
    section: 2,
    kind: 'Work · Antier Solutions',
    year: '2026',
    title: 'Enfineo Bank',
    subtitle: 'Admin dashboards & microservices',
    summary: 'A digital bank that combines fiat accounts, IBAN cards and crypto wallets on a Node.js and TypeScript microservices platform. I built its Financial and AML admin dashboards end to end, across 7 of the platform\'s services.',
    points: [
      'Split the admin dashboard into Financial and AML views, served from Redis-cached metrics with day, week, month and custom periods.',
      'Cache warm-up over gRPC: user, KYC, crypto, banking and aggregator services seed dashboard caches on startup and refresh them fault-tolerantly.',
      'Paginated flagged-transaction and KYT (Know Your Transaction) APIs over gRPC, integrated with the KYC service.',
      'Role-based access control with module and sub-module permissions, a permission-tree UI and master-admin restrictions.',
      'Audit log of every admin database change; multi-sheet Excel export and bulk campaign export.',
      'React 18 admin screens: IBAN card volumes in EUR, top-country drill-downs and scrollable KYT tables.',
    ],
    pipeline: 'React admin portal\n  → admin-service (REST)\n      ⇄ gRPC  user · kyc · crypto\n              banking · aggregator\n      → Redis       dashboard cache\n      → PostgreSQL  Sequelize\nservices ⇄ RabbitMQ (retry + DLQ)',
    tags: ['Node.js', 'TypeScript', 'gRPC', 'RabbitMQ', 'Redis', 'PostgreSQL', 'React 18', 'RBAC'],
    links: [{ label: 'enfineo.com', url: 'https://enfineo.com' }],
    note: 'Client work, code is private',
  },
  {
    id: 'lendary',
    section: 3,
    kind: 'Work · Antier Solutions',
    year: '2026',
    title: 'Lendary',
    subtitle: 'Crypto lending & staking platform',
    summary: 'Users take crypto-backed loans, stake and vest tokens, buy the LRY token and vote on governance proposals from a mobile app. I built backend APIs and the admin panel, and fixed issues found in the platform\'s security audit.',
    points: [
      'REST APIs behind the app: sign-up with email OTP, password reset, KYC through Sumsub, loans with collateral and repayment, staking, vesting, LRY sales, governance votes, wallet deposits and withdrawals.',
      'Web admin panel for operations staff: user profiles, KYC review and back-office payments.',
      'Documented the API for the mobile and admin teams, and split frontend and backend into separate services.',
      'Fixed security-audit findings to harden authentication, validation and data access.',
    ],
    pipeline: 'mobile app · admin panel\n  → Lendary REST API\n      auth · email OTP · KYC (Sumsub)\n      loans · collateral · repayment\n      staking · vesting · LRY sale\n      governance votes · wallet\n  → back-office payments',
    tags: ['REST APIs', 'Admin panel', 'Sumsub KYC', 'Crypto lending', 'Staking', 'Security fixes'],
    links: [],
    note: 'Client work, code is private',
  },
  {
    id: 'finder',
    section: 4,
    kind: 'Personal project',
    year: '2026',
    title: 'Hiring Post Finder',
    subtitle: 'Chrome extension · Gemini',
    summary: 'A Chrome extension that finds LinkedIn posts where people are hiring for your role and skills, filters out the noise with Google Gemini, and pulls out the job details.',
    points: [
      'Searches LinkedIn posts newest-first and scrolls to collect them, then runs a local whole-word skill match before calling the AI.',
      'Gemini classifies each batch with a strict JSON schema: real job post or not, role match, company, location, work mode, contact and apply link.',
      'Hides posts you already liked or marked as applied, and remembers them across searches.',
      'Retries on rate limits, falls back to a working Gemini model if the configured one is retired, exports to CSV or JSON.',
    ],
    pipeline: 'search  → scroll & collect\n        → skip applied (likes)\n        → local skill match\n        → Gemini (JSON schema)\n        → results · CSV / JSON',
    tags: ['JavaScript', 'Chrome MV3', 'Gemini API', 'Side panel UI'],
    links: [{ label: 'Download v1.1.0 (.zip)', url: './linkedin_hiring_post_finder-1.1.0.zip', download: true }],
    note: 'Unzip, then load it in chrome://extensions with Developer mode on',
  },
]

export const MORE_WORK = [
  {
    title: 'CeFi & Web3 backend services',
    org: 'Antier Solutions',
    year: '2023 – now',
    text: 'Event-driven NestJS microservices over Kafka, RabbitMQ and gRPC; BullMQ queues and Redis caching; balance updates in transactions with deadlock-safe ordering and retries.',
    tags: ['NestJS', 'Kafka', 'BullMQ', 'Web3.js'],
  },
  {
    title: 'E-commerce platform',
    org: 'CQLsys',
    year: '2021 – 2023',
    text: 'Node.js and Express REST APIs for catalog, search, cart, checkout and orders, with sign-up, login and an admin side for products and stock. React storefront.',
    tags: ['Node.js', 'Express', 'React', 'MongoDB', 'MySQL'],
  },
]

export const SKILLS = [
  { group: 'Languages', items: ['JavaScript', 'TypeScript', 'SQL'] },
  { group: 'Backend', items: ['Node.js', 'NestJS', 'Express.js', 'REST', 'Microservices', 'Event-driven design'] },
  { group: 'Messaging', items: ['Kafka', 'RabbitMQ', 'gRPC', 'Redis', 'BullMQ', 'Socket.io'] },
  { group: 'Databases', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Indexing', 'Query tuning'] },
  { group: 'Fintech & Web3', items: ['Banking as a Service', 'CeFi', 'Web3.js', 'KYC / KYT'] },
  { group: 'Frontend & tools', items: ['React.js', 'Docker', 'Git', 'JIRA', 'Postman', 'Chrome Extensions'] },
]

export const JOBS = [
  {
    when: 'Mar 2023 — Now',
    role: 'Software Engineer',
    org: 'Antier Solutions · Mohali',
    points: [
      'Backend services in Node.js, NestJS and TypeScript for the CeFi business line, including Banking-as-a-Service platforms.',
      'Event-driven microservices with Kafka and RabbitMQ, gRPC between services.',
      'Background jobs and scheduling with BullMQ; Redis for caching and session state.',
      'Blockchain features with Web3.js: wallet balances, token transfers, deposits and withdrawals.',
      'Financial data kept correct with transactions, deadlock-safe locking, reversible migrations and parameterized queries.',
      'React.js admin dashboards that stay fast on millions of rows.',
    ],
  },
  {
    when: 'Mar 2021 — Feb 2023',
    role: 'Web Developer',
    org: 'CQLsys Technologies · Mohali',
    points: [
      'Built and maintained REST APIs and web apps with Node.js and Express.js.',
      'Modeled and queried data across MySQL, PostgreSQL and MongoDB.',
      'Tested and documented APIs with Postman; front-end features in React.js.',
      'Agile team workflow with Git and JIRA.',
    ],
  },
  {
    when: '2016 — 2019',
    role: 'BCA',
    org: 'Punjabi University · Patiala',
    points: [],
  },
]

export const CAREER_LOG = [
  ['2016-08', 'Started BCA, Punjabi University'],
  ['2019-10', 'Graduated, BCA'],
  ['2021-03', 'Joined CQLsys as Web Developer'],
  ['2023-03', 'Joined Antier Solutions, CeFi'],
  ['now', 'Shipping BaaS microservices on Kafka & NestJS'],
]

export const MARQUEE = ['Node.js', 'NestJS', 'TypeScript', 'Kafka', 'RabbitMQ', 'gRPC', 'Redis', 'BullMQ', 'PostgreSQL', 'MongoDB', 'Web3.js', 'React', 'Docker']
