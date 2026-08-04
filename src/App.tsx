import React, { useState, useEffect, useCallback } from 'react';
import {
  INITIAL_USER_PROFILE,
  INITIAL_POSTS,
  INITIAL_COMMENTS,
  INITIAL_MARKETPLACE_ITEMS,
  INITIAL_PENDING_MARKETPLACE_ITEMS,
  INITIAL_VERIFICATION_REQUESTS,
  INITIAL_REPORTS,
} from './data/initialData';
import fuhsiLogo from './assets/images/fuhsi_logo_1785485694958.jpg';
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
import { Smartphone, Search, Bell, Trophy, LogIn, LogOut, User, Shield, X, Sparkles, CheckCircle2, Users } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation State
  const [navIndex, setNavIndex] = useState(0);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [appTotalMembers, setAppTotalMembers] = useState<number>(1);

  // Dynamically calculate total registered community members based on approved user accounts
  useEffect(() => {
    const updateCount = () => {
      try {
        const stored = localStorage.getItem('fuhsi_users_db');
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            // Count ONLY approved user accounts (where isApproved is true or isAdmin is true)
            const approvedList = list.filter((u: any) => u.isApproved === true || (u.isApproved !== false && u.isAdmin));
            setAppTotalMembers(approvedList.length);
            return;
          }
        }
        setAppTotalMembers(1);
      } catch (e) {
        console.error(e);
      }
    };
    updateCount();
    const timer = setInterval(updateCount, 1500);
    return () => clearInterval(timer);
  }, []);

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

  const [userBookmarksMap, setUserBookmarksMap] = useState<Record<string, string[]>>(() => {
    try {
      const stored = localStorage.getItem('fuhsi_user_bookmarks_db');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  // Active user bookmark IDs key
  const activeUserKey = (userProfile?.nickname || '').toLowerCase().replace(/^@/, '');
  const myBookmarkedPostIds = userBookmarksMap[activeUserKey] || [];

  // Auto Sync States to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('fuhsi_user_bookmarks_db', JSON.stringify(userBookmarksMap));
    } catch (e) { console.error(e); }
  }, [userBookmarksMap]);
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

  // Requirement: Session & Security - Require user authentication on initial load or reload
  useEffect(() => {
    try {
      const activeUserJson = localStorage.getItem('fuhsi_active_user');
      if (activeUserJson) {
        let parsed = JSON.parse(activeUserJson);
        if (parsed && parsed.nickname) {
          const storedUsers = localStorage.getItem('fuhsi_users_db');
          if (storedUsers) {
            const list: UserProfile[] = JSON.parse(storedUsers);
            const found = list.find(
              (u) => u.id === parsed.id || u.nickname?.toLowerCase() === parsed.nickname?.toLowerCase()
            );
            if (found) {
              parsed = {
                ...parsed,
                ...found,
                avatarUrl: found.avatarUrl || parsed.avatarUrl,
              };
            }
          }
          setUserProfile(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
    // Strict authentication guard: start unauthenticated on page load/refresh
    setIsLoggedIn(false);
    setShowAuthModal(true);
  }, []);

  // Filter & Selected Item Modals
  const [selectedFilter, setSelectedFilter] = useState('All Campus');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedAuthorPost, setSelectedAuthorPost] = useState<Post | null>(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  // Stack-based Navigation & Modal History State Support
  type ModalStackItem =
    | { type: 'postDetail'; post: Post }
    | { type: 'authorProfile'; post: Post }
    | { type: 'profile' }
    | { type: 'createPost' }
    | { type: 'auth' }
    | { type: 'pwa' };

  const [modalStack, setModalStack] = useState<ModalStackItem[]>([]);
  const [navHistory, setNavHistory] = useState<number[]>([0]);

  // Tab Navigation with History Tracking
  const handleNavChange = useCallback((newIndex: number) => {
    setNavIndex((prevNav) => {
      if (prevNav === newIndex) return prevNav;
      setNavHistory((prev) => [...prev, newIndex]);
      try {
        window.history.pushState({ type: 'nav', index: newIndex, time: Date.now() }, '');
      } catch (e) { console.error(e); }
      return newIndex;
    });
  }, []);

  // Modal Opener Helpers with History Tracking
  const openPostDetail = useCallback((post: Post) => {
    setSelectedPost(post);
    setModalStack((prev) => [...prev, { type: 'postDetail', post }]);
    try {
      window.history.pushState({ type: 'modal', modalType: 'postDetail', id: post.id, time: Date.now() }, '');
    } catch (e) { console.error(e); }
  }, []);

  const openAuthorProfile = useCallback((post: Post) => {
    let enrichedPost = { ...post };
    try {
      const storedUsers = localStorage.getItem('fuhsi_users_db');
      if (storedUsers) {
        const userList = JSON.parse(storedUsers);
        if (Array.isArray(userList)) {
          const targetNick = (post.authorNickname || (post as any).nickname || '').toLowerCase().replace(/^@/, '');
          const found = userList.find((u: any) => u.nickname && u.nickname.toLowerCase().replace(/^@/, '') === targetNick);
          if (found) {
            enrichedPost.authorAvatarKey = found.avatarKey || post.authorAvatarKey || 'caduceus';
            enrichedPost.authorAvatarUrl = found.avatarUrl || post.authorAvatarUrl;
            enrichedPost.authorBadgeType = found.badgeType || post.authorBadgeType || 'GREEN';
            enrichedPost.authorBadgeTitle = found.badgeTitle || post.authorBadgeTitle || 'Verified Student';
            enrichedPost.authorPoints = found.reputationScore || post.authorPoints;
          }
        }
      }
    } catch (e) {
      console.error(e);
    }

    setSelectedAuthorPost(enrichedPost);
    setModalStack((prev) => [...prev, { type: 'authorProfile', post: enrichedPost }]);
    try {
      window.history.pushState({ type: 'modal', modalType: 'authorProfile', id: enrichedPost.id, time: Date.now() }, '');
    } catch (e) { console.error(e); }
  }, []);

  const openProfileModal = useCallback(() => {
    setShowProfileModal(true);
    setModalStack((prev) => [...prev, { type: 'profile' }]);
    try {
      window.history.pushState({ type: 'modal', modalType: 'profile', time: Date.now() }, '');
    } catch (e) { console.error(e); }
  }, []);

  const openCreatePostModal = useCallback(() => {
    setShowCreatePostModal(true);
    setModalStack((prev) => [...prev, { type: 'createPost' }]);
    try {
      window.history.pushState({ type: 'modal', modalType: 'createPost', time: Date.now() }, '');
    } catch (e) { console.error(e); }
  }, []);

  const openAuthModal = useCallback(() => {
    setShowAuthModal(true);
    setModalStack((prev) => [...prev, { type: 'auth' }]);
    try {
      window.history.pushState({ type: 'modal', modalType: 'auth', time: Date.now() }, '');
    } catch (e) { console.error(e); }
  }, []);

  const openPwaModal = useCallback(() => {
    setShowPwaModal(true);
    setModalStack((prev) => [...prev, { type: 'pwa' }]);
    try {
      window.history.pushState({ type: 'modal', modalType: 'pwa', time: Date.now() }, '');
    } catch (e) { console.error(e); }
  }, []);

  // Close top modal via UI "X" / "Back" button
  const closeModalUI = useCallback(() => {
    if (window.history.state && window.history.state.type === 'modal') {
      window.history.back();
    } else {
      // Direct state pop if no history entry
      setModalStack((prevStack) => {
        if (prevStack.length === 0) {
          setSelectedPost(null);
          setSelectedAuthorPost(null);
          setShowProfileModal(false);
          setShowCreatePostModal(false);
          setShowAuthModal(false);
          setShowPwaModal(false);
          return [];
        }
        const newStack = [...prevStack];
        newStack.pop();

        const lastPost = newStack.slice().reverse().find((item) => item.type === 'postDetail');
        setSelectedPost(lastPost ? (lastPost as any).post : null);

        const lastAuthor = newStack.slice().reverse().find((item) => item.type === 'authorProfile');
        setSelectedAuthorPost(lastAuthor ? (lastAuthor as any).post : null);

        setShowProfileModal(newStack.some((item) => item.type === 'profile'));
        setShowCreatePostModal(newStack.some((item) => item.type === 'createPost'));
        setShowAuthModal(newStack.some((item) => item.type === 'auth'));
        setShowPwaModal(newStack.some((item) => item.type === 'pwa'));

        return newStack;
      });
    }
  }, []);

  // PopState Event Handler
  useEffect(() => {
    const handlePopState = () => {
      setModalStack((prevStack) => {
        if (prevStack.length > 0) {
          const newStack = [...prevStack];
          newStack.pop();

          const lastPost = newStack.slice().reverse().find((item) => item.type === 'postDetail');
          setSelectedPost(lastPost ? (lastPost as any).post : null);

          const lastAuthor = newStack.slice().reverse().find((item) => item.type === 'authorProfile');
          setSelectedAuthorPost(lastAuthor ? (lastAuthor as any).post : null);

          setShowProfileModal(newStack.some((item) => item.type === 'profile'));
          setShowCreatePostModal(newStack.some((item) => item.type === 'createPost'));
          setShowAuthModal(newStack.some((item) => item.type === 'auth'));
          setShowPwaModal(newStack.some((item) => item.type === 'pwa'));

          return newStack;
        }

        // Handle navigation tab history if no modals open
        setNavHistory((prevNav) => {
          if (prevNav.length > 1) {
            const newNav = [...prevNav];
            newNav.pop();
            const prevTab = newNav[newNav.length - 1];
            setNavIndex(prevTab);
            return newNav;
          }
          return prevNav;
        });

        return [];
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
    const userKey = (userProfile?.nickname || '').toLowerCase().replace(/^@/, '');
    const currentList = userBookmarksMap[userKey] || [];
    const isBookmarked = currentList.includes(post.id);

    const updatedList = isBookmarked
      ? currentList.filter((id) => id !== post.id)
      : [...currentList, post.id];

    const updatedMap = {
      ...userBookmarksMap,
      [userKey]: updatedList,
    };

    setUserBookmarksMap(updatedMap);

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === post.id) {
          const nextState = !isBookmarked;
          const updated = { ...p, isBookmarkedByMe: nextState, isBookmarked: nextState };
          if (selectedPost && selectedPost.id === post.id) {
            setSelectedPost(updated);
          }
          return updated;
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
    setIsLoggedIn(false);
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

    const newAvatarUrl = avatarUrl || userProfile.avatarUrl;

    const updated: UserProfile = {
      ...userProfile,
      nickname,
      department,
      level,
      bio,
      avatarKey,
      avatarUrl: newAvatarUrl,
      emergencyHomePhone: emergencyPhone,
    };

    setUserProfile(updated);

    try {
      localStorage.setItem('fuhsi_active_user', JSON.stringify(updated));
      const storedUsers = localStorage.getItem('fuhsi_users_db');
      let list: UserProfile[] = storedUsers ? JSON.parse(storedUsers) : [];
      const idx = list.findIndex(
        (u) => u.id === updated.id || u.nickname?.toLowerCase() === updated.nickname?.toLowerCase()
      );
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...updated };
      } else {
        list.push(updated);
      }
      localStorage.setItem('fuhsi_users_db', JSON.stringify(list));
    } catch (e) {
      console.error('Error persisting user profile update:', e);
    }

    // Propagate updated avatar and nickname across existing user posts and comments
    const oldNick = (userProfile.nickname || '').toLowerCase().replace(/^@/, '');
    setPosts((prev) =>
      prev.map((p) => {
        const pNick = (p.authorNickname || p.nickname || '').toLowerCase().replace(/^@/, '');
        if (pNick === oldNick || pNick === nickname.toLowerCase().replace(/^@/, '')) {
          return {
            ...p,
            authorNickname: nickname,
            authorAvatarKey: avatarKey,
            authorAvatarUrl: newAvatarUrl,
          };
        }
        return p;
      })
    );

    setComments((prev) =>
      prev.map((c) => {
        const cNick = (c.authorNickname || '').toLowerCase().replace(/^@/, '');
        if (cNick === oldNick || cNick === nickname.toLowerCase().replace(/^@/, '')) {
          return {
            ...c,
            authorNickname: nickname,
            authorAvatarKey: avatarKey,
            authorAvatarUrl: newAvatarUrl,
          };
        }
        return c;
      })
    );

    return null;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-2 sm:p-4">
        <AuthModal
          isOpen={true}
          canClose={false}
          onClose={() => {}}
          onLoginSuccess={(user) => {
            setUserProfile(user);
            setIsLoggedIn(true);
            setShowAuthModal(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top App Header with Twitter-style Profile Picture Avatar on Left */}
      <header className="sticky top-0 z-30 bg-teal-800 text-white shadow-xs border-b border-teal-900/40">
        <div className="max-w-2xl mx-auto px-3.5 py-2 flex items-center justify-between">
          {/* Top-Left Profile Picture Avatar Trigger (Twitter Style) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={openProfileModal}
              className="group relative flex items-center gap-2 p-1 rounded-full hover:bg-teal-700/80 transition-all text-left focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              title="Click to check your Student Profile"
            >
              <div className="relative">
                <AvatarIcon
                  avatarKey={userProfile?.avatarKey || '1'}
                  avatarUrl={userProfile?.avatarUrl}
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
            onClick={() => handleNavChange(0)}
            className="flex items-center gap-2 cursor-pointer select-none py-0.5"
            title="FUHSI-Connect Campus Network"
          >
            <img
              src={fuhsiLogo}
              alt="FUHSI Connect Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shrink-0 border-2 border-teal-300/60 shadow-xs active:scale-95 transition-transform"
            />
            <div className="text-left leading-tight">
              <h1 className="font-black text-xs sm:text-sm tracking-tight text-white flex items-center gap-1">
                <span>FUHSI-Connect</span>
              </h1>
              <p className="text-[9px] text-teal-200/90 font-semibold tracking-wide">Campus Network</p>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2">
            {/* Live Total Registered Members Indicator Badge (Non-clickable community size indicator) */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-900/80 border border-teal-600/50 text-teal-100 text-xs font-black select-none pointer-events-none cursor-default"
              title="Total Registered FUHSI Connect Members"
            >
              <Users size={13} className="text-teal-300 shrink-0" />
              <span>{appTotalMembers.toLocaleString()}</span>
            </div>

            {userProfile?.isAdmin && (
              <button
                onClick={() => handleNavChange(5)}
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
              onClick={openPwaModal}
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
            onCommentClick={openPostDetail}
            onDeletePost={handleDeletePost}
            onAuthorClick={openAuthorProfile}
            onVotePoll={handleVotePoll}
            onReportPost={handleReportPost}
            onCreatePostClick={openCreatePostModal}
          />
        )}

        {navIndex === 1 && (
          <SearchScreen
            userProfile={userProfile}
            posts={posts}
            marketplaceItems={marketplaceItems}
            onSelectPost={openPostDetail}
            onLikeClick={handleLikeClick}
            onBookmarkClick={handleBookmarkClick}
            onCommentClick={openPostDetail}
            onAuthorClick={openAuthorProfile}
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
            onAuthorClick={openAuthorProfile}
            onApplyVerificationWithFee={() =>
              handleSubmitVerificationRequest(
                'Verification Review Fee Paid (₦1,500)',
                'Applicant paid the ₦1,500 review processing fee and submitted credentials for admin verification.'
              )
            }
          />
        )}

        {navIndex === 3 && (
          <NotificationScreen
            userProfile={userProfile}
            allPosts={posts}
            onSelectPost={openPostDetail}
          />
        )}

        {navIndex === 4 && (
          <LeaderboardScreen
            userProfile={userProfile}
            activePosts={posts}
            onAuthorClick={openAuthorProfile}
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
            onApproveVerification={(reqId) => setVerificationRequests((prev) => prev.map((v) => (v.id === reqId ? { ...v, status: 'APPROVED' } : v)))}
            onRejectVerification={(reqId) => setVerificationRequests((prev) => prev.map((v) => (v.id === reqId ? { ...v, status: 'REJECTED' } : v)))}
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
                <AvatarIcon avatarKey={userProfile.avatarKey} avatarUrl={userProfile.avatarUrl} className="w-8 h-8 rounded-full border border-teal-300" />
                <div>
                  <h2 className="font-extrabold text-sm text-white">Student Profile Check</h2>
                  <p className="text-[10px] text-teal-200">FUHSI Ila-Orangun Student Account</p>
                </div>
              </div>
              <button
                onClick={closeModalUI}
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
                bookmarkedPostIds={myBookmarkedPostIds}
                onSaveProfile={(nickname, department, level, bio, avatarKey, emergencyPhone, avatarUrl) => {
                  const err = handleSaveUserProfile(nickname, department, level, bio, avatarKey, emergencyPhone, avatarUrl);
                  if (!err) closeModalUI();
                  return err;
                }}
                onOpenAuthModal={() => {
                  closeModalUI();
                  openAuthModal();
                }}
                onLogout={handleLogout}
                onLikeClick={handleLikeClick}
                onBookmarkClick={handleBookmarkClick}
                onCommentClick={openPostDetail}
                onAuthorClick={openAuthorProfile}
                onDeletePost={handleDeletePost}
                onDeleteComment={handleDeleteComment}
                onClose={closeModalUI}
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
          onClose={closeModalUI}
          onAddComment={(text, parentId, replyToNickname) => handleAddComment(selectedPost.id, text, parentId, replyToNickname)}
          onLikeComment={handleLikeComment}
          onToggleLike={handleLikeClick}
          onToggleBookmark={handleBookmarkClick}
          onDeletePost={handleDeletePost}
          onDeleteComment={handleDeleteComment}
          onVotePoll={handleVotePoll}
          onAuthorClick={(author) => {
            const dummyPost: Post = {
              id: `author_${author.nickname}`,
              authorNickname: author.nickname,
              authorAvatarKey: author.avatarKey || 'caduceus',
              authorAvatarUrl: author.avatarUrl,
              authorBadgeType: (author.badgeType as any) || 'NONE',
              authorBadgeTitle: author.badgeTitle || '',
              authorPoints: 0,
              timeAgo: '',
              categoryTag: 'General',
              text: '',
              likesCount: 0,
              commentsCount: 0,
              isQuarantined: false,
              createdAt: '',
            };
            openAuthorProfile(dummyPost);
          }}
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
          authorPoints={selectedAuthorPost.authorPoints}
          authorJoinedDate="Jul 2026"
          currentUserNickname={userProfile.nickname}
          allPosts={posts}
          allComments={comments}
          onClose={closeModalUI}
          onLikeClick={handleLikeClick}
          onBookmarkClick={handleBookmarkClick}
          onDeletePost={handleDeletePost}
          onCommentClick={openPostDetail}
        />
      )}

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <CreatePostModal
          userProfile={userProfile}
          onClose={closeModalUI}
          onSubmit={handleCreatePost}
          checkDoxxingThreats={checkDoxxingThreats}
        />
      )}

      {/* PWA App Install Modal */}
      <PWAInstallModal
        isOpen={showPwaModal}
        onClose={closeModalUI}
      />

      {/* Account Register & Login Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={closeModalUI}
        onLoginSuccess={(user) => {
          setUserProfile(user);
          closeModalUI();
        }}
      />

      {/* Bottom Footer Sticky Navigation Bar - Feed, Search, Hub&Fund, Notification, Ranking */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around py-2 px-2">
          {/* 1. Feed */}
          <button
            onClick={() => handleNavChange(0)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              navIndex === 0 ? 'text-teal-700 font-extrabold scale-105' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <DynamicFeedIcon className="w-5 h-5" />
            <span className="text-[11px]">Feed</span>
          </button>

          {/* 2. Search */}
          <button
            onClick={() => handleNavChange(1)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              navIndex === 1 ? 'text-teal-700 font-extrabold scale-105' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[11px]">Search</span>
          </button>

          {/* 3. Hub&Fund */}
          <button
            onClick={() => handleNavChange(2)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              navIndex === 2 ? 'text-teal-700 font-extrabold scale-105' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <StorefrontIcon className="w-5 h-5" />
            <span className="text-[11px]">Hub&Fund</span>
          </button>

          {/* 4. Notification */}
          <button
            onClick={() => handleNavChange(3)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              navIndex === 3 ? 'text-teal-700 font-extrabold scale-105' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="text-[11px]">Notification</span>
          </button>

          {/* 5. Ranking */}
          <button
            onClick={() => handleNavChange(4)}
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
