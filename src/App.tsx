import React, { useState } from 'react';
import {
  INITIAL_USER_PROFILE,
  INITIAL_POSTS,
  INITIAL_COMMENTS,
  INITIAL_MARKETPLACE_ITEMS,
  INITIAL_PENDING_MARKETPLACE_ITEMS,
  INITIAL_VERIFICATION_REQUESTS,
  INITIAL_REPORTS,
} from './data/initialData';
import { UserProfile, Post, Comment, MarketplaceItem, VerificationRequest, Report, BadgeType } from './types';
import { FeedScreen } from './screens/FeedScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { CampusHubScreen } from './screens/CampusHubScreen';
import { ModerationScreen } from './screens/ModerationScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { CreatePostModal } from './components/CreatePostModal';
import { PostDetailModal } from './components/PostDetailModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { DynamicFeedIcon, LeaderboardIcon, StorefrontIcon, ShieldIcon, BadgeIcon } from './components/NavIcons';
import { Smartphone, Download } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation State
  const [navIndex, setNavIndex] = useState(0);
  const [showPwaModal, setShowPwaModal] = useState(false);

  // App Core State
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>(INITIAL_MARKETPLACE_ITEMS);
  const [pendingMarketplaceItems, setPendingMarketplaceItems] = useState<MarketplaceItem[]>(INITIAL_PENDING_MARKETPLACE_ITEMS);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(INITIAL_VERIFICATION_REQUESTS);
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);

  // Filter & Selected Item Modals
  const [selectedFilter, setSelectedFilter] = useState('All Campus');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  // Anti-doxxing helper function: checks phone numbers, email, links, or matric numbers
  const checkDoxxingThreats = (text: string): string | null => {
    const phoneRegex = /(\+?234|0)[789][01]\d{8}/;
    const urlRegex = /(https?:\/\/[^\s]+|wa\.me\/[^\s]+|www\.[^\s]+)/i;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

    if (phoneRegex.test(text)) {
      return 'Phone number detected in post text. Numbers will be redacted to protect student privacy.';
    }
    if (urlRegex.test(text)) {
      return 'External web link detected. Links are sanitized to prevent spam & external scams.';
    }
    if (emailRegex.test(text)) {
      return 'Email address detected. External contacts are sanitized.';
    }
    return null;
  };

  // Redact sensitive patterns from text
  const sanitizeText = (text: string): string => {
    let sanitized = text;
    const phoneRegex = /(\+?234|0)[\s-]*[789][01][\s-]*\d{3,4}[\s-]*\d{4}/g;
    const genericDigitsRegex = /\b\d{4}[\s-]?\d{3,4}[\s-]?\d{3,4}\b/g;
    const urlRegex = /(https?:\/\/[^\s]+|wa\.me\/[^\s]+|t\.me\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|ng|edu|org|net|io|me)\b[^\s]*)/gi;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    sanitized = sanitized.replace(urlRegex, '(******)');
    sanitized = sanitized.replace(emailRegex, '(******)');
    sanitized = sanitized.replace(phoneRegex, '(******)');
    sanitized = sanitized.replace(genericDigitsRegex, '(******)');
    return sanitized;
  };

  // Handlers for Feed
  const handleLikeClick = (post: Post) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === post.id) {
          const isLiked = !p.isLikedByMe;
          return {
            ...p,
            isLikedByMe: isLiked,
            likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1,
          };
        }
        return p;
      })
    );
  };

  const handleBookmarkClick = (post: Post) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === post.id) {
          return { ...p, isBookmarkedByMe: !p.isBookmarkedByMe };
        }
        return p;
      })
    );
  };

  const handleVotePoll = (post: Post, option: 'A' | 'B') => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === post.id) {
          if (p.userVotedOpt) return p; // Already voted
          return {
            ...p,
            userVotedOpt: option,
            pollVotesA: option === 'A' ? p.pollVotesA + 1 : p.pollVotesA,
            pollVotesB: option === 'B' ? p.pollVotesB + 1 : p.pollVotesB,
          };
        }
        return p;
      })
    );
  };

  const handleReportPost = (post: Post, reason: string) => {
    const newReport: Report = {
      id: `rep_${Date.now()}`,
      postId: post.id,
      reporterNickname: userProfile.nickname,
      reason,
      timestamp: 'Just now',
      status: 'PENDING',
    };
    setReports((prev) => [newReport, ...prev]);
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, isFlagged: true, flagReason: reason } : p))
    );
  };

  const handleCreatePost = (data: {
    content: string;
    department: string;
    category?: string;
    imageResName?: string;
    videoUri?: string;
    pollQuestion?: string;
    pollOptA?: string;
    pollOptB?: string;
  }) => {
    const cleanContent = sanitizeText(data.content);

    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorNickname: userProfile.nickname,
      authorBadgeType: userProfile.badgeType,
      authorBadgeTitle: userProfile.badgeTitle,
      authorAvatarKey: userProfile.avatarKey,
      department: data.department || 'General',
      category: (data.category as any) || 'General',
      content: cleanContent,
      imageResName: data.imageResName,
      videoUri: data.videoUri,
      isGhostMode: false,
      timestamp: 'Just now',
      likesCount: 0,
      commentsCount: 0,
      isLikedByMe: false,
      isBookmarkedByMe: false,
      pollQuestion: data.pollQuestion,
      pollOptA: data.pollOptA,
      pollOptB: data.pollOptB,
      pollVotesA: 0,
      pollVotesB: 0,
      isFlagged: false,
    };

    setPosts((prev) => [newPost, ...prev]);
    // Award +3 reputation points for post creation
    setUserProfile((prev) => ({ ...prev, reputationScore: prev.reputationScore + 3 }));
  };

  const handleAddComment = (postId: string, commentText: string) => {
    const cleanText = sanitizeText(commentText);

    const newComment: Comment = {
      id: `c_${Date.now()}`,
      postId,
      authorNickname: userProfile.nickname,
      authorBadgeType: userProfile.badgeType,
      authorAvatarKey: userProfile.avatarKey,
      content: cleanText,
      timestamp: 'Just now',
    };

    setComments((prev) => [...prev, newComment]);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
    );
    // Award +2 reputation points for comment
    setUserProfile((prev) => ({ ...prev, reputationScore: prev.reputationScore + 2 }));
  };

  // Handlers for Marketplace
  const handleSubmitMarketplaceItem = (itemData: {
    title: string;
    category: string;
    askingPrice: number;
    conditionTag: string;
    description: string;
    sellerPhone: string;
    meetupPoint: string;
    imageUrls: string[];
  }) => {
    const newItem: MarketplaceItem = {
      id: `item_${Date.now()}`,
      title: itemData.title,
      category: itemData.category,
      sellerNickname: userProfile.nickname,
      sellerPhone: itemData.sellerPhone,
      askingPrice: itemData.askingPrice,
      adminApprovedPrice: itemData.askingPrice,
      conditionTag: itemData.conditionTag,
      description: itemData.description,
      meetupPoint: itemData.meetupPoint,
      imageUrls: itemData.imageUrls,
      viewCount: 1,
      status: 'PENDING',
      buyerDmIntentsCount: 0,
    };

    setPendingMarketplaceItems((prev) => [newItem, ...prev]);
  };

  const handleRecordDmBuyIntent = (itemId: string) => {
    setMarketplaceItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, buyerDmIntentsCount: item.buyerDmIntentsCount + 1 } : item
      )
    );
  };

  const handleMarkAsSold = (itemId: string, ratingStars: number, ratingTag: string) => {
    setMarketplaceItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, status: 'SOLD', sellerRatingStars: ratingStars, sellerRatingTag: ratingTag }
          : item
      )
    );
  };

  // Handlers for Verification Application
  const handleSubmitVerificationRequest = (category: string, statement: string) => {
    const newReq: VerificationRequest = {
      id: `vr_${Date.now()}`,
      applicantNickname: userProfile.nickname,
      category,
      statement,
      timestamp: 'Just now',
      status: 'PENDING',
    };
    setVerificationRequests((prev) => [newReq, ...prev]);
  };

  // Admin Handlers
  const handleAdminApproveMarketplaceItem = (id: string, approvedPrice: number, note: string) => {
    const item = pendingMarketplaceItems.find((i) => i.id === id);
    if (item) {
      const approvedItem: MarketplaceItem = {
        ...item,
        status: 'APPROVED',
        adminApprovedPrice: approvedPrice,
        adminNote: note,
      };
      setMarketplaceItems((prev) => [approvedItem, ...prev]);
      setPendingMarketplaceItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleAdminRejectMarketplaceItem = (id: string, note: string) => {
    setPendingMarketplaceItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveUserProfile = (
    nickname: string,
    department: string,
    level: string,
    bio: string,
    avatarKey: string,
    emergencyPhone: string
  ): string | null => {
    const lowerNick = nickname.toLowerCase();
    if (lowerNick.includes('anonymous') || lowerNick.includes('anon')) {
      return 'Error: Nicknames containing "Anonymous" or "Anon" are forbidden. Please choose a unique student handle.';
    }

    setUserProfile((prev) => ({
      ...prev,
      nickname,
      department,
      level,
      bio,
      avatarKey,
      emergencyHomePhone: emergencyPhone,
    }));
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top App Header with Install App Option */}
      <header className="sticky top-0 z-30 bg-teal-800 text-white shadow-xs border-b border-teal-900/40">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-600 border border-teal-400/30 flex items-center justify-center font-black text-white text-sm shadow-xs">
              FC
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-white leading-tight">FUHSI Connect</h1>
              <p className="text-[10px] text-teal-200 font-medium">Campus Twitter Network • Ila-Orangun</p>
            </div>
          </div>

          <button
            onClick={() => setShowPwaModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-700/80 hover:bg-teal-700 text-teal-100 hover:text-white border border-teal-500/40 text-xs font-bold transition-all shadow-xs"
          >
            <Smartphone size={14} className="text-teal-300" />
            <span>Install App</span>
          </button>
        </div>
      </header>

      {/* Main Screen Body */}
      <main className="flex-1">
        {navIndex === 0 && (
          <FeedScreen
            posts={posts}
            userProfile={userProfile}
            selectedFilter={selectedFilter}
            onFilterSelect={setSelectedFilter}
            onLikeClick={handleLikeClick}
            onBookmarkClick={handleBookmarkClick}
            onCommentClick={(post) => setSelectedPost(post)}
            onVotePoll={handleVotePoll}
            onReportPost={handleReportPost}
            onCreatePostClick={() => setShowCreatePostModal(true)}
          />
        )}

        {navIndex === 1 && (
          <LeaderboardScreen
            userProfile={userProfile}
            activePosts={posts}
            onSubmitVerificationRequest={handleSubmitVerificationRequest}
          />
        )}

        {navIndex === 2 && (
          <CampusHubScreen
            userProfile={userProfile}
            approvedMarketplaceItems={marketplaceItems}
            onSubmitMarketplaceItem={handleSubmitMarketplaceItem}
            onRecordDmBuyIntent={handleRecordDmBuyIntent}
            onMarkAsSold={handleMarkAsSold}
            onApplyVerificationWithFee={() =>
              handleSubmitVerificationRequest(
                'Verification Review Fee Paid (₦1,500)',
                'Applicant paid the ₦1,500 review processing fee and submitted credentials for admin verification.'
              )
            }
          />
        )}

        {navIndex === 3 && (
          <ModerationScreen
            userProfile={userProfile}
            flaggedPosts={posts.filter((p) => p.isFlagged)}
            reports={reports}
            verificationRequests={verificationRequests}
            pendingMarketplaceItems={pendingMarketplaceItems}
            onToggleAntiDoxxing={() => {}}
            onToggleProfanityShield={() => {}}
            onDismissReport={(repId, postId) => {
              setReports((prev) => prev.filter((r) => r.id !== repId));
            }}
            onQuarantinePost={(repId, postId) => {
              setPosts((prev) => prev.filter((p) => p.id !== postId));
              setReports((prev) => prev.filter((r) => r.id !== repId));
            }}
            onDeletePost={(postId) => {
              setPosts((prev) => prev.filter((p) => p.id !== postId));
            }}
            onUpdateBadge={(type, title) => {
              setUserProfile((prev) => ({ ...prev, badgeType: type, badgeTitle: title }));
            }}
            onUpdateReputationScore={(score) => {
              setUserProfile((prev) => ({ ...prev, reputationScore: score }));
            }}
            onUpdateVerificationRequestStatus={(id, status) => {
              setVerificationRequests((prev) =>
                prev.map((v) => (v.id === id ? { ...v, status } : v))
              );
            }}
            onAdminApproveMarketplaceItem={handleAdminApproveMarketplaceItem}
            onAdminRejectMarketplaceItem={handleAdminRejectMarketplaceItem}
            onSendPriceAdvisory={(id, suggestedPrice, msg) => {
              handleAdminApproveMarketplaceItem(id, suggestedPrice, `Price Advisory: ${msg}`);
            }}
          />
        )}

        {navIndex === 4 && (
          <ProfileScreen userProfile={userProfile} onSaveProfile={handleSaveUserProfile} />
        )}
      </main>

      {/* Post Details Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          comments={comments.filter((c) => c.postId === selectedPost.id)}
          userProfile={userProfile}
          onClose={() => setSelectedPost(null)}
          onAddComment={(text) => handleAddComment(selectedPost.id, text)}
          onToggleLike={handleLikeClick}
          onToggleBookmark={handleBookmarkClick}
        />
      )}

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <CreatePostModal
          userProfile={userProfile}
          onClose={() => setShowCreatePostModal(false)}
          onSubmit={handleCreatePost}
          checkDoxxingThreats={checkDoxxingThreats}
        />
      )}

      {/* PWA App Install Modal */}
      <PWAInstallModal
        isOpen={showPwaModal}
        onClose={() => setShowPwaModal(false)}
      />

      {/* Bottom Sticky Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around py-2 px-3">
          <button
            onClick={() => setNavIndex(0)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              navIndex === 0 ? 'text-teal-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <DynamicFeedIcon className="w-5 h-5" />
            <span className="text-[11px]">Feed</span>
          </button>

          <button
            onClick={() => setNavIndex(1)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              navIndex === 1 ? 'text-teal-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LeaderboardIcon className="w-5 h-5" />
            <span className="text-[11px]">Rankings</span>
          </button>

          <button
            onClick={() => setNavIndex(2)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              navIndex === 2 ? 'text-teal-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <StorefrontIcon className="w-5 h-5" />
            <span className="text-[11px]">Hub & Fund</span>
          </button>

          <button
            onClick={() => setNavIndex(3)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              navIndex === 3 ? 'text-teal-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldIcon className="w-5 h-5" />
            <span className="text-[11px]">Safety</span>
          </button>

          <button
            onClick={() => setNavIndex(4)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              navIndex === 4 ? 'text-teal-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BadgeIcon className="w-5 h-5" />
            <span className="text-[11px]">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
