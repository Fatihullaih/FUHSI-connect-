import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, Lock, Award, Star, School, ShieldAlert, CheckCircle2, Save, ChevronDown, LogOut, UserPlus, Upload, Camera, Image as ImageIcon, Trash2, Link } from 'lucide-react';
import { AvatarIcon } from '../components/AvatarIcon';
import { VerificationBadge } from '../components/VerificationBadge';

interface ProfileScreenProps {
  userProfile: UserProfile | null;
  onSaveProfile: (
    nickname: string,
    department: string,
    level: string,
    bio: string,
    avatarKey: string,
    emergencyPhone: string,
    avatarUrl?: string
  ) => string | null;
  onOpenAuthModal?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ userProfile, onSaveProfile, onOpenAuthModal }) => {
  const [nickname, setNickname] = useState(userProfile?.nickname || '@IlaMedHero');
  const [department, setDepartment] = useState(userProfile?.department || 'Medicine and Surgery (MBBS)');
  const [level, setLevel] = useState(userProfile?.level || '300L');
  const [bio, setBio] = useState(userProfile?.bio || 'FUHSI Student | Learning & Saving Lives');
  const [emergencyPhone, setEmergencyPhone] = useState(userProfile?.emergencyHomePhone || '08031234567');
  const [selectedAvatarKey, setSelectedAvatarKey] = useState(userProfile?.avatarKey || 'caduceus');
  const [avatarUrl, setAvatarUrl] = useState<string>(userProfile?.avatarUrl || '');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');

  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);

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

  const repScore = userProfile?.reputationScore || 2450;
  const targetScore = 3000;
  const scoreProgressPct = Math.min(Math.round((repScore / targetScore) * 100), 100);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSaveErrorMessage('Image file size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
          setSaveErrorMessage(null);
        }
      };
      reader.readAsDataURL(file);
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
      setTimeout(() => setShowSavedToast(false), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 px-4 pt-4 space-y-4">
      {/* Top Card: Student Profile Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-start gap-4">
          <div className="relative group shrink-0">
            <AvatarIcon avatarKey={selectedAvatarKey} avatarUrl={avatarUrl} sizeClassName="w-16 h-16 rounded-full ring-2 ring-teal-500/30 object-cover" />
            <label className="absolute -bottom-1 -right-1 bg-teal-600 hover:bg-teal-700 text-white p-1.5 rounded-full cursor-pointer shadow-md transition-all hover:scale-110">
              <Camera size={12} />
              <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
            </label>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-extrabold text-slate-900 text-lg">{nickname}</h1>
              <VerificationBadge
                badgeType={userProfile?.badgeType || 'BLUE'}
                title={userProfile?.badgeTitle || 'Trusted Leader'}
                showTitle
              />
            </div>

            <p className="text-xs text-slate-500 font-medium mt-0.5">
              FUHSI ID: {userProfile?.matricNumber || '2023/1042'} • {userProfile?.studentEmail || 'student@fuhsi.edu.ng'}
            </p>

            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-teal-600" />
              <span>Real Name Hidden: {userProfile?.realNameHidden}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Verification & Reputation Progress Meter */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Reputation & Verification Progress</h2>
              <p className="text-[11px] text-slate-500">Calculated in background via quality posts, peer upvotes & moderation score</p>
            </div>
          </div>
          <span className="font-extrabold text-xs text-purple-800 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 shadow-2xs">
            {repScore >= 3000 ? '🟡 3,000+ Pts: Eligible for Admin Verification' : repScore >= 1500 ? '🟣 Level 3: Trusted Member' : repScore >= 500 ? '🔵 Level 2: Active Member' : '🟢 Level 1: New Member'}
          </span>
        </div>

        {/* Engagement Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 block">👍 Likes Received</span>
            <span className="text-base font-black text-teal-700">184 (+1 pt ea)</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 block">💬 Comments Sparked</span>
            <span className="text-base font-black text-purple-700">62 (+2 pts ea)</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 block">🔥 Background Rep Score</span>
            <span className="text-base font-black text-amber-600">{repScore} pts</span>
          </div>
        </div>

        {/* Profile Verification Progress Bar */}
        <div className="space-y-1.5 p-3 bg-amber-50/50 rounded-xl border border-amber-200/70">
          <div className="flex justify-between text-xs font-extrabold text-slate-800">
            <span className="flex items-center gap-1">
              ⭐ Verification Progress: <span className="text-amber-800 font-extrabold">{repScore} / {targetScore} Reputation Points</span>
            </span>
            <span className="text-teal-700">{scoreProgressPct}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden border border-slate-300">
            <div
              className="bg-gradient-to-r from-teal-500 via-purple-600 to-amber-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${scoreProgressPct}%` }}
            />
          </div>
          <p className="text-[11px] text-amber-900 font-medium">
            {repScore >= 3000
              ? '🎉 Target reached! Your profile is automatically unlocked for Admin Verification Review.'
              : `Earn ${targetScore - repScore} more points to reach 3,000 pts and unlock Admin Verification Review.`}
          </p>
        </div>

        {/* Multi-Factor Verification & Reputation Formula */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/90 space-y-3 text-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="font-extrabold text-amber-950 flex items-center gap-1.5 text-sm">
              <Award className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Multi-Factor Verification Formula & Point System</span>
            </p>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
              🟡 3,000 Pts Threshold
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
            <div className="space-y-1.5 bg-white/80 p-2.5 rounded-lg border border-amber-100">
              <p className="font-bold text-slate-900">Reputation Tiers:</p>
              <p>🟢 0–499 pts: <span className="font-semibold text-slate-800">New Member</span></p>
              <p>🔵 500–1,499 pts: <span className="font-semibold text-slate-800">Active Member</span></p>
              <p>🟣 1,500–2,999 pts: <span className="font-semibold text-slate-800">Trusted Member</span></p>
              <p>🟡 3,000+ pts: <span className="font-bold text-amber-900">Eligible to Apply for Admin Verification</span></p>
            </div>

            <div className="space-y-1.5 bg-white/80 p-2.5 rounded-lg border border-amber-100">
              <p className="font-bold text-slate-900">Points Formula:</p>
              <p>📅 Daily login: +2 | 📝 Quality post: +3</p>
              <p>👍 Receive a like: +1 | 💬 Receive comment: +2</p>
              <p>🔄 Repost/share: +2 | 👤 Complete profile: +20</p>
              <p>🚩 Actionable report: +10</p>
            </div>
          </div>

          <div className="p-2.5 bg-rose-50/80 rounded-lg border border-rose-200 text-rose-900 space-y-1 text-[11px]">
            <p className="font-bold">⚠️ Deductions & Anti-Cheating Safeguards:</p>
            <p>• Spam: -30 pts | Offensive post: -50 pts | Valid reports: -20 pts | Suspension: -100 pts</p>
            <p>• Anti-Farm: Likes from same user count only once. Accounts &lt; 7 days old do not award points.</p>
          </div>
        </div>
      </div>

      {/* Campus Achievements & Badges Hub */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Achievements & Campus Badges</h2>
              <p className="text-[11px] text-slate-500">Earn recognition for helping peers and starting positive discussions</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            7 / 7 Badges Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title: '🌟 Rising Star', desc: '100+ rep points in first month on campus', unlocked: true, pts: '+50 pts' },
            { title: '🔥 Trending Creator', desc: 'Sparked a post with 25+ peer comments', unlocked: true, pts: '+100 pts' },
            { title: '🎓 Academic Helper', desc: 'Uploaded 5 verified lecture summaries', unlocked: true, pts: '+150 pts' },
            { title: '💬 Top Commenter', desc: 'Contributed 50+ constructive answers', unlocked: true, pts: '+100 pts' },
            { title: '❤️ Most Appreciated', desc: 'Received 100+ likes on study guides', unlocked: true, pts: '+120 pts' },
            { title: '🏆 Campus Influencer', desc: 'Ranked Top 10 on Weekly Campus Rankings', unlocked: true, pts: '+200 pts' },
            { title: '✔️ Verified Student', desc: 'Passed admin multi-factor verification', unlocked: true, pts: '+300 pts' },
          ].map((badge, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border bg-slate-50 border-slate-200/90 hover:border-slate-300 transition-all space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900">{badge.title}</span>
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Unlocked ({badge.pts})
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Nickname Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 text-sm">Edit Nickname Profile Details</h2>

        {/* Profile Picture & Avatar Section */}
        <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/90">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-teal-600" />
              <span>Profile Picture & Campus Avatar</span>
            </label>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl('')}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <Trash2 size={12} />
                <span>Remove Custom Picture</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="shrink-0 relative">
              <AvatarIcon
                avatarKey={selectedAvatarKey}
                avatarUrl={avatarUrl || customUrlInput}
                sizeClassName="w-14 h-14 rounded-full ring-2 ring-teal-500/30 object-cover"
              />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <label className="py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors">
                  <Upload size={14} />
                  <span>Upload Picture</span>
                  <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                </label>
                <span className="text-[10px] text-slate-500">JPG, PNG or WEBP (Max 5MB)</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Link size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="Or paste image web link..."
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-800 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Or Choose Built-in Department Icon:</label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {avatarOptions.map(({ key, label }) => {
                const isSelected = selectedAvatarKey === key && !avatarUrl && !customUrlInput;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedAvatarKey(key);
                    }}
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

        {/* Edit Display Nickname */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Display Nickname (No "Anonymous" or "Anon")
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        {/* Edit Secret Compulsory Emergency Phone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-teal-600" />
            Secret Home/Emergency Phone (Compulsory - Admin Record Only)
          </label>
          <input
            type="tel"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
            placeholder="Enter Phone Number (Hidden from public)"
            className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
          <p className="text-[10px] text-slate-500 mt-1">
            🔒 PRIVACY GUARANTEE: Your phone number is encrypted and hidden. Other students will NEVER see it.
          </p>
        </div>

        {/* Department & Level Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Faculty / Department</label>
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

        {/* Student Status / Bio */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Student Bio / Status</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Error / Toast Messages */}
        {saveErrorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl text-center">
            {saveErrorMessage}
          </div>
        )}

        {showSavedToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-center">
            ✓ Profile successfully updated! Home phone stored securely in encrypted Admin records.
          </div>
        )}

        {/* Submit Save Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          Update Nickname Profile
        </button>

        {/* Switch Account / Register New Account */}
        {onOpenAuthModal && (
          <div className="pt-2 border-t border-slate-100 mt-3 text-center">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4 text-teal-600" />
              <span>Switch Account / Register New Account</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
