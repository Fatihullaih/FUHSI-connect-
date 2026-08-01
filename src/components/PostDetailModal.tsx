import React, { useState, useMemo } from 'react';
import { X, MessageSquare, Heart, Bookmark, Send, CornerDownRight, Maximize2, Trash2, AlertTriangle, BarChart2, Check } from 'lucide-react';
import { Post, Comment, UserProfile, PollOption } from '../types';
import { AvatarIcon } from './AvatarIcon';
import { VerificationBadge } from './VerificationBadge';
import { formatRelativeTime } from '../utils/dateUtils';
import { ImagePreviewModal } from './ImagePreviewModal';

interface PostDetailModalProps {
  post: Post;
  comments: Comment[];
  userProfile: UserProfile | null;
  onClose: () => void;
  onAddComment: (commentText: string, parentId?: string, replyToNickname?: string) => void;
  onLikeComment?: (commentId: string) => void;
  onToggleLike: (post: Post) => void;
  onToggleBookmark: (post: Post) => void;
  onDeletePost?: (postId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onVotePoll?: (post: Post, optionId: string) => void;
  onAuthorClick?: (author: { nickname: string; avatarKey?: string; avatarUrl?: string; badgeType?: string; badgeTitle?: string }) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  comments,
  userProfile,
  onClose,
  onAddComment,
  onLikeComment,
  onToggleLike,
  onToggleBookmark,
  onDeletePost,
  onDeleteComment,
  onVotePoll,
  onAuthorClick,
}) => {
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; nickname: string } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [confirmDeletePost, setConfirmDeletePost] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (replyingTo) {
      onAddComment(commentText, replyingTo.id, replyingTo.nickname);
      setReplyingTo(null);
    } else {
      onAddComment(commentText);
    }
    setCommentText('');
  };

  // Build comment tree (top-level vs nested child replies)
  const topLevelComments = comments.filter((c) => !c.parentId);
  
  const getChildReplies = (parentId: string): Comment[] => {
    return comments.filter((c) => c.parentId === parentId);
  };

  // Helper component to render a comment item recursively or nested
  const renderCommentItem = (comment: Comment, depth: number = 0) => {
    const replies = getChildReplies(comment.id);
    const isMaxDepth = depth >= 3;
    const isMyComment = Boolean(
      userProfile?.nickname &&
      comment.authorNickname?.toLowerCase() === userProfile.nickname.toLowerCase()
    );

    return (
      <div key={comment.id} className="space-y-2">
        <div 
          className={`p-3 rounded-2xl border transition-colors ${
            replyingTo?.id === comment.id 
              ? 'bg-teal-50/90 border-teal-300 ring-2 ring-teal-500/20' 
              : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/60'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div 
              onClick={() => onAuthorClick?.({
                nickname: comment.authorNickname,
                avatarKey: comment.authorAvatarKey,
                avatarUrl: comment.authorAvatarUrl,
                badgeType: comment.authorBadgeType,
                badgeTitle: comment.authorBadgeTitle
              })}
              className="flex items-center gap-2 flex-wrap cursor-pointer group/user"
              title={`View ${comment.authorNickname}'s profile`}
            >
              <AvatarIcon
                avatarKey={comment.authorAvatarKey}
                avatarUrl={comment.authorAvatarUrl}
                sizeClassName="w-7 h-7 rounded-full object-cover shrink-0 group-hover/user:scale-105 transition-transform"
              />
              <span className="font-extrabold text-slate-900 text-xs group-hover/user:text-teal-700 group-hover/user:underline">
                {comment.authorNickname}
              </span>
              {comment.authorBadgeType && (
                <VerificationBadge badgeType={comment.authorBadgeType} />
              )}
              {comment.replyToNickname && (
                <span className="text-[10px] text-teal-700 font-bold bg-teal-100/70 px-1.5 py-0.5 rounded-md">
                  Replying to @{comment.replyToNickname}
                </span>
              )}
            </div>

            <span className="text-[10px] text-slate-400 font-medium shrink-0">
              {formatRelativeTime(comment.timestamp)}
            </span>
          </div>

          <p className="text-xs text-slate-800 pt-1.5 leading-relaxed font-medium whitespace-pre-line pl-9">
            {comment.content}
          </p>

          <div className="flex items-center justify-between pt-2 pl-9 text-[11px] font-bold text-slate-500">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onLikeComment?.(comment.id)}
                className={`flex items-center gap-1 hover:text-rose-600 transition-colors cursor-pointer ${
                  comment.isLikedByMe ? 'text-rose-600 font-black' : ''
                }`}
              >
                <Heart size={12} className={comment.isLikedByMe ? 'fill-rose-600 text-rose-600' : ''} />
                <span>{comment.likesCount || 0}</span>
              </button>

              <button
                type="button"
                onClick={() => setReplyingTo({ id: comment.id, nickname: comment.authorNickname })}
                className="flex items-center gap-1 text-teal-700 hover:text-teal-900 hover:underline transition-colors cursor-pointer"
              >
                <CornerDownRight size={12} />
                <span>Reply</span>
              </button>
            </div>

            {isMyComment && (
              <button
                type="button"
                onClick={() => setDeletingCommentId(comment.id)}
                className="flex items-center gap-1 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                title="Delete your reply"
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            )}
          </div>

          {deletingCommentId === comment.id && (
            <div className="mt-2.5 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-2 animate-in fade-in">
              <p className="text-rose-900 font-bold text-[11px]">Are you sure you want to delete your reply?</p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingCommentId(null)}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 text-[11px] font-bold hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeletingCommentId(null);
                    if (onDeleteComment) onDeleteComment(comment.id);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-extrabold hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Nested Child Replies */}
        {replies.length > 0 && (
          <div className={`pl-4 sm:pl-6 border-l-2 border-teal-200/80 space-y-2 ml-3 pt-1`}>
            {replies.map((child) => renderCommentItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-700" />
            <h2 className="font-extrabold text-slate-900 text-sm sm:text-base">Thread Discussion</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Main Post Card */}
          {(() => {
            const isMyPost = Boolean(
              userProfile?.nickname &&
              post.authorNickname?.toLowerCase() === userProfile.nickname.toLowerCase()
            );
            return (
              <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div 
                    onClick={() => onAuthorClick?.({
                      nickname: post.authorNickname,
                      avatarKey: post.authorAvatarKey,
                      avatarUrl: post.authorAvatarUrl,
                      badgeType: post.authorBadgeType,
                      badgeTitle: post.authorBadgeTitle
                    })}
                    className="flex items-center gap-3 cursor-pointer group/author flex-1 min-w-0"
                    title={`View ${post.authorNickname}'s profile`}
                  >
                    <AvatarIcon
                      avatarKey={post.authorAvatarKey}
                      avatarUrl={post.authorAvatarUrl}
                      sizeClassName="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-teal-500/20 group-hover/author:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-slate-900 text-sm truncate group-hover/author:text-teal-700 group-hover/author:underline">
                          {post.authorNickname}
                        </span>
                        {post.authorBadgeType && (
                          <VerificationBadge badgeType={post.authorBadgeType} title={post.authorBadgeTitle} showTitle />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 pt-0.5">
                        <span className="font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/80 text-[10px]">
                          {post.department}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-500">{formatRelativeTime(post.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {isMyPost && (
                    <button
                      type="button"
                      onClick={() => setConfirmDeletePost(true)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                      title="Delete your thread"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {confirmDeletePost && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 text-rose-900 font-bold">
                      <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                      <span>Delete this thread permanently? This action cannot be undone.</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setConfirmDeletePost(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-800 font-bold hover:bg-slate-300 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDeletePost(false);
                          if (onDeletePost) onDeletePost(post.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-extrabold hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                      >
                        Yes, Delete Thread
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium pt-1">
                  {post.content}
                </p>

            {(post.imageUrl || post.imageResName) && (
              <div 
                onClick={() => setPreviewImage(post.imageUrl || post.imageResName || null)}
                className="rounded-2xl overflow-hidden border border-slate-200 max-h-64 bg-slate-100 cursor-pointer"
              >
                <img src={post.imageUrl || post.imageResName} alt="attachment" className="w-full h-full object-cover hover:scale-101 transition-transform duration-200" />
              </div>
            )}

            {/* Optional Poll Component */}
            {post.pollQuestion && (
              (() => {
                const optionsList: PollOption[] = post.pollOptions && post.pollOptions.length > 0
                  ? post.pollOptions
                  : (post.pollOptA || post.pollOptB
                      ? [
                          { id: 'A', text: post.pollOptA || 'Option A', votes: post.pollVotesA || 0 },
                          { id: 'B', text: post.pollOptB || 'Option B', votes: post.pollVotesB || 0 },
                        ]
                      : []);

                const userKey = userProfile?.nickname?.toLowerCase();
                const myVotedOptionId = userKey && post.pollVotesByUser
                  ? (post.pollVotesByUser[userKey] || post.pollVotesByUser[userProfile?.nickname || ''])
                  : undefined;

                const hasVoted = Boolean(myVotedOptionId);
                const totalPollVotes = optionsList.reduce((acc, opt) => acc + (opt.votes || 0), 0);

                if (optionsList.length === 0) return null;

                return (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-800">
                      <BarChart2 size={16} className="shrink-0 text-teal-600" />
                      <span>Campus Poll: {post.pollQuestion}</span>
                    </div>

                    <div className="space-y-2">
                      {optionsList.map((opt, idx) => {
                        const isThisSelected =
                          myVotedOptionId === opt.id ||
                          myVotedOptionId === opt.text ||
                          (idx === 0 && myVotedOptionId === 'A') ||
                          (idx === 1 && myVotedOptionId === 'B');

                        const pct = totalPollVotes > 0 ? Math.round(((opt.votes || 0) / totalPollVotes) * 100) : 0;

                        return (
                          <button
                            key={opt.id || `opt_${idx}`}
                            disabled={hasVoted}
                            onClick={() => onVotePoll && onVotePoll(post, opt.id || `opt_${idx}`)}
                            className={`w-full p-2.5 rounded-xl text-left border text-xs font-semibold relative overflow-hidden transition-all flex items-center justify-between ${
                              hasVoted ? 'cursor-default' : 'cursor-pointer hover:border-teal-400 hover:bg-teal-50/40'
                            } ${
                              isThisSelected
                                ? 'border-teal-600 bg-teal-50/90 text-teal-950 font-extrabold ring-1 ring-teal-600/30'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            {hasVoted && (
                              <div
                                className={`absolute left-0 top-0 bottom-0 pointer-events-none transition-all duration-500 ${
                                  isThisSelected ? 'bg-teal-200/60' : 'bg-slate-100/80'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                              {isThisSelected && <Check size={14} className="text-teal-700 shrink-0" />}
                              <span>{opt.text}</span>
                            </span>
                            {hasVoted && (
                              <span className="relative z-10 font-bold text-teal-800 shrink-0 ml-2">
                                {pct}% ({opt.votes || 0})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {totalPollVotes} student {totalPollVotes === 1 ? 'vote' : 'votes'} • Anonymous poll
                    </p>
                  </div>
                );
              })()
            )}

            {/* Interaction Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs font-extrabold text-slate-600">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onToggleLike(post)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    post.isLikedByMe ? 'text-rose-600 font-black' : 'hover:text-slate-900'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLikedByMe ? 'fill-rose-600 text-rose-600' : ''}`} />
                  <span>{post.likesCount}</span>
                </button>

                <div className="flex items-center gap-1.5 text-teal-800">
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                  <span>{comments.length} Comments</span>
                </div>
              </div>

              <button
                onClick={() => onToggleBookmark(post)}
                className={`p-1.5 rounded-xl transition-colors ${
                  post.isBookmarkedByMe ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${post.isBookmarkedByMe ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>
            </div>
          </div>
        );
      })()}

          {/* Comments Section */}
          <div className="space-y-3 pt-1">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-700" />
              Replies & Student Discussion ({comments.length})
            </h3>

            {topLevelComments.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium italic bg-slate-50 p-6 rounded-2xl text-center border border-slate-200/80">
                No replies yet. Be the first student to respond!
              </p>
            ) : (
              <div className="space-y-3">
                {topLevelComments.map((comment) => renderCommentItem(comment))}
              </div>
            )}
          </div>
        </div>

        {/* Reply Input Bar */}
        <form onSubmit={handleSubmit} className="p-3.5 border-t border-slate-200 bg-slate-50/95 shrink-0 space-y-2">
          {replyingTo && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-teal-100/90 text-teal-900 rounded-xl text-xs font-bold border border-teal-300 animate-in fade-in">
              <span className="flex items-center gap-1.5">
                <CornerDownRight size={13} className="text-teal-700" />
                <span>Replying to <strong>@{replyingTo.nickname}</strong></span>
              </span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-teal-800 hover:text-teal-950 p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                replyingTo
                  ? `Write a reply to @${replyingTo.nickname}...`
                  : 'Write a constructive student comment...'
              }
              className="flex-1 text-xs rounded-xl border border-slate-300 bg-white p-2.5 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 shadow-2xs"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </div>
        </form>
      </div>

      {previewImage && (
        <ImagePreviewModal
          imageUrl={previewImage}
          title={`Attachment by ${post.authorNickname}`}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
};
