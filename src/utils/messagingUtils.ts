import { DirectMessage, ChatConversation, CampusNotification } from '../types';
import { pushServerDbSync } from './apiSync';
import { saveDirectMessageToFirestore } from '../lib/firestoreSync';

export const DIRECT_MESSAGES_KEY = 'fuhsi_direct_messages_db';
export const CONVERSATIONS_KEY = 'fuhsi_conversations_db';

/**
 * Normalize nickname for consistent key lookups
 */
export const normalizeNickname = (nick: string): string => {
  if (!nick) return '';
  return nick.trim().toLowerCase().replace(/^@/, '');
};

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
 * Save new direct message, update conversations, and send a notification to the recipient
 */
export function sendDirectMessage(msg: DirectMessage): DirectMessage[] {
  const allMessages = getStoredDirectMessages();
  const updatedMessages = [...allMessages, msg];
  
  try {
    localStorage.setItem(DIRECT_MESSAGES_KEY, JSON.stringify(updatedMessages));
  } catch (err) {
    console.error('Error saving direct message:', err);
  }

  // Save to Firestore real-time collection
  saveDirectMessageToFirestore(msg).catch((err) => {
    console.error('Error saving direct message to Firestore:', err);
  });

  // Update conversations
  updateConversationList(msg);

  // Send real notification to recipient
  const isFromAdmin = msg.senderNickname.includes('Admin') || msg.senderNickname.toLowerCase().includes('modula');
  const previewText = msg.text.length > 130 ? `${msg.text.substring(0, 130)}...` : msg.text;

  const msgTime = formatMessageTime(msg.timestamp);

  const notif: CampusNotification = {
    id: `notif_dm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: isFromAdmin ? 'ADMIN' : 'DIRECT_MESSAGE',
    title: isFromAdmin ? '🛡️ Admin Inquiry / Message' : `💬 Message from ${msg.senderNickname}`,
    message: isFromAdmin 
      ? `Official Admin Notice: "${previewText}"`
      : `${msg.senderNickname}: "${previewText}"`,
    timestamp: msgTime,
    isRead: false,
    senderNickname: msg.senderNickname,
    conversationId: msg.conversationId,
    actionType: 'OPEN_TRADE_CHAT',
    itemId: msg.itemId,
  };

  sendUserNotification(msg.receiverNickname, notif);

  // Push sync to server
  try {
    pushServerDbSync({ directMessages: updatedMessages } as any).catch(console.error);
  } catch (e) {
    console.error(e);
  }

  // Dispatch custom window event so all active UI components refresh immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fuhsi_direct_message_updated', { detail: msg }));
  }

  return updatedMessages;
}

/**
 * Update conversations store with last message snippet
 */
export function updateConversationList(msg: DirectMessage): void {
  try {
    const stored = localStorage.getItem(CONVERSATIONS_KEY);
    let convs: ChatConversation[] = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(convs)) convs = [];

    const existingIdx = convs.findIndex((c) => c.id === msg.conversationId);
    const updatedConv: ChatConversation = {
      id: msg.conversationId,
      otherUserNickname: msg.senderNickname.includes('Admin') ? msg.senderNickname : (msg.receiverNickname.includes('Admin') ? msg.senderNickname : msg.receiverNickname),
      lastMessage: msg.text,
      lastTimestamp: formatMessageTime(msg.timestamp),
      itemId: msg.itemId,
      itemTitle: msg.itemTitle,
      itemPrice: msg.itemPrice,
      meetupPoint: msg.meetupPoint,
      unreadCount: (existingIdx >= 0 ? convs[existingIdx].unreadCount : 0) + 1,
    };

    if (existingIdx >= 0) {
      convs[existingIdx] = {
        ...convs[existingIdx],
        ...updatedConv,
      };
    } else {
      convs.unshift(updatedConv);
    }

    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convs));
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
