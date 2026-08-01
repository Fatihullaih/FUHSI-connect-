import React, { useState, useEffect } from 'react';
import {
  INITIAL_USER_PROFILE,
  INITIAL_POSTS,
  INITIAL_COMMENTS,
  INITIAL_MARKETPLACE_ITEMS,
  INITIAL_PENDING_MARKETPLACE_ITEMS,
  INITIAL_VERIFICATION_REQUESTS,
  INITIAL_REPORTS,
} from './data/initialData';
import { UserProfile, Post, Comment, MarketplaceItem, VerificationRequest, Report, BadgeType, PollOption } from './types';
import { FeedScreen } from './screens/FeedScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { CampusHubScreen } from './screens/CampusHubScreen';
import { ModerationScreen } from './screens/ModerationScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SearchScreen } from './screens/SearchScreen';
import { NotificationScreen } from './screens/NotificationScreen';
import { CreatePostModal } from './components/CreatePostModal';
import { PostDetailModal } from './components/PostDetailModal';
import { AuthorProfileModal } from './components/AuthorProfileModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { AuthModal } from './components/AuthModal';
import { AvatarIcon } from './components/AvatarIcon';
import { DynamicFeedIcon, LeaderboardIcon, StorefrontIcon } from './components/NavIcons';
import { Smartphone, Search, Bell, Trophy, LogIn, User, Shield, X, Sparkles, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation State
  const [navIndex, setNavIndex] = useState(0);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // App Core State with Persistent LocalStorage Initialization
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const stored = localStorage.getItem('fuhsi_posts_db');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_POSTS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const stored = localStorage.getItem('fuhsi_comments_db');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_COMMENTS;
  });

  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>(() => {
    try {
      const stored = localStorage.getItem('fuhsi_marketplace_approved_db');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MARKETPLACE_ITEMS;
  });

  const [pendingMarketplaceItems, setPendingMarketplaceItems] = useState<MarketplaceItem[]>(() => {
    try {
      const stored = localStorage.getItem('fuhsi_marketplace_pending_db');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PENDING_MARKETPLACE_ITEMS;
  });

  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    try {
      const stored = localStorage.getItem('fuhsi_verifications_db');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_VERIFICATION_REQUESTS;
  });

  const [reports, setReports] = useState<Report[]>(() => {
    try {
      const stored = localStorage.getItem('fuhsi_reports_db');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_REPORTS;
  });

  // Auto Sync States to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('fuhsi_posts_db', JSON.stringify(posts));
    } catch (e) { console.error(e); }
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem('fuhsi_comments_db', JSON.stringify(comments));
    } catch (e) { console.error(e); }
  }, [comments]);

  useEffect(() => {
    try {
      localStorage.setItem('fuhsi_marketplace_approved_db', JSON.stringify(marketplaceItems));
    } catch (e) { console.error(e); }
  }, [marketplaceItems]);

  useEffect(() => {
    try {
      localStorage.setItem('fuhsi_marketplace_pending_db', JSON.stringify(pendingMarketplaceItems));
    } catch (e) { console.error(e); }
  }, [pendingMarketplaceItems]);

  useEffect(() => {
    try {
      localStorage.setItem('fuhsi_verifications_db', JSON.stringify(verificationRequests));
    } catch (e) { console.error(e); }
  }, [verificationRequests]);

  useEffect(() => {
    try {
      localStorage.setItem('fuhsi_reports_db', JSON.stringify(reports));
    } catch (e) { console.error(e); }
  }, [reports]);

  useEffect(() => {
    if (userProfile && userProfile.nickname) {
      try {
        localStorage.setItem('fuhsi_active_user', JSON.stringify(userProfile));
      } catch (e) { console.error(e); }
    }
  }, [userProfile]);

  // Check initial login session or show register/login modal on first visit
  useEffect(() => {
    try {
      const activeUserJson = localStorage.getItem('fuhsi_active_user');
      if (activeUserJson) {
        const parsed = JSON.parse(activeUserJson);
        if (parsed && parsed.nickname) {
          setUserProfile(parsed);
        } else {
          setShowAuthModal(true);
        }
      } else {
        // First time visiting website - trigger account registration / login
        setShowAuthModal(true);
      }
    } catch {
      setShowAuthModal(true);
    }
  }, []);

  // Filter & Selected Item Modals
  const [selectedFilter, setSelectedFilter] = useState('All Campus');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedAuthorPost, setSelectedAuthorPost] = useState<Post | null>(null);
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
          return { ...p, isBookmarkedByMe: !p.isBookmarkedByMe, isBookmarked: !p.isBookmarkedByMe };
        }
        return p;
      })
    );
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setComments((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(null);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((postId) => {
        next[postId] = next[postId].filter((c) => c.id !== commentId && c.parentId !== commentId);
      });
      return next;
    });
    setPosts((prev) =>
      prev.map((p) => {
        if (selectedPost && p.id === selectedPost.id) {
          return { ...p, commentsCount: Math.max(0, (p.commentsCount || 1) - 1) };
        }
        return p;
      })
    );
  };

  const handleVotePoll = (post: Post, optionId: string) => {
    const currentNickname = (userProfile?.nickname || 'guest').toLowerCase();

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === post.id) {
          // Check if current user already voted on this account
          const existingVote =
            p.pollVotesByUser?.[currentNickname] ||
            p.pollVotesByUser?.[userProfile?.nickname || ''];
          if (existingVote) return p;

          const updatedVotesByUser = {
            ...(p.pollVotesByUser || {}),
            [currentNickname]: optionId,
          };

          // Update pollOptions array
          let updatedOptions = p.pollOptions;
          if (updatedOptions && updatedOptions.length > 0) {
            updatedOptions = updatedOptions.map((opt, idx) => {
              if (
                opt.id === optionId ||
                `opt_${idx}` === optionId ||
                opt.text === optionId ||
                (optionId === 'A' && idx === 0) ||
                (optionId === 'B' && idx === 1)
              ) {
                return { ...opt, votes: (opt.votes || 0) + 1 };
              }
              return opt;
            });
          }

          let votesA = p.pollVotesA || 0;
          let votesB = p.pollVotesB || 0;
          if (optionId === 'A' || optionId === 'opt_0') votesA += 1;
          if (optionId === 'B' || optionId === 'opt_1') votesB += 1;

          return {
            ...p,
            userVotedOpt: optionId,
            pollVotesByUser: updatedVotesByUser,
            pollOptions: updatedOptions,
            pollVotesA: votesA,
            pollVotesB: votesB,
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
    targetDepartment?: string;
    category?: string;
    imageUrl?: string;
    imageResName?: string;
    videoUri?: string;
    pollQuestion?: string;
    pollOptions?: string[];
    pollOptA?: string;
    pollOptB?: string;
  }) => {
    const cleanContent = sanitizeText(data.content);
    const targetDept = data.targetDepartment || 'General Campus';
    const isPriority = targetDept !== 'General Campus';

    let formattedPollOptions: PollOption[] | undefined = undefined;
    if (data.pollQuestion && data.pollOptions && data.pollOptions.length > 0) {
      formattedPollOptions = data.pollOptions.map((optText, idx) => ({
        id: `opt_${idx}`,
        text: optText,
        votes: 0,
      }));
    } else if (data.pollQuestion && (data.pollOptA || data.pollOptB)) {
      formattedPollOptions = [
        { id: 'A', text: data.pollOptA || 'Option A', votes: 0 },
        { id: 'B', text: data.pollOptB || 'Option B', votes: 0 },
      ];
    }

    const newPost: Post = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorNickname: userProfile.nickname,
      authorBadgeType: userProfile.badgeType,
      authorBadgeTitle: userProfile.badgeTitle,
      authorAvatarKey: userProfile.avatarKey,
      authorAvatarUrl: userProfile.avatarUrl,
      authorPoints: (userProfile.reputationScore || 1250) + 3,
      authorDepartment: userProfile.department,
      authorLevel: userProfile.level,
      department: data.department || 'General',
      targetDepartment: targetDept,
      isDepartmentPriority: isPriority,
      category: (data.category as any) || 'General',
      content: cleanContent,
      imageUrl: data.imageUrl,
      imageResName: data.imageResName,
      videoUri: data.videoUri,
      isGhostMode: false,
      timestamp: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      isLikedByMe: false,
      isBookmarkedByMe: false,
      pollQuestion: data.pollQuestion,
      pollOptions: formattedPollOptions,
      pollVotesByUser: {},
      pollOptA: data.pollOptA || (data.pollOptions ? data.pollOptions[0] : undefined),
      pollOptB: data.pollOptB || (data.pollOptions ? data.pollOptions[1] : undefined),
      pollVotesA: 0,
      pollVotesB: 0,
      isFlagged: false,
    };

    setPosts((prev) => [newPost, ...prev]);
    // Award +3 reputation points for post creation
    setUserProfile((prev) => ({ ...prev, reputationScore: (prev.reputationScore || 0) + 3 }));
  };

  const handleAddComment = (
    postId: string,
    commentText: string,
    parentId?: string,
    replyToNickname?: string
  ) => {
    const cleanText = sanitizeText(commentText);

    const newComment: Comment = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      postId,
      authorNickname: userProfile.nickname,
      authorBadgeType: userProfile.badgeType,
      authorAvatarKey: userProfile.avatarKey,
      authorAvatarUrl: userProfile.avatarUrl,
      content: cleanText,
      timestamp: new Date().toISOString(),
      parentId,
      replyToNickname,
      likesCount: 0,
      isLikedByMe: false,
    };

    setComments((prev) => [...prev, newComment]);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p))
    );
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) => (prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : null));
    }
    // Award +2 reputation points for comment
    setUserProfile((prev) => ({ ...prev, reputationScore: (prev.reputationScore || 0) + 2 }));
  };

  const handleLikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const isLiked = !c.isLikedByMe;
          return {
            ...c,
            isLikedByMe: isLiked,
            likesCount: (c.likesCount || 0) + (isLiked ? 1 : -1),
          };
        }
        return c;
      })
    );
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('fuhsi_active_user');
    } catch (e) {
      console.error(e);
    }
    setUserProfile(INITIAL_USER_PROFILE);
    setShowProfileModal(false);
    setShowAuthModal(true);
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
    emergencyPhone: string,
    avatarUrl?: string
  ): string | null => {
    const lowerNick = nickname.toLowerCase();
    if (lowerNick.includes('anonymous') || lowerNick.includes('anon')) {
      return 'Error: Nicknames containing "Anonymous" or "Anon" are forbidden. Please choose a unique student handle.';
    }

    setUserProfile((prev) => {
      const updated = {
        ...prev,
        nickname,
        department,
        level,
        bio,
        avatarKey,
        avatarUrl: avatarUrl || prev.avatarUrl,
        emergencyHomePhone: emergencyPhone,
      };

      try {
        localStorage.setItem('fuhsi_active_user', JSON.stringify(updated));
        const storedUsers = localStorage.getItem('fuhsi_users_db');
        if (storedUsers) {
          let list: UserProfile[] = JSON.parse(storedUsers);
          list = list.map((u) => (u.id === updated.id ? updated : u));
          localStorage.setItem('fuhsi_users_db', JSON.stringify(list));
        }
      } catch (e) {
        console.error('Error persisting user profile update:', e);
      }

      return updated;
    });
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top App Header with Twitter-style Profile Picture Avatar on Left */}
      <header className="sticky top-0 z-30 bg-teal-800 text-white shadow-xs border-b border-teal-900/40">
        <div className="max-w-2xl mx-auto px-3.5 py-2 flex items-center justify-between">
          {/* Top-Left Profile Picture Avatar Trigger (Twitter Style) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowProfileModal(true)}
              className="group relative flex items-center gap-2 p-1 rounded-full hover:bg-teal-700/80 transition-all text-left focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              title="Click to check your Student Profile"
            >
              <div className="relative">
                <AvatarIcon
                  avatarKey={userProfile?.avatarKey || '1'}
                  className="w-9 h-9 rounded-full ring-2 ring-teal-300/60 shadow-xs group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-teal-800 rounded-full" />
              </div>
              <div className="hidden sm:block leading-tight">
                <h2 className="font-extrabold text-xs text-white group-hover:text-teal-100 flex items-center gap-1">
                  <span>{userProfile?.nickname || '@Student'}</span>
                  <CheckCircle2 size={12} className="text-teal-300" />
                </h2>
                <p className="text-[10px] text-teal-200/90 font-medium">{userProfile?.department || 'FUHSI'} • Check Profile</p>
              </div>
            </button>
          </div>

          {/* App Title & Logo */}
          <div
            onClick={() => setNavIndex(0)}
            className="flex items-center gap-2 cursor-pointer select-none"
            title="FUHSI-Connect Campus Network"
          >
            <img
              src="/src/assets/images/fuhsi_logo_1785485694958.jpg"
              alt="FUHSI Connect"
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-teal-300/40 shadow-xs active:scale-95 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div className="text-left leading-none">
              <h1 className="font-black text-sm tracking-tight text-white">FUHSI-Connect</h1>
              <p className="text-[9px] text-teal-200 font-medium">Campus Network</p>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2">
            {userProfile?.isAdmin && (
              <button
                onClick={() => setNavIndex(5)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm ${
                  navIndex === 5
                    ? 'bg-amber-400 text-slate-900 ring-2 ring-amber-300'
                    : 'bg-amber-500/90 hover:bg-amber-400 text-slate-950'
                }`}
                title="Open FUHSI Moderation Council Portal"
              >
                <Shield size={14} className="fill-slate-900 shrink-0" />
                <span>Admin Console</span>
              </button>
            )}

            <button
              onClick={() => setShowPwaModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-700/80 hover:bg-teal-700 text-teal-100 hover:text-white border border-teal-500/40 text-xs font-bold transition-all shadow-xs"
            >
              <Smartphone size={14} className="text-teal-300" />
              <span className="hidden sm:inline">Install</span>
            </button>
          </div>
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
            onDeletePost={handleDeletePost}
            onAuthorClick={(post) => setSelectedAuthorPost(post)}
            onVotePoll={handleVotePoll}
            onReportPost={handleReportPost}
            onCreatePostClick={() => setShowCreatePostModal(true)}
          />
        )}

        {navIndex === 1 && (
          <SearchScreen
            userProfile={userProfile}
            posts={posts}
            marketplaceItems={marketplaceItems}
            onSelectPost={(post) => setSelectedPost(post)}
            onLikeClick={handleLikeClick}
            onBookmarkClick={handleBookmarkClick}
            onCommentClick={(post) => setSelectedPost(post)}
          />
        )}

        {navIndex === 2 && (
          <CampusHubScreen
            userProfile={userProfile}
            approvedMarketplaceItems={marketplaceItems}
            pendingMarketplaceItems={pendingMarketplaceItems}
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
          <NotificationScreen userProfile={userProfile} />
        )}

        {navIndex === 4 && (
          <LeaderboardScreen
            userProfile={userProfile}
            activePosts={posts}
            onSubmitVerificationRequest={handleSubmitVerificationRequest}
          />
        )}

        {navIndex === 5 && (
          <ModerationScreen
            userProfile={userProfile}
            flaggedPosts={posts.filter((p) => p.isQuarantined)}
            reports={reports}
            pendingMarketplaceItems={pendingMarketplaceItems}
            verificationRequests={verificationRequests}
            onAdminApproveMarketplaceItem={handleAdminApproveMarketplaceItem}
            onAdminRejectMarketplaceItem={handleAdminRejectMarketplaceItem}
            onResolveReport={(repId) => setReports((prev) => prev.filter((r) => r.id !== repId))}
            onApproveVerification={(reqId) => setVerificationRequests((prev) => prev.filter((v) => v.id !== reqId))}
            onRejectVerification={(reqId) => setVerificationRequests((prev) => prev.filter((v) => v.id !== reqId))}
            onDeletePost={(postId) => setPosts((prev) => prev.filter((p) => p.id !== postId))}
            onUpdateBadge={(badgeType, badgeTitle) => {
              if (userProfile) {
                const updated = { ...userProfile, badgeType, badgeTitle };
                setUserProfile(updated);
                localStorage.setItem('fuhsi_active_user', JSON.stringify(updated));
              }
            }}
            onUpdateReputationScore={(newScore) => {
              if (userProfile) {
                const updated = { ...userProfile, reputationScore: newScore };
                setUserProfile(updated);
                localStorage.setItem('fuhsi_active_user', JSON.stringify(updated));
              }
            }}
          />
        )}
      </main>

      {/* Profile Modal / Drawer (Triggered by Top-Left Profile Picture Avatar) */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-50 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col relative">
            <div className="sticky top-0 z-10 bg-teal-800 text-white p-3.5 px-4 flex items-center justify-between border-b border-teal-900/40">
              <div className="flex items-center gap-2.5">
                <AvatarIcon avatarKey={userProfile.avatarKey} className="w-8 h-8 rounded-full border border-teal-300" />
                <div>
                  <h2 className="font-extrabold text-sm text-white">Student Profile Check</h2>
                  <p className="text-[10px] text-teal-200">FUHSI Ila-Orangun Student Account</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1.5 rounded-full bg-teal-900/60 hover:bg-teal-900 text-teal-200 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-2 sm:p-4">
              <ProfileScreen
                userProfile={userProfile}
                allPosts={posts}
                allComments={comments}
                onSaveProfile={(nickname, department, level, bio, avatarKey, emergencyPhone, avatarUrl) => {
                  const err = handleSaveUserProfile(nickname, department, level, bio, avatarKey, emergencyPhone, avatarUrl);
                  if (!err) setShowProfileModal(false);
                  return err;
                }}
                onOpenAuthModal={() => {
                  setShowProfileModal(false);
                  setShowAuthModal(true);
                }}
                onLogout={handleLogout}
                onLikeClick={handleLikeClick}
                onBookmarkClick={handleBookmarkClick}
                onCommentClick={(post) => setSelectedPost(post)}
                onDeletePost={handleDeletePost}
                onDeleteComment={handleDeleteComment}
                onClose={() => setShowProfileModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Post Details Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          comments={comments.filter((c) => c.postId === selectedPost.id)}
          userProfile={userProfile}
          onClose={() => setSelectedPost(null)}
          onAddComment={(text, parentId, replyToNickname) => handleAddComment(selectedPost.id, text, parentId, replyToNickname)}
          onLikeComment={handleLikeComment}
          onToggleLike={handleLikeClick}
          onToggleBookmark={handleBookmarkClick}
          onDeletePost={handleDeletePost}
          onDeleteComment={handleDeleteComment}
          onVotePoll={handleVotePoll}
          onAuthorClick={(author) =>
            setSelectedAuthorPost({
              authorNickname: author.nickname,
              authorAvatarKey: author.avatarKey,
              authorAvatarUrl: author.avatarUrl,
              authorBadgeType: author.badgeType,
              authorBadgeTitle: author.badgeTitle,
            } as Post)
          }
        />
      )}

      {/* Author Profile Details Modal (When clicking author name or avatar) */}
      {selectedAuthorPost && (
        <AuthorProfileModal
          authorNickname={selectedAuthorPost.authorNickname || selectedAuthorPost.nickname || 'Student'}
          authorAvatarKey={selectedAuthorPost.authorAvatarKey || 'caduceus'}
          authorAvatarUrl={selectedAuthorPost.authorAvatarUrl}
          authorBadgeType={selectedAuthorPost.authorBadgeType as BadgeType}
          authorBadgeTitle={selectedAuthorPost.authorBadgeTitle}
          authorPoints={selectedAuthorPost.authorPoints || 1500}
          authorJoinedDate="Jul 2026"
          currentUserNickname={userProfile.nickname}
          allPosts={posts}
          allComments={comments}
          onClose={() => setSelectedAuthorPost(null)}
          onLikeClick={handleLikeClick}
          onBookmarkClick={handleBookmarkClick}
          onDeletePost={handleDeletePost}
          onCommentClick={(p) => {
            setSelectedAuthorPost(null);
            setSelectedPost(p);
          }}
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

      {/* Account Register & Login Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(user) => {
          setUserProfile(user);
          setShowAuthModal(false);
        }}
      />

      {/* Bottom Footer Sticky Navigation Bar - Feed, Search, Hub&Fund, Notification, Ranking */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around py-2 px-2">
          {/* 1. Feed */}
          <button
            onClick={() => setNavIndex(0)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              navIndex === 0 ? 'text-teal-700 font-extrabold scale-105' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <DynamicFeedIcon className="w-5 h-5" />
            <span className="text-[11px]">Feed</span>
          </button>

          {/* 2. Search */}
          <button
            onClick={() => setNavIndex(1)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              navIndex === 1 ? 'text-teal-700 font-extrabold scale-105' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[11px]">Search</span>
          </button>

          {/* 3. Hub&Fund */}
          <button
            onClick={() => setNavIndex(2)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              navIndex === 2 ? 'text-teal-700 font-extrabold scale-105' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <StorefrontIcon className="w-5 h-5" />
            <span className="text-[11px]">Hub&Fund</span>
          </button>

          {/* 4. Notification */}
          <button
            onClick={() => setNavIndex(3)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              navIndex === 3 ? 'text-teal-700 font-extrabold scale-105' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="text-[11px]">Notification</span>
          </button>

          {/* 5. Ranking */}
          <button
            onClick={() => setNavIndex(4)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              navIndex === 4 ? 'text-teal-700 font-extrabold scale-105' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LeaderboardIcon className="w-5 h-5" />
            <span className="text-[11px]">Ranking</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
