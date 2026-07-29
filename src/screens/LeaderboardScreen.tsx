import React, { useState } from 'react';
import { DepartmentRanking, UserProfile, Post } from '../types';
import { TOP_LEADERBOARD_USERS, INITIAL_USER_PROFILE } from '../data/initialData';
import { VerificationBadge } from '../components/VerificationBadge';
import { AvatarIcon } from '../components/AvatarIcon';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  Crown, 
  Building2, 
  Medal, 
  ShieldCheck,
  Send,
  CheckCircle2
} from 'lucide-react';

interface LeaderboardScreenProps {
  userProfile?: UserProfile | null;
  user?: UserProfile | null;
  departmentRankings?: DepartmentRanking[];
  activePosts?: Post[];
  onSubmitVerificationRequest?: (category: string, statement: string) => void;
}

const DEFAULT_DEPARTMENTS: DepartmentRanking[] = [
  { name: 'Medicine & Surgery', code: 'MED', totalPoints: 12450, activeStudents: 340, topContributor: '@IlaMedHero' },
  { name: 'Nursing Science', code: 'NRS', totalPoints: 9820, activeStudents: 280, topContributor: '@NurseQueen_Ila' },
  { name: 'Medical Lab Science', code: 'MLS', totalPoints: 7640, activeStudents: 190, topContributor: '@LabPro_MLS' },
  { name: 'Physiology', code: 'PHY', totalPoints: 5430, activeStudents: 150, topContributor: '@PhysoChamp' },
  { name: 'Anatomy', code: 'ANA', totalPoints: 4890, activeStudents: 120, topContributor: '@PreClinicalPro' },
  { name: 'Biochemistry', code: 'BCH', totalPoints: 4120, activeStudents: 110, topContributor: '@BioChemWhiz' },
];

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  userProfile,
  user,
  departmentRankings = DEFAULT_DEPARTMENTS,
  onSubmitVerificationRequest,
}) => {
  const [activeLeaderTab, setActiveLeaderTab] = useState<'students' | 'departments' | 'badges' | 'verify'>('students');
  const [verifCategory, setVerifCategory] = useState('Trusted Student Leader (Clinical Skills Mentor)');
  const [verifStatement, setVerifStatement] = useState('');
  const [verifSubmitted, setVerifSubmitted] = useState(false);

  const currentUser = userProfile || user || INITIAL_USER_PROFILE;
  const currentRep = currentUser?.reputationScore ?? currentUser?.reputationPoints ?? 2450;
  const currentBadgeType = currentUser?.badgeType || 'BLUE';
  const currentBadgeTitle = currentUser?.badgeTitle || currentUser?.badge || 'Class Rep & Tech Lead';

  const handleApplyVerif = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifStatement.trim()) return;
    if (onSubmitVerificationRequest) {
      onSubmitVerificationRequest(verifCategory, verifStatement.trim());
    }
    setVerifSubmitted(true);
    setVerifStatement('');
    setTimeout(() => setVerifSubmitted(false), 4000);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 pb-24">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-200 border border-amber-400/30 px-3 py-1 rounded-full mb-3">
            <Trophy size={14} />
            FUHSI Reputation & Leaderboards
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Campus Honor Roll
          </h1>
          <p className="text-sm text-amber-100/90 leading-relaxed">
            Students earn reputation points by sharing verified revision materials, answering peer questions, and upholding community guidelines.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveLeaderTab('students')}
          className={`flex items-center gap-2 py-3 px-5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeLeaderTab === 'students'
              ? 'border-amber-600 text-amber-700 bg-amber-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Crown size={18} />
          Top Student Contributors
        </button>

        <button
          onClick={() => setActiveLeaderTab('departments')}
          className={`flex items-center gap-2 py-3 px-5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeLeaderTab === 'departments'
              ? 'border-amber-600 text-amber-700 bg-amber-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 size={18} />
          Department Standings
        </button>

        <button
          onClick={() => setActiveLeaderTab('badges')}
          className={`flex items-center gap-2 py-3 px-5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeLeaderTab === 'badges'
              ? 'border-amber-600 text-amber-700 bg-amber-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Medal size={18} />
          Badges & Points Rules
        </button>

        <button
          onClick={() => setActiveLeaderTab('verify')}
          className={`flex items-center gap-2 py-3 px-5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeLeaderTab === 'verify'
              ? 'border-amber-600 text-amber-700 bg-amber-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck size={18} />
          Apply for Verification
        </button>
      </div>

      {/* TAB 1: TOP STUDENTS */}
      {activeLeaderTab === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {TOP_LEADERBOARD_USERS.map((student) => {
              const isCurrentUser = student.nickname === currentUser?.nickname;
              return (
                <div
                  key={student.nickname}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isCurrentUser
                      ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl font-extrabold text-sm flex items-center justify-center shrink-0 ${
                      student.rank === 1 ? 'bg-amber-400 text-amber-950' :
                      student.rank === 2 ? 'bg-slate-300 text-slate-800' :
                      student.rank === 3 ? 'bg-amber-700 text-amber-100' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      #{student.rank}
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center shrink-0">
                      <AvatarIcon avatarKey={student.avatarKey} size={18} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {student.nickname}
                        </span>
                        <VerificationBadge badgeType={student.badgeType} title={student.title} showTitle />
                        {isCurrentUser && (
                          <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {student.department} • {student.level}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm sm:text-base font-extrabold text-amber-700 flex items-center gap-1 justify-end">
                      <Award size={16} />
                      <span>{student.reputationScore} pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* User Score Summary Sidebar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Sparkles size={18} className="text-amber-600" />
              Your Leaderboard Standing
            </h3>

            <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200/80 text-center">
              <div className="text-xs uppercase font-extrabold tracking-wider text-amber-800 mb-1">Current Points</div>
              <div className="text-3xl font-extrabold text-amber-900 mb-1">{currentRep}</div>
              <p className="text-xs font-semibold text-amber-700">Rank #2 in Medicine & Surgery</p>
            </div>

            <div className="space-y-2 text-xs text-slate-600 font-medium">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span>Current Badge</span>
                <VerificationBadge badgeType={currentBadgeType} title={currentBadgeTitle} showTitle />
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span>Account Status</span>
                <span className="font-bold text-emerald-600">Active & Verified</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS */}
      {activeLeaderTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departmentRankings.map((dept, idx) => (
            <div key={dept.code} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                    #{idx + 1}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base">{dept.name}</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Active Students: {dept.activeStudents} • Top Contributor: <span className="text-teal-700 font-bold">{dept.topContributor}</span>
                </p>
              </div>

              <div className="text-right">
                <div className="text-lg font-extrabold text-amber-700">{dept.totalPoints}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Total Pts</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: BADGES & RULES */}
      {activeLeaderTab === 'badges' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <h3 className="font-extrabold text-slate-900 text-lg mb-4">How Reputation Points Work</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium">
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <div className="font-bold text-emerald-900 text-sm mb-1">+10 Points</div>
              <p className="text-emerald-800">When your post or comment receives likes from peers.</p>
            </div>

            <div className="bg-teal-50 p-4 rounded-xl border border-teal-200">
              <div className="font-bold text-teal-900 text-sm mb-1">+15 Points</div>
              <p className="text-teal-800">When you upload a verified lecture summary or past question paper.</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="font-bold text-blue-900 text-sm mb-1">+50 Points</div>
              <p className="text-blue-800">When you achieve student leader or tutor verification status.</p>
            </div>

            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
              <div className="font-bold text-rose-900 text-sm mb-1">-20 Points</div>
              <p className="text-rose-800">If your post is reported and verified to violate code of conduct.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: APPLY VERIFICATION */}
      {activeLeaderTab === 'verify' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-teal-700 font-bold text-base">
            <ShieldCheck size={22} />
            <h2>Apply for Student Leadership & Tutor Badge</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Verified badges recognize class representatives, clinical mentors, and academic group leaders. Applications are evaluated by student union administrators.
          </p>

          {verifSubmitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={18} />
              <span>Verification request submitted successfully! Admin review in progress.</span>
            </div>
          ) : (
            <form onSubmit={handleApplyVerif} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Badge Category</label>
                <select
                  value={verifCategory}
                  onChange={(e) => setVerifCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-teal-500"
                >
                  <option value="Trusted Student Leader (Class Rep / Exec)">Class Representative / Executive</option>
                  <option value="Clinical Skills Mentor">Clinical Skills Mentor</option>
                  <option value="Academic Study Lead">Academic Study Group Lead</option>
                  <option value="Lab Practical Helper">Lab Practical Helper</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Leadership Statement / Qualifications</label>
                <textarea
                  rows={3}
                  value={verifStatement}
                  onChange={(e) => setVerifStatement(e.target.value)}
                  placeholder="Describe your student role, achievements, or clinical session facilitation details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={!verifStatement.trim()}
                className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Send size={16} />
                <span>Submit Verification Application</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
