export interface FeedbackItem {
  id: string;
  content: string;
  channel: 'Support Ticket' | 'App Store Review' | 'NPS Survey' | 'Sales Call Note' | 'Community Post';
  customerLabel: string;
  sentiment: 'POS' | 'NEU' | 'NEG';
  sentimentScore: number; // -1.0 to 1.0
  status: 'NEW' | 'REVIEWED' | 'ACTIONED';
  featureArea: string;
  themes: string[]; // Theme IDs or Names
  createdAt: string;
  aiRationale?: string;
}

export interface ThemeItem {
  id: string;
  name: string;
  description: string;
  color: string;
  count: number;
  spikePercent: number; // e.g. +65% week-over-week
  isSpiking: boolean;
  sentimentBreakdown: { pos: number; neu: number; neg: number };
}

export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ANALYST' | 'VIEWER';
  avatar: string;
}

export interface WorkspaceInfo {
  id: string;
  name: string;
  plan: string;
  memberCount: number;
}

export const INITIAL_WORKSPACE: WorkspaceInfo = {
  id: 'ws_acme_prod',
  name: 'Acme SaaS Corp',
  plan: 'Enterprise Tier',
  memberCount: 8,
};

export const INITIAL_USERS: WorkspaceUser[] = [
  { id: 'u1', name: 'Alex Rivera', email: 'alex@acme.com', role: 'ADMIN', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'u2', name: 'Sarah Chen', email: 'sarah@acme.com', role: 'ANALYST', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { id: 'u3', name: 'Marcus Vance', email: 'marcus@acme.com', role: 'VIEWER', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
];

export const INITIAL_THEMES: ThemeItem[] = [
  {
    id: 'theme_onboarding',
    name: 'Onboarding & Team Invites',
    description: 'Issues and feedback regarding team onboarding flow, invitation links, and multi-tenant setup.',
    color: '#8b5cf6', // Violet
    count: 38,
    spikePercent: 62,
    isSpiking: true,
    sentimentBreakdown: { pos: 5, neu: 8, neg: 25 },
  },
  {
    id: 'theme_sso',
    name: 'Enterprise SSO & Security',
    description: 'Requests for SAML 2.0, Okta/Azure AD integration, and granular role permissions.',
    color: '#3b82f6', // Blue
    count: 27,
    spikePercent: 40,
    isSpiking: true,
    sentimentBreakdown: { pos: 4, neu: 9, neg: 14 },
  },
  {
    id: 'theme_performance',
    name: 'Dashboard Load Performance',
    description: 'Latencies and load times when loading large analytics dashboards and exports.',
    color: '#ef4444', // Red
    count: 22,
    spikePercent: -15,
    isSpiking: false,
    sentimentBreakdown: { pos: 2, neu: 5, neg: 15 },
  },
  {
    id: 'theme_export',
    name: 'CSV & PDF Data Export',
    description: 'Feedback on data export capabilities, custom column selection, and automated scheduled reports.',
    color: '#10b981', // Emerald
    count: 19,
    spikePercent: 12,
    isSpiking: false,
    sentimentBreakdown: { pos: 14, neu: 3, neg: 2 },
  },
  {
    id: 'theme_billing',
    name: 'Invoice & Billing Portal',
    description: 'Timeouts, credit card management errors, and billing email notification controls.',
    color: '#f59e0b', // Amber
    count: 14,
    spikePercent: 28,
    isSpiking: false,
    sentimentBreakdown: { pos: 1, neu: 3, neg: 10 },
  },
];

// Seed feedback items
export const SEEDED_FEEDBACK: FeedbackItem[] = [
  {
    id: 'fb_001',
    content: 'Onboarding took forever — I couldn’t figure out how to invite my team members without contacting support.',
    channel: 'Support Ticket',
    customerLabel: 'Fintech Enterprise Customer (Tier 1)',
    sentiment: 'NEG',
    sentimentScore: -0.85,
    status: 'NEW',
    featureArea: 'Onboarding',
    themes: ['Onboarding & Team Invites'],
    createdAt: '2026-08-05T14:22:00Z',
    aiRationale: 'Strong negative tone expressing frustration with team invitation workflow during onboarding.',
  },
  {
    id: 'fb_002',
    content: 'The new dashboard is gorgeous and finally fast. Huge improvement over last month’s release!',
    channel: 'App Store Review',
    customerLabel: 'Product Designer @ ScaleUp',
    sentiment: 'POS',
    sentimentScore: 0.92,
    status: 'REVIEWED',
    featureArea: 'Dashboard UI',
    themes: ['Dashboard Load Performance'],
    createdAt: '2026-08-05T11:05:00Z',
    aiRationale: 'Very positive sentiment complimenting visual UI aesthetics and query speed.',
  },
  {
    id: 'fb_003',
    content: 'It does the job, but the mobile experience needs significant polish. Filters are cut off on small screens.',
    channel: 'NPS Survey',
    customerLabel: 'Operations Specialist',
    sentiment: 'NEU',
    sentimentScore: 0.05,
    status: 'NEW',
    featureArea: 'Mobile UX',
    themes: ['Dashboard Load Performance'],
    createdAt: '2026-08-04T18:40:00Z',
    aiRationale: 'Constructive neutral review highlighting mobile layout responsive issues.',
  },
  {
    id: 'fb_004',
    content: 'Prospect wants SAML SSO before they will sign the $45k ACV contract — third enterprise prospect asking this month.',
    channel: 'Sales Call Note',
    customerLabel: 'VP of Sales - Enterprise Deal',
    sentiment: 'NEG',
    sentimentScore: -0.65,
    status: 'ACTIONED',
    featureArea: 'Security & Auth',
    themes: ['Enterprise SSO & Security'],
    createdAt: '2026-08-04T16:15:00Z',
    aiRationale: 'High business urgency request for enterprise Single Sign-On compliance.',
  },
  {
    id: 'fb_005',
    content: 'Love the new export feature! Saved me an hour of manual spreadsheet building today.',
    channel: 'Community Post',
    customerLabel: 'Data Analyst Community User',
    sentiment: 'POS',
    sentimentScore: 0.88,
    status: 'REVIEWED',
    featureArea: 'Data Export',
    themes: ['CSV & PDF Data Export'],
    createdAt: '2026-08-04T09:30:00Z',
    aiRationale: 'Enthusiastic positive feedback celebrating time-saving data export functionality.',
  },
  {
    id: 'fb_006',
    content: 'Billing page keeps timing out whenever I try to download an historical VAT invoice.',
    channel: 'Support Ticket',
    customerLabel: 'Finance Director @ CloudCo',
    sentiment: 'NEG',
    sentimentScore: -0.78,
    status: 'NEW',
    featureArea: 'Billing & Invoicing',
    themes: ['Invoice & Billing Portal'],
    createdAt: '2026-08-03T15:10:00Z',
    aiRationale: 'Critical functional failure report regarding billing portal invoice download timeouts.',
  },
  {
    id: 'fb_007',
    content: 'Can we get automated weekly email digests sent to executives? Right now I have to export PDFs manually.',
    channel: 'NPS Survey',
    customerLabel: 'Head of Product',
    sentiment: 'NEU',
    sentimentScore: 0.15,
    status: 'NEW',
    featureArea: 'Reporting',
    themes: ['CSV & PDF Data Export'],
    createdAt: '2026-08-03T12:00:00Z',
    aiRationale: 'Feature request for scheduled automated executive report emails.',
  },
  {
    id: 'fb_008',
    content: 'Inviting sub-teams into separate workspace segments is confusing. Roles are not granular enough.',
    channel: 'Support Ticket',
    customerLabel: 'Engineering Lead @ DevStudio',
    sentiment: 'NEG',
    sentimentScore: -0.55,
    status: 'REVIEWED',
    featureArea: 'RBAC & Workspaces',
    themes: ['Onboarding & Team Invites', 'Enterprise SSO & Security'],
    createdAt: '2026-08-02T16:50:00Z',
    aiRationale: 'Negative feedback on workspace isolation clarity and role permission granularity.',
  },
  {
    id: 'fb_009',
    content: 'The Ask LOOP AI feature answered my exact question about customer complaints in seconds! Super impressive.',
    channel: 'App Store Review',
    customerLabel: 'Founder & CEO',
    sentiment: 'POS',
    sentimentScore: 0.95,
    status: 'ACTIONED',
    featureArea: 'Ask LOOP AI',
    themes: ['Dashboard Load Performance'],
    createdAt: '2026-08-02T10:20:00Z',
    aiRationale: 'Glowing testimonial praising AI semantic search accuracy and response speed.',
  },
  {
    id: 'fb_010',
    content: 'Data loading spinner hangs when switching between date ranges on the analytics dashboard.',
    channel: 'Community Post',
    customerLabel: 'Frontend Dev Community Member',
    sentiment: 'NEG',
    sentimentScore: -0.60,
    status: 'NEW',
    featureArea: 'Analytics',
    themes: ['Dashboard Load Performance'],
    createdAt: '2026-08-01T17:45:00Z',
    aiRationale: 'Bug report on UI state freezing during dashboard date range changes.',
  },
];

// Generate additional 115 items programmatically to reach 125 dataset items
const sampleChannels: FeedbackItem['channel'][] = ['Support Ticket', 'App Store Review', 'NPS Survey', 'Sales Call Note', 'Community Post'];
const sampleFeatureAreas = ['Onboarding', 'Security & Auth', 'Dashboard UI', 'Data Export', 'Billing & Invoicing', 'Ask LOOP AI', 'API & Webhooks'];

for (let i = 11; i <= 125; i++) {
  const channel = sampleChannels[i % sampleChannels.length];
  const sentiment: FeedbackItem['sentiment'] = i % 3 === 0 ? 'NEG' : i % 5 === 0 ? 'NEU' : 'POS';
  const score = sentiment === 'POS' ? 0.6 + (i % 35) / 100 : sentiment === 'NEG' ? -0.4 - (i % 55) / 100 : 0.05;
  const theme = INITIAL_THEMES[i % INITIAL_THEMES.length];
  
  let content = '';
  if (theme.id === 'theme_onboarding') {
    content = `Customer expressed ${sentiment === 'NEG' ? 'frustration' : 'satisfaction'} regarding team invite link expiration after ${i + 2} hours during setup.`;
  } else if (theme.id === 'theme_sso') {
    content = `Security compliance item #${i}: Verify SAML 2.0 integration compatibility with Azure AD and Okta directory sync.`;
  } else if (theme.id === 'theme_performance') {
    content = `Analytics table query latency observed around ${(1.1 + (i % 5) * 0.3).toFixed(1)}s when loading dataset segment #${i}.`;
  } else if (theme.id === 'theme_export') {
    content = `User requested ${sentiment === 'POS' ? 'more PDF custom branding templates' : 'faster bulk CSV export background downloads'}.`;
  } else {
    content = `Billing inquiry regarding credit card transaction processing for account ref #${1000 + i}.`;
  }

  SEEDED_FEEDBACK.push({
    id: `fb_${String(i).padStart(3, '0')}`,
    content,
    channel,
    customerLabel: `Account #${1000 + i} (${channel})`,
    sentiment,
    sentimentScore: Math.max(-1, Math.min(1, score)),
    status: i % 4 === 0 ? 'ACTIONED' : i % 2 === 0 ? 'REVIEWED' : 'NEW',
    featureArea: sampleFeatureAreas[i % sampleFeatureAreas.length],
    themes: [theme.name],
    createdAt: new Date(Date.now() - (125 - i) * 12 * 3600 * 1000).toISOString(),
    aiRationale: `Auto-classified based on keywords related to ${theme.name.toLowerCase()}.`,
  });
}
