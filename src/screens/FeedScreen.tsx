import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Post, Comment, PostCategory, UserProfile } from '../types';
import { PostCard } from '../components/PostCard';
import { INITIAL_USER_PROFILE } from '../data/initialData';
import { generateMorePosts } from '../utils/postGenerator';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Flame, 
  Sparkles,
  HeartHandshake,
  Loader2,
  RefreshCw
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
  onVotePoll?: (post: Post, option: 'A' | 'B') => void;
  onReportPost?: (post: Post, reason: string) => void;
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
  onVotePoll,
  onReportPost,
  onCreatePostClick,
  comments = {},
  onVote,
  onBookmark,
  onAddComment,
  onFlagPost,
}) => {
  const [internalFilter, setInternalFilter] = useState<string>('All Campus');
  const [sortBy, setSortBy] = useState<'trending' | 'latest' | 'upvoted'>('trending');
  const [searchQuery, setSearchQuery] = useState('');

  // Endless scrolling state
  const [extraPosts, setExtraPosts] = useState<Post[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadCountRef = useRef(0);

  const currentUser = userProfile || user || INITIAL_USER_PROFILE;
  const currentFilter = externalFilter !== undefined ? externalFilter : internalFilter;

  const handleSelectFilter = (cat: string) => {
    if (onFilterSelect) {
      onFilterSelect(cat);
    } else {
      setInternalFilter(cat);
    }
  };

  const filterOptions = [
    'All Campus',
    'Medicine & Surgery',
    'Nursing Science',
    'Medical Lab Science',
    'Biochemistry',
    'Public Health',
    'Pharmacy',
  ];

  // Infinite Scroll Trigger Function
  const loadMorePosts = useCallback(() => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);

    setTimeout(() => {
      const nextBatch = generateMorePosts(5, loadCountRef.current * 5);
      loadCountRef.current += 1;
      setExtraPosts((prev) => [...prev, ...nextBatch]);
      setIsLoadingMore(false);
    }, 600);
  }, [isLoadingMore]);

  // Intersection Observer for endless Twitter-style scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
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
  }, [observerTarget, isLoadingMore, loadMorePosts]);

  // Combine initial posts and endless extra posts
  const allCombinedPosts = [...posts, ...extraPosts];

  // Filter & Search
  let filteredPosts = allCombinedPosts.filter((post) => {
    if (post.status === 'Removed') return false;

    // Filter by department or category
    if (currentFilter !== 'All Campus' && currentFilter !== 'All') {
      const dept = post.department || post.authorDepartment || '';
      const cat = post.category || '';
      if (dept !== currentFilter && cat !== currentFilter) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const content = (post.content || '').toLowerCase();
      const author = (post.authorNickname || '').toLowerCase();
      const dept = (post.department || post.authorDepartment || '').toLowerCase();
      return content.includes(query) || author.includes(query) || dept.includes(query);
    }

    return true;
  });

  // Sort
  filteredPosts = [...filteredPosts].sort((a, b) => {
    const aLikes = a.likesCount ?? a.upvotes ?? 0;
    const bLikes = b.likesCount ?? b.upvotes ?? 0;
    const aComments = a.commentsCount ?? a.commentCount ?? 0;
    const bComments = b.commentsCount ?? b.commentCount ?? 0;

    if (sortBy === 'trending') return (bLikes + bComments * 2) - (aLikes + aComments * 2);
    if (sortBy === 'upvoted') return bLikes - aLikes;
    return 0; // default order
  });

  const nickname = currentUser?.nickname || '@FUHSIStudent';
  const initial = nickname.replace('@', '').charAt(0) || 'F';

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Feed Column */}
        <div className="lg:col-span-3 space-y-5">
          {/* Create Post Bar Trigger */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center font-bold text-teal-800 shrink-0 uppercase">
              {initial}
            </div>
            <button
              onClick={() => onCreatePostClick && onCreatePostClick()}
              className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-slate-500 transition-colors flex items-center justify-between group"
            >
              <span>Share an update, lecture tip, or confession with FUHSI...</span>
              <Sparkles size={16} className="text-teal-600 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => onCreatePostClick && onCreatePostClick()}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Post</span>
            </button>
          </div>

          {/* Search & Sorting Controls */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search posts or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:border-teal-500 focus:bg-white"
              />
            </div>

            {/* Sort Buttons */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl w-full sm:w-auto justify-center">
              <button
                onClick={() => setSortBy('trending')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sortBy === 'trending' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame size={14} />
                Trending
              </button>
              <button
                onClick={() => setSortBy('latest')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sortBy === 'latest' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock size={14} />
                Latest
              </button>
              <button
                onClick={() => setSortBy('upvoted')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sortBy === 'upvoted' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp size={14} />
                Most Liked
              </button>
            </div>
          </div>

          {/* Category / Department Horizontal Pill Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filterOptions.map((cat) => (
              <button
                key={cat}
                onClick={() => handleSelectFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  currentFilter === cat
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {cat === 'All Campus' ? '🌟 All Campus' : cat}
              </button>
            ))}
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Filter size={24} />
                </div>
                <h3 className="text-slate-800 font-bold text-base mb-1">No posts found</h3>
                <p className="text-slate-500 text-xs max-w-sm mx-auto mb-4">
                  No campus posts match your filter or search criteria. Try selecting another topic or publish a new post.
                </p>
                <button
                  onClick={() => { handleSelectFilter('All Campus'); setSearchQuery(''); }}
                  className="text-xs font-bold text-teal-700 hover:underline"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    comments={comments[post.id] || []}
                    onLikeClick={onLikeClick}
                    onBookmarkClick={onBookmarkClick}
                    onCommentClick={onCommentClick}
                    onVotePoll={onVotePoll}
                    onReportPost={onReportPost}
                    onVote={onVote}
                    onBookmark={onBookmark}
                    onAddComment={onAddComment}
                    onFlagPost={onFlagPost}
                  />
                ))}

                {/* Twitter / X Style Infinite Endless Scroll Trigger Element */}
                <div ref={observerTarget} className="py-6 text-center flex flex-col items-center justify-center">
                  {isLoadingMore ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-700 bg-teal-50 px-4 py-2.5 rounded-full border border-teal-200/80 shadow-xs">
                      <Loader2 size={16} className="animate-spin text-teal-600" />
                      <span>Loading more campus posts...</span>
                    </div>
                  ) : (
                    <button
                      onClick={loadMorePosts}
                      className="text-xs font-bold text-slate-500 hover:text-teal-700 hover:bg-slate-100 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw size={14} />
                      <span>Endless Feed • Click to fetch more updates</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar Info & Shortcuts */}
        <div className="space-y-5">
          {/* FUHSI Campus Pulse Card */}
          <div className="bg-gradient-to-br from-teal-900 to-emerald-950 text-white rounded-2xl p-5 shadow-lg border border-teal-800/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">FUHSI Campus Pulse</span>
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">Federal University of Health Sciences, Ila-Orangun</h3>
            <p className="text-xs text-teal-100/80 leading-relaxed mb-4">
              Building the future of Nigerian Healthcare & Medical Technology. Connect with peers safely via nickname identity.
            </p>
            <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-teal-800/80">
              <div className="bg-teal-900/60 p-2 rounded-xl border border-teal-700/50">
                <div className="text-lg font-extrabold text-emerald-300">{posts.length}</div>
                <div className="text-[10px] text-teal-200">Active Posts</div>
              </div>
              <div className="bg-teal-900/60 p-2 rounded-xl border border-teal-700/50">
                <div className="text-lg font-extrabold text-emerald-300">6</div>
                <div className="text-[10px] text-teal-200">Faculties</div>
              </div>
            </div>
          </div>

          {/* Quick Guidelines Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <HeartHandshake size={16} className="text-teal-600" />
              Community Code
            </h4>
            <ul className="text-xs space-y-2 text-slate-600 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span>Respect peer anonymity & nickname choices</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span>Share verified academic materials & revision guides</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span>Strict zero-tolerance for exam leaks or harassment</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
