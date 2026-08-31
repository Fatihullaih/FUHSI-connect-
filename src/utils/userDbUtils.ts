import { UserProfile } from '../types';
import { INITIAL_USER_PROFILE } from '../data/initialData';
import { pushServerDbSync, mergeUsers } from './apiSync';
import { saveUserToFirestore, saveUsersBatchToFirestore } from '../lib/firestoreSync';
import { isDemoUser } from './postGenerator';
import { getUserBadgeInfo } from './verificationUtils';

export { getUserBadgeInfo };

export const USER_DB_KEY = 'fuhsi_users_db';

export const DEFAULT_USERS_LIST: UserProfile[] = [
  {
    id: 'usr_admin_modula',
    nickname: '@modula',
    accountType: 'Student',
    realName: 'Administrator',
    matricNumber: 'FUHSI/COUNCIL/001',
    studentEmail: 'fuhsiconnectsupport@gmail.com',
    emergencyHomePhone: '08000000000',
    department: 'Campus Secretariat',
    level: 'Council',
    bio: 'Platform Administrator (@modula).',
    avatarKey: '1',
    badgeType: 'GOLD',
    badgeTitle: '',
    reputationScore: 9999,
    isVerified: true,
    isApproved: true,
    isDeclined: false,
    isAdmin: true,
  },
  {
    id: 'usr_student_adedeji_ayo_24prt007',
    nickname: '@Deji',
    accountType: 'Student',
    realName: 'Adedeji Ayo',
    matricNumber: '24/PRT/007',
    studentEmail: 'faithlucas.co@gmail.com',
    emergencyHomePhone: '091562232018',
    department: 'Prosthetics and Orthotics',
    level: '200L',
    bio: 'FUHSI Student | Prosthetics and Orthotics (200L)',
    avatarKey: 'caduceus',
    badgeType: 'BLUE',
    badgeTitle: '',
    reputationScore: 180,
    isVerified: true,
    isApproved: true,
    isDeclined: false,
    isAdmin: false,
  },
];

/**
 * Get all users stored in the database. If none exists, initializes default list.
 */
export function getStoredUsers(): UserProfile[] {
  try {
    const stored = localStorage.getItem(USER_DB_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Automatically filter out any demo/mock accounts and deduplicate
        const realUsers = parsed.filter((u) => !isDemoUser(u));
        // Guarantee Deji and Modula exist in database
        const withDefaults = mergeUsers(DEFAULT_USERS_LIST, realUsers);
        const cleaned = mergeUsers(withDefaults.length > 0 ? withDefaults : DEFAULT_USERS_LIST, []);
        try {
          localStorage.setItem(USER_DB_KEY, JSON.stringify(cleaned));
        } catch (e) {
          console.error('Error auto-cleaning user database:', e);
        }
        return cleaned;
      }
    }
  } catch (err) {
    console.error('Error reading user database:', err);
  }

  // Fallback / First-time initialization
  try {
    localStorage.setItem(USER_DB_KEY, JSON.stringify(DEFAULT_USERS_LIST));
  } catch (e) {
    console.error('Error initializing user database:', e);
  }
  return DEFAULT_USERS_LIST;
}

/**
 * Save user list to database and sync across devices via Firestore and server API
 */
export function saveStoredUsers(users: UserProfile[]): void {
  const realOnly = users.filter((u) => !isDemoUser(u));
  const cleaned = mergeUsers(realOnly.length > 0 ? realOnly : DEFAULT_USERS_LIST, []);
  try {
    localStorage.setItem(USER_DB_KEY, JSON.stringify(cleaned));
  } catch (e) {
    console.error('Error saving user database:', e);
  }
  // Sync to Firestore cloud database
  saveUsersBatchToFirestore(cleaned).catch((err) => {
    console.error('Error batch saving users to Firestore:', err);
  });
  // Sync to central server database asynchronously
  pushServerDbSync({ users: cleaned, replaceUsers: true } as any).catch((err) => {
    console.error('Error syncing users to server:', err);
  });
}


/**
 * Find user by nickname
 */
export function findUserByNickname(nickname: string): UserProfile | undefined {
  if (!nickname) return undefined;
  const clean = nickname.trim().toLowerCase().replace(/^@/, '');
  const users = getStoredUsers();
  return users.find((u) => (u.nickname || '').trim().toLowerCase().replace(/^@/, '') === clean);
}

/**
 * Check if a user or user handle is a Guest account
 */
export function isGuestAccount(userOrNickname?: Partial<UserProfile> | string | null | any): boolean {
  if (!userOrNickname) return false;
  if (typeof userOrNickname === 'object') {
    if (userOrNickname.accountType === 'Guest') return true;
    if (userOrNickname.accountType === 'Student') return false;
    if (userOrNickname.nickname) {
      const dbUser = findUserByNickname(userOrNickname.nickname);
      if (dbUser?.accountType === 'Guest') return true;
      if (dbUser?.accountType === 'Student') return false;
    }
    // Fallback: If user explicitly has no department, level, or matric, check if they are guest
    if (!userOrNickname.matricNumber && !userOrNickname.department && !userOrNickname.isAdmin) {
      return userOrNickname.accountType === 'Guest';
    }
    return false;
  }
  const dbUser = findUserByNickname(userOrNickname);
  return dbUser?.accountType === 'Guest';
}

/**
 * Get account category: 'Student' | 'Guest'
 */
export function getUserAccountType(userOrNickname?: Partial<UserProfile> | string | null | any): 'Student' | 'Guest' {
  return isGuestAccount(userOrNickname) ? 'Guest' : 'Student';
}

/**
 * Return appropriate subtitle string for any user identity:
 * - For Guest: 'Guest'
 * - For Student: 'Department • Level' (or department/FUHSI Student)
 */
export function getUserIdentitySubtitle(
  userOrNickname?: Partial<UserProfile> | string | null | any,
  fallbackDept?: string,
  fallbackLevel?: string
): string {
  if (isGuestAccount(userOrNickname)) {
    return 'Guest';
  }
  let dept = fallbackDept;
  let lvl = fallbackLevel;
  if (typeof userOrNickname === 'object' && userOrNickname) {
    if (userOrNickname.accountType === 'Guest') return 'Guest';
    dept = userOrNickname.department || dept;
    lvl = userOrNickname.level || lvl;
  } else if (typeof userOrNickname === 'string') {
    const dbUser = findUserByNickname(userOrNickname);
    if (dbUser) {
      if (dbUser.accountType === 'Guest') return 'Guest';
      dept = dbUser.department || dept;
      lvl = dbUser.level || lvl;
    }
  }
  if (dept && lvl) {
    return `${dept} • ${lvl}`;
  }
  if (dept) return dept;
  return 'FUHSI Student';
}

/**
 * Calculate the total count of approved, active community members
 */
export function getApprovedMembersCount(): number {
  const users = getStoredUsers();
  const approved = users.filter((u) => u.isApproved === true && !u.isDeclined);
  return approved.length;
}

/**
 * Add or update a user in the database
 */
export function upsertUser(user: UserProfile): UserProfile[] {
  const users = getStoredUsers();
  const normNick = (user.nickname || '').trim().toLowerCase().replace(/^@/, '');
  const normEmail = (user.studentEmail || '').trim().toLowerCase();

  const index = users.findIndex((u) => {
    if (u.id && user.id) return u.id === user.id;
    if (normNick && (u.nickname || '').trim().toLowerCase().replace(/^@/, '') === normNick) return true;
    if (normEmail && normEmail !== 'admin@fuhsi.edu.ng' && (u.studentEmail || '').trim().toLowerCase() === normEmail) return true;
    return false;
  });

  let updatedUser = user;
  if (index >= 0) {
    const existing = users[index];
    const existingPassword = (existing as any).savedPassword || (existing as any).password;
    const incomingPassword = (user as any).savedPassword || (user as any).password;
    const finalPassword = incomingPassword || existingPassword;
    users[index] = { 
      ...existing, 
      ...user,
      savedPassword: finalPassword,
      password: finalPassword,
    };
    updatedUser = users[index];
  } else {
    users.push(user);
  }

  // Save single user to Firestore immediately
  saveUserToFirestore(updatedUser).catch((err) => {
    console.error('Error saving single user to Firestore:', err);
  });

  saveStoredUsers(users);
  return users;
}

/**
 * Permanently update password for a specific user and sync to Firestore, server DB, and localStorage
 */
export function updateUserPassword(identifierOrEmail: string, newPassword: string): boolean {
  if (!identifierOrEmail || !newPassword) return false;
  const cleanId = identifierOrEmail.trim().toLowerCase().replace(/^@/, '');
  const users = getStoredUsers();

  const index = users.findIndex((u) => {
    if (u.id && u.id.toLowerCase() === cleanId) return true;
    if (u.nickname && u.nickname.trim().toLowerCase().replace(/^@/, '') === cleanId) return true;
    if (u.studentEmail && u.studentEmail.trim().toLowerCase() === cleanId) return true;
    return false;
  });

  if (index >= 0) {
    users[index] = {
      ...users[index],
      savedPassword: newPassword.trim(),
      password: newPassword.trim(),
    };

    saveUserToFirestore(users[index]).catch((err) => console.error('Error updating user password in Firestore:', err));
    saveStoredUsers(users);

    // Update active user profile in localStorage if matching
    try {
      const activeUserJson = localStorage.getItem('fuhsi_active_user');
      if (activeUserJson) {
        const active = JSON.parse(activeUserJson);
        const matchActive = (active.id === users[index].id) ||
          (active.nickname && active.nickname.toLowerCase().replace(/^@/, '') === cleanId) ||
          (active.studentEmail && active.studentEmail.toLowerCase() === cleanId);
        if (matchActive) {
          localStorage.setItem('fuhsi_active_user', JSON.stringify({
            ...active,
            savedPassword: newPassword.trim(),
            password: newPassword.trim(),
          }));
        }
      }
    } catch (e) {
      console.error('Error updating active user password:', e);
    }

    return true;
  }
  return false;
}
