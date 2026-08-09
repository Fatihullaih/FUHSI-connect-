import React, { useState, useMemo } from 'react';
import { Post, Comment, BadgeType } from '../types';
import { AvatarIcon } from './AvatarIcon';
import { VerificationBadge } from './VerificationBadge';
import { PostCard } from './PostCard';
import { ProfilePictureModal } from './ProfilePictureModal';
import { formatRelativeTime, getTimestampMs } from '../utils/dateUtils';
import { calculateUserPoints } from '../utils/reputationUtils';
import { 
  X, 
  Award, 
  Calendar, 
  UserCheck, 
  FileText, 
  MessageSquare,
  Lock,
  ArrowRight
} from 'lucide-react';

interface AuthorProfileModalProps {
  authorNickname: string;
  authorAvatarKey?: string;
  authorAvatarUrl?: string;
  authorBadgeType?: BadgeType;
  authorBadgeTitle?: string;
  authorIsVerified?: boolean;
  authorPoints?: number;
  authorJoinedDate?: string;
  currentUserNickname?: string;
  userProfile?: UserProfile | null;
  allPosts?: Post[];
  posts?: Post[];
  allComments?: Comment[];
  onClose: () => void;
  onLikeClick?: (post: Post) => void;
  onBookmarkClick?: (post: Post) => void;
  onCommentClick?: (post: Post) => void;
  onDeletePost?: (postId: string) => void;
}

export const AuthorProfileModal: React.FC<AuthorProfileModalProps> = (props) => {
  const {
    authorNickname,
    authorAvatarKey = 'caduceus',
    authorAvatarUrl,
    authorBadgeType = 'NONE',
    authorBadgeTitle = '',
    authorIsVerified = false,
    authorPoints,
    authorJoinedDate = 'Jul 2026',
    currentUserNickname,
    userProfile,
    allPosts = [],
    posts = [],
    allComments = [],
    onClose,
    onLikeClick,
    onBookmarkClick,
    onCommentClick,
    onDeletePost,
  } = props;

  const [activeTab, setActiveTab] = useState<'threads' | 'replies'>('threads');
  const [showPictureModal, setShowPictureModal] = useState(false);

  const isVerifiedAuthor = useMemo(() => {
    if (authorIsVerified) return true;
    try {
      const cleanNick = (authorNickname || '').toLowerCase().replace(/^@/, '');
      const vStr = localStorage.getItem('fuhsi_verifications_db');
      if (vStr) {
        const vList: any[] = JSON.parse(vStr);
        const foundVerif = vList.find(
          (req) =>
            req.status === 'APPROVED' &&
            (req.applicantNickname?.toLowerCase().replace(/^@/, '') === cleanNick ||
              req.applicantNickname?.toLowerCase() === authorNickname.toLowerCase())
        );
        if (foundVerif) return true;
      }
      const uStr = localStorage.getItem('fuhsi_users_db');
      if (uStr) {
        const uList: any[] = JSON.parse(uStr);
        const foundUser = uList.find(
          (usr) =>
            (usr.nickname || '').toLowerCase().replace(/^@/, '') === cleanNick ||
            usr.id === authorNickname
        );
        if (foundUser && (foundUser.isVerified || foundUser.verificationStatus === 'approved')) return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }, [authorNickname, authorIsVerified]);

  React.useEffect(() => {
    const handlePopState = () => {
      if (showPictureModal) {
        setShowPictureModal(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showPictureModal]);

  // Derive username format
  const username = authorNickname.startsWith('@') 
    ? authorNickname 
    : `@${authorNickname.replace(/\s+/g, '_').toLowerCase()}`;

  const normAuthor = authorNickname ? authorNickname.toLowerCase().replace(/^@/, '').trim() : '';
  const effectivePosts = (allPosts && allPosts.length > 0) ? allPosts : posts;

  // Find all threads written by this author, sorted chronologically (newest first)
  const authorPosts = useMemo(() => {
    return effectivePosts
      .filter((p) => {
        const nick = (p.authorNickname || p.nickname || (p as any).customNickname || '')
          .toLowerCase()
          .replace(/^@/, '')
          .trim();
        return nick === normAuthor;
      })
      .sort((a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp));
  }, [effectivePosts, normAuthor]);

  // Find all replies/comments made by this author across all threads
  const authorReplies = useMemo(() => {
    const list: Array<{ comment: Comment; parentPost?: Post }> = [];
    const seen = new Set<string>();

    // From allComments prop
    (allComments || []).forEach((c) => {
      const cNick = (c.authorNickname || '').toLowerCase().replace(/^@/, '').trim();
      if (cNick === normAuthor) {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          const parentPost = effectivePosts.find((p) => p.id === c.postId);
          list.push({ comment: c, parentPost });
        }
      }
    });

    // From embedded comments inside posts
    effectivePosts.forEach((p) => {
      if ((p as any).comments && Array.isArray((p as any).comments)) {
        (p as any).comments.forEach((c: Comment) => {
          const cNick = (c.authorNickname || '').toLowerCase().replace(/^@/, '').trim();
          if (cNick === normAuthor) {
            if (!seen.has(c.id)) {
              seen.add(c.id);
              list.push({ comment: c, parentPost: p });
            }
          }
        });
      }
    });

    return list;
  }, [allComments, effectivePosts, normAuthor]);

  // Calculate points dynamically based on actual activity
  const computedPoints = useMemo(() => {
    return calculateUserPoints(
      authorNickname || '',
      { nickname: authorNickname, department: 'FUHSI' },
      effectivePosts,
      allComments
    );
  }, [authorNickname, effectivePosts, allComments]);

  const displayPoints = computedPoints;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-50 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col relative animate-in zoom-in-95">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-teal-900/60 hover:bg-teal-900 text-teal-100 hover:text-white transition-colors cursor-pointer"
            title="Close Profile Details"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4">
            {/* Clickable Profile Picture for Full-size View & Download */}
            <div 
              className="relative shrink-0 cursor-pointer"
              onClick={() => setShowPictureModal(true)}
              title="Click to view full size profile picture"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border-2 border-teal-300/80 shadow-md overflow-hidden hover:scale-105 transition-transform">
                <AvatarIcon
                  avatarKey={authorAvatarKey}
                  avatarUrl={authorAvatarUrl}
                  sizeClassName="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white truncate">{authorNickname}</h2>
                <VerificationBadge 
                  isVerified={isVerifiedAuthor} 
                  badgeType={authorBadgeType}
                  title={authorBadgeTitle}
                  showTitle 
                />
              </div>

              <p className="text-xs text-teal-200 font-bold mt-0.5">{username}</p>

              <p className="text-xs text-teal-100 font-medium mt-1 flex items-center gap-1.5">
                <Calendar size={13} className="text-teal-300 shrink-0" />
                <span>Joined {authorJoinedDate}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Public Stats Row: Total Threads & Points Earned */}
        <div className="bg-white border-b border-slate-200 p-3 px-5 grid grid-cols-2 text-center divide-x divide-slate-100">
          <div>
            <div className="text-base sm:text-lg font-black text-slate-900">{authorPosts.length}</div>
            <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Total Threads</div>
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-teal-700 flex items-center justify-center gap-1">
              <Award size={16} className="text-teal-600" />
              <span>{(displayPoints ?? 0).toLocaleString()} <span className="text-xs font-bold text-teal-600">pts</span></span>
            </div>
            <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Total Points Earned</div>
          </div>
        </div>

        {/* Tabs Row: Threads & Replies */}
        <div className="bg-white border-b border-slate-200 flex px-4 gap-2">
          <button
            onClick={() => setActiveTab('threads')}
            className={`py-3 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'threads'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText size={15} />
            <span>Threads ({authorPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('replies')}
            className={`py-3 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'replies'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare size={15} />
            <span>Replies ({authorReplies.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="overflow-y-auto p-3 sm:p-4 space-y-3 flex-1">
          {activeTab === 'threads' && (
            authorPosts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2 my-auto">
                <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto border border-teal-100">
                  <UserCheck size={24} />
                </div>
                <h4 className="text-slate-800 font-bold text-sm">No Public Threads Yet</h4>
                <p className="text-slate-500 text-xs max-w-xs mx-auto">
                  {authorNickname} has earned {(displayPoints ?? 0).toLocaleString()} points on FUHSI Connect.
                </p>
              </div>
            ) : (
              authorPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserNickname={currentUserNickname}
                  userProfile={userProfile}
                  onLikeClick={onLikeClick}
                  onBookmarkClick={onBookmarkClick}
                  onCommentClick={(p) => {
                    if (onCommentClick) onCommentClick(p);
                  }}
                  onDeletePost={onDeletePost}
                />
              ))
            )
          )}

          {activeTab === 'replies' && (
            authorReplies.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2 my-auto">
                <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto border border-teal-100">
                  <MessageSquare size={24} />
                </div>
                <h4 className="text-slate-800 font-bold text-sm">No Replies Yet</h4>
                <p className="text-slate-500 text-xs max-w-xs mx-auto">
                  {authorNickname} hasn't commented on any discussions yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {authorReplies.map(({ comment, parentPost }) => (
                  <div
                    key={comment.id}
                    onClick={() => {
                      if (parentPost && onCommentClick) {
                        onCommentClick(parentPost);
                      }
                    }}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 text-xs space-y-2 hover:bg-teal-50/50 hover:border-teal-300 transition-all cursor-pointer group shadow-2xs"
                    title="Click to view full thread"
                  >
                    <div className="flex items-center justify-between text-[11px] font-medium gap-2">
                      <div className="flex items-center gap-1.5 font-extrabold text-teal-800 truncate">
                        <MessageSquare className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">
                          Replying on: "{parentPost ? (parentPost.content.length > 45 ? parentPost.content.substring(0, 45) + '...' : parentPost.content) : 'Campus Thread'}"
                        </span>
                      </div>
                      <span className="text-[10px] text-teal-700 group-hover:underline font-extrabold shrink-0 flex items-center gap-0.5">
                        View thread <ArrowRight size={10} />
                      </span>
                    </div>

                    <p className="text-slate-800 font-semibold leading-relaxed pl-3.5 border-l-2 border-teal-500/50">
                      {comment.content}
                    </p>

                    <div className="text-[10px] text-slate-400 font-medium text-right">
                      {formatRelativeTime(comment.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>

      {/* Profile Picture Full-size Lightbox Modal */}
      {showPictureModal && (
        <ProfilePictureModal
          nickname={authorNickname}
          avatarUrl={authorAvatarUrl}
          avatarKey={authorAvatarKey}
          isOwner={false}
          onClose={() => setShowPictureModal(false)}
        />
      )}
    </div>
  );
};
