import React, { useState } from 'react';
import { Post, MarketplaceItem, UserProfile } from '../types';
import { PostCard } from '../components/PostCard';
import { Search, Sparkles, TrendingUp, User, ShoppingBag, Hash, Building2, ChevronRight } from 'lucide-react';

interface SearchScreenProps {
  userProfile: UserProfile;
  posts: Post[];
  marketplaceItems: MarketplaceItem[];
  onSelectPost: (post: Post) => void;
  onLikeClick: (post: Post) => void;
  onBookmarkClick: (post: Post) => void;
  onCommentClick: (post: Post) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  userProfile,
  posts,
  marketplaceItems,
  onSelectPost,
  onLikeClick,
  onBookmarkClick,
  onCommentClick,
}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'POSTS' | 'STUDENTS' | 'HUB'>('ALL');

  const trendingTopics = [
    '#FUHSI2023',
    '#MBBS_Postings',
    '#CBT_Exams',
    '#IlaLandlords',
    '#SUG_Election',
    '#MLS_Practicals',
    '#Nursing_Clinical',
    '#HostelSpace',
  ];

  const searchTrim = query.trim().toLowerCase();

  // Filter posts (Only show results when query is provided)
  const filteredPosts = !searchTrim
    ? []
    : (posts || []).filter((p) => {
        if (!p) return false;
        const content = p.content || '';
        const nickname = p.nickname || p.authorNickname || '';
        const category = p.category || p.department || '';
        const customNickname = p.customNickname || '';
        return (
          content.toLowerCase().includes(searchTrim) ||
          nickname.toLowerCase().includes(searchTrim) ||
          category.toLowerCase().includes(searchTrim) ||
          customNickname.toLowerCase().includes(searchTrim)
        );
      });

  // Filter Marketplace (Only show results when query is provided)
  const filteredItems = !searchTrim
    ? []
    : (marketplaceItems || []).filter((item) => {
        if (!item) return false;
        return (
          (item.title || '').toLowerCase().includes(searchTrim) ||
          (item.description || '').toLowerCase().includes(searchTrim) ||
          (item.category || '').toLowerCase().includes(searchTrim) ||
          (item.sellerNickname || '').toLowerCase().includes(searchTrim)
        );
      });

  // Extract unique student handles from posts (Only show when query provided)
  const studentHandles = !searchTrim
    ? []
    : Array.from(
        new Set((posts || []).map((p) => p?.nickname || p?.authorNickname).filter(Boolean))
      ).filter((nick) => {
        return (nick as string).toLowerCase().includes(searchTrim);
      });

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4 pb-24">
      {/* Search Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
            <Search size={20} />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight">Search FUHSI Network</h1>
            <p className="text-xs text-slate-500 font-medium">Find campus posts, student handles, listings & topics</p>
          </div>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search @handle, topic, post or item..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-teal-600 focus:outline-none transition-all shadow-inner"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar text-xs font-bold">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('POSTS')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'POSTS'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Posts ({filteredPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('HUB')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'HUB'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hub & Items ({filteredItems.length})
          </button>
          <button
            onClick={() => setActiveTab('STUDENTS')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'STUDENTS'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Students ({studentHandles.length})
          </button>
        </div>
      </div>

      {/* Trending Topics Chips */}
      {!query && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
            <TrendingUp size={15} className="text-teal-600" />
            <span>Trending on Campus</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag.replace('#', ''))}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1"
              >
                <Hash size={13} className="text-teal-600" />
                <span>{tag.replace('#', '')}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      <div className="space-y-3">
        {(activeTab === 'ALL' || activeTab === 'POSTS') && filteredPosts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">
              Campus Feed Matches ({filteredPosts.length})
            </h2>
            {filteredPosts.map((post, idx) => (
              <PostCard
                key={post.id || `search_post_${idx}`}
                post={post}
                onLikeClick={() => onLikeClick(post)}
                onBookmarkClick={() => onBookmarkClick(post)}
                onCommentClick={() => onCommentClick(post)}
              />
            ))}
          </div>
        )}

        {(activeTab === 'ALL' || activeTab === 'HUB') && filteredItems.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">
              Marketplace Matches ({filteredItems.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredItems.map((item, idx) => (
                <div
                  key={item.id || `search_item_${idx}`}
                  className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 truncate mt-1">{item.title}</h3>
                    <p className="text-xs font-black text-slate-800">₦{(item.price != null ? Number(item.price) : 0).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">By {item.sellerNickname}</p>
                  </div>
                  {item.photos && item.photos[0] && (
                    <img
                      src={item.photos[0]}
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'ALL' || activeTab === 'STUDENTS') && studentHandles.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">
              Student Handles ({studentHandles.length})
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {(studentHandles as string[]).map((handle, idx) => (
                <div key={handle || `student_${idx}`} className="p-3 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs border border-teal-200">
                      <User size={15} />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{handle}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Verified FUHSI Student</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setQuery(handle)}
                    className="text-xs font-extrabold text-teal-700 hover:underline flex items-center gap-0.5"
                  >
                    <span>View Posts</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!query.trim() ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto border border-teal-100">
              <Search size={22} />
            </div>
            <h3 className="text-sm font-black text-slate-800">Search FUHSI Connect</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Type a student handle (e.g., <span className="font-extrabold text-teal-800">@IlaMedHero</span>), course code, department name, or marketplace item above to begin searching.
            </p>
          </div>
        ) : (
          filteredPosts.length === 0 &&
          filteredItems.length === 0 &&
          studentHandles.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-extrabold text-slate-800">No results found</h3>
              <p className="text-xs text-slate-500">
                Try searching with a different term or student handle e.g. <span className="font-bold text-slate-700">@MedScholar</span>
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
