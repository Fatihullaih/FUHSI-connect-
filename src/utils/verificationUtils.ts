import { UserProfile } from '../types';

/**
 * Single source of truth helper to determine if a user or author nickname is verified.
 */
export function checkIsUserVerified(nickname?: string, userProfile?: UserProfile | null): boolean {
  if (userProfile && (userProfile.isVerified || userProfile.verificationStatus === 'approved')) {
    if (!nickname || nickname.toLowerCase().replace(/^@/, '') === userProfile.nickname?.toLowerCase().replace(/^@/, '')) {
      return true;
    }
  }

  if (!nickname) return false;

  try {
    const cleanNick = nickname.toLowerCase().replace(/^@/, '');

    // Check verifications DB
    const vStr = localStorage.getItem('fuhsi_verifications_db');
    if (vStr) {
      const vList: any[] = JSON.parse(vStr);
      const found = vList.find(
        (req) =>
          req.status === 'APPROVED' &&
          req.applicantNickname?.toLowerCase().replace(/^@/, '') === cleanNick
      );
      if (found) return true;
    }

    // Check users DB
    const uStr = localStorage.getItem('fuhsi_users_db');
    if (uStr) {
      const uList: any[] = JSON.parse(uStr);
      const foundU = uList.find(
        (usr) =>
          (usr.nickname || '').toLowerCase().replace(/^@/, '') === cleanNick ||
          usr.id === nickname
      );
      if (foundU && (foundU.isVerified || foundU.verificationStatus === 'approved')) return true;
    }
  } catch (e) {
    console.error('Error checking verification status:', e);
  }

  return false;
}
