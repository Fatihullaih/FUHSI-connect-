import React from 'react';
import { Post, BadgeType } from '../types';
import { AvatarIcon } from './AvatarIcon';
import { VerificationBadge } from './VerificationBadge';
import { PostCard } from './PostCard';
import { X, Building2, GraduationCap, Award, MessageSquare, CheckCircle2, ShieldCheck, Heart, Sparkles, UserCheck } from 'lucide-react';

interface AuthorProfileModalProps {
  authorNickname: string;
  authorDepartment?: string;
  authorAvatarKey?: string;
  authorBadgeType?: BadgeType;
  authorBadgeTitle?: string;
  authorLevel?: string;
  allPosts: Post[];
  onClose: () => void;
  onLikeClick?: (post: Post) => void;
  onBookmarkClick?: (post: Post) => void;
  onCommentClick?: (post: Post) => void;
}

export const AuthorProfileModal: React.FC<AuthorProfileModalProps> = ({
  authorNickname,
  authorDepartment = 'Medicine & Surgery',
  authorAvatarKey = 'caduceus',
  authorBadgeType = 'GREEN',
  authorBadgeTitle = 'Verified Student',
  authorLevel = '300L',
  allPosts = [],
  onClose,
  onLikeClick,
  onBookmarkClick,
  onCommentClick,
}) => {
  // Find all posts written by this author
  const authorPosts = allPosts.filter(
    (p) =>
      p.authorNickname?.toLowerCase() === authorNickname?.toLowerCase() ||
      p.nickname?.toLowerCase() === authorNickname?.toLowerCase()
  );

  const totalLikes = authorPosts.reduce((acc, p) => acc + (p.likesCount || p.upvotes || 0), 0);
  const totalComments = authorPosts.reduce((acc, p) => acc + (p.commentsCount || p.commentCount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-50 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col relative animate-in zoom-in-95">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-teal-900/60 hover:bg-teal-900 text-teal-100 hover:text-white transition-colors"
            title="Close Profile Details"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border-2 border-teal-300/80 shadow-md">
                <AvatarIcon avatarKey={authorAvatarKey} size={32} />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-teal-900 rounded-full" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-white truncate">{authorNickname}</h2>
                {authorBadgeType && (
                  <VerificationBadge badgeType={authorBadgeType} title={authorBadgeTitle} showTitle />
                )}
              </div>
              <p className="text-xs text-teal-100 font-medium mt-0.5 flex items-center gap-1.5">
                <Building2 size={13} className="text-teal-300 shrink-0" />
                <span>{authorDepartment} {authorLevel ? `• ${authorLevel}` : ''}</span>
              </p>
              <p className="text-[11px] text-teal-200/90 mt-1 font-medium flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-300" />
                <span>Verified FUHSI Ila-Orangun Student</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="bg-white border-b border-slate-200 p-3 px-5 grid grid-cols-3 text-center divide-x divide-slate-100">
          <div>
            <div className="text-sm font-black text-slate-900">{authorPosts.length}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Campus Posts</div>
          </div>
          <div>
            <div className="text-sm font-black text-rose-600 flex items-center justify-center gap-1">
              <Heart size={13} className="fill-rose-500" />
              <span>{totalLikes}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Likes Received</div>
          </div>
          <div>
            <div className="text-sm font-black text-teal-700 flex items-center justify-center gap-1">
              <MessageSquare size={13} />
              <span>{totalComments}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Discussions</div>
          </div>
        </div>

        {/* Content Body: Student's Posts */}
        <div className="overflow-y-auto p-3 sm:p-4 space-y-3 flex-1">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Sparkles size={14} className="text-teal-600" />
              <span>Posts by {authorNickname} ({authorPosts.length})</span>
            </h3>
          </div>

          {authorPosts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-teal-100">
                <UserCheck size={24} />
              </div>
              <h4 className="text-slate-800 font-bold text-sm mb-1">Active Student Profile</h4>
              <p className="text-slate-500 text-xs">
                {authorNickname} is a verified student in {authorDepartment}. No public posts published yet today.
              </p>
            </div>
          ) : (
            authorPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLikeClick={onLikeClick}
                onBookmarkClick={onBookmarkClick}
                onCommentClick={onCommentClick}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
