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
    timestamp: '10 mins ago',
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
    timestamp: '45 mins ago',
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
    timestamp: '2 hours ago',
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
    timestamp: '4 hours ago',
    likesCount: 28,
    commentsCount: 5,
    isLikedByMe: false,
    isBookmarkedByMe: false,
    isGhostMode: false,
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
    description: 'Original Littmann Classic III Stethoscope purchased from certified medical distributor. High acoustic sensitivity, dual-sided chestpiece. Includes extra ear tips.',
    meetupPoint: 'Main Library Entrance',
    imageUrls: [
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80'
    ],
    viewCount: 142,
    status: 'APPROVED',
    buyerDmIntentsCount: 4,
    adminNote: 'Admin Price Benchmark Verified: Fair campus market value.',
    sellerRatingStars: 5,
    sellerRatingTag: 'Trusted Seller ⭐⭐⭐⭐⭐'
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
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
    ],
    viewCount: 98,
    status: 'APPROVED',
    buyerDmIntentsCount: 2,
    adminNote: 'Price adjusted slightly to reflect minor highlighted pages.',
    sellerRatingStars: 5,
    sellerRatingTag: 'Prompt Delivery ⭐⭐⭐⭐⭐'
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
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'
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
