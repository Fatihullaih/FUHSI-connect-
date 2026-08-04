import React, { useState, useMemo } from 'react';
import { UserProfile, Post, CampusNotification } from '../types';
import { Bell, ShieldCheck, Sparkles, MessageSquare, Heart, Award, Info, CheckCheck, Trash2, Megaphone, Check, Building2, Landmark, Layers } from 'lucide-react';
import { isUserMatchingAudience, isFacultyTarget } from '../utils/audienceUtils';

interface NotificationScreenProps {
  userProfile: UserProfile;
  allPosts?: Post[];
  onSelectPost?: (post: Post) => void;
}

export const NotificationScreen: React.FC<NotificationScreenProps> = ({ userProfile, allPosts = [], onSelectPost }) => {
  const [filter, setFilter] = useState<'ALL' | 'TARGETED' | 'UNREAD' | 'ADMIN'>('ALL');
  const [readNotifIds, setReadNotifIds] = useState<Record<string, boolean>>({});

  // Custom user notifications (e.g. account approval message)
  const customUserNotifications: CampusNotification[] = useMemo(() => {
    if (!userProfile?.nickname) return [];
    const cleanNick = userProfile.nickname.toLowerCase().replace(/^@/, '');
    const notifKey = `fuhsi_user_notifications_${cleanNick}`;
    try {
      const stored = localStorage.getItem(notifKey);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  }, [userProfile?.nickname]);

  // Base system notifications
  const baseNotifications: CampusNotification[] = useMemo(() => [
    ...customUserNotifications,
    {
      id: 'notif_1',
      type: 'VERIFICATION',
      title: 'Badge Status Update',
      message: `Your student profile (${userProfile.department} - ${userProfile.level}) is active on FUHSI-Connect. Complete activities to earn reputation points and badges.`,
      timestamp: '10m ago',
      isRead: false,
    },
    {
      id: 'notif_2',
      type: 'ADMIN',
      title: 'SUG & Safety Advisory',
      message: 'Anti-doxxing & privacy shield is active campus-wide. Personal phone numbers and external contact links in public feed posts are automatically redacted.',
      timestamp: '1h ago',
      isRead: false,
    },
    {
      id: 'notif_3',
      type: 'LIKE',
      title: 'Post Interaction',
      message: '@MedScholar and 4 other students liked your recent post on clinical posting updates.',
      timestamp: '3h ago',
      isRead: true,
    },
    {
      id: 'notif_4',
      type: 'MARKET',
      title: 'Campus Hub Inquiry',
      message: 'A student inquired about Littmann Stethoscope listing on Campus Hub & Trade Desk.',
      timestamp: '5h ago',
      isRead: true,
    },
    {
      id: 'notif_5',
      type: 'COMMENT',
      title: 'Discussion Reply',
      message: '@NursePrecious replied: "Thank you for sharing the CBT past questions link!"',
      timestamp: '1d ago',
      isRead: true,
    },
  ], [userProfile.department, userProfile.level]);

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
    return combined.map((n) => ({
      ...n,
      isRead: readNotifIds[n.id] !== undefined ? readNotifIds[n.id] : n.isRead,
    }));
  }, [targetedNotifications, baseNotifications, readNotifIds]);

  const handleMarkAllRead = () => {
    const updated: Record<string, boolean> = {};
    allCombinedNotifications.forEach((n) => {
      updated[n.id] = true;
    });
    setReadNotifIds(updated);
  };

  const handleToggleRead = (n: CampusNotification) => {
    setReadNotifIds((prev) => ({
      ...prev,
      [n.id]: !n.isRead,
    }));

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
    return true;
  });

  const unreadCount = allCombinedNotifications.filter((n) => !n.isRead).length;
  const targetedCount = targetedNotifications.length;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4 pb-24">
      {/* Active Sync Status Banner */}
      <div className="bg-teal-900 text-white p-3.5 rounded-2xl shadow-xs border border-teal-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-800/80 rounded-xl text-teal-300 border border-teal-700 shrink-0">
            <Building2 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">Auto-Synced Department Alerts</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[11px] text-teal-200 font-medium">
              Registered Profile: <strong className="text-white font-extrabold">{userProfile.department}</strong> ({userProfile.level})
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-black text-teal-200 bg-teal-800/90 px-2.5 py-1 rounded-lg border border-teal-700">
            {targetedCount} Targeted
          </span>
        </div>
      </div>

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
                {unreadCount > 0 ? `${unreadCount} unread alerts requiring attention` : 'All caught up! No unread notifications'}
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
                <span className="hidden sm:inline">Mark read</span>
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
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleToggleRead(n)}
              className={`p-4 transition-all cursor-pointer flex items-start gap-3 hover:bg-slate-50/80 ${
                !n.isRead ? 'bg-teal-50/40 border-l-4 border-l-teal-600' : ''
              }`}
            >
              <div className="shrink-0 mt-0.5">
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

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-xs ${!n.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                    {n.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold shrink-0">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{n.message}</p>
                {n.targetDepartment && (
                  <span className="inline-block text-[10px] font-extrabold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md mt-1">
                    Audience: {n.targetDepartment}
                  </span>
                )}
              </div>

              {!n.isRead && (
                <div className="w-2 h-2 rounded-full bg-teal-600 shrink-0 self-center" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
          <Bell className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-extrabold text-slate-800">No notifications</h3>
          <p className="text-xs text-slate-500">You don't have any notifications under this filter.</p>
        </div>
      )}
    </div>
  );
};

