import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, Lock, Award, Star, School, ShieldAlert, CheckCircle2, Save, ChevronDown } from 'lucide-react';
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
    emergencyPhone: string
  ) => string | null;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ userProfile, onSaveProfile }) => {
  const [nickname, setNickname] = useState(userProfile?.nickname || '@IlaMedHero');
  const [department, setDepartment] = useState(userProfile?.department || 'Medicine & Surgery');
  const [level, setLevel] = useState(userProfile?.level || '300L');
  const [bio, setBio] = useState(userProfile?.bio || 'FUHSI Student | Learning & Saving Lives');
  const [emergencyPhone, setEmergencyPhone] = useState(userProfile?.emergencyHomePhone || '08031234567');
  const [selectedAvatarKey, setSelectedAvatarKey] = useState(userProfile?.avatarKey || 'caduceus');

  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const departments = [
    'Medicine & Surgery',
    'Nursing Science',
    'Medical Lab Science',
    'Biochemistry',
    'Public Health',
    'Anatomy & Physiology',
    'Pharmacy',
  ];

  const levels = ['100L', '200L', '300L', '400L', '500L', 'Postgraduate'];

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveErrorMessage(null);
    setShowSavedToast(false);

    const error = onSaveProfile(nickname, department, level, bio, selectedAvatarKey, emergencyPhone);
    if (error) {
      setSaveErrorMessage(error);
    } else {
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 px-4 pt-4 space-y-4">
      {/* Top Card: Student Profile Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-start gap-4">
          <AvatarIcon avatarKey={selectedAvatarKey} sizeClassName="w-16 h-16" />

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

      {/* Reputation & Verification Progress Meter */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="font-bold text-slate-900 text-sm">Verification Progress & Reputation</h2>
          </div>
          <span className="font-extrabold text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            {repScore >= 3000 ? '🟡 Verification Eligible' : repScore >= 1500 ? '🟣 Trusted Member' : '🔵 Active Member'}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-extrabold text-slate-800">
            <span>⭐ {repScore} / {targetScore} Points</span>
            <span className="text-teal-700">{scoreProgressPct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
            <div
              className="bg-gradient-to-r from-teal-500 to-purple-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${scoreProgressPct}%` }}
            />
          </div>
        </div>

        {/* Reputation Levels & Points Formula Collapsible/Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
          <p className="font-bold text-teal-950">📈 Reputation Scale & Point Rewards Formula:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
            <div className="space-y-1">
              <p className="font-semibold text-slate-800">Levels Thresholds:</p>
              <p>🟢 0–499 pts: New Member</p>
              <p>🔵 500–1,499 pts: Active Member</p>
              <p>🟣 1,500–2,999 pts: Trusted Member</p>
              <p>🟡 3,000+ pts: Unlock Admin Review</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-800">Points Rewards:</p>
              <p>📅 Daily Login: +2 pts</p>
              <p>📝 Quality Post: +3 pts</p>
              <p>💬 Comment Received: +2 pts</p>
              <p>👍 Like Received: +1 pt</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Nickname Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 text-sm">Edit Nickname Profile Details</h2>

        {/* Avatar Picker */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">Choose Your Campus Avatar</label>
          <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
            {avatarOptions.map(({ key, label }) => {
              const isSelected = selectedAvatarKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedAvatarKey(key)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all shrink-0 ${
                    isSelected ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <AvatarIcon avatarKey={key} sizeClassName="w-10 h-10" />
                  <span className="text-[10px] font-bold text-slate-700">{label}</span>
                </button>
              );
            })}
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
            placeholder="080XXXXXXXX (Hidden from public)"
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
      </form>
    </div>
  );
};
