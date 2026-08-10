import { UserProfile } from '../types';
import { INITIAL_USER_PROFILE } from '../data/initialData';
import { pushServerDbSync } from './apiSync';

export const USER_DB_KEY = 'fuhsi_users_db';

export const DEFAULT_USERS_LIST: UserProfile[] = [
  {
    id: 'usr_admin_modula',
    nickname: '@modula',
    realName: 'Executive Admin Council Officer',
    matricNumber: 'FUHSI/ADMIN/001',
    studentEmail: 'fuhsiconnectsupport@gmail.com',
    emergencyHomePhone: '08000000000',
    department: 'FUHSI Administration',
    level: 'Council',
    bio: 'Primary Executive Admin Council Officer (@modula).',
    avatarKey: '1',
    badgeType: 'GOLD',
    badgeTitle: 'Official Admin',
    reputationScore: 9999,
    isVerified: false,
    isApproved: true,
    isDeclined: false,
    isAdmin: true,
  },
  {
    ...INITIAL_USER_PROFILE,
    isApproved: true,
    isDeclined: false,
    isAdmin: false,
  },
  {
    id: 'usr_pending_demo_1',
    nickname: '@FreshMedStudent',
    realName: 'Adegoke Emmanuel Temitope',
    matricNumber: '25/MBS/088',
    studentEmail: 'adegoke.e@fuhsi.edu.ng',
    emergencyHomePhone: '08023456789',
    department: 'Medicine and Surgery',
    level: '100L',
    bio: 'Fresh 100L MBBS Student seeking account approval.',
    badgeTitle: 'Pending Approval',
    isApproved: false,
    isDeclined: false,
    isVerified: false,
    isAdmin: false,
  },
  {
    id: 'usr_pending_demo_2',
    nickname: '@NurseGrace_Ila',
    realName: 'Olanrewaju Grace Omowumi',
    matricNumber: '24/NSC/412',
    studentEmail: 'olanrewaju.g@fuhsi.edu.ng',
    emergencyHomePhone: '08134567890',
    department: 'Nursing Science',
    level: '200L',
    bio: '200L Nursing student registered on FUHSI Connect.',
    badgeTitle: 'Pending Approval',
    isApproved: false,
    isDeclined: false,
    isVerified: false,
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
        return parsed;
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
 * Save user list to database and sync across devices via server API
 */
export function saveStoredUsers(users: UserProfile[]): void {
  try {
    localStorage.setItem(USER_DB_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving user database:', e);
  }
  // Sync to central server database asynchronously
  pushServerDbSync({ users }).catch((err) => {
    console.error('Error syncing users to server:', err);
  });
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
  const index = users.findIndex(
    (u) =>
      u.id === user.id ||
      (u.nickname && u.nickname.toLowerCase() === user.nickname.toLowerCase())
  );

  if (index >= 0) {
    users[index] = { ...users[index], ...user };
  } else {
    users.push(user);
  }

  saveStoredUsers(users);
  return users;
}
