import React, { useState } from 'react';
import { Post, Comment, PostCategory, BadgeType } from '../types';
import { AvatarIcon } from './AvatarIcon';
import { VerificationBadge } from './VerificationBadge';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  Flag, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  X,
  AlertTriangle,
  BarChart2,
  Check,
  Zap,
  Maximize2
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  comments?: Comment[];
  onLikeClick?: (post: Post) => void;
  onBookmarkClick?: (post: Post) => void;
  onCommentClick?: (post: Post) => void;
  onVotePoll?: (post: Post, option: 'A' | 'B') => void;
  onReportPost?: (post: Post, reason: string) => void;
  onAuthorClick?: (post: Post) => void;
  // Alternative legacy props
  onVote?: (postId: string, voteType: 'up' | 'down') => void;
  onBookmark?: (postId: string) => void;
  onAddComment?: (postId: string, text: string) => void;
  onFlagPost?: (postId: string, reason: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  comments = [],
  onLikeClick,
  onBookmarkClick,
  onCommentClick,
  onVotePoll,
  onReportPost,
  onAuthorClick,
  onVote,
  onBookmark,
  onAddComment,
  onFlagPost,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('Inappropriate Content / Harassment');
  const [customReason, setCustomReason] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  const likesCount = post.likesCount ?? post.upvotes ?? 0;
  const isLiked = post.isLikedByMe || post.userVote === 'up';
  const isBookmarked = post.isBookmarkedByMe || post.isBookmarked || false;
  const commentsCount = post.commentsCount ?? post.commentCount ?? comments.length;
  const department = post.department || post.authorDepartment || 'General';
  const avatarKey = post.authorAvatarKey || post.authorAvatarId || 'caduceus';
  const category = post.category || 'General';

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Academic':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Events':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Confessions':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Marketplace':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'LostAndFound':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleToggleLike = () => {
    if (onLikeClick) {
      onLikeClick(post);
    } else if (onVote) {
      onVote(post.id, 'up');
    }
  };

  const handleToggleBookmark = () => {
    if (onBookmarkClick) {
      onBookmarkClick(post);
    } else if (onBookmark) {
      onBookmark(post.id);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (onAddComment) {
      onAddComment(post.id, newComment.trim());
    }
    setNewComment('');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = flagReason === 'Other' ? customReason : flagReason;
    if (!finalReason) return;
    if (onReportPost) {
      onReportPost(post, finalReason);
    } else if (onFlagPost) {
      onFlagPost(post.id, finalReason);
    }
    setShowFlagModal(false);
  };

  // Poll calculations
  const totalPollVotes = (post.pollVotesA || 0) + (post.pollVotesB || 0);
  const pctA = totalPollVotes > 0 ? Math.round(((post.pollVotesA || 0) / totalPollVotes) * 100) : 0;
  const pctB = totalPollVotes > 0 ? Math.round(((post.pollVotesB || 0) / totalPollVotes) * 100) : 0;

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all overflow-hidden mb-4">
      <div className="p-4 sm:p-5">
        {/* Post Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onAuthorClick?.(post)}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-teal-50 border-teal-200/80 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              title={`View ${post.authorNickname}'s profile details`}
            >
              <AvatarIcon avatarKey={avatarKey} size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onAuthorClick?.(post)}
                  className="font-bold text-slate-900 text-sm hover:text-teal-700 cursor-pointer focus:outline-none focus:underline"
                  title={`View ${post.authorNickname}'s profile details`}
                >
                  {post.authorNickname}
                </button>

                {post.authorBadgeType && (
                  <VerificationBadge 
                    badgeType={post.authorBadgeType as BadgeType} 
                    title={post.authorBadgeTitle} 
                    showTitle 
                  />
                )}

                <span className="text-xs text-slate-500 font-medium">
                  • {department} {post.authorLevel ? `(${post.authorLevel})` : ''}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{post.timestamp}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadge(category)}`}>
              {category}
            </span>
            <button
              onClick={handleToggleBookmark}
              className={`p-1.5 rounded-lg transition-colors ${
                isBookmarked ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Save Post'}
            >
              {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
          </div>
        </div>

        {/* Post Content */}
        <p className="mt-2 text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
          {post.content}
        </p>

        {/* Attached Image */}
        {(post.imageUrl || post.imageResName) && (
          <div className="mt-3.5 rounded-xl overflow-hidden border border-slate-200/90 bg-slate-950 group relative">
            <img
              src={post.imageUrl || post.imageResName}
              alt="Post visual attachment"
              className="w-full max-h-96 object-cover group-hover:scale-102 transition-transform duration-300"
            />
          </div>
        )}

        {/* Attached Video (Premium Feature) */}
        {post.videoUri && (
          <div className="mt-3.5 rounded-xl overflow-hidden border border-indigo-200/90 bg-slate-950 relative">
            <video
              src={post.videoUri}
              controls
              className="w-full max-h-96 object-contain"
            />
          </div>
        )}

        {/* Optional Poll Component */}
        {post.pollQuestion && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-800">
              <BarChart2 size={16} />
              <span>Campus Poll: {post.pollQuestion}</span>
            </div>

            <div className="space-y-2">
              {/* Option A */}
              <button
                disabled={Boolean(post.userVotedOpt)}
                onClick={() => onVotePoll && onVotePoll(post, 'A')}
                className={`w-full p-2.5 rounded-xl text-left border text-xs font-semibold relative overflow-hidden transition-all flex items-center justify-between ${
                  post.userVotedOpt === 'A'
                    ? 'border-teal-600 bg-teal-50/80 text-teal-900 font-bold'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                {/* Background Progress Bar */}
                {post.userVotedOpt && (
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-teal-200/40 pointer-events-none transition-all duration-500"
                    style={{ width: `${pctA}%` }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {post.userVotedOpt === 'A' && <Check size={14} className="text-teal-700" />}
                  {post.pollOptA}
                </span>
                {post.userVotedOpt && (
                  <span className="relative z-10 font-bold text-teal-800">{pctA}% ({post.pollVotesA || 0})</span>
                )}
              </button>

              {/* Option B */}
              <button
                disabled={Boolean(post.userVotedOpt)}
                onClick={() => onVotePoll && onVotePoll(post, 'B')}
                className={`w-full p-2.5 rounded-xl text-left border text-xs font-semibold relative overflow-hidden transition-all flex items-center justify-between ${
                  post.userVotedOpt === 'B'
                    ? 'border-teal-600 bg-teal-50/80 text-teal-900 font-bold'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                {/* Background Progress Bar */}
                {post.userVotedOpt && (
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-teal-200/40 pointer-events-none transition-all duration-500"
                    style={{ width: `${pctB}%` }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {post.userVotedOpt === 'B' && <Check size={14} className="text-teal-700" />}
                  {post.pollOptB}
                </span>
                {post.userVotedOpt && (
                  <span className="relative z-10 font-bold text-teal-800">{pctB}% ({post.pollVotesB || 0})</span>
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {totalPollVotes} student {totalPollVotes === 1 ? 'vote' : 'votes'} • Anonymous poll
            </p>
          </div>
        )}

        {/* Post Footer Controls */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors ${
              isLiked
                ? 'bg-rose-50 text-rose-600 font-bold'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
            title="Like post"
          >
            <Heart size={16} className={isLiked ? 'fill-rose-500 text-rose-500' : ''} />
            <span>{likesCount}</span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => {
                if (onCommentClick) {
                  onCommentClick(post);
                } else {
                  setShowComments(!showComments);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <MessageSquare size={16} />
              <span>{commentsCount} Comments</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
              title="Share post link"
            >
              {copiedShare ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={16} />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowFlagModal(true)}
              className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
              title="Report post to moderators"
            >
              <Flag size={16} />
            </button>
          </div>
        </div>

        {/* Local Comment Drawer Section (when onCommentClick is not passed) */}
        {showComments && !onCommentClick && (
          <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 sm:p-5 rounded-b-2xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <MessageSquare size={14} />
              Student Discussions ({comments.length})
            </h4>

            {/* List of comments */}
            <div className="space-y-3 mb-4">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No comments yet. Be the first student to reply!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-white p-3 rounded-xl border border-slate-200/70 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center">
                          <AvatarIcon avatarKey={comment.authorAvatarKey || comment.authorAvatarId} size={12} />
                        </div>
                        <span className="font-bold text-slate-800">{comment.authorNickname}</span>
                      </div>
                      <span className="text-slate-400 text-[10px]">{comment.timestamp}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed pl-7">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a constructive campus reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Send size={14} />
                <span>Post</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Flag / Report Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle size={20} />
                <h3 className="font-bold text-slate-900 text-base">Report Post to FUHSI Moderation</h3>
              </div>
              <button onClick={() => setShowFlagModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Help keep FUHSI Connect safe. Reported content is escalated to student moderators and evaluated against campus community guidelines.
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Reason</label>
                <select
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-teal-500"
                >
                  <option value="Inappropriate Content / Harassment">Inappropriate Content / Harassment</option>
                  <option value="Academic Fraud / Exam Misconduct">Academic Fraud / Exam Misconduct</option>
                  <option value="Spam / Commercial Unverified Sale">Spam / Commercial Unverified Sale</option>
                  <option value="False Information / Rumors">False Information / Campus Rumors</option>
                  <option value="Other">Other Reason</option>
                </select>
              </div>

              {flagReason === 'Other' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specify Details</label>
                  <textarea
                    rows={2}
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Provide details about why this post violates community guidelines..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFlagModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-xs transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </article>
  );
};
