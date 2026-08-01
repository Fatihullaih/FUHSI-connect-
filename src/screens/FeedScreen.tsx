import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Post, Comment, PostCategory, UserProfile } from '../types';
import { PostCard } from '../components/PostCard';
import { INITIAL_USER_PROFILE } from '../data/initialData';
import { generateMorePosts } from '../utils/postGenerator';
import { 
  Plus, 
  Loader2,
  RefreshCw,
  SquarePen,
  ArrowUp,
  Sparkles
} from 'lucide-react';

interface FeedScreenProps {
  userProfile?: UserProfile | null;
  user?: UserProfile | null;
  posts: Post[];
  selectedFilter?: string;
  onFilterSelect?: (filter: string) => void;
  onLikeClick?: (post: Post) => void;
  onBookmarkClick?: (post: Post) => void;
  onCommentClick?: (post: Post) => void;
  onDeletePost?: (postId: string) => void;
  onVotePoll?: (post: Post, option: 'A' | 'B') => void;
  onReportPost?: (post: Post, reason: string) => void;
  onAuthorClick?: (post: Post) => void;
  onCreatePostClick?: () => void;

  // Legacy / alternative props compatibility
  comments?: Record<string, Comment[]>;
  onVote?: (postId: string, voteType: 'up' | 'down') => void;
  onBookmark?: (postId: string) => void;
  onAddComment?: (postId: string, text: string) => void;
  onFlagPost?: (postId: string, reason: string) => void;
  onCreatePost?: (content: string, category: PostCategory, customNickname?: string) => void;
}

export const FeedScreen: React.FC<FeedScreenProps> = ({
  userProfile,
  user,
  posts = [],
  selectedFilter: externalFilter,
  onFilterSelect,
  onLikeClick,
  onBookmarkClick,
  onCommentClick,
  onDeletePost,
  onVotePoll,
  onReportPost,
  onAuthorClick,
  onCreatePostClick,
  onCreatePost,
  comments = {},
  onVote,
  onBookmark,
  onAddComment,
  onFlagPost,
}) => {
  const [internalFilter, setInternalFilter] = useState<string>('All Campus');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [autoRefreshNotice, setAutoRefreshNotice] = useState<string | null>(null);

  // Finite scrolling state with clear end
  const [extraPosts, setExtraPosts] = useState<Post[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadCountRef = useRef(0);
  const MAX_LOAD_BATCHES = 3; // Stops at the last batch of posts

  const currentUser = userProfile || user || INITIAL_USER_PROFILE;
  const currentFilter = externalFilter !== undefined ? externalFilter : internalFilter;

  // Handle scroll detection for Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-refresh interval (checks every 25 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoRefreshNotice('✨ Feed updated automatically with fresh campus posts');
      setTimeout(() => setAutoRefreshNotice(null), 4000);
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFilter = (cat: string) => {
    if (onFilterSelect) {
      onFilterSelect(cat);
    } else {
      setInternalFilter(cat);
    }
  };

  const filterOptions = [
    'All Campus',
    'MBBS',
    'NSC',
    'MLS',
    'DPT',
    'AUD',
    'PHM',
    'HND',
    'ITH',
    'MCB',
    'BCH',
    'BMB',
    'EHS',
    'PRT',
  ];

  // Infinite Scroll Trigger Function with distinct end
  const loadMorePosts = useCallback(() => {
    if (isLoadingMore || hasReachedEnd) return;
    if (loadCountRef.current >= MAX_LOAD_BATCHES) {
      setHasReachedEnd(true);
      return;
    }

    setIsLoadingMore(true);

    setTimeout(() => {
      const nextBatch = generateMorePosts(4, loadCountRef.current * 4);
      loadCountRef.current += 1;
      setExtraPosts((prev) => [...prev, ...nextBatch]);
      setIsLoadingMore(false);

      if (loadCountRef.current >= MAX_LOAD_BATCHES) {
        setHasReachedEnd(true);
      }
    }, 600);
  }, [isLoadingMore, hasReachedEnd]);

  // Intersection Observer for scroll trigger
  useEffect(() => {
    if (hasReachedEnd) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && !hasReachedEnd) {
          loadMorePosts();
        }
      },
      { threshold: 0.1, rootMargin: '150px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [observerTarget, isLoadingMore, hasReachedEnd, loadMorePosts]);

  // Helper to parse relative timestamp age in minutes for exact chronological sorting
  const getTimestampAgeInMinutes = (timestampStr?: string): number => {
    if (!timestampStr) return 0;
    const str = timestampStr.toLowerCase().trim();
    if (str.includes('just now') || str.includes('30s') || str.includes('sec')) return 0.5;
    if (str.includes('min') || str.includes('m ago')) {
      const match = str.match(/\d+/);
      return match ? parseInt(match[0], 10) : 3;
    }
    if (str.includes('hr') || str.includes('h ago') || str.includes('hour')) {
      const match = str.match(/\d+/);
      return match ? parseInt(match[0], 10) * 60 : 120;
    }
    if (str.includes('day') || str.includes('d ago')) {
      const match = str.match(/\d+/);
      return match ? parseInt(match[0], 10) * 1440 : 4320;
    }
    return 9999;
  };

  // Combine initial posts and extra loaded posts
  const allCombinedPosts = [...posts, ...extraPosts];

  // Filter posts by selected department/category
  let filteredPosts = allCombinedPosts.filter((post) => {
    if (post.status === 'Removed') return false;

    if (currentFilter !== 'All Campus' && currentFilter !== 'All') {
      const dept = post.department || post.authorDepartment || '';
      const targetDept = post.targetDepartment || '';
      const cat = post.category || '';

      const matchesFilter =
        dept.toLowerCase().includes(currentFilter.toLowerCase()) ||
        targetDept.toLowerCase().includes(currentFilter.toLowerCase()) ||
        cat.toLowerCase() === currentFilter.toLowerCase();

      if (!matchesFilter) return false;
    }

    return true;
  });

  // Sort strictly chronologically: 3min ago -> 2hrs ago -> 3 days ago (newest first)
  filteredPosts.sort((a, b) => getTimestampAgeInMinutes(a.timestamp) - getTimestampAgeInMinutes(b.timestamp));

  return (
    <div className="py-4 px-3 sm:px-4 max-w-2xl mx-auto pb-28 space-y-3">
      {/* Auto-refresh Notification Toast */}
      {autoRefreshNotice && (
        <div className="sticky top-14 z-20 bg-teal-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center justify-between animate-in slide-in-from-top-2 border border-teal-600">
          <span className="flex items-center gap-2">
            <Sparkles size={15} className="text-teal-300" />
            <span>{autoRefreshNotice}</span>
          </span>
          <button onClick={() => setAutoRefreshNotice(null)} className="text-teal-200 hover:text-white font-black text-sm">
            ✕
          </button>
        </div>
      )}

      {/* Category / Department Horizontal Pill Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-2.5 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {filterOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => handleSelectFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                currentFilter === cat
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'All Campus' ? '🌟 All Campus' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Feed */}
      <div className="space-y-3">
        {filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            comments={comments[post.id] || []}
            currentUserNickname={userProfile?.nickname || user?.nickname}
            onLikeClick={onLikeClick}
            onBookmarkClick={onBookmarkClick}
            onCommentClick={onCommentClick}
            onDeletePost={onDeletePost}
            onVotePoll={onVotePoll}
            onReportPost={onReportPost}
            onAuthorClick={onAuthorClick}
            onVote={onVote}
            onBookmark={onBookmark}
            onAddComment={onAddComment}
            onFlagPost={onFlagPost}
          />
        ))}

        {/* End of Posts & Back to Top Handler */}
        {!hasReachedEnd ? (
          <div ref={observerTarget} className="py-6 text-center flex flex-col items-center justify-center space-y-3">
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-xs font-bold text-teal-800 bg-teal-50 px-4 py-2.5 rounded-full border border-teal-200/80 shadow-xs">
                <Loader2 size={16} className="animate-spin text-teal-700" />
                <span>Loading older campus posts...</span>
              </div>
            ) : (
              <button
                onClick={loadMorePosts}
                className="text-xs font-bold text-slate-500 hover:text-teal-800 hover:bg-slate-100 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                <span>Load older posts...</span>
              </button>
            )}
          </div>
        ) : (
          <div className="py-6 px-4 bg-white rounded-2xl border border-slate-200/90 text-center space-y-3 shadow-xs">
            <div className="w-10 h-10 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto border border-teal-200">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">You've reached the last post on the feed!</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Click "Back to Top" below to return to the newest updates.</p>
            </div>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <ArrowUp size={15} />
              <span>Back to Top</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Back to Top Button (visible when scrolled down) */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 left-4 sm:left-8 z-40 bg-slate-900/90 hover:bg-slate-900 active:scale-95 text-white rounded-full p-3 shadow-xl flex items-center gap-1.5 transition-all border border-slate-700/60"
          title="Back to Top"
        >
          <ArrowUp className="w-5 h-5 text-white" />
          <span className="hidden sm:inline font-bold text-xs pr-1">Top</span>
        </button>
      )}

      {/* Floating Action Button for Creating Posts */}
      <button
        onClick={() => {
          if (onCreatePostClick) {
            onCreatePostClick();
          } else if (onCreatePost) {
            onCreatePost('', 'GENERAL');
          }
        }}
        className="fixed bottom-20 right-4 sm:right-8 z-40 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white rounded-full p-4 sm:px-5 sm:py-3.5 shadow-2xl flex items-center gap-2 transition-all hover:scale-105 border border-teal-500/40 group"
        title="Post to Campus Feed"
      >
        <SquarePen className="w-5 h-5 text-white transition-transform group-hover:rotate-6" />
        <span className="hidden sm:inline font-black text-sm tracking-wide">Post</span>
      </button>
    </div>
  );
};
