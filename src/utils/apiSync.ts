import { UserProfile, Post, Comment, MarketplaceItem, VerificationRequest, Report, DirectMessage, ChatConversation, ChatReport } from '../types';
import {
  isDemoUser,
  isDemoPost,
  isDemoComment,
  isDemoVerificationRequest,
  isDemoMarketplaceItem,
  isDemoDirectMessage,
  isDemoNickname,
} from './postGenerator';

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
  tradeDeskTransactions?: any[];
  directMessages?: DirectMessage[];
  chatConversations?: ChatConversation[];
  chatReports?: ChatReport[];
  chatRestrictions?: any[];
  chatViolations?: any[];
  replaceUsers?: boolean;
  replacePosts?: boolean;
  replaceComments?: boolean;
  replaceMarketplaceItems?: boolean;
  replacePendingMarketplaceItems?: boolean;
  replaceVerificationRequests?: boolean;
  replaceReports?: boolean;
}

export function mergeUsers(a: UserProfile[] = [], b: UserProfile[] = []): UserProfile[] {
  const map = new Map<string, UserProfile>();

  const getKey = (u: UserProfile): string => {
    if (!u) return '';
    if (u.id && u.id.trim()) {
      return `id:${u.id.trim()}`;
    }
    if (u.studentEmail && u.studentEmail.trim() && !u.studentEmail.includes('admin@fuhsi.edu.ng')) {
      return `email:${u.studentEmail.trim().toLowerCase()}`;
    }
    if (u.nickname && u.nickname.trim()) {
      return `nick:${u.nickname.trim().toLowerCase().replace(/^@/, '')}`;
    }
    return '';
  };

  const processUser = (u: UserProfile) => {
    if (!u || isDemoUser(u) || isDemoNickname(u.nickname)) return;
    const key = getKey(u);
    if (!key) return;
    const existing = map.get(key);
    if (!existing) {
      const sanitizedBadgeTitle =
        u.badgeTitle && !u.badgeTitle.toLowerCase().includes('decline') && !u.badgeTitle.toLowerCase().includes('pending')
          ? u.badgeTitle
          : 'FUHSI Student';
      map.set(key, { ...u, badgeTitle: sanitizedBadgeTitle });
    } else {
      let isDeclined = false;
      if (u.isDeclined !== undefined) {
        isDeclined = Boolean(u.isDeclined);
      } else if (existing.isDeclined !== undefined) {
        isDeclined = Boolean(existing.isDeclined);
      }

      let isApproved = false;
      if (isDeclined) {
        isApproved = false;
      } else if (u.isApproved !== undefined) {
        isApproved = Boolean(u.isApproved);
      } else if (existing.isApproved !== undefined) {
        isApproved = Boolean(existing.isApproved);
      } else {
        isApproved = true;
      }

      let badgeTitle = u.badgeTitle || existing.badgeTitle || 'FUHSI Student';
      if (badgeTitle.toLowerCase().includes('decline') || badgeTitle.toLowerCase().includes('pending')) {
        badgeTitle = 'FUHSI Student';
      }

      const merged: UserProfile = {
        ...existing,
        ...u,
        isApproved,
        isDeclined,
        isVerified: Boolean(u.isVerified !== undefined ? u.isVerified : existing.isVerified),
        verificationStatus: u.verificationStatus || existing.verificationStatus,
        isAdmin: Boolean(existing.isAdmin || u.isAdmin),
        reputationScore: Math.max(existing.reputationScore || 0, u.reputationScore || 0),
        badgeType: u.badgeType && u.badgeType !== 'NONE' ? u.badgeType : existing.badgeType || 'BLUE',
        badgeTitle,
        studentEmail: u.studentEmail || existing.studentEmail,
        savedPassword: (u as any).savedPassword || (u as any).password || (existing as any).savedPassword || (existing as any).password,
        password: (u as any).savedPassword || (u as any).password || (existing as any).savedPassword || (existing as any).password,
      };
      map.set(key, merged);
    }
  };

  a.forEach(processUser);
  b.forEach(processUser);

  return Array.from(map.values()).filter((u) => !isDemoUser(u) && !isDemoNickname(u.nickname));
}

export function mergePosts(a: Post[] = [], b: Post[] = []): Post[] {
  const map = new Map<string, Post>();

  const processPost = (p: Post) => {
    if (!p || !p.id || isDemoPost(p)) return;
    const existing = map.get(p.id);
    if (!existing) {
      map.set(p.id, { ...p });
    } else {
      const likesCount = Math.max(existing.likesCount || existing.likes || 0, p.likesCount || p.likes || 0);
      const bookmarks = Math.max(existing.bookmarks || 0, p.bookmarks || 0);
      const commentsCount = Math.max(existing.commentsCount || 0, p.commentsCount || 0);

      // Determine which version has newer edits / content
      const existingUpdatedMs = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
      const pUpdatedMs = p.updatedAt ? new Date(p.updatedAt).getTime() : 0;
      const isPNewer = pUpdatedMs >= existingUpdatedMs;

      const base = isPNewer ? { ...existing, ...p } : { ...p, ...existing };

      map.set(p.id, {
        ...base,
        likes: likesCount,
        likesCount,
        bookmarks,
        commentsCount,
      });
    }
  };

  a.forEach(processPost);
  b.forEach(processPost);

  return Array.from(map.values())
    .filter((p) => !isDemoPost(p))
    .sort((x, y) => {
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
    if (!c || !c.id || isDemoComment(c)) return;
    const existing = map.get(c.id);
    if (!existing) {
      map.set(c.id, { ...c });
    } else {
      const likesCount = Math.max(existing.likesCount || existing.likes || 0, c.likesCount || c.likes || 0);
      map.set(c.id, { ...existing, ...c, likes: likesCount, likesCount });
    }
  };
  a.forEach(processComment);
  b.forEach(processComment);
  return Array.from(map.values()).filter((c) => !isDemoComment(c));
}

export function mergeMarketplaceItems(a: MarketplaceItem[] = [], b: MarketplaceItem[] = []): MarketplaceItem[] {
  const map = new Map<string, MarketplaceItem>();
  const processItem = (item: MarketplaceItem) => {
    if (!item || !item.id || isDemoMarketplaceItem(item)) return;
    map.set(item.id, { ...(map.get(item.id) || {}), ...item });
  };
  a.forEach(processItem);
  b.forEach(processItem);
  return Array.from(map.values()).filter((m) => !isDemoMarketplaceItem(m));
}

export function mergeVerificationRequests(a: VerificationRequest[] = [], b: VerificationRequest[] = []): VerificationRequest[] {
  const map = new Map<string, VerificationRequest>();
  const processReq = (r: VerificationRequest) => {
    if (!r || !r.id || isDemoVerificationRequest(r)) return;
    const existing = map.get(r.id);
    if (!existing) {
      map.set(r.id, { ...r });
    } else {
      const status = r.status !== 'PENDING' ? r.status : (existing.status || r.status);
      const assignedBadgeType = r.assignedBadgeType || existing.assignedBadgeType;
      const assignedBadgeTitle = r.assignedBadgeTitle || existing.assignedBadgeTitle;
      map.set(r.id, {
        ...existing,
        ...r,
        status,
        assignedBadgeType,
        assignedBadgeTitle,
      });
    }
  };
  a.forEach(processReq);
  b.forEach(processReq);
  return Array.from(map.values())
    .filter((v) => !isDemoVerificationRequest(v))
    .sort((x, y) => {
      const tX = isNaN(new Date(x.timestamp).getTime()) ? 0 : new Date(x.timestamp).getTime();
      const tY = isNaN(new Date(y.timestamp).getTime()) ? 0 : new Date(y.timestamp).getTime();
      return tY - tX;
    });
}

export function mergeReports(a: Report[] = [], b: Report[] = []): Report[] {
  const map = new Map<string, Report>();
  a.forEach((r) => r?.id && !isDemoNickname(r.reporterNickname) && !isDemoNickname((r as any).reportedNickname) && map.set(r.id, { ...r }));
  b.forEach((r) => r?.id && !isDemoNickname(r.reporterNickname) && !isDemoNickname((r as any).reportedNickname) && map.set(r.id, { ...(map.get(r.id) || {}), ...r }));
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

export function mergeDirectMessages(a: DirectMessage[] = [], b: DirectMessage[] = []): DirectMessage[] {
  const map = new Map<string, DirectMessage>();
  a.forEach((m) => m?.id && map.set(m.id, { ...m }));
  b.forEach((m) => {
    if (m?.id) {
      const existing = map.get(m.id);
      if (existing) {
        map.set(m.id, {
          ...existing,
          ...m,
          isRead: Boolean(existing.isRead || m.isRead),
          readAt: m.readAt || existing.readAt,
        });
      } else {
        map.set(m.id, { ...m });
      }
    }
  });
  return Array.from(map.values()).sort((x, y) => {
    const tX = isNaN(new Date(x.timestamp).getTime()) ? 0 : new Date(x.timestamp).getTime();
    const tY = isNaN(new Date(y.timestamp).getTime()) ? 0 : new Date(y.timestamp).getTime();
    return tX - tY;
  });
}

export function mergeChatConversations(a: ChatConversation[] = [], b: ChatConversation[] = []): ChatConversation[] {
  const map = new Map<string, ChatConversation>();
  a.forEach((c) => c?.id && map.set(c.id, { ...c }));
  b.forEach((c) => c?.id && map.set(c.id, { ...(map.get(c.id) || {}), ...c }));
  return Array.from(map.values());
}

export function mergeChatReports(a: ChatReport[] = [], b: ChatReport[] = []): ChatReport[] {
  const map = new Map<string, ChatReport>();
  a.forEach((r) => r?.id && map.set(r.id, { ...r }));
  b.forEach((r) => r?.id && map.set(r.id, { ...(map.get(r.id) || {}), ...r }));
  return Array.from(map.values()).sort((x, y) => {
    const tX = isNaN(new Date(x.timestamp).getTime()) ? 0 : new Date(x.timestamp).getTime();
    const tY = isNaN(new Date(y.timestamp).getTime()) ? 0 : new Date(y.timestamp).getTime();
    return tY - tX;
  });
}

export function mergeChatRestrictions(a: any[] = [], b: any[] = []): any[] {
  const map = new Map<string, any>();
  a.forEach((r) => r?.userNickname && map.set(r.userNickname.toLowerCase(), { ...r }));
  b.forEach((r) => r?.userNickname && map.set(r.userNickname.toLowerCase(), { ...(map.get(r.userNickname.toLowerCase()) || {}), ...r }));
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

