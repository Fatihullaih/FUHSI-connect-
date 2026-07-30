import { UserProfile, Post, Comment, MarketplaceItem, VerificationRequest, Report, LeaderboardUser } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'user_1',
  nickname: '@IlaMedHero',
  realNameHidden: 'Adeyemo Oluwaseun Joseph',
  matricNumber: '2023/1042',
  studentEmail: 'adeyemo.o@fuhsi.edu.ng',
  emergencyHomePhone: '08031234567',
  department: 'Medicine & Surgery',
  level: '300L',
  bio: 'FUHSI Student | Learning & Saving Lives 🩺 | Class Rep',
  avatarKey: 'caduceus',
  badgeType: 'BLUE',
  badgeTitle: 'Class Rep & Tech Lead',
  reputationScore: 2450,
  isVerified: true,
  isPremiumUser: true
};

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    authorNickname: '@FUHSI_SUG_Official',
    authorBadgeType: 'GREEN',
    authorBadgeTitle: 'SUG Welfare Executive',
    authorAvatarKey: 'caduceus',
    department: 'All Campus',
    content: '📢 OFFICIAL SUG NOTICE: Shuttle buses will resume early morning campus pickups tomorrow by 7:00 AM sharp at Ila Main Gate. Please ensure you have your FUHSI Student ID card displayed clearly.',
    timestamp: '10m ago',
    likesCount: 84,
    commentsCount: 12,
    isLikedByMe: false,
    isBookmarkedByMe: true,
    isGhostMode: false,
    pollQuestion: 'Are you using the Campus Shuttle Service tomorrow?',
    pollOptA: 'Yes, morning shift 7AM',
    pollOptB: 'No, staying at hostel',
    pollVotesA: 42,
    pollVotesB: 18,
    isFlagged: false
  },
  {
    id: 'post_2',
    authorNickname: '@MedicStudent_2024',
    authorBadgeType: 'NONE',
    authorBadgeTitle: '',
    authorAvatarKey: 'caduceus',
    department: 'Medicine & Surgery',
    content: 'Anatomy CA 2 past questions summary for 300L MB;BS has been uploaded to the student drive. Good luck to everyone revising Upper Limb neurovasculature tonight! Stay focused!',
    timestamp: '45m ago',
    likesCount: 39,
    commentsCount: 7,
    isLikedByMe: true,
    isBookmarkedByMe: false,
    isGhostMode: false,
    isFlagged: false
  },
  {
    id: 'post_3',
    authorNickname: '@NurseQueen_Ila',
    authorBadgeType: 'BLUE',
    authorBadgeTitle: 'Clinical Skills Mentor',
    authorAvatarKey: 'stethoscope',
    department: 'Nursing Science',
    content: 'Practical examination reminders for 200L Nursing students: Sterile gloving & vitals assessment station checklist is available at the lab entrance bulletin board. Practice with your study partner today! 💉🩺',
    timestamp: '2h ago',
    likesCount: 52,
    commentsCount: 9,
    isLikedByMe: false,
    isBookmarkedByMe: false,
    isGhostMode: false,
    isFlagged: false
  },
  {
    id: 'post_4',
    authorNickname: '@LabPro_MLS',
    authorBadgeType: 'BLUE',
    authorBadgeTitle: 'Lab Practical Helper',
    authorAvatarKey: 'microscope',
    department: 'Medical Lab Science',
    content: 'Found a black Littmann Stethoscope near the General Science Lecture Theater after BCH 201 lecture. Please verify your name tag with Admin to retrieve it at the MLS Departmental office.',
    timestamp: '4h ago',
    likesCount: 28,
    commentsCount: 5,
    isLikedByMe: false,
    isBookmarkedByMe: false,
    isGhostMode: false,
    isFlagged: false
  },
  {
    id: 'post_sp1',
    authorNickname: '@Ila_Campus_Prints',
    authorBadgeType: 'PURPLE',
    authorBadgeTitle: 'Verified Campus Business',
    authorAvatarKey: 'pill',
    department: 'Services & Businesses',
    content: '⚡ SPONSORED: Fast 24/7 Color Printing, Project Binding & Past Question Photocopying right opposite Ila Campus Gate 2! Student discount: ₦30 per page. Free WhatsApp PDF submission for instant pickup!',
    timestamp: 'Sponsored',
    likesCount: 142,
    commentsCount: 18,
    isLikedByMe: false,
    isBookmarkedByMe: false,
    isGhostMode: false,
    isSponsored: true,
    sponsorName: 'Ila Print & Digital Services',
    sponsorActionUrl: 'https://wa.me/2348000000000',
    isFlagged: false
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c_1',
    postId: 'post_1',
    authorNickname: '@BioChemWhiz',
    authorBadgeType: 'NONE',
    authorAvatarKey: 'pill',
    content: 'Thank you SUG executive team! Does this shuttle schedule also apply on Saturday morning lectures?',
    timestamp: '8 mins ago'
  },
  {
    id: 'c_2',
    postId: 'post_1',
    authorNickname: '@FUHSI_SUG_Official',
    authorBadgeType: 'GREEN',
    authorAvatarKey: 'caduceus',
    content: 'Yes, Saturday morning shuttles run from 8:00 AM to 2:00 PM.',
    timestamp: '5 mins ago'
  }
];

export const INITIAL_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: 'item_1',
    title: '3M Littmann Classic III Stethoscope (Navy Blue)',
    category: 'Medical Equipment',
    sellerNickname: '@IlaMedHero',
    sellerPhone: '08031234567',
    askingPrice: 38000,
    adminApprovedPrice: 38000,
    conditionTag: 'Like New (Used 2 Weeks)',
    description: 'Original Littmann Classic III Stethoscope purchased from certified medical distributor. High acoustic sensitivity, dual-sided chestpiece. Includes extra ear tips, original box & warranty card.',
    meetupPoint: 'Main Library Entrance',
    imageUrls: [
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80'
    ],
    viewCount: 142,
    status: 'APPROVED',
    buyerDmIntentsCount: 4,
    adminNote: 'Admin Price Benchmark Verified: Fair campus market value.',
    sellerRatingStars: 5,
    sellerRatingTag: 'Trusted Seller ⭐⭐⭐⭐⭐',
    isFeatured: true,
    featuredDays: 7
  },
  {
    id: 'item_2',
    title: 'Guyton and Hall Textbook of Medical Physiology (14th Ed)',
    category: 'Textbooks & Books',
    sellerNickname: '@FutureDoctor',
    sellerPhone: '08098765432',
    askingPrice: 15000,
    adminApprovedPrice: 14500,
    conditionTag: 'Good Condition (Clean Highlights)',
    description: 'Essential textbook for 200L & 300L Physiology & Medicine. Hardcover with clear protective film. Free summary PDF notes included.',
    meetupPoint: 'School Main Gate Pavilion',
    imageUrls: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80'
    ],
    viewCount: 98,
    status: 'APPROVED',
    buyerDmIntentsCount: 2,
    adminNote: 'Price adjusted slightly to reflect minor highlighted pages.',
    sellerRatingStars: 5,
    sellerRatingTag: 'Prompt Delivery ⭐⭐⭐⭐⭐'
  },
  {
    id: 'item_4',
    title: 'Digital Sphygmomanometer Blood Pressure Monitor',
    category: 'Medical Equipment',
    sellerNickname: '@NurseQueen_Ila',
    sellerPhone: '08055554444',
    askingPrice: 18500,
    adminApprovedPrice: 18000,
    conditionTag: 'Brand New (Sealed)',
    description: 'Fully automatic digital arm BP monitor. Highly accurate readings for clinical posting practice. Battery operated & USB powered.',
    meetupPoint: 'Medical Faculty Reception',
    imageUrls: [
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80'
    ],
    viewCount: 210,
    status: 'SOLD',
    buyerDmIntentsCount: 6,
    adminNote: 'Transaction completed safely at Medical Faculty Reception.',
    sellerRatingStars: 5,
    sellerRatingTag: 'Item Matched Description ⭐⭐⭐⭐⭐'
  }
];

export const INITIAL_PENDING_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: 'item_3',
    title: 'Binocular Biological Compound Microscope 1000x',
    category: 'Lab Gear',
    sellerNickname: '@LabPro_MLS',
    sellerPhone: '08022223333',
    askingPrice: 65000,
    adminApprovedPrice: 60000,
    conditionTag: 'Very Good',
    description: 'Ideal for Medical Lab Science & Microbiology practicals. Crisp illumination, smooth coarse/fine adjustment knobs.',
    meetupPoint: 'Faculty Reception Hall',
    imageUrls: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80'
    ],
    viewCount: 15,
    status: 'PENDING',
    buyerDmIntentsCount: 0,
    adminNote: 'Pending price benchmark assessment by SUG Commerce Committee.'
  }
];

export const INITIAL_VERIFICATION_REQUESTS: VerificationRequest[] = [
  {
    id: 'vr_1',
    applicantNickname: '@NurseQueen_Ila',
    category: 'Trusted Student Leader (Clinical Skills Mentor)',
    statement: 'Served as 300L Nursing Science Class Representative and facilitated weekly peer clinical skills practice sessions.',
    timestamp: 'Yesterday',
    status: 'PENDING'
  }
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep_1',
    postId: 'post_4',
    reporterNickname: '@ConcernedStudent',
    reason: 'Possible mislaid item query - verifying ownership details.',
    timestamp: '3 hours ago',
    status: 'PENDING'
  }
];

export const TOP_LEADERBOARD_USERS: LeaderboardUser[] = [
  { rank: 1, nickname: '@FUHSI_SUG_Official', department: 'Student Union Body', level: 'Executive', avatarKey: 'caduceus', badgeType: 'GREEN', reputationScore: 3850, title: 'SUG Welfare Committee' },
  { rank: 2, nickname: '@IlaMedHero', department: 'Medicine & Surgery', level: '300L', avatarKey: 'caduceus', badgeType: 'BLUE', reputationScore: 2450, title: 'Class Rep & Tech Lead' },
  { rank: 3, nickname: '@FutureDoctor', department: 'Medicine & Surgery', level: '400L', avatarKey: 'stethoscope', badgeType: 'GOLD', reputationScore: 2180, title: 'Academic Study Lead' },
  { rank: 4, nickname: '@NurseQueen_Ila', department: 'Nursing Science', level: '300L', avatarKey: 'stethoscope', badgeType: 'BLUE', reputationScore: 1890, title: 'Clinical Skills Mentor' },
  { rank: 5, nickname: '@LabPro_MLS', department: 'Medical Lab Science', level: '400L', avatarKey: 'microscope', badgeType: 'BLUE', reputationScore: 1620, title: 'Lab Practical Helper' },
  { rank: 6, nickname: '@PreClinicalPro', department: 'Anatomy', level: '200L', avatarKey: 'caduceus', badgeType: 'NONE', reputationScore: 1250, title: 'Histology Contributor' },
  { rank: 7, nickname: '@PharmBoss', department: 'Pharmacy', level: '300L', avatarKey: 'pill', badgeType: 'NONE', reputationScore: 980, title: 'Pharmacology Helper' },
  { rank: 8, nickname: '@PhysoChamp', department: 'Physiology', level: '200L', avatarKey: 'stethoscope', badgeType: 'NONE', reputationScore: 760, title: 'CA Study Group Lead' },
  { rank: 9, nickname: '@RadiologyExpert', department: 'Radiography', level: '400L', avatarKey: 'microscope', badgeType: 'NONE', reputationScore: 540, title: 'X-Ray Guide Creator' },
  { rank: 10, nickname: '@BioChemWhiz', department: 'Biochemistry', level: '100L', avatarKey: 'pill', badgeType: 'NONE', reputationScore: 320, title: 'Enzyme Notes Share' }
];

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
    title: '✔️ Verified Student',
    icon: '✔️',
    description: 'Passed multi-factor admin verification review (3+ mos tenure, 0 strikes, 1200+ rep).',
    isUnlocked: true,
    progressPct: 100,
    unlockedAt: 'Verified',
    category: 'Verification' as const,
    rewardPoints: 300
  }
];

export const INITIAL_VERIFICATION_CANDIDATES = [
  {
    id: 'cand_1',
    nickname: '@FutureDoctor',
    realName: 'Adekanmi Samuel Folorunsho',
    matricNumber: '2022/0412',
    emergencyHomePhone: '08021114455',
    department: 'Medicine & Surgery',
    level: '400L',
    accountAgeDays: 110,
    reputationScore: 3180,
    likesReceived: 314,
    commentsCount: 142,
    qualityPostsCount: 24,
    strikes: 0,
    status: 'ELIGIBLE_PENDING_ADMIN' as const,
    submittedAt: 'Today at 08:30 AM'
  },
  {
    id: 'cand_2',
    nickname: '@NurseQueen_Ila',
    realName: 'Okonkwo Chinedu Emmanuel',
    matricNumber: '2022/0891',
    emergencyHomePhone: '08098765432',
    department: 'Nursing Science',
    level: '300L',
    accountAgeDays: 95,
    reputationScore: 3050,
    likesReceived: 268,
    commentsCount: 114,
    qualityPostsCount: 19,
    strikes: 0,
    status: 'ELIGIBLE_PENDING_ADMIN' as const,
    submittedAt: 'Yesterday at 04:15 PM'
  },
  {
    id: 'cand_3',
    nickname: '@LabPro_MLS',
    realName: 'Bamidele Victoria Timileyin',
    matricNumber: '2021/0530',
    emergencyHomePhone: '08139998877',
    department: 'Medical Lab Science',
    level: '400L',
    accountAgeDays: 140,
    reputationScore: 3420,
    likesReceived: 352,
    commentsCount: 148,
    qualityPostsCount: 31,
    strikes: 0,
    status: 'APPROVED_VERIFIED' as const,
    submittedAt: '3 days ago'
  }
];

export const WEEKLY_CAMPUS_RANKINGS = {
  topEngaging: [
    { rank: 1, nickname: '@FutureDoctor', department: 'Medicine & Surgery', level: '400L', avatarKey: 'stethoscope', badgeType: 'GOLD' as const, badgeTitle: 'Academic Study Lead', metricLabel: 'Weekly Engagements', metricValue: '342 interactions', changeTag: '⬆️ +2 ranks' },
    { rank: 2, nickname: '@IlaMedHero', department: 'Medicine & Surgery', level: '300L', avatarKey: 'caduceus', badgeType: 'BLUE' as const, badgeTitle: 'Class Rep & Tech Lead', metricLabel: 'Weekly Engagements', metricValue: '298 interactions', changeTag: '🔥 Hot' },
    { rank: 3, nickname: '@NurseQueen_Ila', department: 'Nursing Science', level: '300L', avatarKey: 'stethoscope', badgeType: 'BLUE' as const, badgeTitle: 'Clinical Skills Mentor', metricLabel: 'Weekly Engagements', metricValue: '254 interactions', changeTag: '⭐ Steady' },
    { rank: 4, nickname: '@PharmBoss', department: 'Pharmacy', level: '300L', avatarKey: 'pill', badgeType: 'NONE' as const, metricLabel: 'Weekly Engagements', metricValue: '190 interactions', changeTag: '⬆️ +4 ranks' },
    { rank: 5, nickname: '@LabPro_MLS', department: 'Medical Lab Science', level: '400L', avatarKey: 'microscope', badgeType: 'BLUE' as const, metricLabel: 'Weekly Engagements', metricValue: '175 interactions', changeTag: '⭐ Steady' },
    { rank: 6, nickname: '@PreClinicalPro', department: 'Anatomy', level: '200L', avatarKey: 'caduceus', badgeType: 'NONE' as const, metricLabel: 'Weekly Engagements', metricValue: '148 interactions', changeTag: '⬆️ +1 rank' },
    { rank: 7, nickname: '@PhysoChamp', department: 'Physiology', level: '200L', avatarKey: 'stethoscope', badgeType: 'NONE' as const, metricLabel: 'Weekly Engagements', metricValue: '132 interactions', changeTag: '⭐ Steady' },
    { rank: 8, nickname: '@QueenNurse', department: 'Nursing Science', level: '400L', avatarKey: 'stethoscope', badgeType: 'GOLD' as const, metricLabel: 'Weekly Engagements', metricValue: '115 interactions', changeTag: '⭐ Steady' },
    { rank: 9, nickname: '@RadiologyExpert', department: 'Radiography', level: '400L', avatarKey: 'microscope', badgeType: 'NONE' as const, metricLabel: 'Weekly Engagements', metricValue: '98 interactions', changeTag: '⬆️ +2 ranks' },
    { rank: 10, nickname: '@BioChemWhiz', department: 'Biochemistry', level: '100L', avatarKey: 'pill', badgeType: 'NONE' as const, metricLabel: 'Weekly Engagements', metricValue: '84 interactions', changeTag: '🆕 New' }
  ],
  topHelpful: [
    { rank: 1, nickname: '@IlaMedHero', department: 'Medicine & Surgery', level: '300L', avatarKey: 'caduceus', badgeType: 'BLUE' as const, metricLabel: 'Study Downloads', metricValue: '1,420 downloads', changeTag: '🥇 Top Helper' },
    { rank: 2, nickname: '@LabPro_MLS', department: 'Medical Lab Science', level: '400L', avatarKey: 'microscope', badgeType: 'BLUE' as const, metricLabel: 'Study Downloads', metricValue: '980 downloads', changeTag: '🥈 Silver Helper' },
    { rank: 3, nickname: '@FutureDoctor', department: 'Medicine & Surgery', level: '400L', avatarKey: 'stethoscope', badgeType: 'GOLD' as const, metricLabel: 'Study Downloads', metricValue: '860 downloads', changeTag: '🥉 Bronze Helper' },
    { rank: 4, nickname: '@NurseQueen_Ila', department: 'Nursing Science', level: '300L', avatarKey: 'stethoscope', badgeType: 'BLUE' as const, metricLabel: 'Study Downloads', metricValue: '640 downloads', changeTag: '⭐ Steady' },
    { rank: 5, nickname: '@PreClinicalPro', department: 'Anatomy', level: '200L', avatarKey: 'caduceus', badgeType: 'NONE' as const, metricLabel: 'Study Downloads', metricValue: '510 downloads', changeTag: '⬆️ +3 ranks' },
    { rank: 6, nickname: '@PharmBoss', department: 'Pharmacy', level: '300L', avatarKey: 'pill', badgeType: 'NONE' as const, metricLabel: 'Study Downloads', metricValue: '430 downloads', changeTag: '⭐ Steady' },
    { rank: 7, nickname: '@PhysoChamp', department: 'Physiology', level: '200L', avatarKey: 'stethoscope', badgeType: 'NONE' as const, metricLabel: 'Study Downloads', metricValue: '390 downloads', changeTag: '⭐ Steady' },
    { rank: 8, nickname: '@RadiologyExpert', department: 'Radiography', level: '400L', avatarKey: 'microscope', badgeType: 'NONE' as const, metricLabel: 'Study Downloads', metricValue: '310 downloads', changeTag: '⭐ Steady' },
    { rank: 9, nickname: '@QueenNurse', department: 'Nursing Science', level: '400L', avatarKey: 'stethoscope', badgeType: 'GOLD' as const, metricLabel: 'Study Downloads', metricValue: '280 downloads', changeTag: '⭐ Steady' },
    { rank: 10, nickname: '@BioChemWhiz', department: 'Biochemistry', level: '100L', avatarKey: 'pill', badgeType: 'NONE' as const, metricLabel: 'Study Downloads', metricValue: '210 downloads', changeTag: '🆕 New' }
  ],
  topTrendingPosts: [
    { rank: 1, nickname: '@FUHSI_SUG_Official', snippet: '📢 OFFICIAL SUG NOTICE: Shuttle buses will resume early morning pickups...', category: 'General', engagement: '112 likes • 28 comments' },
    { rank: 2, nickname: '@MedicStudent_2024', snippet: 'Anatomy CA 2 past questions summary for 300L MB;BS has been uploaded...', category: 'Academic', engagement: '89 likes • 34 comments' },
    { rank: 3, nickname: '@NurseQueen_Ila', snippet: 'Vital signs clinical OSCE tutorial session holding this Saturday at Nursing Lab...', category: 'Events', engagement: '76 likes • 19 comments' },
    { rank: 4, nickname: '@PharmBoss', snippet: 'Pharmacology drug classification cheatsheet available for download!', category: 'Academic', engagement: '64 likes • 22 comments' },
    { rank: 5, nickname: '@FutureDoctor', snippet: 'Tips for passing MB 1 Pathology & Microbiology on your first attempt...', category: 'Academic', engagement: '58 likes • 15 comments' }
  ]
};

export const INITIAL_COMMUNITY_FUND = {
  totalFundRaised: 348500,
  currentMonthBalance: 125000,
  activeDonorsCount: 86,
  lastAuditDate: 'July 2026 Monthly Report',
  allocationBreakdown: {
    serversAndMaintenancePct: 40,
    featureDevelopmentPct: 30,
    campusActivitiesPct: 20,
    emergencyReservePct: 10
  },
  recentExpenditures: [
    { id: 'exp_1', description: 'Cloud Run Container Hosting & Database Renewal', amount: 48000, category: 'App Maintenance (40%)', date: 'July 15, 2026' },
    { id: 'exp_2', description: 'Weekly Campus Leaderboard Quiz Prizes & Student Data Subsidies', amount: 25000, category: 'Campus Activities (20%)', date: 'July 20, 2026' },
    { id: 'exp_3', description: 'Push Notifications & SMS Verification API Tokens', amount: 18000, category: 'Feature Dev (30%)', date: 'July 24, 2026' },
    { id: 'exp_4', description: 'Emergency Server Traffic Spike Capacity Allocation', amount: 10000, category: 'Emergency Reserve (10%)', date: 'July 28, 2026' }
  ]
};
