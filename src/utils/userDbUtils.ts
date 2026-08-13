import { UserProfile } from '../types';
import { INITIAL_USER_PROFILE } from '../data/initialData';
import { pushServerDbSync } from './apiSync';
import { saveUserToFirestore, saveUsersBatchToFirestore } from '../lib/firestoreSync';

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
    isVerified: true,
    isApproved: true,
    isDeclined: false,
    isAdmin: true,
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
 * Save user list to database and sync across devices via Firestore and server API
 */
export function saveStoredUsers(users: UserProfile[]): void {
  try {
    localStorage.setItem(USER_DB_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving user database:', e);
  }
  // Sync to Firestore cloud database
  saveUsersBatchToFirestore(users).catch((err) => {
    console.error('Error batch saving users to Firestore:', err);
  });
  // Sync to central server database asynchronously
  pushServerDbSync({ users, replaceUsers: true } as any).catch((err) => {
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

  let updatedUser = user;
  if (index >= 0) {
    users[index] = { ...users[index], ...user };
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
