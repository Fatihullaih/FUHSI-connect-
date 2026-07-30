import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Bell, ShieldCheck, Sparkles, MessageSquare, Heart, Award, Info, CheckCheck, Trash2, Megaphone, Check } from 'lucide-react';

interface NotificationScreenProps {
  userProfile: UserProfile;
}

interface CampusNotification {
  id: string;
  type: 'VERIFICATION' | 'LIKE' | 'COMMENT' | 'ADMIN' | 'MARKET';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export const NotificationScreen: React.FC<NotificationScreenProps> = ({ userProfile }) => {
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'ADMIN'>('ALL');
  const [notifications, setNotifications] = useState<CampusNotification[]>([
    {
      id: 'notif_1',
      type: 'VERIFICATION',
      title: 'Badge Status Update',
      message: `Your student profile (${userProfile.department} - ${userProfile.level}) is active on FUHSI-Connect. Submit credentials to request official Gold or Emerald Verified Badge status.`,
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
  ]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'ADMIN') return n.type === 'ADMIN' || n.type === 'VERIFICATION';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4 pb-24">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
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
                className="p-2 rounded-xl text-xs font-bold text-teal-700 hover:bg-teal-50 flex items-center gap-1 transition-all"
                title="Mark all as read"
              >
                <CheckCheck size={16} />
                <span className="hidden sm:inline">Mark read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="p-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                title="Clear all notifications"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 pt-1 text-xs font-bold">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === 'ALL'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === 'UNREAD'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('ADMIN')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
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
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleToggleRead(n.id)}
              className={`p-4 transition-all cursor-pointer flex items-start gap-3 hover:bg-slate-50/80 ${
                !n.isRead ? 'bg-teal-50/40 border-l-4 border-l-teal-600' : ''
              }`}
            >
              <div className="shrink-0 mt-0.5">
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
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center border border-indigo-200">
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
