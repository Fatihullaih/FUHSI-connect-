import { Post, Comment, UserProfile } from '../types';

export const REPUTATION_RULES = {
  PROFILE_COMPLETION: 50,
  DAILY_LOGIN: 20,
  CREATE_THREAD: 20,
  ADD_COMMENT: 10,
  RECEIVE_LIKE: 5,
};

/**
 * Calculates a user's total points dynamically based on actual activity on the platform:
 * - Profile Completion (+50)
 * - Daily Login (+20)
 * - Creating a new thread (+20)
 * - Commenting / Replying (+10)
 * - Upvotes/Likes received (+5)
 */
export const calculateUserPoints = (
  nickname?: string,
  userProfile?: Partial<UserProfile> | null,
  allPosts: Post[] = [],
  allComments: Comment[] = []
): number => {
  if (!nickname) return REPUTATION_RULES.PROFILE_COMPLETION;

  const normTarget = nickname.toLowerCase().replace(/^@/, '').trim();

  // 1. Profile Completion Base
  let points = REPUTATION_RULES.PROFILE_COMPLETION;

  // 2. Daily Login
  if (userProfile?.isVerified || userProfile?.isApproved || userProfile?.nickname) {
    points += REPUTATION_RULES.DAILY_LOGIN;
  }

  // 3. Threads created (+20 per thread)
  const myPosts = (allPosts || []).filter((p) => {
    const author = (p.authorNickname || p.nickname || p.customNickname || '')
      .toLowerCase()
      .replace(/^@/, '')
      .trim();
    return author === normTarget;
  });

  points += myPosts.length * REPUTATION_RULES.CREATE_THREAD;

  // 4. Upvotes/likes received on user's threads (+5 per like)
  const totalLikesReceived = myPosts.reduce((acc, p) => acc + (p.likesCount || p.upvotes || 0), 0);
  points += totalLikesReceived * REPUTATION_RULES.RECEIVE_LIKE;

  // 5. Comments / Replies made (+10 per comment)
  let commentCount = 0;

  // From top-level comments list
  (allComments || []).forEach((c) => {
    const author = (c.authorNickname || '').toLowerCase().replace(/^@/, '').trim();
    if (author === normTarget) commentCount++;
  });

  // Also check nested comments in posts array
  (allPosts || []).forEach((p) => {
    if ((p as any).comments && Array.isArray((p as any).comments)) {
      (p as any).comments.forEach((c: Comment) => {
        const author = (c.authorNickname || '').toLowerCase().replace(/^@/, '').trim();
        if (author === normTarget) commentCount++;
      });
    }
  });

  points += commentCount * REPUTATION_RULES.ADD_COMMENT;

  // Executive admins / official leaders retain appropriate minimum baseline
  if (userProfile?.isAdmin) {
    return Math.max(points, 2500);
  } else if (userProfile?.badgeType === 'GOLD') {
    return Math.max(points, 1200);
  }

  return points;
};
