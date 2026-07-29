import React, { useState } from 'react';
import { X, MessageSquare, Heart, Bookmark, Send, ShieldAlert } from 'lucide-react';
import { Post, Comment, UserProfile } from '../types';
import { AvatarIcon } from './AvatarIcon';
import { VerificationBadge } from './VerificationBadge';

interface PostDetailModalProps {
  post: Post;
  comments: Comment[];
  userProfile: UserProfile | null;
  onClose: () => void;
  onAddComment: (commentText: string) => void;
  onToggleLike: (post: Post) => void;
  onToggleBookmark: (post: Post) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  comments,
  userProfile,
  onClose,
  onAddComment,
  onToggleLike,
  onToggleBookmark,
}) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(commentText);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-800 text-lg">Post Details & Discussion</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Main Post Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3">
              <AvatarIcon avatarKey={post.authorAvatarKey} sizeClassName="w-10 h-10" />
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">{post.authorNickname}</span>
                  <VerificationBadge badgeType={post.authorBadgeType} title={post.authorBadgeTitle} showTitle />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                    {post.department}
                  </span>
                  <span>•</span>
                  <span>{post.timestamp}</span>
                </div>
              </div>
            </div>

            <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line">{post.content}</p>

            {post.imageResName && (
              <div className="rounded-xl overflow-hidden border border-slate-200 max-h-60 bg-slate-100">
                <img src={post.imageResName} alt="post attachment" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Interaction Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onToggleLike(post)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    post.isLikedByMe ? 'text-rose-600 font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLikedByMe ? 'fill-rose-600 text-rose-600' : ''}`} />
                  <span>{post.likesCount}</span>
                </button>

                <div className="flex items-center gap-1.5 text-teal-700">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.commentsCount} Comments</span>
                </div>
              </div>

              <button
                onClick={() => onToggleBookmark(post)}
                className={`p-1 rounded-md transition-colors ${
                  post.isBookmarkedByMe ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${post.isBookmarkedByMe ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              Student Responses ({comments.length})
            </h3>

            {comments.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                No comments yet. Be the first to start the discussion!
              </p>
            ) : (
              <div className="space-y-2.5">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <AvatarIcon avatarKey={comment.authorAvatarKey} sizeClassName="w-6 h-6" />
                        <span className="font-bold text-slate-900">{comment.authorNickname}</span>
                        <VerificationBadge badgeType={comment.authorBadgeType} />
                      </div>
                      <span className="text-[11px] text-slate-400">{comment.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-700 pl-7">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Comment Input Bar */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a constructive student comment..."
              className="flex-1 text-xs rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Reply
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">
            🔒 Auto-Sanitizer Active: Phone numbers and links are automatically redacted as <span className="font-mono">(******)</span>.
          </p>
        </form>
      </div>
    </div>
  );
};
