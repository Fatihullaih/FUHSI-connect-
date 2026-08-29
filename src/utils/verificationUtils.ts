import { UserProfile } from '../types';

export interface UserBadgeInfo {
  isVerified: boolean;
  badgeType: 'BLUE' | 'GOLD' | 'PURPLE' | string;
  badgeTitle: string;
}

/**
 * Single source of truth helper to retrieve consistent verification status and badge presentation.
 * Ensures one account = one verification status = one badge design across all screens.
 */
export function getUserBadgeInfo(nicknameOrId?: string, fallbackUser?: UserProfile | null): UserBadgeInfo {
  const defaultInfo: UserBadgeInfo = {
    isVerified: false,
    badgeType: 'BLUE',
    badgeTitle: '',
  };

  const clean = (nicknameOrId || fallbackUser?.nickname || '').trim().toLowerCase().replace(/^@/, '');
  if (!clean && !fallbackUser) return defaultInfo;

  let user: UserProfile | undefined = fallbackUser || undefined;

  try {
    const uStr = localStorage.getItem('fuhsi_users_db');
    if (uStr) {
      const uList: UserProfile[] = JSON.parse(uStr);
      const match = uList.find(
        (u) =>
          u.id === nicknameOrId ||
          (u.nickname || '').trim().toLowerCase().replace(/^@/, '') === clean ||
          (u.studentEmail || '').trim().toLowerCase() === clean
      );
      if (match) {
        user = match;
      }
    }
  } catch (e) {
    console.error('Error reading users db in getUserBadgeInfo:', e);
  }

  if (!user && fallbackUser) {
    user = fallbackUser;
  }

  // Also check verifications DB for approved status
  let isApprovedInVerifDb = false;
  try {
    const vStr = localStorage.getItem('fuhsi_verifications_db');
    if (vStr) {
      const vList: any[] = JSON.parse(vStr);
      isApprovedInVerifDb = vList.some(
        (req) =>
          req.status === 'APPROVED' &&
          (req.applicantNickname || '').trim().toLowerCase().replace(/^@/, '') === clean
      );
    }
  } catch (e) {
    console.error('Error reading verifications db in getUserBadgeInfo:', e);
  }

  const isVerified = Boolean(
    user?.isVerified ||
    user?.verificationStatus === 'approved' ||
    user?.isAdmin ||
    clean === 'modula' ||
    isApprovedInVerifDb
  );

  let rawType = (user?.badgeType || 'BLUE').toUpperCase();
  if (user?.isAdmin || clean === 'modula') {
    rawType = 'GOLD';
  } else if (rawType === 'GREEN' || rawType === 'VERIFIED' || rawType === 'NONE' || !rawType) {
    rawType = 'BLUE'; // Unified blue verification badge for student accounts
  }

  let rawTitle = (user?.badgeTitle || '').trim();
  // Strip any internal or declined status
  if (
    rawTitle.toLowerCase().includes('decline') ||
    rawTitle.toLowerCase().includes('pending') ||
    rawTitle.toLowerCase().includes('reject')
  ) {
    rawTitle = user?.accountType === 'Guest' ? 'Guest' : 'FUHSI Student';
  }
  if (!rawTitle && user?.accountType === 'Guest') {
    rawTitle = 'Guest';
  }

  return {
    isVerified,
    badgeType: rawType,
    badgeTitle: rawTitle,
  };
}

/**
 * Single source of truth helper to determine if a user or author nickname is verified.
 */
export function checkIsUserVerified(nickname?: string, userProfile?: UserProfile | null): boolean {
  return getUserBadgeInfo(nickname, userProfile).isVerified;
}

