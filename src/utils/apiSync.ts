import { UserProfile, Post, Comment, MarketplaceItem, VerificationRequest, Report } from '../types';

export interface ServerDbState {
  users: UserProfile[];
  posts: Post[];
  comments: Comment[];
  marketplaceItems: MarketplaceItem[];
  pendingMarketplaceItems: MarketplaceItem[];
  verificationRequests: VerificationRequest[];
  reports: Report[];
  verificationFee: number;
  notifications: Record<string, any[]>;
  verifCandidates: any[];
  sentEmails: any[];
}

export function mergeUsers(a: UserProfile[] = [], b: UserProfile[] = []): UserProfile[] {
  const map = new Map<string, UserProfile>();

  const getKey = (u: UserProfile) => {
    if (u.id) return u.id;
    if (u.nickname) return u.nickname.toLowerCase();
    if (u.studentEmail) return u.studentEmail.toLowerCase();
    return Math.random().toString();
  };

  const processUser = (u: UserProfile) => {
    if (!u) return;
    const key = getKey(u);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...u });
    } else {
      const isDeclined = Boolean(u.isDeclined || existing.isDeclined);
      let isApproved = false;
      if (isDeclined) {
        isApproved = false;
      } else if (u.isDeclined === false) {
        isApproved = u.isApproved !== undefined ? Boolean(u.isApproved) : Boolean(existing.isApproved);
      } else {
        isApproved = Boolean(u.isApproved || existing.isApproved);
      }

      const merged: UserProfile = {
        ...existing,
        ...u,
        isApproved,
        isDeclined,
        isVerified: Boolean(u.isVerified !== undefined ? u.isVerified : existing.isVerified),
        isAdmin: Boolean(existing.isAdmin || u.isAdmin),
        reputationScore: Math.max(existing.reputationScore || 0, u.reputationScore || 0),
        badgeType: u.badgeType ? u.badgeType : existing.badgeType || 'GREEN',
        badgeTitle: u.badgeTitle ? u.badgeTitle : existing.badgeTitle || 'FUHSI Student',
        studentEmail: u.studentEmail || existing.studentEmail,
        savedPassword: (u as any).savedPassword || (existing as any).savedPassword || (u as any).password || (existing as any).password,
      };
      map.set(key, merged);
    }
  };

  a.forEach(processUser);
  b.forEach(processUser);

  return Array.from(map.values());
}

export function mergePosts(a: Post[] = [], b: Post[] = []): Post[] {
  const map = new Map<string, Post>();

  const processPost = (p: Post) => {
    if (!p || !p.id) return;
    const existing = map.get(p.id);
    if (!existing) {
      map.set(p.id, { ...p });
    } else {
      const allLikes = Array.from(new Set([...(existing.likes || []), ...(p.likes || [])]));
      const allBookmarks = Array.from(new Set([...(existing.bookmarks || []), ...(p.bookmarks || [])]));
      const commentsCount = Math.max(existing.commentsCount || 0, p.commentsCount || 0);
      map.set(p.id, {
        ...existing,
        ...p,
        likes: allLikes,
        bookmarks: allBookmarks,
        commentsCount,
      });
    }
  };

  a.forEach(processPost);
  b.forEach(processPost);

  return Array.from(map.values()).sort((x, y) => {
    const valX = x.createdAt || x.timestamp || 0;
    const valY = y.createdAt || y.timestamp || 0;
    const tX = isNaN(new Date(valX).getTime()) ? 0 : new Date(valX).getTime();
    const tY = isNaN(new Date(valY).getTime()) ? 0 : new Date(valY).getTime();
    return tY - tX;
  });
}

export function mergeComments(a: Comment[] = [], b: Comment[] = []): Comment[] {
  const map = new Map<string, Comment>();
  const processComment = (c: Comment) => {
    if (!c || !c.id) return;
    const existing = map.get(c.id);
    if (!existing) {
      map.set(c.id, { ...c });
    } else {
      const allLikes = Array.from(new Set([...(existing.likes || []), ...(c.likes || [])]));
      map.set(c.id, { ...existing, ...c, likes: allLikes });
    }
  };
  a.forEach(processComment);
  b.forEach(processComment);
  return Array.from(map.values());
}

export function mergeMarketplaceItems(a: MarketplaceItem[] = [], b: MarketplaceItem[] = []): MarketplaceItem[] {
  const map = new Map<string, MarketplaceItem>();
  const processItem = (item: MarketplaceItem) => {
    if (!item || !item.id) return;
    map.set(item.id, { ...(map.get(item.id) || {}), ...item });
  };
  a.forEach(processItem);
  b.forEach(processItem);
  return Array.from(map.values());
}

export function mergeVerificationRequests(a: VerificationRequest[] = [], b: VerificationRequest[] = []): VerificationRequest[] {
  const map = new Map<string, VerificationRequest>();
  const processReq = (r: VerificationRequest) => {
    if (!r || !r.id) return;
    const existing = map.get(r.id);
    if (!existing) {
      map.set(r.id, { ...r });
    } else {
      const status = r.status !== 'PENDING' ? r.status : existing.status;
      map.set(r.id, { ...existing, ...r, status });
    }
  };
  a.forEach(processReq);
  b.forEach(processReq);
  return Array.from(map.values());
}

export function mergeReports(a: Report[] = [], b: Report[] = []): Report[] {
  const map = new Map<string, Report>();
  a.forEach((r) => r?.id && map.set(r.id, { ...r }));
  b.forEach((r) => r?.id && map.set(r.id, { ...(map.get(r.id) || {}), ...r }));
  return Array.from(map.values());
}

export function mergeVerifCandidates(a: any[] = [], b: any[] = []): any[] {
  const map = new Map<string, any>();
  const processCand = (c: any) => {
    if (!c) return;
    const key = c.id || c.userId || c.nickname;
    if (!key) return;
    map.set(key, { ...(map.get(key) || {}), ...c });
  };
  a.forEach(processCand);
  b.forEach(processCand);
  return Array.from(map.values());
}

/**
 * Fetch the complete database from server
 */
export async function fetchServerDb(): Promise<ServerDbState | null> {
  try {
    const res = await fetch('/api/db');
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }
    const data = await res.json();
    if (data && data.success && data.db) {
      return data.db as ServerDbState;
    }
  } catch (err) {
    // Silent catch if backend server sync endpoint is not available or returning non-JSON
  }
  return null;
}

/**
 * Sync state changes to the server database
 */
export async function pushServerDbSync(partialDb: Partial<ServerDbState>): Promise<ServerDbState | null> {
  try {
    const res = await fetch('/api/db/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialDb),
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }
    const data = await res.json();
    if (data && data.success && data.db) {
      return data.db as ServerDbState;
    }
  } catch (err) {
    // Silent catch if backend server sync endpoint is not available or returning non-JSON
  }
  return null;
}

