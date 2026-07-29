export type PrivacyMode = 'Anonymous' | 'Nickname' | 'Public';

export type PostCategory = 'General' | 'Academic' | 'Events' | 'Confessions' | 'Marketplace' | 'LostAndFound';

export type PostStatus = 'Active' | 'UnderReview' | 'Removed';

export type BadgeType = 'NONE' | 'BLUE' | 'GOLD' | 'GREEN' | 'RED' | 'PURPLE';

export interface UserProfile {
  id: string;
  nickname: string;
  realNameHidden?: string;
  realName?: string;
  matricNumber?: string;
  studentId?: string;
  studentEmail?: string;
  emergencyHomePhone?: string;
  department: string;
  level: string;
  bio: string;
  avatarKey?: string;
  avatarId?: string;
  badgeType?: BadgeType;
  badgeTitle?: string;
  badge?: string;
  reputationScore?: number;
  reputationPoints?: number;
  isVerified?: boolean;
  isPremiumUser?: boolean;
  strikes?: number;
  isBanned?: boolean;
  privacyMode?: PrivacyMode;
}

export interface Comment {
  id: string;
  postId: string;
  authorNickname: string;
  authorBadgeType?: BadgeType | string;
  authorAvatarKey?: string;
  authorAvatarId?: string;
  content: string;
  timestamp: string;
  upvotes?: number;
  userVote?: 'up' | 'down' | null;
}

export interface Post {
  id: string;
  authorNickname: string;
  authorBadgeType?: BadgeType | string;
  authorBadgeTitle?: string;
  authorAvatarKey?: string;
  authorAvatarId?: string;
  authorDepartment?: string;
  authorLevel?: string;
  department?: string;
  category?: PostCategory;
  content: string;
  imageResName?: string;
  videoUri?: string;
  timestamp: string;
  likesCount?: number;
  upvotes?: number;
  downvotes?: number;
  commentsCount?: number;
  commentCount?: number;
  shareCount?: number;
  isLikedByMe?: boolean;
  isBookmarkedByMe?: boolean;
  isBookmarked?: boolean;
  userVote?: 'up' | 'down' | null;
  isGhostMode?: boolean;
  pollQuestion?: string;
  pollOptA?: string;
  pollOptB?: string;
  pollVotesA?: number;
  pollVotesB?: number;
  userVotedOpt?: 'A' | 'B';
  isFlagged?: boolean;
  flagReason?: string;
  status?: PostStatus;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  category: string;
  sellerNickname: string;
  sellerPhone: string;
  askingPrice: number;
  adminApprovedPrice: number;
  conditionTag: string;
  description: string;
  meetupPoint: string;
  imageUrls: string[];
  viewCount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SOLD';
  buyerDmIntentsCount: number;
  adminNote?: string;
  sellerRatingStars?: number;
  sellerRatingTag?: string;
}

export interface VerificationRequest {
  id: string;
  applicantNickname: string;
  category: string;
  statement: string;
  timestamp: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Report {
  id: string;
  postId: string;
  reporterNickname: string;
  reason: string;
  timestamp: string;
  status: 'PENDING' | 'DISMISSED' | 'QUARANTINED';
}

export interface ModerationReport {
  id: string;
  postId: string;
  postContent: string;
  postAuthor: string;
  reportedBy: string;
  reason: string;
  timestamp: string;
  status: 'Pending' | 'Approved' | 'Dismissed' | 'ActionTaken';
  notes?: string;
}

export interface LeaderboardUser {
  rank: number;
  nickname: string;
  department: string;
  level: string;
  avatarKey: string;
  badgeType: BadgeType;
  reputationScore: number;
  title: string;
}

export interface DepartmentRanking {
  name: string;
  code: string;
  totalPoints: number;
  activeStudents: number;
  topContributor: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'Academic' | 'Administrative' | 'Hostel' | 'Exam' | 'General';
  publisher: string;
  date: string;
  urgent: boolean;
  read?: boolean;
}

export interface Resource {
  id: string;
  title: string;
  courseCode: string;
  department: string;
  level: string;
  fileType: 'PDF' | 'DOCX' | 'PPTX' | 'ZIP';
  fileSize: string;
  uploaderNickname: string;
  downloads: number;
  rating: number;
  dateAdded: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  category: 'Seminar' | 'Sports' | 'Social' | 'Workshop' | 'Health';
  organizer: string;
  description: string;
  rsvpCount: number;
  isRsvped?: boolean;
}

