import { UserProfile, Post, Comment, MarketplaceItem, VerificationRequest, Report, LeaderboardUser, WeeklyRankingItem, WeeklyTrendingPost, CommunityFundSummary } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'usr_admin_modula',
  nickname: '@modula',
  realName: 'Executive Admin Council Officer',
  matricNumber: 'FUHSI/ADMIN/001',
  studentEmail: 'fuhsiconnectsupport@gmail.com',
  emergencyHomePhone: '08000000000',
  department: 'FUHSI Administration',
  level: 'Council',
  bio: 'Primary Executive Admin Council Officer (@modula).',
  avatarKey: '1',
  badgeType: 'GOLD',
  badgeTitle: 'Official Admin',
  reputationScore: 9999,
  isVerified: true,
  isApproved: true,
  isDeclined: false,
  isAdmin: true,
};

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_COMMENTS: Comment[] = [];

export const INITIAL_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: 'item_techno_k15k',
    title: 'TECHNO K15K',
    category: 'Phones',
    sellerNickname: 'Samuel Obafemi',
    sellerPhone: '08012345678',
    askingPrice: 65000,
    adminApprovedPrice: 65000,
    conditionTag: '128GB and 4GB RAM',
    description: '128GB and 4GB RAM. Pristine working condition with original charger. Clean battery health and dual SIM.',
    meetupPoint: '📍 Ayeka, Ondo State',
    imageUrls: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80'
    ],
    viewCount: 24,
    status: 'APPROVED',
    buyerDmIntentsCount: 2,
    isFeatured: true,
  },
  {
    id: 'item_stethoscope_sold',
    title: '3M Littmann Classic III Stethoscope',
    category: 'Medical Equipment',
    sellerNickname: 'Dr_Chidi',
    sellerPhone: '08023456789',
    askingPrice: 48000,
    adminApprovedPrice: 48000,
    conditionTag: 'Mint Condition / Medical Grade',
    description: 'Original Littmann Classic III in Navy Blue tube with stainless steel chestpiece. Used gently for 1 clinical rotation.',
    meetupPoint: '📍 Medical Faculty Reception',
    imageUrls: [
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'
    ],
    viewCount: 68,
    status: 'SOLD',
    soldAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    sellerRatingStars: 5,
    sellerRatingTag: 'Honest Seller ⭐⭐⭐⭐⭐',
    buyerDmIntentsCount: 5,
  },
  {
    id: 'item_laptop_hp',
    title: 'HP Pavilion 15 (Core i5, 512GB SSD)',
    category: 'Electronics',
    sellerNickname: 'Tech_Senior',
    sellerPhone: '08034567890',
    askingPrice: 210000,
    adminApprovedPrice: 210000,
    conditionTag: '8GB RAM • 512GB NVMe • Backlit Keyboard',
    description: 'Very fast laptop suitable for medical imaging software, virtual lab simulation, and coding. 5 hours battery backup.',
    meetupPoint: '📍 FUHSI Main Gate / Library',
    imageUrls: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80'
    ],
    viewCount: 42,
    status: 'APPROVED',
    buyerDmIntentsCount: 3,
  },
  {
    id: 'item_anatomy_sold_today',
    title: "Gray's Anatomy for Students (4th Edition)",
    category: 'Textbooks',
    sellerNickname: 'Nurse_Folake',
    sellerPhone: '08045678901',
    askingPrice: 18000,
    adminApprovedPrice: 18000,
    conditionTag: 'Hardcover • Crisp Pages',
    description: 'Essential clinical anatomy book with high-res diagram plates and clinical case summaries.',
    meetupPoint: '📍 Central Cafeteria Complex',
    imageUrls: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
    ],
    viewCount: 35,
    status: 'SOLD',
    soldAt: new Date().toISOString(), // Sold today
    sellerRatingStars: 5,
    sellerRatingTag: 'Great Condition',
    buyerDmIntentsCount: 4,
  }
];

export const INITIAL_PENDING_MARKETPLACE_ITEMS: MarketplaceItem[] = [];

export const INITIAL_VERIFICATION_REQUESTS: VerificationRequest[] = [];

export const INITIAL_REPORTS: Report[] = [];

export const TOP_LEADERBOARD_USERS: LeaderboardUser[] = [];

export const INITIAL_ACHIEVEMENTS = [
  {
    id: 'ach_1',
    title: '🌟 Rising Star',
    icon: '🌟',
    description: 'Earned 100+ reputation points during your first month on campus.',
    isUnlocked: true,
    progressPct: 100,
    unlockedAt: '1 month ago',
    category: 'Engagement' as const,
    rewardPoints: 50
  },
  {
    id: 'ach_2',
    title: '🔥 Trending Creator',
    icon: '🔥',
    description: 'Sparked a post that generated 25+ peer comments and active discussions.',
    isUnlocked: true,
    progressPct: 100,
    unlockedAt: '2 weeks ago',
    category: 'Engagement' as const,
    rewardPoints: 100
  },
  {
    id: 'ach_3',
    title: '🎓 Academic Helper',
    icon: '🎓',
    description: 'Uploaded 5 verified lecture summaries, past questions, or clinical notes.',
    isUnlocked: true,
    progressPct: 100,
    unlockedAt: '3 days ago',
    category: 'Academic' as const,
    rewardPoints: 150
  },
  {
    id: 'ach_4',
    title: '💬 Top Commenter',
    icon: '💬',
    description: 'Contributed 50+ constructive answers and peer advice replies.',
    isUnlocked: true,
    progressPct: 100,
    unlockedAt: 'Yesterday',
    category: 'Community' as const,
    rewardPoints: 100
  },
  {
    id: 'ach_5',
    title: '❤️ Most Appreciated',
    icon: '❤️',
    description: 'Received 100+ likes on study guides and answers provided to peers.',
    isUnlocked: true,
    progressPct: 100,
    unlockedAt: '5 days ago',
    category: 'Engagement' as const,
    rewardPoints: 120
  },
  {
    id: 'ach_6',
    title: '🏆 Campus Influencer',
    icon: '🏆',
    description: 'Ranked in the Top 10 on the Weekly Campus Leaderboard.',
    isUnlocked: true,
    progressPct: 100,
    unlockedAt: 'This Week',
    category: 'Engagement' as const,
    rewardPoints: 200
  },
  {
    id: 'ach_7',
    title: 'FUHSI Student',
    icon: '✔️',
    description: 'Passed multi-factor admin verification review (3+ mos tenure, 0 strikes, 1200+ rep).',
    isUnlocked: true,
    progressPct: 100,
    unlockedAt: 'Verified',
    category: 'Verification' as const,
    rewardPoints: 300
  }
];

export const INITIAL_VERIFICATION_CANDIDATES: any[] = [];

export const WEEKLY_CAMPUS_RANKINGS: {
  topEngaging: WeeklyRankingItem[];
  topHelpful: WeeklyRankingItem[];
  topTrendingPosts: WeeklyTrendingPost[];
} = {
  topEngaging: [],
  topHelpful: [],
  topTrendingPosts: []
};

export const INITIAL_COMMUNITY_FUND: CommunityFundSummary = {
  totalFundRaised: 348500,
  currentMonthBalance: 125000,
  activeDonorsCount: 86,
  lastAuditDate: 'August 2026 Monthly Report',
  allocationBreakdown: {
    serversAndMaintenancePct: 40,
    featureDevelopmentPct: 30,
    campusActivitiesPct: 20,
    emergencyReservePct: 10
  },
  recentExpenditures: []
};

