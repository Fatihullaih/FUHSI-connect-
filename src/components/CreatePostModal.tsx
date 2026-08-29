import React, { useState, useMemo } from 'react';
import { PostCategory, UserProfile } from '../types';
import { compressImageFile } from '../utils/imageUtils';
import { AvatarIcon } from './AvatarIcon';
import { VerificationModal } from './VerificationModal';
import { INITIAL_USER_PROFILE } from '../data/initialData';
import { getUserIdentitySubtitle, isGuestAccount } from '../utils/userDbUtils';
import { X, Sparkles, Send, ShieldCheck, BarChart2, AlertTriangle, Image as ImageIcon, Video as VideoIcon, Upload, Trash2, Building2, Bell, Crown, Lock, Plus } from 'lucide-react';

interface CreatePostModalProps {
  userProfile?: UserProfile | null;
  user?: UserProfile | null;
  isOpen?: boolean;
  onClose: () => void;
  onSubmit?: (
    data: {
      content: string;
      department: string;
      targetDepartment?: string;
      category: string;
      imageUrl?: string;
      imageUrls?: string[];
      videoUri?: string;
      pollQuestion?: string;
      pollOptions?: string[];
      pollOptA?: string;
      pollOptB?: string;
    }
  ) => void;
  onCreatePost?: (content: string, category: PostCategory, customNickname?: string) => void;
  checkDoxxingThreats?: (text: string) => boolean;
  onOpenVerification?: (data?: any) => void;
}

// Target Audience Options - General Campus is Priority 1 listed first, followed by Faculties & Dept Abbreviations
const TARGET_AUDIENCE_OPTIONS = [
  { label: '🌟 General Campus (Broadcast to All)', value: 'General Campus' },
  // Faculties (automatically synchronizes all departments inside)
  { label: '🏛️ Faculty of Allied Health Sciences (NSC, MLS, DPT, AUD, EHS, ITH, HND, PRT)', value: 'Faculty of Allied Health Sciences' },
  { label: '🏛️ Faculty of Basic Medical Sciences (MBBS, PHM)', value: 'Faculty of Basic Medical Sciences' },
  { label: '🏛️ Faculty of Science (BCH, MCB, BMB)', value: 'Faculty of Science' },
  // Department Abbreviations
  { label: '🩺 MBBS - Medicine & Surgery', value: 'MBBS' },
  { label: '💉 NSC - Nursing Science', value: 'NSC' },
  { label: '🔬 MLS - Medical Laboratory Science', value: 'MLS' },
  { label: '🦿 DPT - Doctor of Physiotherapy', value: 'DPT' },
  { label: '👂 AUD - Audiology', value: 'AUD' },
  { label: '💊 PHM - Pharmacology', value: 'PHM' },
  { label: '🍎 HND - Nutrition & Dietetics', value: 'HND' },
  { label: '💻 ITH - Info Tech & Health Informatics', value: 'ITH' },
  { label: '🧫 MCB - Microbiology', value: 'MCB' },
  { label: '🧬 BCH - Biochemistry', value: 'BCH' },
  { label: '🧪 BMB - Biotech & Molecular Biology', value: 'BMB' },
  { label: '🌿 EHS - Environmental Health Science', value: 'EHS' },
  { label: '🦶 PRT - Prosthetics & Orthotics', value: 'PRT' },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  userProfile,
  user,
  isOpen = true,
  onClose,
  onSubmit,
  onCreatePost,
  checkDoxxingThreats,
  onOpenVerification,
}) => {
  const currentUser = userProfile || user || INITIAL_USER_PROFILE;

  const isVerifiedUser = useMemo(() => {
    if (currentUser?.isVerified || currentUser?.verificationStatus === 'approved') return true;
    try {
      const cleanNick = (currentUser?.nickname || '').toLowerCase().replace(/^@/, '');
      const vStr = localStorage.getItem('fuhsi_verifications_db');
      if (vStr) {
        const vList: any[] = JSON.parse(vStr);
        const found = vList.find(
          (req) =>
            req.status === 'APPROVED' &&
            (req.applicantNickname?.toLowerCase().replace(/^@/, '') === cleanNick ||
              req.applicantNickname?.toLowerCase() === (currentUser?.nickname || '').toLowerCase())
        );
        if (found) return true;
      }
      const uStr = localStorage.getItem('fuhsi_users_db');
      if (uStr) {
        const uList: any[] = JSON.parse(uStr);
        const foundU = uList.find(
          (usr) =>
            (usr.nickname || '').toLowerCase().replace(/^@/, '') === cleanNick ||
            usr.id === currentUser?.id
        );
        if (foundU && (foundU.isVerified || foundU.verificationStatus === 'approved')) return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }, [currentUser]);

  const [content, setContent] = useState('');
  const [targetDepartment, setTargetDepartment] = useState('General Campus');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [showImageInput, setShowImageInput] = useState(false);
  const [videoUri, setVideoUri] = useState('');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [showVerifiedVideoModal, setShowVerifiedVideoModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [hasPoll, setHasPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [doxxingWarning, setDoxxingWarning] = useState(false);

  const handleAddPollOption = () => {
    setPollOptions((prev) => [...prev, '']);
  };

  const handleUpdatePollOption = (index: number, value: string) => {
    setPollOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length <= 2) return;
    setPollOptions((prev) => prev.filter((_, i) => i !== index));
  };

  if (isOpen === false) return null;

  const handleContentChange = (text: string) => {
    setContent(text);
    if (checkDoxxingThreats && text.trim()) {
      setDoxxingWarning(checkDoxxingThreats(text));
    } else {
      setDoxxingWarning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const availableSlots = 2 - imageUrls.length;
    if (availableSlots <= 0) return;

    const filesToProcess = files.slice(0, availableSlots);
    const newProcessedImages: string[] = [];

    for (const file of filesToProcess) {
      try {
        const compressedDataUrl = await compressImageFile(file, 900, 900, 0.75);
        newProcessedImages.push(compressedDataUrl);
      } catch (err) {
        console.error('Image compression failed, using direct reader', err);
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newProcessedImages.push(dataUrl);
      }
    }

    setImageUrls((prev) => [...prev, ...newProcessedImages].slice(0, 2));
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoError(null);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    const tempUrl = URL.createObjectURL(file);
    tempVideo.src = tempUrl;

    tempVideo.onloadedmetadata = () => {
      URL.revokeObjectURL(tempUrl);
      if (tempVideo.duration > 90) {
        setVideoError('Video exceeds maximum duration of 1 minute 30 seconds.');
        setVideoUri('');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    };

    tempVideo.onerror = () => {
      URL.revokeObjectURL(tempUrl);
      setVideoError('Failed to load video file. Please select a valid video.');
      e.target.value = '';
    };
  };

  const handleVideoClick = () => {
    if (isVerifiedUser) {
      setShowVideoInput(!showVideoInput);
    } else {
      setShowVerifiedVideoModal(true);
    }
  };

  const handleVerificationSubmit = (data: any) => {
    try {
      const existingReqs = JSON.parse(localStorage.getItem('fuhsi_verifications_db') || '[]');
      const newReq = {
        id: `verif_req_${Date.now()}`,
        applicantNickname: currentUser.nickname,
        applicantFullName: currentUser.realName || currentUser.nickname,
        applicantEmail: currentUser.studentEmail || 'N/A',
        applicantPhone: currentUser.emergencyHomePhone || 'N/A',
        department: currentUser.department || 'N/A',
        level: currentUser.level || 'N/A',
        category: `${data.accountType || 'Student'} Verification`,
        accountType: data.accountType || 'Student',
        positionTitle: data.positionTitle || '',
        matricNumber: currentUser.matricNumber || 'N/A',
        proofDetails: data.proofDetails || 'Standard Verification Request',
        paymentRef: data.paymentRef || `SQUADCO-${Math.floor(100000 + Math.random() * 900000)}`,
        amountPaid: data.amountPaid || 1500,
        submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'ELIGIBLE_PENDING_ADMIN',
      };
      localStorage.setItem('fuhsi_verifications_db', JSON.stringify([newReq, ...existingReqs]));

      if (onOpenVerification) {
        onOpenVerification(data);
      }
    } catch (e) {
      console.error(e);
    }
    setShowVerificationModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const validPollOptions = pollOptions.map((opt) => opt.trim()).filter(Boolean);
    const isValidPoll = hasPoll && Boolean(pollQuestion.trim()) && validPollOptions.length >= 2;

    if (onSubmit) {
      onSubmit({
        content: content.trim(),
        department: currentUser?.department || 'General',
        targetDepartment: targetDepartment,
        category: 'General',
        imageUrl: imageUrls[0] || undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        videoUri: isVerifiedUser ? (videoUri.trim() || undefined) : undefined,
        pollQuestion: isValidPoll ? pollQuestion.trim() : undefined,
        pollOptions: isValidPoll ? validPollOptions : undefined,
        pollOptA: isValidPoll ? validPollOptions[0] : undefined,
        pollOptB: isValidPoll ? validPollOptions[1] : undefined,
      });
    } else if (onCreatePost) {
      onCreatePost(content.trim(), 'General');
    }

    setContent('');
    setImageUrls([]);
    setVideoUri('');
    setTargetDepartment('General Campus');
    setPollQuestion('');
    setPollOptions(['', '']);
    setHasPoll(false);
    onClose();
  };

  const nickname = currentUser?.nickname || '@FUHSIStudent';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Create Campus Post</h3>
              <p className="text-xs text-slate-500">Share updates, ask questions, or attach lecture diagrams</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content Scrollable */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Handle Identity Bar (Real name hidden) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                  <AvatarIcon avatarKey={currentUser?.avatarKey} size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{nickname}</span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {getUserIdentitySubtitle(currentUser, currentUser?.department, currentUser?.level)}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200">
                {isGuestAccount(currentUser) ? 'Guest' : 'Student Handle'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200/60">
              🔒 Your real name is strictly hidden from peers — posts appear under your handle <span className="font-bold text-slate-700">{nickname}</span>.
            </p>
          </div>

          {/* Doxxing / Privacy Alert */}
          {doxxingWarning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <span>Anti-Doxxing Guard: Sensitive contacts detected. Numbers or links will be auto-redacted.</span>
            </div>
          )}

          {/* Target Feed / Campus Faculty Selector (OPTIONAL) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Building2 size={14} className="text-teal-600" />
              Target Audience / Campus Faculty <span className="text-[10px] font-medium text-slate-400">(Optional)</span>
            </label>
            <select
              value={targetDepartment}
              onChange={(e) => setTargetDepartment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors cursor-pointer"
            >
              {TARGET_AUDIENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Post Content Area */}
          <div>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="What's happening?"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Attachments Bar (Image & Premium Video) */}
          <div className="border-t border-slate-100 pt-3 space-y-3">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Image Toggle */}
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className="text-xs font-bold text-teal-700 flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <ImageIcon size={16} />
                <span>{imageUrls.length > 0 ? `📷 ${imageUrls.length}/2 Attached` : '+ Attach Image'}</span>
              </button>

              {/* Video Toggle (Verified Feature) */}
              <button
                type="button"
                onClick={handleVideoClick}
                className={`text-xs font-bold flex items-center gap-1.5 hover:underline cursor-pointer ${
                  isVerifiedUser ? 'text-indigo-700' : 'text-slate-600'
                }`}
              >
                <VideoIcon size={16} />
                <span>{videoUri ? '🎥 Video Attached' : '+ Upload Video'}</span>
                {isVerifiedUser ? (
                  <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-200">
                    <ShieldCheck size={10} /> VERIFIED
                  </span>
                ) : (
                  <span className="text-[9px] font-extrabold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-amber-200">
                    <Lock size={10} /> VERIFIED ONLY
                  </span>
                )}
              </button>
            </div>

            {/* Image Input Drawer */}
            {(showImageInput || imageUrls.length > 0) && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">
                    Image Attachments <span className="text-teal-700">({imageUrls.length}/2)</span>
                  </span>
                  {imageUrls.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setImageUrls([])}
                      className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>

                {/* File Upload Button */}
                {imageUrls.length < 2 ? (
                  <label className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white rounded-xl p-3 text-xs font-extrabold flex items-center justify-center gap-2 transition-colors shadow-xs">
                    <Upload size={16} />
                    <span>{imageUrls.length === 0 ? 'Click to Select Image from Device (Max 2)' : '+ Add 2nd Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-center">
                    ✓ Maximum 2 images attached
                  </p>
                )}

                {/* Attached Image Previews Grid */}
                {imageUrls.length > 0 && (
                  <div className={`grid ${imageUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 pt-1`}>
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 h-40 bg-slate-950 flex items-center justify-center group">
                        <img src={url} alt={`Attachment ${idx + 1}`} className="h-full w-full object-cover" />
                        <div className="absolute top-1.5 left-1.5 bg-slate-900/80 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md backdrop-blur-xs">
                          Image {idx + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md transition-colors cursor-pointer"
                          title="Remove image"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Verified Video Input Drawer */}
            {isVerifiedUser && (showVideoInput || videoUri || videoError) && (
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-600" /> Video Attachment
                  </span>
                  {videoUri && (
                    <button
                      type="button"
                      onClick={() => {
                        setVideoUri('');
                        setVideoError(null);
                      }}
                      className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Remove Video</span>
                    </button>
                  )}
                </div>

                {/* Upload MP4 Button */}
                {!videoUri && (
                  <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-3 text-xs font-extrabold flex items-center justify-center gap-2 transition-colors shadow-xs w-full">
                    <Upload size={16} />
                    <span>Upload MP4 (Max length: 1m 30s)</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Video Duration Error */}
                {videoError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                    <span>{videoError}</span>
                  </div>
                )}

                {/* Video Preview */}
                {videoUri && (
                  <div className="relative rounded-xl overflow-hidden border border-indigo-200 max-h-48 bg-slate-950 flex items-center justify-center">
                    <video src={videoUri} controls className="max-h-48 w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setVideoUri('')}
                      className="absolute top-2 right-2 bg-slate-900/80 hover:bg-rose-600 text-white p-1 rounded-full transition-colors cursor-pointer"
                      title="Remove video"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Campus Poll Options */}
          <div className="border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setHasPoll(!hasPoll)}
              className="text-xs font-bold text-teal-700 flex items-center gap-1.5 hover:underline mb-2 cursor-pointer"
            >
              <BarChart2 size={16} />
              <span>{hasPoll ? 'Remove Campus Poll' : '+ Attach Student Poll'}</span>
            </button>

            {hasPoll && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-2">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Poll Question
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. How many courses are available in FUHSI?"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Answer Options
                  </label>
                  {pollOptions.map((optText, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + index)} (e.g. ${
                          index === 0 ? '5 Courses' : index === 1 ? '8 Courses' : index === 2 ? '12 Courses' : 'Option Choice'
                        })`}
                        value={optText}
                        onChange={(e) => handleUpdatePollOption(index, e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:border-teal-500"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePollOption(index)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-100/60 rounded-lg transition-colors cursor-pointer"
                          title="Remove option"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddPollOption}
                  className="mt-1 text-xs font-extrabold text-teal-800 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200/90 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>+ Add Option</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer Submit Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <ShieldCheck size={14} className="text-teal-600" />
              <span>Anti-Doxxing Safeguard Active</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!content.trim()}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Send size={14} />
                <span>Publish Post</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Verified Video Lock Modal */}
      {showVerifiedVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs border border-amber-200">
              <Lock size={24} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Video Upload — Verified Feature</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Video attachments (up to 1m 30s) are available exclusively to Verified accounts on FUHSI Connect.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs space-y-2 text-slate-800 font-medium">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <ShieldCheck size={16} />
                <span>Verification Benefits Include:</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-700 font-medium">
                <li className="flex items-center gap-1.5">✓ Upload any video posts</li>
                <li className="flex items-center gap-1.5">✓ Verified checkmark across the platform</li>
                <li className="flex items-center gap-1.5">✓ Higher trust and marketplace credibility</li>
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowVerifiedVideoModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowVerifiedVideoModal(false);
                  setShowVerificationModal(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ShieldCheck size={14} />
                <span>Get Verified</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showVerificationModal && (
        <VerificationModal
          userProfile={currentUser}
          onClose={() => setShowVerificationModal(false)}
          onSubmitVerification={handleVerificationSubmit}
        />
      )}
    </div>
  );
};


