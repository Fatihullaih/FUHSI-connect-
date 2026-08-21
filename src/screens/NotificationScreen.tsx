import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, Post, CampusNotification, DirectMessage } from '../types';
import { Bell, ShieldCheck, Sparkles, MessageSquare, Heart, Award, Info, CheckCheck, Trash2, Megaphone, Check, Building2, Landmark, Layers, Send, ShieldAlert, CornerDownRight, Shield } from 'lucide-react';
import { isUserMatchingAudience, isFacultyTarget } from '../utils/audienceUtils';
import { 
  sendDirectMessage, 
  getStoredDirectMessages, 
  normalizeNickname, 
  formatMessageTime,
  getReadNotificationIds,
  setReadNotificationId,
  setAllNotificationIdsRead,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUserNotifications
} from '../utils/messagingUtils';
import { ChatInterface } from '../components/ChatInterface';

interface NotificationScreenProps {
  userProfile: UserProfile;
  allPosts?: Post[];
  onSelectPost?: (post: Post) => void;
  onOpenTradeChat?: (convId?: string) => void;
}

export const NotificationScreen: React.FC<NotificationScreenProps> = ({ 
  userProfile, 
  allPosts = [], 
  onSelectPost,
  onOpenTradeChat 
}) => {
  const [filter, setFilter] = useState<'ALL' | 'TARGETED' | 'UNREAD' | 'ADMIN' | 'MESSAGES'>('ALL');
  const [readNotifIds, setReadNotifIds] = useState<Record<string, boolean>>(() => {
    return userProfile?.nickname ? getReadNotificationIds(userProfile.nickname) : {};
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sync readNotifIds if userProfile changes
  useEffect(() => {
    if (userProfile?.nickname) {
      setReadNotifIds(getReadNotificationIds(userProfile.nickname));
    }
  }, [userProfile?.nickname]);

  // Reply Modal State
  const [replyingTo, setReplyingTo] = useState<CampusNotification | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyToast, setReplyToast] = useState<string | null>(null);

  // Active Real-time Firestore Chat Interface State
  const [activeChatSession, setActiveChatSession] = useState<{
    conversationId: string;
    recipientNickname: string;
    contextItem?: any;
    initialSnippet?: string;
  } | null>(null);

  const handleOpenChatForNotification = (n: CampusNotification) => {
    const cleanNick = normalizeNickname(userProfile.nickname);
    const targetConvId = n.conversationId || `conv_${cleanNick}_admin`;
    const recipient = n.senderNickname || '🛡️ FUHSI Admin Trade Desk';

    setReadNotifIds((prev) => {
      const updated = { ...prev, [n.id]: true };
      setReadNotificationId(userProfile.nickname, n.id, true);
      return updated;
    });
    markNotificationAsRead(userProfile.nickname, n.id);

    setActiveChatSession({
      conversationId: targetConvId,
      recipientNickname: recipient,
      contextItem: n.itemId ? { id: n.itemId } : undefined,
      initialSnippet: n.message,
    });
  };

  // Listen to live direct messages and notifications
  useEffect(() => {
    const handleUpdate = () => {
      setRefreshTrigger((prev) => prev + 1);
      if (userProfile?.nickname) {
        setReadNotifIds(getReadNotificationIds(userProfile.nickname));
      }
    };
    window.addEventListener('fuhsi_direct_message_updated', handleUpdate);
    window.addEventListener('fuhsi_notification_received', handleUpdate);
    window.addEventListener('fuhsi_notification_read_updated', handleUpdate);
    return () => {
      window.removeEventListener('fuhsi_direct_message_updated', handleUpdate);
      window.removeEventListener('fuhsi_notification_received', handleUpdate);
      window.removeEventListener('fuhsi_notification_read_updated', handleUpdate);
    };
  }, [userProfile?.nickname]);

  // Custom user notifications (e.g. account approval message, admin inquiries, direct messages)
  const customUserNotifications: CampusNotification[] = useMemo(() => {
    if (!userProfile?.nickname) return [];
    return getUserNotifications(userProfile.nickname);
  }, [userProfile?.nickname, refreshTrigger]);

  // Base system notifications (only actual user notifications)
  const baseNotifications: CampusNotification[] = useMemo(() => [
    ...customUserNotifications,
  ], [customUserNotifications]);

  // Dynamically compute targeted notifications for posts directed at the user's registered department/faculty
  const targetedNotifications: CampusNotification[] = useMemo(() => {
    const list: CampusNotification[] = [];
    allPosts.forEach((p) => {
      const target = p.targetDepartment;
      if (!target || target === 'General Campus' || target === 'General') return;

      if (isUserMatchingAudience(userProfile.department, target)) {
        const isFaculty = isFacultyTarget(target);
        const snippet = p.content.length > 90 ? `${p.content.substring(0, 90)}...` : p.content;

        list.push({
          id: `targeted_notif_${p.id}`,
          type: isFaculty ? 'TARGETED_FACULTY' : 'TARGETED_DEPT',
          title: isFaculty ? `🏛️ Faculty Notice: ${target}` : `📢 Department Alert: ${target}`,
          message: `${p.authorNickname} posted for ${target}: "${snippet}"`,
          timestamp: p.timestamp || 'Recent',
          isRead: Boolean(readNotifIds[`targeted_notif_${p.id}`]),
          targetDepartment: target,
          postId: p.id,
        });
      }
    });
    return list;
  }, [allPosts, userProfile.department, readNotifIds]);

  // Combine base notifications and targeted notifications
  const allCombinedNotifications: CampusNotification[] = useMemo(() => {
    const combined = [...targetedNotifications, ...baseNotifications];
    return combined.map((n) => {
      const isMarkedReadInState = readNotifIds[n.id];
      const effectiveIsRead = isMarkedReadInState !== undefined ? isMarkedReadInState : Boolean(n.isRead);
      return {
        ...n,
        isRead: effectiveIsRead,
      };
    });
  }, [targetedNotifications, baseNotifications, readNotifIds]);

  const handleMarkAllRead = () => {
    const updated: Record<string, boolean> = {};
    const allIds = allCombinedNotifications.map((n) => n.id);
    allIds.forEach((id) => {
      updated[id] = true;
    });
    setReadNotifIds(updated);
    setAllNotificationIdsRead(userProfile.nickname, allIds);
    markAllNotificationsAsRead(userProfile.nickname);
  };

  const handleToggleRead = (n: CampusNotification) => {
    const currentStatus = Boolean(readNotifIds[n.id] !== undefined ? readNotifIds[n.id] : n.isRead);
    const nextStatus = !currentStatus;

    setReadNotifIds((prev) => {
      const updated = { ...prev, [n.id]: nextStatus };
      setReadNotificationId(userProfile.nickname, n.id, nextStatus);
      return updated;
    });

    if (nextStatus) {
      markNotificationAsRead(userProfile.nickname, n.id);
    } else {
      const clean = normalizeNickname(userProfile.nickname);
      const key = `fuhsi_user_notifications_${clean}`;
      try {
        const stored = getUserNotifications(userProfile.nickname);
        const updatedList = stored.map((item) => item.id === n.id ? { ...item, isRead: false } : item);
        localStorage.setItem(key, JSON.stringify(updatedList));
      } catch (e) {
        console.error(e);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fuhsi_notification_read_updated', { detail: { nickname: userProfile.nickname, notifId: n.id } }));
      }
    }

    if (n.postId && onSelectPost) {
      const matchingPost = allPosts.find((p) => p.id === n.postId);
      if (matchingPost) {
        onSelectPost(matchingPost);
      }
    }
  };

  const filtered = allCombinedNotifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'TARGETED') return n.type === 'TARGETED_DEPT' || n.type === 'TARGETED_FACULTY';
    if (filter === 'ADMIN') return n.type === 'ADMIN' || n.type === 'VERIFICATION';
    if (filter === 'MESSAGES') return n.type === 'DIRECT_MESSAGE' || n.type === 'ADMIN_TRADE_DESK' || Boolean(n.senderNickname);
    return true;
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTo || !replyText.trim()) return;

    const targetRecipient = replyingTo.senderNickname || '🛡️ FUHSI Admin Trade Desk';
    const targetConvId = replyingTo.conversationId || `conv_${userProfile.nickname.toLowerCase().replace(/^@/, '')}_admin`;

    const newReplyMsg: DirectMessage = {
      id: `dm_reply_${Date.now()}`,
      conversationId: targetConvId,
      senderNickname: userProfile.nickname,
      receiverNickname: targetRecipient,
      text: replyText.trim(),
      timestamp: formatMessageTime(),
    };

    sendDirectMessage(newReplyMsg);

    setReplyToast(`✓ Your reply has been sent to ${targetRecipient}!`);
    setReplyText('');
    
    // Auto mark as read
    setReadNotifIds((prev) => {
      const updated = { ...prev, [replyingTo.id]: true };
      setReadNotificationId(userProfile.nickname, replyingTo.id, true);
      return updated;
    });
    markNotificationAsRead(userProfile.nickname, replyingTo.id);

    setReplyingTo(null);

    setTimeout(() => {
      setReplyToast(null);
    }, 4000);
  };

  const unreadCount = allCombinedNotifications.filter((n) => !n.isRead).length;
  const targetedCount = targetedNotifications.length;
  const messagesCount = allCombinedNotifications.filter((n) => n.type === 'DIRECT_MESSAGE' || n.type === 'ADMIN_TRADE_DESK' || Boolean(n.senderNickname)).length;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4 pb-24">
      {/* Toast Alert */}
      {replyToast && (
        <div className="p-3 bg-emerald-600 text-white font-extrabold text-xs rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in">
          <span>{replyToast}</span>
          <button onClick={() => setReplyToast(null)} className="text-white/80 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight">Campus Notifications</h1>
              <p className="text-xs text-slate-500 font-medium">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount === 1 ? '' : 's'} requiring attention` : 'All caught up! No unread notifications'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="p-2 rounded-xl text-xs font-bold text-teal-700 hover:bg-teal-50 flex items-center gap-1 transition-all cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck size={16} />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs font-bold">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filter === 'ALL'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({allCombinedNotifications.length})
          </button>
          <button
            onClick={() => setFilter('MESSAGES')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
              filter === 'MESSAGES'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200/60'
            }`}
          >
            <Send size={13} />
            <span>Messages & Queries ({messagesCount})</span>
          </button>
          <button
            onClick={() => setFilter('TARGETED')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
              filter === 'TARGETED'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200/60'
            }`}
          >
            <Building2 size={13} />
            <span>Targeted ({targetedCount})</span>
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filter === 'UNREAD'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('ADMIN')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filter === 'ADMIN'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Admin & Badges
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {filtered.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {filtered.map((n) => {
            const isDirectMsgOrAdmin = n.type === 'DIRECT_MESSAGE' || n.type === 'ADMIN_TRADE_DESK' || Boolean(n.senderNickname);
            const displayTime = formatMessageTime(n.timestamp);

            return (
              <div
                key={n.id}
                onClick={() => handleToggleRead(n)}
                className={`p-4 transition-all cursor-pointer flex items-start gap-3 hover:bg-slate-50/80 ${
                  !n.isRead ? 'bg-teal-50/40 border-l-4 border-l-teal-600' : ''
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {(n.type === 'DIRECT_MESSAGE' || n.type === 'ADMIN_TRADE_DESK') && (
                    <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center border border-teal-700 shadow-2xs">
                      <ShieldCheck size={18} />
                    </div>
                  )}
                  {n.type === 'TARGETED_DEPT' && (
                    <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center border border-teal-200 shadow-2xs">
                      <Building2 size={18} />
                    </div>
                  )}
                  {n.type === 'TARGETED_FACULTY' && (
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center border border-indigo-200 shadow-2xs">
                      <Landmark size={18} />
                    </div>
                  )}
                  {n.type === 'VERIFICATION' && (
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200">
                      <ShieldCheck size={18} />
                    </div>
                  )}
                  {n.type === 'ADMIN' && (
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
                      <Megaphone size={18} />
                    </div>
                  )}
                  {n.type === 'LIKE' && (
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center border border-rose-200">
                      <Heart size={18} />
                    </div>
                  )}
                  {n.type === 'COMMENT' && (
                    <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center border border-sky-200">
                      <MessageSquare size={18} />
                    </div>
                  )}
                  {n.type === 'MARKET' && (
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center border border-purple-200">
                      <Sparkles size={18} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-xs ${!n.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                      {n.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">{displayTime}</span>
                  </div>
                  
                  {n.senderNickname && (
                    <p className="text-[11px] font-extrabold text-teal-800">
                      From: {n.senderNickname}
                    </p>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-line">{n.message}</p>
                  
                  {n.targetDepartment && (
                    <span className="inline-block text-[10px] font-extrabold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md mt-1">
                      Audience: {n.targetDepartment}
                    </span>
                  )}

                  {/* Interactive Actions for Admin inquiries & Direct Messages */}
                  {isDirectMsgOrAdmin && (
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenChatForNotification(n);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-black text-[11px] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <MessageSquare size={12} />
                        <span>Open Live Chat with {n.senderNickname || 'Admin'}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReplyingTo(n);
                          setReplyText('');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Send size={11} />
                        <span>Quick Reply</span>
                      </button>

                      {onOpenTradeChat && n.conversationId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenTradeChat(n.conversationId);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold text-[11px] transition-colors cursor-pointer border border-slate-200"
                        >
                          Trade Desk
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-teal-600 shrink-0 self-center" />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
          <Bell className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-extrabold text-slate-800">No notifications</h3>
          <p className="text-xs text-slate-500">You don't have any notifications under this filter.</p>
        </div>
      )}

      {/* Live Firestore Chat Interface Modal */}
      {activeChatSession && (
        <ChatInterface
          conversationId={activeChatSession.conversationId}
          currentUser={userProfile}
          recipientNickname={activeChatSession.recipientNickname}
          contextItem={activeChatSession.contextItem}
          initialMessageSnippet={activeChatSession.initialSnippet}
          onClose={() => setActiveChatSession(null)}
        />
      )}

      {/* Quick Reply Fallback Modal */}
      {replyingTo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <Send size={14} className="text-teal-600" />
                <span>Reply to {replyingTo.senderNickname || 'Admin'}</span>
              </h3>
              <button 
                onClick={() => setReplyingTo(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
              <p className="font-bold text-slate-900 mb-1">{replyingTo.title}</p>
              <p className="text-[11px] line-clamp-3 text-slate-600">{replyingTo.message}</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Your Response / Answer</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response here..."
                  rows={4}
                  className="w-full text-xs rounded-xl border border-slate-300 p-3 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={13} />
                  <span>Send Response</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

