import { DirectMessage, ChatConversation, CampusNotification, ChatReport } from '../types';
import { pushServerDbSync } from './apiSync';
import { saveDirectMessageToFirestore } from '../lib/firestoreSync';
import { evaluateChatMessage } from './safetyFilter';

export const DIRECT_MESSAGES_KEY = 'fuhsi_direct_messages_db';
export const CONVERSATIONS_KEY = 'fuhsi_conversations_db';
export const CHAT_REPORTS_KEY = 'fuhsi_chat_reports_db';

/**
 * Normalize nickname for consistent key lookups
 */
export const normalizeNickname = (nick: string): string => {
  if (!nick) return '';
  return nick.trim().toLowerCase().replace(/^@/, '');
};

/**
 * Deterministically generate a conversation ID between two usernames
 */
export function getConversationId(userA: string, userB: string): string {
  const cleanA = normalizeNickname(userA);
  const cleanB = normalizeNickname(userB);

  // If one of them is admin desk
  if (cleanA.includes('admin') || cleanA.includes('desk') || cleanA.includes('modula')) {
    return `conv_admin_${cleanB}`;
  }
  if (cleanB.includes('admin') || cleanB.includes('desk') || cleanB.includes('modula')) {
    return `conv_admin_${cleanA}`;
  }

  const sorted = [cleanA, cleanB].sort();
  return `conv_${sorted[0]}_${sorted[1]}`;
}

export const formatMessageTime = (dateInput?: string | number | Date): string => {
  if (!dateInput || dateInput === 'Just now' || dateInput === 'Live Desk') {
    return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  if (typeof dateInput === 'string' && /^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(dateInput.trim())) {
    return dateInput.trim();
  }
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  if (isToday) {
    return timeStr;
  }
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
};

/**
 * Get all stored direct messages
 */
export function getStoredDirectMessages(): DirectMessage[] {
  try {
    const stored = localStorage.getItem(DIRECT_MESSAGES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading direct messages from storage:', err);
  }
  return [];
}

/**
 * Get all stored conversations
 */
export function getStoredConversations(): ChatConversation[] {
  try {
    const stored = localStorage.getItem(CONVERSATIONS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading conversations:', err);
  }
  return [];
}

/**
 * Get active conversations for a specific user, filtering out deleted ones
 */
export function getUserConversations(userNickname: string): ChatConversation[] {
  if (!userNickname) return [];
  const cleanMe = normalizeNickname(userNickname);
  const allMessages = getStoredDirectMessages();
  const storedConvs = getStoredConversations();

  // Find all conversation IDs this user is part of
  const convMap = new Map<string, { otherUser: string; lastMsg: DirectMessage; count: number }>();

  allMessages.forEach((msg) => {
    const sender = normalizeNickname(msg.senderNickname);
    const receiver = normalizeNickname(msg.receiverNickname);

    if (sender === cleanMe || receiver === cleanMe) {
      const other = sender === cleanMe ? msg.receiverNickname : msg.senderNickname;
      const convId = msg.conversationId || getConversationId(msg.senderNickname, msg.receiverNickname);
      
      const existing = convMap.get(convId);
      if (!existing) {
        convMap.set(convId, { otherUser: other, lastMsg: msg, count: 1 });
      } else {
        // Keep the latest message
        convMap.set(convId, { otherUser: other, lastMsg: msg, count: existing.count + 1 });
      }
    }
  });

  const result: ChatConversation[] = [];

  convMap.forEach((data, convId) => {
    const stored = storedConvs.find((c) => c.id === convId);
    if (stored && stored.isDeletedBy && stored.isDeletedBy.includes(cleanMe)) {
      return; // Skipped because deleted by user
    }

    const cleanOther = normalizeNickname(data.otherUser);
    // Lookup user avatar and verification from users cache
    let otherAvatarKey = '1';
    let otherAvatarUrl: string | undefined;
    let otherIsVerified = false;
    let otherBadgeType = 'GREEN';
    let otherBadgeTitle = 'FUHSI Student';

    try {
      const uStr = localStorage.getItem('fuhsi_users_db');
      if (uStr) {
        const uList: any[] = JSON.parse(uStr);
        const match = uList.find(
          (u) => normalizeNickname(u.nickname) === cleanOther || u.id === data.otherUser
        );
        if (match) {
          otherAvatarKey = match.avatarKey || '1';
          otherAvatarUrl = match.avatarUrl;
          otherIsVerified = Boolean(match.isVerified || match.verificationStatus === 'approved');
          otherBadgeType = match.badgeType || 'GREEN';
          otherBadgeTitle = match.badgeTitle || 'FUHSI Student';
        }
      }
    } catch (e) {}

    result.push({
      id: convId,
      otherUserNickname: data.otherUser.startsWith('@') ? data.otherUser : `@${data.otherUser}`,
      otherUserAvatarKey: otherAvatarKey,
      otherUserAvatarUrl: otherAvatarUrl,
      otherUserIsVerified: otherIsVerified,
      otherUserBadgeType: otherBadgeType,
      otherUserBadgeTitle: otherBadgeTitle,
      lastMessage: data.lastMsg.text,
      lastTimestamp: formatMessageTime(data.lastMsg.timestamp),
      itemId: data.lastMsg.itemId,
      itemTitle: data.lastMsg.itemTitle,
      itemPrice: data.lastMsg.itemPrice,
      meetupPoint: data.lastMsg.meetupPoint,
      unreadCount: stored?.unreadCount || 0,
      updatedAt: data.lastMsg.timestamp,
    });
  });

  // Sort newest first
  return result.sort((a, b) => {
    const tA = new Date(a.updatedAt || 0).getTime() || 0;
    const tB = new Date(b.updatedAt || 0).getTime() || 0;
    return tB - tA;
  });
}

/**
 * Delete / Remove conversation for a user
 */
export function deleteConversationForUser(conversationId: string, userNickname: string): void {
  if (!conversationId || !userNickname) return;
  const clean = normalizeNickname(userNickname);
  try {
    const stored = getStoredConversations();
    const existing = stored.find((c) => c.id === conversationId);
    let updated: ChatConversation[];
    if (existing) {
      const deletedBy = existing.isDeletedBy || [];
      if (!deletedBy.includes(clean)) {
        deletedBy.push(clean);
      }
      updated = stored.map((c) => (c.id === conversationId ? { ...c, isDeletedBy: deletedBy } : c));
    } else {
      updated = [
        ...stored,
        {
          id: conversationId,
          otherUserNickname: '',
          lastMessage: '',
          lastTimestamp: '',
          unreadCount: 0,
          isDeletedBy: [clean],
        },
      ];
    }
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated));
    pushServerDbSync({ chatConversations: updated } as any).catch(console.error);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fuhsi_conversation_deleted', { detail: { conversationId, userNickname } }));
    }
  } catch (err) {
    console.error('Error deleting conversation:', err);
  }
}

/**
 * Submit a Chat Moderation Report
 */
export function submitChatReport(report: ChatReport): void {
  try {
    let reports: ChatReport[] = [];
    const raw = localStorage.getItem(CHAT_REPORTS_KEY);
    if (raw) reports = JSON.parse(raw);

    reports = [report, ...reports];
    localStorage.setItem(CHAT_REPORTS_KEY, JSON.stringify(reports));

    pushServerDbSync({ chatReports: reports } as any).catch(console.error);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fuhsi_chat_report_submitted', { detail: report }));
    }
  } catch (err) {
    console.error('Error submitting chat report:', err);
  }
}

/**
 * Get all submitted chat reports (for Admin Console)
 */
export function getStoredChatReports(): ChatReport[] {
  try {
    const raw = localStorage.getItem(CHAT_REPORTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading chat reports:', err);
  }
  return [];
}

/**
 * Update chat report status (Admin action)
 */
export function updateChatReportStatus(reportId: string, status: 'ACTION_TAKEN' | 'DISMISSED'): void {
  try {
    const reports = getStoredChatReports();
    const updated = reports.map((r) => (r.id === reportId ? { ...r, status } : r));
    localStorage.setItem(CHAT_REPORTS_KEY, JSON.stringify(updated));
    pushServerDbSync({ chatReports: updated } as any).catch(console.error);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fuhsi_chat_report_updated', { detail: { reportId, status } }));
    }
  } catch (err) {
    console.error('Error updating chat report:', err);
  }
}

/**
 * Save new direct message, evaluate safety, update conversations, and send notification
 */
export function sendDirectMessage(msg: DirectMessage): {
  updatedMessages: DirectMessage[];
  warningMessage?: string;
  isBlocked?: boolean;
} {
  // Safety evaluation before dispatching
  const evalResult = evaluateChatMessage(msg.text, msg.senderNickname);

  if (!evalResult.isAllowed) {
    return {
      updatedMessages: getStoredDirectMessages(),
      warningMessage: evalResult.warningMessage,
      isBlocked: true,
    };
  }

  const effectiveText = evalResult.sanitizedText || msg.text;

  const safeMsg: DirectMessage = {
    ...msg,
    text: effectiveText,
    isSafetyWarning: evalResult.actionTaken === 'REPLACED_CONTACT_INFO',
    violationNotice: evalResult.actionTaken === 'REPLACED_CONTACT_INFO' ? evalResult.warningMessage : undefined,
  };

  const allMessages = getStoredDirectMessages();
  const updatedMessages = [...allMessages, safeMsg];
  
  try {
    localStorage.setItem(DIRECT_MESSAGES_KEY, JSON.stringify(updatedMessages));
  } catch (err) {
    console.error('Error saving direct message:', err);
  }

  // Save to Firestore real-time collection
  saveDirectMessageToFirestore(safeMsg).catch((err) => {
    console.error('Error saving direct message to Firestore:', err);
  });

  // Update conversations
  updateConversationList(safeMsg);

  // Send real notification to recipient
  const isFromAdmin = safeMsg.senderNickname.includes('Admin') || safeMsg.senderNickname.toLowerCase().includes('modula');
  const previewText = safeMsg.text.length > 130 ? `${safeMsg.text.substring(0, 130)}...` : safeMsg.text;

  const msgTime = formatMessageTime(safeMsg.timestamp);

  const notif: CampusNotification = {
    id: `notif_dm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: isFromAdmin ? 'ADMIN' : 'DIRECT_MESSAGE',
    title: isFromAdmin ? '🛡️ Admin Inquiry / Message' : `💬 Message from ${safeMsg.senderNickname}`,
    message: isFromAdmin 
      ? `Official Admin Notice: "${previewText}"`
      : `${safeMsg.senderNickname}: "${previewText}"`,
    timestamp: msgTime,
    isRead: false,
    senderNickname: safeMsg.senderNickname,
    conversationId: safeMsg.conversationId,
    actionType: 'OPEN_TRADE_CHAT',
    itemId: safeMsg.itemId,
  };

  sendUserNotification(safeMsg.receiverNickname, notif);

  // Push sync to server
  try {
    pushServerDbSync({ directMessages: updatedMessages } as any).catch(console.error);
  } catch (e) {
    console.error(e);
  }

  // Dispatch custom window event so all active UI components refresh immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fuhsi_direct_message_updated', { detail: safeMsg }));
  }

  return {
    updatedMessages,
    warningMessage: evalResult.warningMessage,
    isBlocked: false,
  };
}

/**
 * Update conversations store with last message snippet
 */
export function updateConversationList(msg: DirectMessage): void {
  try {
    const stored = localStorage.getItem(CONVERSATIONS_KEY);
    let convs: ChatConversation[] = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(convs)) convs = [];

    const convId = msg.conversationId || getConversationId(msg.senderNickname, msg.receiverNickname);
    const existingIdx = convs.findIndex((c) => c.id === convId);

    const updatedConv: ChatConversation = {
      id: convId,
      otherUserNickname: msg.senderNickname.includes('Admin') ? msg.senderNickname : (msg.receiverNickname.includes('Admin') ? msg.senderNickname : msg.receiverNickname),
      lastMessage: msg.text,
      lastTimestamp: formatMessageTime(msg.timestamp),
      itemId: msg.itemId,
      itemTitle: msg.itemTitle,
      itemPrice: msg.itemPrice,
      meetupPoint: msg.meetupPoint,
      unreadCount: (existingIdx >= 0 ? convs[existingIdx].unreadCount : 0) + 1,
      isDeletedBy: [], // unhide if a new message arrives
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      convs[existingIdx] = {
        ...convs[existingIdx],
        ...updatedConv,
        isDeletedBy: [],
      };
    } else {
      convs.unshift(updatedConv);
    }

    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convs));
    pushServerDbSync({ chatConversations: convs } as any).catch(console.error);
  } catch (err) {
    console.error('Error updating conversations:', err);
  }
}

export const READ_NOTIFS_KEY_PREFIX = 'fuhsi_read_notif_ids_';

/**
 * Get IDs of notifications marked as read
 */
export function getReadNotificationIds(nickname: string): Record<string, boolean> {
  if (!nickname) return {};
  const clean = normalizeNickname(nickname);
  try {
    const stored = localStorage.getItem(`${READ_NOTIFS_KEY_PREFIX}${clean}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    }
  } catch (err) {
    console.error('Error reading read notification IDs:', err);
  }
  return {};
}

/**
 * Set read status for a specific notification ID
 */
export function setReadNotificationId(nickname: string, notifId: string, isRead: boolean): void {
  if (!nickname || !notifId) return;
  const clean = normalizeNickname(nickname);
  const key = `${READ_NOTIFS_KEY_PREFIX}${clean}`;
  try {
    const current = getReadNotificationIds(nickname);
    current[notifId] = isRead;
    localStorage.setItem(key, JSON.stringify(current));
  } catch (err) {
    console.error('Error saving read notification ID:', err);
  }
}

/**
 * Mark a list of notification IDs as read
 */
export function setAllNotificationIdsRead(nickname: string, notifIds: string[]): void {
  if (!nickname || !notifIds.length) return;
  const clean = normalizeNickname(nickname);
  const key = `${READ_NOTIFS_KEY_PREFIX}${clean}`;
  try {
    const current = getReadNotificationIds(nickname);
    notifIds.forEach((id) => {
      current[id] = true;
    });
    localStorage.setItem(key, JSON.stringify(current));
  } catch (err) {
    console.error('Error saving read notification IDs:', err);
  }
}

/**
 * Get user-specific notifications
 */
export function getUserNotifications(nickname: string): CampusNotification[] {
  if (!nickname) return [];
  const clean = normalizeNickname(nickname);
  const key = `fuhsi_user_notifications_${clean}`;
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading user notifications:', err);
  }
  return [];
}

/**
 * Send a notification to a specific user
 */
export function sendUserNotification(targetNickname: string, notif: CampusNotification): void {
  if (!targetNickname) return;
  const clean = normalizeNickname(targetNickname);
  const key = `fuhsi_user_notifications_${clean}`;
  
  const preparedNotif: CampusNotification = {
    ...notif,
    timestamp: notif.timestamp ? formatMessageTime(notif.timestamp) : formatMessageTime(),
  };

  try {
    const current = getUserNotifications(targetNickname);
    // Deduplicate identical notifications within short timeframe
    const exists = current.some((n) => n.id === preparedNotif.id);
    if (!exists) {
      const updated = [preparedNotif, ...current];
      localStorage.setItem(key, JSON.stringify(updated));
    }
  } catch (err) {
    console.error('Error storing user notification:', err);
  }

  // Dispatch window event for live badges
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fuhsi_notification_received', { detail: { targetNickname, notif: preparedNotif } }));
  }
}

/**
 * Mark a user notification as read
 */
export function markNotificationAsRead(nickname: string, notifId: string): void {
  if (!nickname || !notifId) return;
  const clean = normalizeNickname(nickname);
  const key = `fuhsi_user_notifications_${clean}`;
  try {
    const current = getUserNotifications(nickname);
    const updated = current.map((n) => (n.id === notifId ? { ...n, isRead: true } : n));
    localStorage.setItem(key, JSON.stringify(updated));
    setReadNotificationId(nickname, notifId, true);
  } catch (err) {
    console.error('Error marking notification read:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fuhsi_notification_read_updated', { detail: { nickname, notifId } }));
  }
}

/**
 * Mark all notifications as read for a user
 */
export function markAllNotificationsAsRead(nickname: string): void {
  if (!nickname) return;
  const clean = normalizeNickname(nickname);
  const key = `fuhsi_user_notifications_${clean}`;
  try {
    const current = getUserNotifications(nickname);
    const updated = current.map((n) => ({ ...n, isRead: true }));
    localStorage.setItem(key, JSON.stringify(updated));
    const allIds = current.map((n) => n.id);
    setAllNotificationIdsRead(nickname, allIds);
  } catch (err) {
    console.error('Error marking all notifications read:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fuhsi_notification_read_updated', { detail: { nickname } }));
  }
}
