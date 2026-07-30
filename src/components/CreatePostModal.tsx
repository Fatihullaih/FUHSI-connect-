import React, { useState } from 'react';
import { PostCategory, UserProfile } from '../types';
import { INITIAL_USER_PROFILE } from '../data/initialData';
import { AvatarIcon } from './AvatarIcon';
import { X, Sparkles, Send, ShieldCheck, BarChart2, AlertTriangle, Image as ImageIcon, Video as VideoIcon, Upload, Trash2, Building2, Bell, Crown, Lock } from 'lucide-react';

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
      videoUri?: string;
      pollQuestion?: string;
      pollOptA?: string;
      pollOptB?: string;
    }
  ) => void;
  onCreatePost?: (content: string, category: PostCategory, customNickname?: string) => void;
  checkDoxxingThreats?: (text: string) => boolean;
}

const CATEGORIES: PostCategory[] = [
  'General',
  'Academic',
  'Events',
  'Confessions',
  'Marketplace',
  'LostAndFound'
];

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

const SAMPLE_IMAGE_PRESETS = [
  { name: 'Lecture Notes', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80' },
  { name: 'Stethoscope & Ward', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80' },
  { name: 'Lab Microscope', url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80' },
  { name: 'Medical Anatomy', url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=80' },
  { name: 'Ila Campus Life', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80' },
];

const SAMPLE_VIDEO_PRESETS = [
  { name: 'Surgical Anatomy Demonstration', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  { name: 'Laboratory Clinical Procedure', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  userProfile,
  user,
  isOpen = true,
  onClose,
  onSubmit,
  onCreatePost,
  checkDoxxingThreats,
}) => {
  const currentUser = userProfile || user || INITIAL_USER_PROFILE;
  const isPremiumUser = Boolean(currentUser?.badgeType && currentUser.badgeType !== 'NONE') || Boolean(currentUser?.reputationScore && currentUser.reputationScore >= 1000) || Boolean(currentUser?.badgeTitle);

  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('General');
  const [targetDepartment, setTargetDepartment] = useState('General Campus');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [videoUri, setVideoUri] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [showPremiumVideoModal, setShowPremiumVideoModal] = useState(false);
  const [hasPoll, setHasPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptA, setPollOptA] = useState('');
  const [pollOptB, setPollOptB] = useState('');
  const [doxxingWarning, setDoxxingWarning] = useState(false);

  if (isOpen === false) return null;

  const handleContentChange = (text: string) => {
    setContent(text);
    if (checkDoxxingThreats && text.trim()) {
      setDoxxingWarning(checkDoxxingThreats(text));
    } else {
      setDoxxingWarning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoClick = () => {
    if (isPremiumUser) {
      setShowVideoInput(!showVideoInput);
    } else {
      setShowPremiumVideoModal(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (onSubmit) {
      onSubmit({
        content: content.trim(),
        department: currentUser?.department || 'General',
        targetDepartment: targetDepartment,
        category,
        imageUrl: imageUrl.trim() || undefined,
        videoUri: videoUri.trim() || undefined,
        pollQuestion: hasPoll ? pollQuestion.trim() : undefined,
        pollOptA: hasPoll ? pollOptA.trim() : undefined,
        pollOptB: hasPoll ? pollOptB.trim() : undefined,
      });
    } else if (onCreatePost) {
      onCreatePost(content.trim(), category);
    }

    setContent('');
    setImageUrl('');
    setVideoUri('');
    setTargetDepartment('General Campus');
    setPollQuestion('');
    setPollOptA('');
    setPollOptB('');
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
          {/* Verified Handle Identity Bar (Real name hidden) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                  <AvatarIcon avatarKey={currentUser?.avatarKey} size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{nickname}</span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {`${currentUser?.department} • ${currentUser?.level}`}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200">
                Verified Student Handle
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
            <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 size={14} className="text-teal-600" />
                Target Audience / Campus Faculty <span className="text-[10px] font-medium text-slate-400">(Optional)</span>
              </span>
              {targetDepartment !== 'General Campus' && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                  <Bell size={10} /> Priority Notification Sync
                </span>
              )}
            </label>
            <select
              value={targetDepartment}
              onChange={(e) => setTargetDepartment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
            >
              {TARGET_AUDIENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              {targetDepartment === 'General Campus' ? (
                '🌐 Broadcasts generally to the main campus feed for all FUHSI students.'
              ) : (
                <span className="text-teal-800 font-semibold">
                  ⚡ Synchronizes automatically to all students in <span className="font-extrabold underline">{targetDepartment}</span> with a priority feed notification!
                </span>
              )}
            </p>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Post Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    category === cat
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Post Content Area */}
          <div>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="What's happening on campus? Share revision notes, ask about clinical postings, or voice a concern..."
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
                className="text-xs font-bold text-teal-700 flex items-center gap-1.5 hover:underline"
              >
                <ImageIcon size={16} />
                <span>{imageUrl ? '📷 Image Attached' : '+ Attach Image / Diagram'}</span>
              </button>

              {/* Video Toggle (Premium Only) */}
              <button
                type="button"
                onClick={handleVideoClick}
                className={`text-xs font-bold flex items-center gap-1.5 hover:underline ${
                  isPremiumUser ? 'text-indigo-700' : 'text-purple-600'
                }`}
              >
                <VideoIcon size={16} />
                <span>{videoUri ? '🎥 Video Attached' : '+ Attach Video'}</span>
                {!isPremiumUser && (
                  <span className="text-[9px] font-extrabold bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-purple-200">
                    <Crown size={10} /> PRO
                  </span>
                )}
              </button>
            </div>

            {/* Image Input Drawer */}
            {(showImageInput || imageUrl) && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">Image Attachment</span>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste image URL (http://...)"
                    className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:border-teal-500"
                  />
                  <label className="cursor-pointer bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg px-3 py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0">
                    <Upload size={14} />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preset sample images */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Or pick a campus sample image:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_IMAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                          imageUrl === preset.url
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Image Preview */}
                {imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-950 flex items-center justify-center">
                    <img src={imageUrl} alt="Attachment Preview" className="max-h-48 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 bg-slate-900/80 hover:bg-rose-600 text-white p-1 rounded-full transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Premium Video Input Drawer */}
            {isPremiumUser && (showVideoInput || videoUri) && (
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                    <Crown size={14} className="text-amber-500" /> Premium Video Attachment
                  </span>
                  {videoUri && (
                    <button
                      type="button"
                      onClick={() => setVideoUri('')}
                      className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={videoUri}
                    onChange={(e) => setVideoUri(e.target.value)}
                    placeholder="Paste MP4 video URL (http://...)"
                    className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                  <label className="cursor-pointer bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-300 rounded-lg px-3 py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0">
                    <Upload size={14} />
                    <span>Upload MP4</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Video presets */}
                <div>
                  <span className="text-[10px] font-bold text-indigo-700/80 uppercase tracking-wider block mb-1">
                    Sample Clinical / Lecture Video Clips:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_VIDEO_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setVideoUri(preset.url)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                          videoUri === preset.url
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-indigo-900 border-indigo-200 hover:bg-indigo-100'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Video Preview */}
                {videoUri && (
                  <div className="relative rounded-xl overflow-hidden border border-indigo-200 max-h-48 bg-slate-950 flex items-center justify-center">
                    <video src={videoUri} controls className="max-h-48 w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setVideoUri('')}
                      className="absolute top-2 right-2 bg-slate-900/80 hover:bg-rose-600 text-white p-1 rounded-full transition-colors"
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
              className="text-xs font-bold text-teal-700 flex items-center gap-1.5 hover:underline mb-2"
            >
              <BarChart2 size={16} />
              <span>{hasPoll ? 'Remove Campus Poll' : '+ Attach Student Poll'}</span>
            </button>

            {hasPoll && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-2">
                <input
                  type="text"
                  placeholder="Poll Question (e.g. Should Saturday CBT start by 8 AM?)"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:border-teal-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Option A (e.g. Yes)"
                    value={pollOptA}
                    onChange={(e) => setPollOptA(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:border-teal-500"
                  />
                  <input
                    type="text"
                    placeholder="Option B (e.g. No)"
                    value={pollOptB}
                    onChange={(e) => setPollOptB(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium focus:outline-none focus:border-teal-500"
                  />
                </div>
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

      {/* Non-Premium Video Lock Modal */}
      {showPremiumVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-xs">
              <Crown size={24} />
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">Video Uploads Reserved for Premium Members</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Video attachments are available exclusively to verified students with active campus badges (Class Rep, SUG Executive, Tech Lead, or Gold verified members).
            </p>
            <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-left text-xs space-y-1 text-purple-950">
              <span className="font-bold block">How to unlock video posting:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-purple-900 font-medium">
                <li>Reach 1,000+ Reputation Score via community likes</li>
                <li>Request official badge approval in Moderation Council</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setShowPremiumVideoModal(false)}
              className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-colors"
            >
              Got It, Thank You
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


