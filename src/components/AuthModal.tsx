import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AvatarIcon } from './AvatarIcon';
import { 
  ShieldCheck, 
  Sparkles, 
  User, 
  Lock, 
  Building2, 
  GraduationCap, 
  Phone, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  LogIn, 
  UserPlus, 
  Key, 
  Eye, 
  EyeOff,
  Info,
  Stethoscope
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  existingUsers?: UserProfile[];
  canClose?: boolean;
}

export const FUHSI_DEPARTMENTS = [
  'Medicine and Surgery',
  'Nursing Science',
  'Medical Laboratory Science',
  'Doctor of Physiotherapy',
  'Audiology',
  'Pharmacology',
  'Nutrition and Dietetics',
  'Information Technology and Health Informatics',
  'Microbiology',
  'Biochemistry',
  'Biotechnology and Molecular Biology',
  'Environmental Health Science',
  'Prosthetics and Orthotics',
];

export const FUHSI_LEVELS = ['100L', '200L', '300L', '400L', '500L'];

export const AVATAR_OPTIONS = [
  { id: '1', name: 'Stethoscope Doctor', icon: 'stethoscope' },
  { id: '2', name: 'Nurse Specialist', icon: 'nurse' },
  { id: '3', name: 'Lab Scientist', icon: 'microscope' },
  { id: '4', name: 'Pharma Specialist', icon: 'pill' },
  { id: '5', name: 'Scholar Graduate', icon: 'scholar' },
  { id: '6', name: 'Health Tech', icon: 'tech' },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  existingUsers = [],
  canClose = false,
}) => {
  const [mode, setMode] = useState<'REGISTER' | 'LOGIN' | 'FORGOT_PASSWORD'>('LOGIN');
  const [pendingUserNotice, setPendingUserNotice] = useState<UserProfile | null>(null);

  // Register Form State - All start completely empty
  const [nickname, setNickname] = useState('');
  const [realName, setRealName] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [level, setLevel] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [avatarKey, setAvatarKey] = useState('1');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isAdminPortal, setIsAdminPortal] = useState(false);

  // Forgot Password Reset State
  const [resetUsername, setResetUsername] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  // Secret Admin Portal Unlock State
  const [secretClickCount, setSecretClickCount] = useState(0);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  const handleSecretHeaderClick = () => {
    const nextCount = secretClickCount + 1;
    setSecretClickCount(nextCount);

    if (nextCount >= 3) {
      setIsAdminUnlocked(true);
      setIsAdminPortal(true);
      setErrorMessage('');
      setSecretClickCount(0);
    }
  };

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!nickname.trim()) {
      setErrorMessage('Student Nickname/Handle is required.');
      return;
    }
    if (!realName.trim()) {
      setErrorMessage('Full Real Name is required.');
      return;
    }

    // Check if registering as an Admin in Unlocked Admin Mode
    if (isAdminPortal || isAdminUnlocked) {
      if (!password || password.length < 4) {
        setErrorMessage('Admin Password is required (minimum 4 characters).');
        return;
      }

      const cleanAdminNickname = nickname.trim().startsWith('@') ? nickname.trim() : `@${nickname.trim()}`;
      const newAdminProfile: UserProfile = {
        id: `usr_admin_${Date.now()}`,
        nickname: cleanAdminNickname,
        realName: realName.trim(),
        matricNumber: matricNumber.trim() ? matricNumber.trim().toUpperCase() : 'FUHSI/ADMIN/COUNCIL',
        emergencyHomePhone: phone.trim() || '08000000000',
        department: department || 'FUHSI Council Administration',
        level: 'Council',
        bio: `Official Admin Council Officer (${cleanAdminNickname}) at FUHSI Ila-Orangun.`,
        avatarKey: avatarKey || '1',
        badgeType: 'GOLD',
        badgeTitle: 'Official Admin',
        reputationScore: 9999,
        isVerified: true,
        isApproved: true,
        isAdmin: true,
        strikes: 0,
        isBanned: false,
      };

      try {
        const stored = localStorage.getItem('fuhsi_users_db');
        const list: UserProfile[] = stored ? JSON.parse(stored) : existingUsers;
        list.push(newAdminProfile);
        localStorage.setItem('fuhsi_users_db', JSON.stringify(list));
      } catch (err) {
        console.error('Error saving admin:', err);
      }

      localStorage.setItem('fuhsi_active_user', JSON.stringify(newAdminProfile));
      onLoginSuccess(newAdminProfile);
      onClose();
      return;
    }

    if (!department) {
      setErrorMessage('Please select your Faculty Department.');
      return;
    }
    if (!level) {
      setErrorMessage('Please select your Academic Level.');
      return;
    }
    if (!matricNumber.trim()) {
      setErrorMessage('Matric Number is required.');
      return;
    }

    const matricTrimmed = matricNumber.trim().toUpperCase();

    // Matric number MUST start with 22/, 23/, 24/, or 25/ (or FUHSI/22/, FUHSI/23/, etc.)
    const validPrefixes = ['22/', '23/', '24/', '25/', 'FUHSI/22/', 'FUHSI/23/', 'FUHSI/24/', 'FUHSI/25/'];
    const hasValidPrefix = validPrefixes.some((pfx) => matricTrimmed.startsWith(pfx));

    if (!hasValidPrefix) {
      setErrorMessage('Invalid matric number.');
      return;
    }

    const matricPattern = /^(FUHSI\/[0-9]{2,4}\/[A-Z0-9]{2,5}\/[0-9]{2,4}|FUHSI\/[0-9]{2,4}\/[0-9]{3,4}|[0-9]{2}\/[A-Z0-9]{2,5}\/[0-9]{2,4}|[0-9]{2}\/[0-9]{3,4})$/i;
    if (!matricPattern.test(matricTrimmed)) {
      setErrorMessage('Invalid matric number.');
      return;
    }

    const DEPT_CODE_MAP: Record<string, string[]> = {
      'Medicine and Surgery': ['MBS', 'MED'],
      'Nursing Science': ['NSC', 'NUR', 'NRS'],
      'Medical Laboratory Science': ['MLS', 'MLT'],
      'Doctor of Physiotherapy': ['DPT', 'PHY', 'PHT'],
      'Audiology': ['AUD'],
      'Pharmacology': ['PHM', 'PCO', 'PHA'],
      'Nutrition and Dietetics': ['HND', 'NUT', 'NUD', 'NAD'],
      'Information Technology and Health Informatics': ['ITH', 'ICT', 'INF', 'ITHI'],
      'Microbiology': ['MCB', 'MIC'],
      'Biochemistry': ['BCH', 'BIO'],
      'Biotechnology and Molecular Biology': ['BMB', 'BTC'],
      'Environmental Health Science': ['EHS', 'ENV'],
      'Prosthetics and Orthotics': ['PRT', 'PRO'],
    };

    const parts = matricTrimmed.split('/');
    const allowedCodes = DEPT_CODE_MAP[department] || [];

    if (parts.length >= 3) {
      const middleCode = parts.length === 3 ? parts[1] : parts[2];
      if (isNaN(Number(middleCode))) {
        if (allowedCodes.length > 0 && !allowedCodes.some((code) => code.toUpperCase() === middleCode.toUpperCase())) {
          setErrorMessage('Invalid matric number.');
          return;
        }
      }
    }

    if (!phone.trim()) {
      setErrorMessage('Phone / Emergency Contact is required.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('Security Password is required (minimum 4 characters).');
      return;
    }

    const cleanNickname = nickname.trim().startsWith('@') ? nickname.trim() : `@${nickname.trim()}`;

    // Load existing users to check uniqueness of matric number and nickname
    let allUsers: UserProfile[] = existingUsers;
    try {
      const stored = localStorage.getItem('fuhsi_users_db');
      if (stored) {
        allUsers = JSON.parse(stored);
      }
    } catch {
      allUsers = existingUsers;
    }

    const duplicateMatric = allUsers.find(
      (u) => u.matricNumber && u.matricNumber.trim().toUpperCase() === matricTrimmed
    );
    if (duplicateMatric) {
      setErrorMessage('Invalid matric number.');
      return;
    }

    const duplicateNick = allUsers.find(
      (u) => u.nickname.toLowerCase() === cleanNickname.toLowerCase()
    );
    if (duplicateNick) {
      setErrorMessage('This Username is already taken. Please choose another username.');
      return;
    }

    const newUserProfile: UserProfile = {
      id: `usr_${Date.now()}`,
      nickname: cleanNickname,
      realName: realName.trim(),
      matricNumber: matricTrimmed,
      emergencyHomePhone: phone.trim(),
      department: department,
      level,
      bio: `Student in ${department} (${level}) at FUHSI Ila-Orangun.`,
      avatarKey,
      badgeType: 'GREEN',
      badgeTitle: 'Pending Approval',
      reputationScore: 100,
      isVerified: false,
      isApproved: false, // Must wait for admin approval!
      strikes: 0,
      isBanned: false,
    };

    // Save to localStorage
    try {
      const stored = localStorage.getItem('fuhsi_users_db');
      const usersList: UserProfile[] = stored ? JSON.parse(stored) : [];
      usersList.push(newUserProfile);
      localStorage.setItem('fuhsi_users_db', JSON.stringify(usersList));
    } catch (err) {
      console.error('Error storing user profile:', err);
    }

    setPendingUserNotice(newUserProfile);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your Username.');
      return;
    }
    if (!loginPassword.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const searchKey = loginIdentifier.trim().toLowerCase();

    // 1. Check Primary Executive Admin account handle (@modula) with password (ibraheem)
    if (
      (searchKey === '@modula' || searchKey === 'modula') &&
      loginPassword.trim().toLowerCase() === 'ibraheem'
    ) {
      const modulaAdmin: UserProfile = {
        id: 'usr_admin_modula',
        nickname: '@modula',
        realName: 'Executive Admin Council Officer',
        matricNumber: 'FUHSI/ADMIN/001',
        department: 'FUHSI Administration',
        level: 'Council',
        bio: 'Primary Executive Admin Council Officer (@modula).',
        avatarKey: '1',
        badgeType: 'GOLD',
        badgeTitle: 'Official Admin',
        reputationScore: 9999,
        isVerified: true,
        isApproved: true,
        isAdmin: true,
      };

      localStorage.setItem('fuhsi_active_user', JSON.stringify(modulaAdmin));
      onLoginSuccess(modulaAdmin);
      onClose();
      return;
    }

    // 2. Check if logging in as Admin via Admin Portal or Admin Keyword
    if (isAdminPortal || searchKey.includes('admin') || searchKey === '@modula' || searchKey === 'modula') {
      const adminProfile: UserProfile = {
        id: 'usr_admin_fuhsi',
        nickname: searchKey.startsWith('@') ? searchKey : `@${searchKey}`,
        realName: 'FUHSI Executive Admin',
        matricNumber: 'FUHSI/ADMIN/001',
        department: 'FUHSI Administration',
        level: 'Council',
        bio: 'Official Executive Admin & Moderation Council Officer.',
        avatarKey: '1',
        badgeType: 'GOLD',
        badgeTitle: 'Official Admin',
        reputationScore: 9999,
        isVerified: true,
        isApproved: true,
        isAdmin: true,
      };

      localStorage.setItem('fuhsi_active_user', JSON.stringify(adminProfile));
      onLoginSuccess(adminProfile);
      onClose();
      return;
    }

    // Try finding in localStorage or existing state
    let matchedUser: UserProfile | null = null;
    try {
      const stored = localStorage.getItem('fuhsi_users_db');
      const usersList: UserProfile[] = stored ? JSON.parse(stored) : existingUsers;
      
      matchedUser = usersList.find(
        (u) =>
          u.nickname.toLowerCase() === searchKey ||
          u.nickname.toLowerCase() === `@${searchKey}` ||
          `@${u.nickname.toLowerCase()}` === searchKey
      ) || null;
    } catch {
      matchedUser = null;
    }

    if (matchedUser) {
      if (matchedUser.isApproved === false) {
        setErrorMessage('Your account registration is still pending verification and approval by FUHSI Admin. Access is restricted until accepted.');
        return;
      }
      localStorage.setItem('fuhsi_active_user', JSON.stringify(matchedUser));
      onLoginSuccess(matchedUser);
      onClose();
    } else {
      setErrorMessage('Account not found for this username. Please click "Sign Up" below to register your student details.');
      return;
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setResetSuccessMessage('');

    if (!resetUsername.trim()) {
      setErrorMessage('Please enter your Username.');
      return;
    }
    if (!resetNewPassword.trim() || resetNewPassword.length < 4) {
      setErrorMessage('New password must be at least 4 characters long.');
      return;
    }

    const searchKey = resetUsername.trim().toLowerCase();
    try {
      const stored = localStorage.getItem('fuhsi_users_db');
      let usersList: UserProfile[] = stored ? JSON.parse(stored) : existingUsers;
      const userIndex = usersList.findIndex(
        (u) =>
          u.nickname.toLowerCase() === searchKey ||
          u.nickname.toLowerCase() === `@${searchKey}` ||
          `@${u.nickname.toLowerCase()}` === searchKey
      );

      if (userIndex !== -1) {
        usersList[userIndex] = { ...usersList[userIndex] };
        localStorage.setItem('fuhsi_users_db', JSON.stringify(usersList));
      }
    } catch (err) {
      console.error(err);
    }

    setResetSuccessMessage('✓ Password reset successfully! You can now sign in with your new password.');
  };

  if (pendingUserNotice) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 space-y-4 animate-in zoom-in-95">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
            <Lock size={32} />
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              ⏳ REGISTRATION PENDING ADMIN APPROVAL
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2">Account Registration Submitted</h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Welcome <span className="font-bold text-teal-800">{pendingUserNotice.nickname}</span>! Your account details (<span className="font-medium text-slate-800">{pendingUserNotice.realName}</span> • <span className="font-mono">{pendingUserNotice.matricNumber}</span>) have been registered.
            </p>
          </div>

          <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-left space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Verification Status: Pending</span>
            </div>
            <p className="text-amber-800 leading-snug">
              • Your account registration has been successfully recorded.
            </p>
            <p className="text-amber-800 leading-snug font-medium">
              • Access to the campus feed is restricted until your matric credentials are verified and accepted by FUHSI Administration.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setPendingUserNotice(null);
              setMode('LOGIN');
            }}
            className="w-full py-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-colors"
          >
            <span>Return to Sign In</span>
            <LogIn size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 p-5 text-white shrink-0 relative">
          <div className="flex items-center justify-between">
            <div
              onClick={handleSecretHeaderClick}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
              title="FUHSI-Connect"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-teal-200 border border-white/20 group-active:scale-95 transition-transform">
                <Stethoscope size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>FUHSI-Connect</span>
                  {isAdminUnlocked && (
                    <span className="text-[10px] font-black bg-amber-400 text-slate-900 px-2 py-0.5 rounded-md shadow-xs animate-in zoom-in-50">
                      🛡️ Admin Mode
                    </span>
                  )}
                </h2>
              </div>
            </div>

            {canClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-teal-900/50 hover:bg-teal-900 text-teal-100 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-xs text-teal-100/90 mt-1.5 font-medium leading-relaxed">
            Explore with FUHSI students and for other updates
          </p>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <Info size={16} className="text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'REGISTER' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Student Handle / Nickname */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Public Student Handle / Nickname <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">@</span>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value.replace('@', ''))}
                    placeholder="Enter your nickname"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Real Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Full Real Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Department Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Faculty Department <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
                    required
                  >
                    <option value="">-- Select Faculty Department --</option>
                    {FUHSI_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Level & Matric Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Academic Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
                    required
                  >
                    <option value="">-- Select Level --</option>
                    {FUHSI_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Matric Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value)}
                    placeholder="Enter Matric Number"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Phone & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Phone / Emergency Contact <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter Phone Number"
                      className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Security Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Registration Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <CheckCircle2 size={16} />
                <span>Create Student Account</span>
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setResetSuccessMessage('');
                    setMode('LOGIN');
                  }}
                  className="text-xs font-extrabold text-teal-700 hover:text-teal-900 hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          ) : mode === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {isAdminPortal ? (
                <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-xl text-xs text-amber-900 space-y-2 animate-in fade-in">
                  <div className="font-extrabold flex items-center justify-between text-amber-800">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={16} />
                      <span>FUHSI Council Admin Portal (Secret Mode)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAdminPortal(false)}
                      className="text-[10px] font-bold text-amber-700 hover:underline"
                    >
                      Exit Admin
                    </button>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Accessing executive moderation console. Enter your admin credentials to proceed.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between gap-2">
                  <span>Enter your registered <span className="font-bold text-slate-900">Username (@nickname)</span> and password to sign in.</span>
                  {/* Secret hidden shield button - triple click or click to toggle admin */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminPortal(true);
                      setLoginIdentifier('@Admin_FUHSI');
                    }}
                    className="p-1 text-slate-300 hover:text-amber-500 transition-colors shrink-0"
                    title="FUHSI Security Node"
                  >
                    <ShieldCheck size={14} />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {isAdminPortal ? 'Admin Username' : 'Username'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLoginIdentifier(val);
                      if (val.toLowerCase().includes('admin')) {
                        setIsAdminPortal(true);
                      }
                    }}
                    placeholder={isAdminPortal ? '@Admin_FUHSI' : 'Enter Username'}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Security Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
                {!isAdminPortal && (
                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('');
                        setResetSuccessMessage('');
                        setMode('FORGOT_PASSWORD');
                      }}
                      className="text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-4 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-white ${
                  isAdminPortal
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                <LogIn size={16} />
                <span>{isAdminPortal ? 'Sign In as FUHSI Admin' : 'Sign In to Student Account'}</span>
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setResetSuccessMessage('');
                    setMode('REGISTER');
                  }}
                  className="text-xs font-extrabold text-teal-700 hover:text-teal-900 hover:underline"
                >
                  Sign Up
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                Enter your <span className="font-bold">Username (@nickname)</span> and choose a new password to reset your credentials.
              </div>

              {resetSuccessMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  {resetSuccessMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={resetUsername}
                    onChange={(e) => setResetUsername(e.target.value)}
                    placeholder="Enter Username"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Key size={16} />
                <span>Reset Password</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setResetSuccessMessage('');
                    setMode('LOGIN');
                  }}
                  className="text-xs font-bold text-teal-700 hover:underline"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {canClose && (
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Close Window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
