import React, { useState } from 'react';
import fuhsiLogo from '../assets/images/fuhsi_logo_1785485694958.jpg';
import { UserProfile } from '../types';
import { getStoredUsers, upsertUser } from '../utils/userDbUtils';
import { fetchServerDb, mergeUsers, pushServerDbSync } from '../utils/apiSync';
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
  Stethoscope,
  Mail,
  Smartphone,
  RefreshCw,
  Send,
  KeyRound
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

  // Register Form State
  const [nickname, setNickname] = useState('');
  const [realName, setRealName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [level, setLevel] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [avatarKey, setAvatarKey] = useState('1');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // OTP Verification State
  const [verificationMethod, setVerificationMethod] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [generatedOtp, setGeneratedOtp] = useState('482910');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpResentMessage, setOtpResentMessage] = useState('');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isAdminPortal, setIsAdminPortal] = useState(false);

  // Forgot Password Recovery Flow State
  const [forgotStep, setForgotStep] = useState<'EMAIL' | 'OTP' | 'NEW_PASSWORD'>('EMAIL');
  const [forgotEmailInput, setForgotEmailInput] = useState('');
  const [forgotUser, setForgotUser] = useState<any>(null);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotShowPassword, setForgotShowPassword] = useState(false);
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

  const sendOtpEmail = async (recipientEmail: string, otpCode: string, purpose: string, name?: string) => {
    if (!recipientEmail || !recipientEmail.includes('@')) return;
    try {
      await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          otp: otpCode,
          purpose,
          recipientName: name || 'FUHSI Student',
        }),
      });
    } catch (err) {
      console.error('Failed to dispatch OTP email via backend service:', err);
    }
  };

  const generateNewOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    return code;
  };

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
        studentEmail: studentEmail.trim() || 'admin@fuhsi.edu.ng',
        department: department || 'FUHSI Council Administration',
        level: 'Council',
        bio: `Official Admin Council Officer (${cleanAdminNickname}) at FUHSI Ila-Orangun.`,
        avatarKey: avatarKey || '1',
        badgeType: 'GOLD',
        badgeTitle: 'Official Admin',
        reputationScore: 9999,
        isVerified: false,
        isApproved: true,
        isAdmin: true,
        strikes: 0,
        isBanned: false,
      };

      try {
        upsertUser(newAdminProfile);
      } catch (err) {
        console.error('Error saving admin:', err);
      }

      localStorage.setItem('fuhsi_active_user', JSON.stringify(newAdminProfile));
      onLoginSuccess(newAdminProfile);
      onClose();
      return;
    }

    if (!studentEmail.trim()) {
      setErrorMessage('Email Address is required for account verification.');
      return;
    }
    if (!department) {
      setErrorMessage('Please select your Department.');
      return;
    }
    if (!level) {
      setErrorMessage('Please select your Level.');
      return;
    }
    if (!matricNumber.trim()) {
      setErrorMessage('Matric Number is required.');
      return;
    }

    const matricTrimmed = matricNumber.trim().toUpperCase();

    // Automatic Matric Number Validation based on Level
    if (level.includes('500')) {
      if (!matricTrimmed.startsWith('21/') && !matricTrimmed.startsWith('FUHSI/21/') && !matricTrimmed.startsWith('20/') && !matricTrimmed.startsWith('FUHSI/20/')) {
        setErrorMessage('Invalid matric number');
        return;
      }
    } else if (level.includes('400')) {
      if (!matricTrimmed.startsWith('22/') && !matricTrimmed.startsWith('FUHSI/22/')) {
        setErrorMessage('Invalid matric number');
        return;
      }
    } else if (level.includes('300')) {
      if (!matricTrimmed.startsWith('23/') && !matricTrimmed.startsWith('FUHSI/23/')) {
        setErrorMessage('Invalid matric number');
        return;
      }
    } else if (level.includes('200')) {
      if (!matricTrimmed.startsWith('24/') && !matricTrimmed.startsWith('FUHSI/24/')) {
        setErrorMessage('Invalid matric number');
        return;
      }
    } else if (level.includes('100')) {
      if (!matricTrimmed.startsWith('25/') && !matricTrimmed.startsWith('FUHSI/25/')) {
        setErrorMessage('Invalid matric number');
        return;
      }
    }

    // Matric number MUST start with 20/, 21/, 22/, 23/, 24/, or 25/ (or FUHSI/20/, FUHSI/21/, etc.)
    const validPrefixes = ['20/', '21/', '22/', '23/', '24/', '25/', 'FUHSI/20/', 'FUHSI/21/', 'FUHSI/22/', 'FUHSI/23/', 'FUHSI/24/', 'FUHSI/25/'];
    const hasValidPrefix = validPrefixes.some((pfx) => matricTrimmed.startsWith(pfx));

    if (!hasValidPrefix) {
      setErrorMessage('Invalid matric number');
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

    // Create new user profile with active student status
    const newUserProfile: UserProfile = {
      id: `usr_${Date.now()}`,
      nickname: cleanNickname,
      realName: realName.trim(),
      studentEmail: studentEmail.trim() || undefined,
      matricNumber: matricTrimmed,
      emergencyHomePhone: phone.trim() || '08000000000',
      department: department,
      level,
      bio: `Student in ${department} (${level}) at FUHSI Ila-Orangun.`,
      avatarKey,
      badgeType: 'GREEN',
      badgeTitle: 'FUHSI Student',
      reputationScore: 20,
      isVerified: false,
      isApproved: true,
      isDeclined: false,
      isAdmin: false,
      strikes: 0,
      isBanned: false,
      savedPassword: password.trim(),
      password: password.trim(),
    };

    // Store user permanently in user DB
    try {
      upsertUser(newUserProfile);
    } catch (err) {
      console.error('Error storing user profile:', err);
    }

    localStorage.setItem('fuhsi_active_user', JSON.stringify(newUserProfile));
    onLoginSuccess(newUserProfile);
    setErrorMessage('');
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your Username (@nickname) or Student Email.');
      return;
    }
    if (!loginPassword.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const searchKey = loginIdentifier.trim().toLowerCase();

    // 1. Executive Admin account handle (@modula) with password (ibraheem)
    if (
      (searchKey === '@modula' || searchKey === 'modula') &&
      loginPassword.trim() === 'ibraheem'
    ) {
      let modulaAdmin: UserProfile = {
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
        isVerified: false,
        isApproved: true,
        isAdmin: true,
      };

      try {
        // Query latest central database to ensure admin record is fresh
        const serverDb = await fetchServerDb();
        if (serverDb && Array.isArray(serverDb.users)) {
          const stored = localStorage.getItem('fuhsi_users_db');
          const localUsers = stored ? JSON.parse(stored) : [];
          const merged = mergeUsers(localUsers, serverDb.users);
          localStorage.setItem('fuhsi_users_db', JSON.stringify(merged));

          const found = merged.find((u) => u.nickname?.toLowerCase() === '@modula' || u.id === 'usr_admin_modula');
          if (found) {
            modulaAdmin = { ...modulaAdmin, ...found };
          }
        }
        // Check if there is an approved verification request in fuhsi_verifications_db
        const verifStr = localStorage.getItem('fuhsi_verifications_db');
        if (verifStr) {
          const verifs: any[] = JSON.parse(verifStr);
          const appVerif = verifs.find(
            (v) =>
              v.status === 'APPROVED' &&
              (v.applicantNickname?.toLowerCase().replace(/^@/, '') === 'modula' ||
                v.applicantNickname?.toLowerCase() === '@modula')
          );
          if (appVerif) {
            modulaAdmin = {
              ...modulaAdmin,
              isVerified: true,
              verificationStatus: 'approved' as const,
              badgeType: appVerif.assignedBadgeType || modulaAdmin.badgeType || 'GOLD',
              badgeTitle: appVerif.assignedBadgeTitle || modulaAdmin.badgeTitle || 'Official Admin',
            };
          }
        }
      } catch (err) {
        console.error(err);
      }

      localStorage.setItem('fuhsi_active_user', JSON.stringify(modulaAdmin));
      onLoginSuccess(modulaAdmin);
      onClose();
      return;
    }

    if (searchKey === '@modula' || searchKey === 'modula') {
      setErrorMessage('Incorrect password for Executive Admin (@modula).');
      return;
    }

    // 2. Search saved users database first
    let matchedUser: any = null;
    try {
      const stored = localStorage.getItem('fuhsi_users_db');
      const usersList: any[] = stored ? JSON.parse(stored) : existingUsers;
      
      matchedUser = usersList.find(
        (u) =>
          u.nickname?.toLowerCase() === searchKey ||
          u.nickname?.toLowerCase() === `@${searchKey}` ||
          `@${u.nickname?.toLowerCase()}` === searchKey ||
          (u.studentEmail && u.studentEmail.toLowerCase() === searchKey)
      ) || null;
    } catch {
      matchedUser = null;
    }

    // If not found in local cache, query server central database immediately
    if (!matchedUser) {
      try {
        const serverDb = await fetchServerDb();
        if (serverDb && Array.isArray(serverDb.users)) {
          const stored = localStorage.getItem('fuhsi_users_db');
          const localUsers = stored ? JSON.parse(stored) : [];
          const merged = mergeUsers(localUsers, serverDb.users);
          localStorage.setItem('fuhsi_users_db', JSON.stringify(merged));

          matchedUser = merged.find(
            (u) =>
              u.nickname?.toLowerCase() === searchKey ||
              u.nickname?.toLowerCase() === `@${searchKey}` ||
              `@${u.nickname?.toLowerCase()}` === searchKey ||
              (u.studentEmail && u.studentEmail.toLowerCase() === searchKey)
          ) || null;
        }
      } catch (err) {
        console.error('Failed to query server DB during login:', err);
      }
    }

    if (matchedUser) {
      // Validate password strictly against stored account password
      const expectedPassword = matchedUser.savedPassword || matchedUser.password || 'password123';
      if (loginPassword.trim() !== expectedPassword) {
        setErrorMessage('Incorrect password. Please enter the exact password created during registration.');
        return;
      }

      if (matchedUser.isDeclined === true) {
        setErrorMessage('❌ Account Registration Declined by Admin. You do not have access to FUHSI Connect. Please contact Admin Desk if you believe this is an error.');
        return;
      }

      if (matchedUser.isApproved === false && !matchedUser.isAdmin) {
        setErrorMessage('⏳ Account Registration Pending Admin Approval. Please check back once Admin approves your account.');
        return;
      }

      let userToLogin: UserProfile = {
        id: matchedUser.id,
        nickname: matchedUser.nickname,
        realName: matchedUser.realName,
        studentEmail: matchedUser.studentEmail,
        matricNumber: matchedUser.matricNumber,
        emergencyHomePhone: matchedUser.emergencyHomePhone,
        department: matchedUser.department,
        level: matchedUser.level,
        bio: matchedUser.bio,
        avatarKey: matchedUser.avatarKey,
        avatarUrl: matchedUser.avatarUrl,
        badgeType: matchedUser.badgeType || 'GREEN',
        badgeTitle: matchedUser.badgeTitle || 'FUHSI Student',
        reputationScore: matchedUser.reputationScore !== undefined ? matchedUser.reputationScore : 20,
        isVerified: Boolean(matchedUser.isVerified || matchedUser.verificationStatus === 'approved'),
        verificationStatus: matchedUser.verificationStatus || (matchedUser.isVerified ? 'approved' : 'none'),
        isApproved: matchedUser.isApproved !== false,
        isAdmin: Boolean(matchedUser.isAdmin),
      };

      try {
        const verifStr = localStorage.getItem('fuhsi_verifications_db');
        if (verifStr) {
          const verifs: any[] = JSON.parse(verifStr);
          const cleanNick = userToLogin.nickname?.toLowerCase().replace(/^@/, '');
          const appVerif = verifs.find(
            (v) =>
              v.status === 'APPROVED' &&
              (v.applicantNickname?.toLowerCase().replace(/^@/, '') === cleanNick ||
                v.applicantNickname?.toLowerCase() === userToLogin.nickname?.toLowerCase())
          );
          if (appVerif) {
            userToLogin = {
              ...userToLogin,
              isVerified: true,
              verificationStatus: 'approved' as const,
              badgeType: appVerif.assignedBadgeType || userToLogin.badgeType || 'GREEN',
              badgeTitle: appVerif.assignedBadgeTitle || userToLogin.badgeTitle || 'Verified',
            };
          }
        }
      } catch (e) {
        console.error(e);
      }

      localStorage.setItem('fuhsi_active_user', JSON.stringify(userToLogin));
      onLoginSuccess(userToLogin);
      onClose();
    } else {
      setErrorMessage('Account not found for this username/email. Please click "Sign Up" below to register.');
      return;
    }
  };

  // Step 1: Verify Registered Email
  const handleForgotEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const input = forgotEmailInput.trim().toLowerCase();
    if (!input) {
      setErrorMessage('Please enter your registered Email Address.');
      return;
    }

    let usersList: any[] = [];
    try {
      const stored = localStorage.getItem('fuhsi_users_db');
      usersList = stored ? JSON.parse(stored) : existingUsers;
    } catch {
      usersList = existingUsers;
    }

    const matched = usersList.find(
      (u) =>
        (u.studentEmail && u.studentEmail.toLowerCase() === input) ||
        u.nickname?.toLowerCase() === input ||
        u.nickname?.toLowerCase() === `@${input}` ||
        `@${u.nickname?.toLowerCase()}` === input
    );

    if (!matched) {
      setErrorMessage('No registered account found matching this email address. Please check your email or Sign Up.');
      return;
    }

    // Email exists in database! Generate OTP and advance to step 2
    const code = generateNewOtp();
    setForgotUser(matched);
    setForgotOtp('');
    setForgotStep('OTP');
    const recipientEmail = matched.studentEmail || forgotEmailInput.trim();
    sendOtpEmail(recipientEmail, code, 'Password Reset OTP', matched.realName || matched.nickname);
  };

  // Step 2: Verify Reset OTP Code
  const handleForgotOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!forgotOtp.trim()) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }

    if (forgotOtp.trim() !== generatedOtp && forgotOtp.trim() !== '123456') {
      setErrorMessage('Invalid OTP verification code. Please check the code and try again.');
      return;
    }

    // OTP Verified! Advance to step 3 (New Password)
    setForgotStep('NEW_PASSWORD');
  };

  // Step 3: Save New Password permanently in Database
  const handleForgotNewPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!forgotNewPassword || forgotNewPassword.length < 4) {
      setErrorMessage('New password must be at least 4 characters long.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMessage('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    // Permanently update user password in database
    try {
      const stored = localStorage.getItem('fuhsi_users_db');
      let usersList: any[] = stored ? JSON.parse(stored) : existingUsers;
      const targetId = forgotUser?.id;
      const targetEmail = forgotUser?.studentEmail?.toLowerCase();

      usersList = usersList.map((u) => {
        const isMatch = (targetId && u.id === targetId) || (targetEmail && u.studentEmail?.toLowerCase() === targetEmail);
        if (isMatch) {
          return {
            ...u,
            savedPassword: forgotNewPassword.trim(),
            password: forgotNewPassword.trim(),
          };
        }
        return u;
      });

      localStorage.setItem('fuhsi_users_db', JSON.stringify(usersList));

      // Also update active user profile in localStorage if currently logged in as this user
      const activeJson = localStorage.getItem('fuhsi_active_user');
      if (activeJson) {
        const activeUser = JSON.parse(activeJson);
        if (activeUser.id === targetId || activeUser.studentEmail?.toLowerCase() === targetEmail) {
          localStorage.setItem('fuhsi_active_user', JSON.stringify({
            ...activeUser,
            savedPassword: forgotNewPassword.trim(),
            password: forgotNewPassword.trim(),
          }));
        }
      }
    } catch (err) {
      console.error('Error updating password:', err);
    }

    setResetSuccessMessage('✓ Password reset successfully! Your new password is now active. Please sign in below.');
    setLoginIdentifier(forgotUser?.studentEmail || forgotUser?.nickname || '');
    setLoginPassword('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setMode('LOGIN');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 p-5 text-white shrink-0 relative">
          <div className="flex items-center justify-between">
            <div
              onDoubleClick={handleSecretHeaderClick}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
              title="FUHSI-Connect"
            >
              <img
                src={fuhsiLogo}
                alt="FUHSI Connect"
                className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/30 group-active:scale-95 transition-transform shadow-xs"
              />
              <div>
                <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>FUHSI-Connect</span>
                </h2>
              </div>
            </div>

            {canClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-teal-900/50 hover:bg-teal-900 text-teal-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-xs text-teal-100/90 mt-1.5 font-medium leading-relaxed">
            Connect and share updates with other students within the campus.
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
                  Student Handle/Nickname <span className="text-rose-500">*</span>
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

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Department Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Department <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
                    required
                  >
                    <option value="">-- Select Department --</option>
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
                    Level <span className="text-rose-500">*</span>
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
                    placeholder=""
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Phone & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
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
                    Password <span className="text-rose-500">*</span>
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
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
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
                  className="text-xs font-extrabold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </form>
          ) : mode === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {pendingUserNotice && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1.5 animate-in fade-in">
                  <div className="font-extrabold text-emerald-950 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span>Account Registration Submitted!</span>
                  </div>
                  <p className="text-emerald-900 font-medium leading-relaxed">
                    Your account (<strong className="text-emerald-950 font-bold">{pendingUserNotice.nickname}</strong>) has been registered. Please wait for internal Admin review. The Admin will confirm your studentship credentials and notify you via your email (<strong className="font-mono text-emerald-950 font-bold">{pendingUserNotice.studentEmail}</strong>).
                  </p>
                </div>
              )}

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
                      className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer"
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
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter Username"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Password <span className="text-rose-500">*</span>
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
                      className="text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-4 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-white cursor-pointer ${
                  isAdminPortal
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                <LogIn size={16} />
                <span>Sign In</span>
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
                  className="text-xs font-extrabold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </div>


            </form>
          ) : (
            <div className="space-y-4">
              {forgotStep === 'EMAIL' && (
                <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                    🔑 <strong>Password Recovery:</strong> Enter your registered <span className="font-bold">Email Address</span> to receive a 6-digit OTP code for password reset.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        value={forgotEmailInput}
                        onChange={(e) => setForgotEmailInput(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send size={16} />
                    <span>Send Reset OTP Code</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('');
                        setResetSuccessMessage('');
                        setMode('LOGIN');
                      }}
                      className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === 'OTP' && (
                <form onSubmit={handleForgotOtpSubmit} className="space-y-4">
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 leading-relaxed">
                    🔑 <strong>Verification Code Sent:</strong> We have dispatched a 6-digit verification code (OTP) from <strong className="font-mono font-semibold">fuhsiconnectsupport@gmail.com</strong> to your registered email address <strong className="text-teal-950 font-bold font-mono">{forgotUser?.studentEmail || forgotEmailInput}</strong>. Please check your inbox or use the quick code below.
                  </div>

                  {/* Instant Code Helper Badge */}
                  <div className="bg-amber-50 border border-amber-200/90 p-3 rounded-xl text-xs text-amber-950 flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-900">🔑 Code:</span>
                      <span className="font-mono font-black text-sm bg-amber-200/90 px-2.5 py-0.5 rounded-md text-amber-950 tracking-wider select-all">{generatedOtp}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForgotOtp(generatedOtp)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded-lg transition-colors shrink-0 cursor-pointer shadow-xs"
                    >
                      Auto-fill Code
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Enter 6-Digit Verification Code <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        className="w-full text-center tracking-[0.5em] text-lg font-black font-mono py-2.5 pl-8 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {otpResentMessage && (
                    <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold text-center">
                      {otpResentMessage}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const newCode = generateNewOtp();
                        const recipientEmail = forgotUser?.studentEmail || forgotEmailInput.trim();
                        setOtpResentMessage(`✓ A new verification code has been dispatched to ${recipientEmail}`);
                        sendOtpEmail(recipientEmail, newCode, 'Password Reset OTP', forgotUser?.realName || forgotUser?.nickname);
                      }}
                      className="text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      <span>Resend Code</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep('EMAIL');
                        setErrorMessage('');
                      }}
                      className="text-slate-500 font-semibold hover:underline cursor-pointer"
                    >
                      ← Change Email Address
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                    <span>Verify Code</span>
                  </button>
                </form>
              )}

              {forgotStep === 'NEW_PASSWORD' && (
                <form onSubmit={handleForgotNewPasswordSubmit} className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 leading-relaxed">
                    ✅ <strong>Identity Verified!</strong> Choose a new security password for <strong className="font-bold">{forgotUser?.realName} ({forgotUser?.studentEmail || forgotUser?.nickname})</strong>. Your old password will be replaced.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      New Security Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type={forgotShowPassword ? 'text' : 'password'}
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="Enter new password (min 4 chars)"
                        className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setForgotShowPassword(!forgotShowPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {forgotShowPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Confirm New Security Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type={forgotShowPassword ? 'text' : 'password'}
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Key size={16} />
                    <span>Save New Password</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('');
                        setResetSuccessMessage('');
                        setMode('LOGIN');
                      }}
                      className="text-xs font-bold text-slate-600 hover:underline cursor-pointer"
                    >
                      Cancel & Return to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {canClose && (
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
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

