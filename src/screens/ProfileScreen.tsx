import React, { useState, useEffect } from 'react';
import { UserProfile, Post, Comment } from '../types';
import { compressImageFile } from '../utils/imageUtils';
import { calculateUserPoints, getUserPointsBreakdown } from '../utils/reputationUtils';
import { 
  User, 
  Lock, 
  Calendar, 
  Mail, 
  Camera, 
  Upload, 
  Trash2, 
  Link, 
  Save, 
  UserPlus, 
  X, 
  MessageSquare, 
  FileText, 
  Settings, 
  Edit3, 
  ArrowLeft,
  Award,
  Sparkles,
  Maximize2,
  LogOut,
  LogIn,
  Bookmark,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { AvatarIcon } from '../components/AvatarIcon';
import { VerificationBadge } from '../components/VerificationBadge';
import { PostCard } from '../components/PostCard';
import { ProfilePictureModal } from '../components/ProfilePictureModal';
import { VerificationModal } from '../components/VerificationModal';
import { formatRelativeTime, getTimestampMs } from '../utils/dateUtils';

interface ProfileScreenProps {
  userProfile: UserProfile | null;
  allPosts?: Post[];
  allComments?: Comment[];
  bookmarkedPostIds?: string[];
  onSaveProfile: (
    nickname: string,
    department: string,
    level: string,
    bio: string,
    avatarKey: string,
    emergencyPhone: string,
    avatarUrl?: string
  ) => string | null;
  onSubmitVerification?: (data: { matricNumber: string; department: string; level: string; proofDetails: string }) => void;
  onOpenAuthModal?: () => void;
  onLikeClick?: (post: Post) => void;
  onBookmarkClick?: (post: Post) => void;
  onCommentClick?: (post: Post) => void;
  onAuthorClick?: (post: Post) => void;
  onDeletePost?: (postId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onLogout?: () => void;
  onClose?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  allPosts = [],
  allComments = [],
  bookmarkedPostIds = [],
  onSaveProfile,
  onSubmitVerification,
  onOpenAuthModal,
  onLikeClick,
  onBookmarkClick,
  onCommentClick,
  onAuthorClick,
  onDeletePost,
  onDeleteComment,
  onLogout,
  onClose,
}) => {
  const isOwnProfile = Boolean(userProfile);
  const [activeTab, setActiveTab] = useState<'threads' | 'replies' | 'bookmarks'>('threads');
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [showPointsBreakdown, setShowPointsBreakdown] = useState(false);

  // Edit Form state (owner personal details)
  const [nickname, setNickname] = useState(userProfile?.nickname || '@IlaMedHero');
  const [realName, setRealName] = useState(userProfile?.realNameHidden || userProfile?.realName || 'Adeyemo Oluwaseun Joseph');
  const [studentEmail, setStudentEmail] = useState(userProfile?.studentEmail || '');
  const [department, setDepartment] = useState(userProfile?.department || 'Medicine and Surgery (MBBS)');
  const [level, setLevel] = useState(userProfile?.level || '300L');
  const [bio, setBio] = useState(userProfile?.bio || 'FUHSI Student | Learning & Saving Lives');
  const [emergencyPhone, setEmergencyPhone] = useState(userProfile?.emergencyHomePhone || '08031234567');
  const [selectedAvatarKey, setSelectedAvatarKey] = useState(userProfile?.avatarKey || 'caduceus');
  const [avatarUrl, setAvatarUrl] = useState<string>(userProfile?.avatarUrl || '');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');

  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Sync form state when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setNickname(userProfile.nickname || '@IlaMedHero');
      setRealName(userProfile.realNameHidden || userProfile.realName || '');
      setStudentEmail(userProfile.studentEmail || '');
      setDepartment(userProfile.department || 'Medicine and Surgery (MBBS)');
      setLevel(userProfile.level || '300L');
      setBio(userProfile.bio || '');
      setEmergencyPhone(userProfile.emergencyHomePhone || '');
      setSelectedAvatarKey(userProfile.avatarKey || 'caduceus');
      setAvatarUrl(userProfile.avatarUrl || '');
    }
  }, [userProfile]);

  // Handle popstate for back button inside ProfileScreen
  useEffect(() => {
    const handlePopState = () => {
      if (confirmLogout) {
        setConfirmLogout(false);
        return;
      }
      if (showPictureModal) {
        setShowPictureModal(false);
        return;
      }
      if (showPointsBreakdown) {
        setShowPointsBreakdown(false);
        return;
      }
      if (isEditingSettings) {
        setIsEditingSettings(false);
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [confirmLogout, showPictureModal, showPointsBreakdown, isEditingSettings]);

  const departments = [
    'Medicine and Surgery (MBBS)',
    'Nursing Science (NSC)',
    'Medical Laboratory Science (MLS)',
    'Doctor of Physiotherapy (DPT)',
    'Audiology (AUD)',
    'Pharmacology (PHM)',
    'Nutrition and Dietetics (HND)',
    'Information Technology and Health Informatics (ITH)',
    'Microbiology (MCB)',
    'Biochemistry (BCH)',
    'Biotechnology and Molecular Biology (BMB)',
    'Environmental Health Science (EHS)',
    'Prosthetics and Orthotics (PRT)',
  ];

  const levels = ['100L', '200L', '300L', '400L', '500L'];

  const avatarOptions = [
    { key: 'caduceus', label: 'Medicine 🩺' },
    { key: 'stethoscope', label: 'Nursing 💉' },
    { key: 'microscope', label: 'MLS 🔬' },
    { key: 'dna', label: 'Biochem 🧪' },
    { key: 'pill', label: 'Pharmacy 💊' },
  ];

  // User posts (threads) sorted chronologically (newest first)
  const myNickname = userProfile?.nickname || '';
  const normMyNick = myNickname ? myNickname.toLowerCase().replace(/^@/, '').trim() : '';

  const myPosts = (allPosts || [])
    .filter((p) => {
      if (!p) return false;
      const author = (p.authorNickname || p.nickname || (p as any).customNickname || '')
        .toLowerCase()
        .replace(/^@/, '')
        .trim();
      return normMyNick && author === normMyNick;
    })
    .sort((a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp));

  // User comments (replies) sorted chronologically (newest first)
  const myReplies = (allComments || [])
    .filter((c) => {
      if (!c) return false;
      const author = (c.authorNickname || '').toLowerCase().replace(/^@/, '').trim();
      return normMyNick && author === normMyNick;
    })
    .sort((a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp));

  // Saved / Bookmarked posts (Strictly isolated per account)
  const bookmarkedPosts = (allPosts || [])
    .filter((p) => {
      if (!p) return false;
      if (bookmarkedPostIds && bookmarkedPostIds.length > 0) {
        return bookmarkedPostIds.includes(p.id);
      }
      return Boolean(p.isBookmarkedByMe);
    })
    .sort((a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp));

  const pointsEarned = calculateUserPoints(myNickname, userProfile, allPosts, allComments);
  const joinedDate = userProfile?.joinedDate || 'Jul 2026';

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedDataUrl = await compressImageFile(file, 600, 600, 0.75);
        setAvatarUrl(compressedDataUrl);
        setSaveErrorMessage(null);
      } catch (err) {
        console.error('Image compression failed', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setAvatarUrl(reader.result);
            setSaveErrorMessage(null);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveErrorMessage(null);
    setShowSavedToast(false);

    const finalAvatarUrl = customUrlInput.trim() ? customUrlInput.trim() : avatarUrl;

    const error = onSaveProfile(nickname, department, level, bio, selectedAvatarKey, emergencyPhone, finalAvatarUrl);
    if (error) {
      setSaveErrorMessage(error);
    } else {
      setAvatarUrl(finalAvatarUrl);
      setCustomUrlInput('');
      setShowSavedToast(true);
      setIsEditingSettings(false);
      setTimeout(() => setShowSavedToast(false), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 px-2 sm:px-4 pt-2 space-y-4 font-sans text-slate-900">
      {/* Toast Notification */}
      {showSavedToast && (
        <div className="p-3.5 bg-emerald-600 text-white font-extrabold text-xs rounded-2xl text-center shadow-lg animate-in fade-in slide-in-from-top-2">
          ✓ Account settings updated! Your personal info remains strictly confidential to you.
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4 relative">
        {/* Header Bar with Settings Icon */}
        <div className="flex items-center justify-between">
          {onClose ? (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              title="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!userProfile && onOpenAuthModal) {
                  onOpenAuthModal();
                } else {
                  setShowVerificationModal(true);
                }
              }}
              className="bg-black hover:bg-slate-800 text-white px-3.5 py-2 rounded-full text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <CheckCircle2 size={15} className="text-sky-400" />
              <span>Get Verified</span>
            </button>

            <button
              onClick={() => {
                setIsEditingSettings(true);
                try { window.history.pushState({ subModal: 'profileEdit' }, ''); } catch (e) { console.error(e); }
              }}
              className="px-3.5 py-2 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-800 hover:text-teal-800 transition-all border border-slate-200 shadow-2xs flex items-center gap-1.5 font-extrabold text-xs cursor-pointer"
              title="Account Settings & Personal Details"
            >
              <Settings size={16} className="text-teal-700" />
              <span>Account Settings</span>
            </button>
          </div>
        </div>

        {/* Profile Avatar & Info Row */}
        <div className="flex items-start justify-between gap-4">
          {/* Avatar Picture (Clickable for full size view) */}
          <div className="relative cursor-pointer" onClick={() => setShowPictureModal(true)}>
            <AvatarIcon
              avatarKey={selectedAvatarKey}
              avatarUrl={avatarUrl}
              sizeClassName="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-4 ring-teal-500/20 object-cover shadow-md transition-transform hover:scale-105"
            />
          </div>
        </div>

        {/* Public Profile Overview (Username, Date Joined, Bio) */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {userProfile?.nickname || '@IlaMedHero'}
              </h1>
              <VerificationBadge
                isVerified={Boolean(userProfile?.isVerified || userProfile?.verificationStatus === 'approved')}
                badgeType={userProfile?.badgeType}
                title={userProfile?.badgeTitle}
                showTitle
              />
            </div>
          </div>

          <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <Calendar size={13} className="text-slate-400 shrink-0" />
            <span>Joined {joinedDate}</span>
          </p>

          {userProfile?.bio && (
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed pt-1.5">
              {userProfile.bio}
            </p>
          )}
        </div>

        {/* Stats Row: Total Threads & Total Points Earned (NO Followers/Following) */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase block">Total Threads</span>
            <span className="text-lg sm:text-xl font-black text-slate-900">{myPosts.length}</span>
          </div>

          <div 
            onClick={() => setShowPointsBreakdown(true)}
            className="bg-teal-50/80 hover:bg-teal-100/90 transition-all p-3 rounded-2xl border border-teal-200/80 text-center cursor-pointer group shadow-2xs"
            title="Click to view full points breakdown"
          >
            <span className="text-xs font-bold text-teal-800 uppercase flex items-center justify-center gap-1 group-hover:text-teal-900">
              <Award size={13} className="text-teal-600 group-hover:scale-110 transition-transform" />
              <span>Total Points Earned</span>
            </span>
            <span className="text-lg sm:text-xl font-black text-teal-900 flex items-center justify-center gap-1">
              {pointsEarned.toLocaleString()} <span className="text-xs font-extrabold text-teal-700">pts</span>
              <Info size={12} className="text-teal-600 opacity-60 group-hover:opacity-100" />
            </span>
          </div>
        </div>
      </div>

      {/* POINTS BREAKDOWN MODAL */}
      {showPointsBreakdown && (() => {
        const bd = getUserPointsBreakdown(myNickname, userProfile, allPosts, allComments);
        return (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white max-w-md w-full rounded-3xl p-5 sm:p-6 border border-teal-200 shadow-2xl space-y-4 my-auto animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-teal-800 font-extrabold text-base">
                  <Award className="w-5 h-5 text-teal-600" />
                  <span>Reputation Points Breakdown</span>
                </div>
                <button
                  onClick={() => setShowPointsBreakdown(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Official reputation calculation for <strong className="text-slate-800">{userProfile?.nickname || myNickname}</strong> based on campus activity:
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">👤 Profile Completion</span>
                    <span className="text-[10px] text-slate-500">One-time account reward</span>
                  </div>
                  <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
                    +{bd.profileCompletion} pts
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">📝 Quality Threads Created</span>
                    <span className="text-[10px] text-slate-500">{bd.postsCount} posts × 2 pts</span>
                  </div>
                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                    +{bd.qualityPosts} pts
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">👍 Likes Received from Peers</span>
                    <span className="text-[10px] text-slate-500">{bd.likesCount} peer likes × 1 pt</span>
                  </div>
                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                    +{bd.likesReceived} pts
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">💬 Comments Received from Peers</span>
                    <span className="text-[10px] text-slate-500">{bd.commentsCount} peer comments × 1 pt</span>
                  </div>
                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                    +{bd.commentsReceived} pts
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">🔄 Reposts/Quotes Received</span>
                    <span className="text-[10px] text-slate-500">{bd.repostsCount} peer reposts × 1 pt</span>
                  </div>
                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                    +{bd.repostsReceived} pts
                  </span>
                </div>

                {(bd.spamPenalties > 0 || bd.offensivePenalties > 0 || bd.reportPenalties > 0) && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                    <span className="font-bold text-rose-950 block">⚠️ Safety Penalties Deducted</span>
                    {bd.spamPenalties > 0 && <p className="text-[11px] text-rose-700">• Spam penalty: -{bd.spamPenalties} pts</p>}
                    {bd.offensivePenalties > 0 && <p className="text-[11px] text-rose-700">• Offensive post penalty: -{bd.offensivePenalties} pts</p>}
                    {bd.reportPenalties > 0 && <p className="text-[11px] text-rose-700">• Valid community reports penalty: -{bd.reportPenalties} pts</p>}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="font-black text-slate-900 text-sm">Total Calculated Points</span>
                <span className="font-black text-teal-800 text-lg bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
                  {bd.total.toLocaleString()} pts
                </span>
              </div>

              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[10px] text-amber-900 space-y-1">
                <span className="font-bold block">🔒 Anti-Abuse System Active:</span>
                <p className="leading-snug">
                  Liking, commenting on, or reposting your own threads earns <strong>0 points</strong>. Only verified interactions from other students count towards reputation points.
                </p>
              </div>

              <button
                onClick={() => setShowPointsBreakdown(false)}
                className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        );
      })()}

      {/* SETTINGS & PERSONAL DETAILS MODAL (Account Owner Only) */}
      {isEditingSettings && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form 
            onSubmit={handleSave} 
            className="bg-white max-w-lg w-full rounded-3xl p-5 sm:p-6 border border-teal-200 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto animate-in zoom-in-95"
          >
            {/* Settings Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-600" />
                <div>
                  <h2 className="font-black text-slate-900 text-sm sm:text-base">Account Settings</h2>
                  <p className="text-[10px] text-slate-500 font-medium">Accessible only to you (Account Owner)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingSettings(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Privacy Shield Notice */}
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-[11px] text-teal-900 font-medium flex items-start gap-2">
              <Lock className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <span>
                🔒 <strong>Owner Privacy Protection:</strong> Other users can only see your Nickname, Points, Threads, and Profile Picture. Your Full Name, Email, Phone, Department, and Level remain strictly private here.
              </span>
            </div>

            {/* Profile Picture Upload Section */}
            <div className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-teal-600" />
                <span>Profile Picture</span>
              </label>

              <div className="flex items-center gap-4">
                <AvatarIcon
                  avatarKey={selectedAvatarKey}
                  avatarUrl={avatarUrl || customUrlInput}
                  sizeClassName="w-16 h-16 rounded-full ring-2 ring-teal-500/30 object-cover shrink-0"
                />

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                      <Upload size={14} />
                      <span>Upload New Photo</span>
                      <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                    </label>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Link size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="Or paste image web link..."
                      className="w-full pl-7 pr-2.5 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-800 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Or Choose Built-in Icon:</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {avatarOptions.map(({ key, label }) => {
                    const isSelected = selectedAvatarKey === key && !avatarUrl && !customUrlInput;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedAvatarKey(key)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all shrink-0 ${
                          isSelected ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <AvatarIcon avatarKey={key} sizeClassName="w-8 h-8" />
                        <span className="text-[10px] font-bold text-slate-700">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Personal Details (Account Owner Only) */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Display Username / Handle</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Lock size={12} className="text-teal-600" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail size={12} className="text-teal-600" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Lock size={12} className="text-teal-600" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 bg-white font-medium"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Academic Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 bg-white font-medium"
                  >
                    {levels.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Profile Description</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="FUHSI Student | Learning & Saving Lives 🩺"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {saveErrorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl text-center">
                {saveErrorMessage}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingSettings(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors"
              >
                <Save size={14} />
                Save Settings
              </button>
            </div>

            {onLogout && (
              <div className="pt-3 border-t border-slate-200">
                {!confirmLogout ? (
                  <button
                    type="button"
                    onClick={() => setConfirmLogout(true)}
                    className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs border border-rose-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Log Out of FUHSI Connect</span>
                  </button>
                ) : (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-center space-y-2.5 animate-in fade-in duration-150">
                    <p className="text-xs font-bold text-rose-900">
                      Are you sure you want to log out of your FUHSI Connect account?
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingSettings(false);
                          setConfirmLogout(false);
                          if (onClose) onClose();
                          onLogout();
                        }}
                        className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-colors shadow-xs cursor-pointer"
                      >
                        Yes, Log Out
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmLogout(false)}
                        className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      )}

      {/* FULL-SIZE PROFILE PICTURE LIGHTBOX MODAL */}
      {showPictureModal && (
        <ProfilePictureModal
          nickname={userProfile?.nickname || '@IlaMedHero'}
          avatarUrl={avatarUrl}
          avatarKey={selectedAvatarKey}
          isOwner={true}
          onClose={() => setShowPictureModal(false)}
          onUploadClick={() => setIsEditingSettings(true)}
        />
      )}

      {/* TABS: Threads (Posts), Replies & Bookmarks */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('threads')}
            className={`flex-1 py-3 text-xs sm:text-sm font-extrabold text-center relative transition-colors ${
              activeTab === 'threads' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Threads ({myPosts.length})
            {activeTab === 'threads' && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-teal-700 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('replies')}
            className={`flex-1 py-3 text-xs sm:text-sm font-extrabold text-center relative transition-colors ${
              activeTab === 'replies' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Replies ({myReplies.length})
            {activeTab === 'replies' && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-teal-700 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 py-3 text-xs sm:text-sm font-extrabold text-center relative transition-colors ${
              activeTab === 'bookmarks' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Bookmarks ({bookmarkedPosts.length})
            {activeTab === 'bookmarks' && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-teal-700 rounded-full" />
            )}
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-3 sm:p-4 space-y-3">
          {/* TAB 1: THREADS / POSTS */}
          {activeTab === 'threads' && (
            <div>
              {myPosts.length > 0 ? (
                <div className="space-y-3">
                  {myPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      comments={allComments.filter((c) => c.postId === post.id)}
                      currentUserNickname={myNickname}
                      onLikeClick={onLikeClick}
                      onBookmarkClick={onBookmarkClick}
                      onCommentClick={onCommentClick}
                      onAuthorClick={onAuthorClick}
                      onDeletePost={onDeletePost}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-extrabold text-xs text-slate-700">No threads posted yet</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    When you share campus updates or academic resources on the feed, your threads will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REPLIES / COMMENTS */}
          {activeTab === 'replies' && (
            <div>
              {myReplies.length > 0 ? (
                <div className="space-y-2.5">
                  {myReplies.map((reply) => {
                    const parentPost = allPosts.find((p) => p.id === reply.postId);
                    return (
                      <div
                        key={reply.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-2 hover:border-teal-300 transition-all shadow-2xs relative group"
                      >
                        <div className="flex items-center justify-between text-[11px] font-medium gap-2">
                          <div 
                            onClick={() => {
                              if (parentPost && onCommentClick) {
                                onCommentClick(parentPost);
                              }
                            }}
                            className="flex items-center gap-1.5 font-extrabold text-teal-800 truncate cursor-pointer hover:underline flex-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span className="truncate">
                              Replying on: "{parentPost ? (parentPost.content.length > 40 ? parentPost.content.substring(0, 40) + '...' : parentPost.content) : 'Campus Thread'}"
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {parentPost && (
                              <button
                                type="button"
                                onClick={() => onCommentClick && onCommentClick(parentPost)}
                                className="text-[10px] text-teal-700 hover:underline font-extrabold cursor-pointer"
                              >
                                View thread →
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingReplyId(reply.id);
                              }}
                              className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete reply"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <p 
                          onClick={() => {
                            if (parentPost && onCommentClick) {
                              onCommentClick(parentPost);
                            }
                          }}
                          className="text-slate-800 font-semibold leading-relaxed pl-3.5 border-l-2 border-teal-500/50 cursor-pointer"
                        >
                          {reply.content}
                        </p>

                        <div className="text-[10px] text-slate-400 font-medium text-right">
                          {formatRelativeTime(reply.timestamp)}
                        </div>

                        {deletingReplyId === reply.id && (
                          <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-2 animate-in fade-in">
                            <div className="flex items-center gap-2 text-rose-900 font-bold">
                              <AlertTriangle size={14} className="text-rose-600 shrink-0" />
                              <span>Are you sure you want to delete your reply?</span>
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingReplyId(null);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 font-bold text-[11px] hover:bg-slate-300 transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingReplyId(null);
                                  if (onDeleteComment) onDeleteComment(reply.id);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-extrabold text-[11px] hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                              >
                                Yes, Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-extrabold text-xs text-slate-700">No replies yet</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    When you comment on posts in the campus feed, your replies will be listed here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BOOKMARKS */}
          {activeTab === 'bookmarks' && (
            <div>
              {bookmarkedPosts.length > 0 ? (
                <div className="space-y-3">
                  {bookmarkedPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      comments={allComments.filter((c) => c.postId === post.id)}
                      currentUserNickname={myNickname}
                      onLikeClick={onLikeClick}
                      onBookmarkClick={onBookmarkClick}
                      onCommentClick={onCommentClick}
                      onAuthorClick={onAuthorClick}
                      onDeletePost={onDeletePost}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Bookmark className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-extrabold text-xs text-slate-700">No bookmarked posts</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Tap the bookmark icon on any campus thread to save it here for quick reference.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Verification Information & Application Modal */}
      {showVerificationModal && (
        <VerificationModal
          userProfile={userProfile}
          onClose={() => setShowVerificationModal(false)}
          onSubmitVerification={(data) => {
            onSubmitVerification?.(data);
          }}
        />
      )}
    </div>
  );
};
