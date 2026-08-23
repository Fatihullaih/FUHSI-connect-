import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserProfile, ChatConversation, DirectMessage, ChatReport } from '../types';
import { AvatarIcon } from '../components/AvatarIcon';
import { VerificationBadge } from '../components/VerificationBadge';
import { 
  getStoredDirectMessages, 
  getUserConversations, 
  sendDirectMessage, 
  markConversationMessagesAsRead,
  deleteConversationForUser, 
  submitChatReport, 
  extractPreservedReportEvidence,
  getConversationId, 
  normalizeNickname,
  formatMessageTime 
} from '../utils/messagingUtils';
import { 
  checkUserChatRestriction, 
  formatRestrictionRemainingTime 
} from '../utils/safetyFilter';
import { subscribeDirectMessagesByConversation } from '../lib/firestoreSync';
import { 
  MessageSquare, 
  Search, 
  Send, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  Lock, 
  AlertTriangle, 
  CheckCheck, 
  Sparkles, 
  ChevronLeft, 
  UserPlus, 
  X, 
  Flag, 
  Check, 
  Info,
  BadgeAlert,
  ArrowDown
} from 'lucide-react';

interface ChatsScreenProps {
  userProfile: UserProfile;
  onOpenProfile?: (nickname: string) => void;
  initialConversationId?: string;
  initialRecipientNickname?: string;
  initialRecipient?: { nickname: string; avatarKey?: string; avatarUrl?: string } | null;
  onClearInitialRecipient?: () => void;
  allUsers?: UserProfile[];
}

export const ChatsScreen: React.FC<ChatsScreenProps> = ({
  userProfile,
  onOpenProfile,
  initialConversationId,
  initialRecipientNickname,
  initialRecipient,
  onClearInitialRecipient,
  allUsers = [],
}) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConversationId || null);
  const [activeRecipient, setActiveRecipient] = useState<{
    nickname: string;
    avatarKey?: string;
    avatarUrl?: string;
    badgeType?: string;
    badgeTitle?: string;
    isVerified?: boolean;
  } | null>(null);

  const [activeMessages, setActiveMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('HARASSMENT');
  const [reportNotes, setReportNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'warning' | 'error' | 'success' } | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const myNickname = userProfile?.nickname || '@Student';
  const cleanMyNickname = normalizeNickname(myNickname);

  // Check if current user is restricted
  const restrictionInfo = useMemo(() => {
    return checkUserChatRestriction(cleanMyNickname);
  }, [cleanMyNickname, conversations]);

  // Check if recipient is online / active
  const isRecipientOnline = useMemo(() => {
    if (!activeRecipient) return true;
    const cleanTarget = normalizeNickname(activeRecipient.nickname);
    const match = allUsers.find(
      (u) => normalizeNickname(u.nickname) === cleanTarget || u.id === cleanTarget
    );
    if (match) {
      if (match.isBanned) return false;
      return (match as any).isOnline !== false;
    }
    return true;
  }, [activeRecipient, allUsers]);

  // Derive conversation handle
  const recipientConvHandle = useMemo(() => {
    if (activeConvId) {
      return activeConvId.startsWith('@') ? activeConvId : `@${activeConvId}`;
    }
    if (activeRecipient) {
      const nick = normalizeNickname(activeRecipient.nickname);
      return `@${getConversationId(myNickname, nick)}`;
    }
    return '';
  }, [activeConvId, activeRecipient, myNickname]);

  // Load conversations
  const refreshConversations = () => {
    if (!myNickname) return;
    const userConvs = getUserConversations(myNickname);
    setConversations(userConvs);
  };

  useEffect(() => {
    refreshConversations();

    const handleUpdate = () => refreshConversations();
    window.addEventListener('fuhsi_direct_message_updated', handleUpdate);
    window.addEventListener('fuhsi_conversation_deleted', handleUpdate);
    window.addEventListener('fuhsi_chat_restriction_updated', handleUpdate);

    return () => {
      window.removeEventListener('fuhsi_direct_message_updated', handleUpdate);
      window.removeEventListener('fuhsi_conversation_deleted', handleUpdate);
      window.removeEventListener('fuhsi_chat_restriction_updated', handleUpdate);
    };
  }, [myNickname]);

  // Handle initial recipient or conversation
  useEffect(() => {
    if (initialRecipient && initialRecipient.nickname) {
      handleSelectRecipient(initialRecipient.nickname, initialRecipient.avatarKey, initialRecipient.avatarUrl);
      if (onClearInitialRecipient) onClearInitialRecipient();
    } else if (initialRecipientNickname) {
      handleSelectRecipient(initialRecipientNickname);
    } else if (initialConversationId) {
      setActiveConvId(initialConversationId);
    }
  }, [initialRecipient, initialRecipientNickname, initialConversationId]);

  // When activeConvId changes, find recipient metadata and subscribe to messages
  useEffect(() => {
    if (!activeConvId) {
      setActiveMessages([]);
      setActiveRecipient(null);
      return;
    }

    // 1. Populate cached local messages
    const localMsgs = getStoredDirectMessages().filter(
      (m) => (m.conversationId || getConversationId(m.senderNickname, m.receiverNickname)) === activeConvId
    );
    setActiveMessages(localMsgs);

    // Mark incoming messages as read by this user
    markConversationMessagesAsRead(activeConvId, myNickname);

    // 2. Resolve recipient metadata
    const conv = conversations.find((c) => c.id === activeConvId);
    if (conv) {
      setActiveRecipient({
        nickname: conv.otherUserNickname,
        avatarKey: conv.otherUserAvatarKey || '1',
        avatarUrl: conv.otherUserAvatarUrl,
        badgeType: conv.otherUserBadgeType,
        badgeTitle: conv.otherUserBadgeTitle,
        isVerified: conv.otherUserIsVerified,
      });
    } else {
      // Resolve for new conversations with no existing message records
      const parts = activeConvId.split('__');
      const cleanMe = normalizeNickname(myNickname);
      const otherClean = (parts[0] === cleanMe ? parts[1] : parts[0]) || '';
      
      const targetNick = initialRecipient?.nickname || initialRecipientNickname || otherClean;
      const cleanTarget = normalizeNickname(targetNick);
      const userMatch = allUsers.find(
        (u) => normalizeNickname(u.nickname) === cleanTarget || u.id === cleanTarget || u.studentEmail?.toLowerCase() === cleanTarget
      );

      setActiveRecipient((prev) => {
        if (prev && normalizeNickname(prev.nickname) === cleanTarget && prev.avatarKey) {
          return prev;
        }
        return {
          nickname: targetNick.startsWith('@') ? targetNick : `@${targetNick}`,
          avatarKey: initialRecipient?.avatarKey || userMatch?.avatarKey || '1',
          avatarUrl: initialRecipient?.avatarUrl || userMatch?.avatarUrl,
          badgeType: userMatch?.badgeType || 'GREEN',
          badgeTitle: userMatch?.badgeTitle || 'FUHSI Student',
          isVerified: Boolean(userMatch?.isVerified || userMatch?.verificationStatus === 'approved'),
        };
      });
    }

    // 3. Subscribe to Firestore real-time messages for this conversation
    const unsubscribe = subscribeDirectMessagesByConversation(
      activeConvId,
      (firestoreMsgs) => {
        if (firestoreMsgs && firestoreMsgs.length > 0) {
          setActiveMessages((prev) => {
            const map = new Map<string, DirectMessage>();
            prev.forEach((m) => map.set(m.id, m));
            firestoreMsgs.forEach((m) => map.set(m.id, m));
            const list = Array.from(map.values());
            list.sort((a, b) => {
              const timeA = a.id?.includes('dm_') ? Number(a.id.replace(/\D/g, '')) || 0 : 0;
              const timeB = b.id?.includes('dm_') ? Number(b.id.replace(/\D/g, '')) || 0 : 0;
              return timeA - timeB;
            });
            return list;
          });
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activeConvId, conversations, initialRecipientNickname, allUsers]);

  // Auto scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [activeMessages.length, activeConvId]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 100);
  };

  // Select or initiate chat with a recipient
  const handleSelectRecipient = (targetNickname: string, avatarKey?: string, avatarUrl?: string) => {
    const cleanTarget = normalizeNickname(targetNickname);
    if (cleanTarget === cleanMyNickname) {
      showToast('You cannot start a conversation with yourself.', 'info');
      return;
    }

    const convId = getConversationId(myNickname, targetNickname);
    setActiveConvId(convId);

    // Resolve user details
    const userMatch = allUsers.find(
      (u) => normalizeNickname(u.nickname) === cleanTarget || u.id === targetNickname
    );

    setActiveRecipient({
      nickname: targetNickname.startsWith('@') ? targetNickname : `@${targetNickname}`,
      avatarKey: avatarKey || userMatch?.avatarKey || '1',
      avatarUrl: avatarUrl || userMatch?.avatarUrl,
      badgeType: userMatch?.badgeType || 'GREEN',
      badgeTitle: userMatch?.badgeTitle || 'FUHSI Student',
      isVerified: Boolean(userMatch?.isVerified || userMatch?.verificationStatus === 'approved'),
    });

    setShowNewChatModal(false);
  };

  const showToast = (text: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Send message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConvId || !activeRecipient) return;

    if (restrictionInfo.isRestricted) {
      showToast(`Chat Restricted: ${restrictionInfo.reason} (${formatRestrictionRemainingTime(restrictionInfo.restrictedUntil)} remaining).`, 'error');
      return;
    }

    setIsSending(true);

    const newMsg: DirectMessage = {
      id: `dm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId: activeConvId,
      senderNickname: myNickname.startsWith('@') ? myNickname : `@${myNickname}`,
      receiverNickname: activeRecipient.nickname,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    const result = sendDirectMessage(newMsg);

    if (result.isBlocked) {
      showToast(result.warningMessage || '⚠️ Message blocked by safety filter.', 'error');
      setIsSending(false);
      return;
    }

    if (result.warningMessage) {
      showToast(result.warningMessage, 'warning');
    }

    setInputText('');
    setIsSending(false);
    refreshConversations();
  };

  // Delete conversation
  const handleDeleteConversation = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation? It will be removed from your chat list.')) {
      deleteConversationForUser(convId, myNickname);
      if (activeConvId === convId) {
        setActiveConvId(null);
        setActiveRecipient(null);
      }
      refreshConversations();
      showToast('Conversation deleted.', 'info');
    }
  };

  // Submit report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecipient || !activeConvId) return;

    // Securely extract strictly the last 5 messages from @reporter ↔ @reportedUser in exact chronological order
    const preservedEvidence = extractPreservedReportEvidence(
      myNickname,
      activeRecipient.nickname,
      activeMessages
    );

    const report: ChatReport = {
      id: `chatreport_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId: activeConvId,
      reportedNickname: activeRecipient.nickname.startsWith('@') ? activeRecipient.nickname : `@${activeRecipient.nickname}`,
      reporterNickname: myNickname.startsWith('@') ? myNickname : `@${myNickname}`,
      reason: reportReason,
      notes: reportNotes.trim() || undefined,
      messageSnippet: preservedEvidence[preservedEvidence.length - 1]?.text || activeMessages[activeMessages.length - 1]?.text || 'Chat conversation reported',
      recentMessages: preservedEvidence,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
    };

    submitChatReport(report);
    setShowReportModal(false);
    setReportNotes('');
    showToast('Report submitted. The moderation case has been securely created for review.', 'success');
  };

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().replace(/^@/, '');
    return conversations.filter(
      (c) =>
        c.otherUserNickname.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  // Filtered students for New Chat
  const eligibleNewChatStudents = useMemo(() => {
    const q = newChatSearch.toLowerCase().replace(/^@/, '');
    return allUsers
      .filter((u) => {
        const nick = normalizeNickname(u.nickname);
        if (!nick || nick === cleanMyNickname) return false;
        if (!q) return true;
        return nick.includes(q);
      })
      .slice(0, 15);
  }, [allUsers, newChatSearch, cleanMyNickname]);

  // Suggested quick messages
  const quickReplies = [
    'Hello 👋',
    'How are you doing?',
    'Are you on campus today?',
    'When is the next lecture?',
    'Thanks for the update!',
    'See you around campus!',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto bg-slate-50 border-x border-slate-200 shadow-xs overflow-hidden">
      {/* Toast Banner */}
      {toastMessage && (
        <div 
          className={`px-4 py-2.5 text-xs font-bold flex items-center justify-between z-50 transition-all ${
            toastMessage.type === 'error'
              ? 'bg-rose-600 text-white'
              : toastMessage.type === 'warning'
              ? 'bg-amber-500 text-slate-900'
              : toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-teal-700 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'error' || toastMessage.type === 'warning' ? (
              <AlertTriangle size={15} className="shrink-0" />
            ) : (
              <Check size={15} className="shrink-0" />
            )}
            <span className="leading-snug">{toastMessage.text}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)} 
            className="p-1 hover:bg-black/10 rounded-lg cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Layout: Split Screen on Desktop, Toggle on Mobile */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Conversation List (Hidden on mobile when conversation is active) */}
        <div 
          className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 ${
            activeConvId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2 bg-white sticky top-0 z-10">
            <div>
              <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>Chats</span>
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" title="Live connection active" />
              </h1>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>

            <button
              id="btn-new-chat"
              onClick={() => setShowNewChatModal(true)}
              className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl border border-teal-200 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Start a new chat with any student"
            >
              <UserPlus size={15} />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>

          {/* Safety & Privacy Notice */}
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5 select-none">
            <Lock size={13} className="text-teal-700 shrink-0" />
            <span>Private & Protected</span>
          </div>

          {/* Restriction Banner (If User is Restricted) */}
          {restrictionInfo.isRestricted && (
            <div className="m-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-extrabold text-xs text-rose-800">
                <BadgeAlert size={15} className="text-rose-600 shrink-0" />
                <span>Chat Restricted</span>
              </div>
              <p className="text-[11px] leading-snug font-medium text-rose-700">
                Your chat access has been temporarily restricted because of repeated violations of the FUHSI Connect community rules.
              </p>
              <div className="text-[10px] bg-white/70 p-2 rounded-xl border border-rose-100 space-y-0.5 font-bold">
                <div>Reason: <span className="font-medium text-rose-800">{restrictionInfo.reason}</span></div>
                <div>Duration: <span className="font-extrabold text-rose-900">{formatRestrictionRemainingTime(restrictionInfo.restrictedUntil)} remaining</span></div>
              </div>
            </div>
          )}

          {/* Search Box */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search username or messages..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100/70 border border-transparent focus:border-teal-500 focus:bg-white rounded-xl outline-none font-medium text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-3 my-auto">
                <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto border border-teal-100">
                  <MessageSquare size={22} />
                </div>
                <h3 className="text-xs font-black text-slate-800">No Conversations Yet</h3>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Start a chat by viewing any student profile or clicking <strong className="text-teal-700 font-bold">New Chat</strong> above.
                </p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  Find Students
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConvId;
                return (
                  <div
                    key={conv.id}
                    id={`conv-item-${conv.id}`}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      setActiveRecipient({
                        nickname: conv.otherUserNickname,
                        avatarKey: conv.otherUserAvatarKey || '1',
                        avatarUrl: conv.otherUserAvatarUrl,
                        badgeType: conv.otherUserBadgeType,
                        badgeTitle: conv.otherUserBadgeTitle,
                        isVerified: conv.otherUserIsVerified,
                      });
                    }}
                    className={`p-3 sm:px-4 flex items-center gap-3 cursor-pointer transition-colors group relative ${
                      isSelected
                        ? 'bg-teal-50/80 border-l-4 border-teal-600'
                        : 'hover:bg-slate-50/90'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-teal-900 flex items-center justify-center overflow-hidden border border-slate-200">
                        <AvatarIcon
                          avatarKey={conv.otherUserAvatarKey}
                          avatarUrl={conv.otherUserAvatarUrl}
                          sizeClassName="w-full h-full object-cover"
                        />
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-600 text-white rounded-full text-[9px] font-black flex items-center justify-center border-2 border-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Meta info: ONLY username & nickname, never real name or private info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs font-black text-slate-900 truncate">
                            {conv.otherUserNickname}
                          </span>
                          <VerificationBadge
                            isVerified={Boolean(conv.otherUserIsVerified)}
                            badgeType={conv.otherUserBadgeType as any}
                            size={12}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          {conv.lastTimestamp}
                        </span>
                      </div>

                      <p className="text-[11px] font-medium text-slate-500 truncate leading-tight">
                        {conv.lastMessage}
                      </p>
                    </div>

                    {/* Delete Conversation action */}
                    <button
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                      title="Delete conversation"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Stream */}
        <div 
          className={`flex-1 bg-slate-50 flex-col justify-between overflow-hidden ${
            activeConvId ? 'flex' : 'hidden md:flex items-center justify-center'
          }`}
        >
          {activeConvId && activeRecipient ? (
            <>
              {/* Conversation Top Header */}
              <div className="p-3 sm:px-4 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => {
                      setActiveConvId(null);
                      setActiveRecipient(null);
                    }}
                    className="md:hidden p-1.5 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors cursor-pointer"
                    title="Back to conversation list"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {/* Recipient Avatar */}
                  <div 
                    onClick={() => onOpenProfile && onOpenProfile(activeRecipient.nickname)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-teal-900 flex items-center justify-center overflow-hidden border border-slate-200 cursor-pointer shrink-0 hover:scale-105 transition-transform"
                    title="View student profile"
                  >
                    <AvatarIcon
                      avatarKey={activeRecipient.avatarKey}
                      avatarUrl={activeRecipient.avatarUrl}
                      sizeClassName="w-full h-full object-cover"
                    />
                  </div>

                  {/* Recipient Username & Metadata */}
                  <div className="min-w-0">
                    {/* Line 1: @deji (verified badge if verified) */}
                    <div 
                      onClick={() => onOpenProfile && onOpenProfile(activeRecipient.nickname)}
                      className="flex items-center gap-1.5 cursor-pointer group leading-tight"
                    >
                      <h2 className="text-xs sm:text-sm font-black text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                        {activeRecipient.nickname.startsWith('@') ? activeRecipient.nickname : `@${activeRecipient.nickname}`}
                      </h2>
                      <VerificationBadge
                        isVerified={Boolean(activeRecipient.isVerified)}
                        badgeType={activeRecipient.badgeType as any}
                        size={13}
                      />
                    </div>
                    
                    {/* Line 2: @conv_admin_deji or conversation identifier */}
                    <p className="text-[10px] font-semibold text-slate-500 truncate leading-tight">
                      {recipientConvHandle}
                    </p>

                    {/* Line 3: • Online / Offline */}
                    <div className="flex items-center gap-1 text-[10px] font-bold mt-0.5 leading-tight">
                      {isRecipientOnline ? (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 inline-block" />
                          <span>• Online</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 inline-block" />
                          <span>• Offline</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Actions: Report Conversation & Safety Info */}
                <div className="flex items-center gap-1.5">
                  <button
                    id="btn-report-chat"
                    onClick={() => setShowReportModal(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-[11px] font-bold border border-slate-200 flex items-center gap-1 transition-all cursor-pointer"
                    title="Report Harassment, Threats, or Prohibited Content"
                  >
                    <ShieldAlert size={13} className="text-rose-500" />
                    <span className="hidden sm:inline">Report</span>
                  </button>
                </div>
              </div>

              {/* Permanent Protected conversation banner (Fixed, does not scroll with message stream) */}
              <div className="px-3.5 py-1.5 bg-teal-50 border-b border-teal-100/90 flex items-center gap-1.5 text-[11px] font-extrabold text-teal-800 shrink-0 select-none">
                <ShieldCheck size={13} className="text-teal-600 shrink-0" />
                <span>Protected conversation</span>
              </div>

              {/* Chat Message Stream */}
              <div 
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 relative"
              >
                {activeMessages.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto border border-slate-200 text-teal-700 shadow-2xs">
                      <MessageSquare size={20} />
                    </div>
                    <h4 className="text-xs font-black text-slate-800">No Messages Yet</h4>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      Say hello to {activeRecipient.nickname.startsWith('@') ? activeRecipient.nickname : `@${activeRecipient.nickname}`}!
                    </p>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isMe = normalizeNickname(msg.senderNickname) === cleanMyNickname;
                    const isSafetyBlocked = msg.isSafetyWarning || msg.text.includes('Contact information cannot be shared');

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-md px-3.5 py-2.5 rounded-2xl text-xs shadow-2xs space-y-1 ${
                            isMe
                              ? isSafetyBlocked
                                ? 'bg-amber-100 text-amber-950 rounded-br-xs border border-amber-300'
                                : 'bg-teal-700 text-white rounded-br-xs'
                              : isSafetyBlocked
                              ? 'bg-amber-50 text-amber-900 rounded-bl-xs border border-amber-200'
                              : 'bg-white text-slate-900 rounded-bl-xs border border-slate-200/80'
                          }`}
                        >
                          {isSafetyBlocked ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 font-extrabold text-[11px] text-amber-800">
                                <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                                <span>⚠️ Contact information cannot be shared.</span>
                              </div>
                              <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                                FUHSI Connect does not allow exchanging personal phone numbers, emails, or social media handles for student security.
                              </p>
                            </div>
                          ) : (
                            <p className="leading-relaxed whitespace-pre-wrap break-words font-medium">
                              {msg.text}
                            </p>
                          )}

                          <div
                            className={`flex items-center justify-end gap-1 text-[9px] font-bold ${
                              isMe
                                ? isSafetyBlocked
                                  ? 'text-amber-700'
                                  : 'text-teal-200'
                                : 'text-slate-400'
                            }`}
                          >
                            <span>{formatMessageTime(msg.timestamp)}</span>
                            {isMe && (
                              msg.isRead ? (
                                <span 
                                  title="Viewed / Read by recipient" 
                                  className="flex items-center gap-0.5 text-cyan-300 font-black cursor-help"
                                >
                                  <CheckCheck size={13} className="text-cyan-300 stroke-[2.5]" />
                                </span>
                              ) : (
                                <span 
                                  title="Sent / Delivered (Unread)" 
                                  className="flex items-center gap-0.5 text-teal-200/60 cursor-help"
                                >
                                  <CheckCheck size={13} className="text-teal-200/60" />
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />

                {/* Floating Scroll to Bottom */}
                {showScrollBottom && (
                  <button
                    onClick={() => scrollToBottom('smooth')}
                    className="sticky bottom-2 right-2 ml-auto p-2 bg-teal-700 hover:bg-teal-800 text-white rounded-full shadow-lg transition-all cursor-pointer flex items-center justify-center"
                    title="Scroll to bottom"
                  >
                    <ArrowDown size={14} />
                  </button>
                )}
              </div>

              {/* Quick Reply Suggestions */}
              <div className="bg-slate-100/90 border-t border-slate-200/80 px-3 py-1.5 shrink-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-extrabold text-slate-400 flex items-center gap-1 shrink-0">
                  <Sparkles size={11} className="text-teal-600" />
                  <span>Quick:</span>
                </span>
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => setInputText(reply)}
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 text-slate-700 border border-slate-200 text-[10px] font-bold whitespace-nowrap shadow-2xs transition-all cursor-pointer shrink-0"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Message Composer */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                {restrictionInfo.isRestricted ? (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-center text-xs font-bold text-rose-800 flex items-center justify-center gap-1.5">
                    <BadgeAlert size={15} />
                    <span>You cannot send messages while chat is restricted ({formatRestrictionRemainingTime(restrictionInfo.restrictedUntil)} remaining).</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder={`Message ${activeRecipient.nickname}...`}
                      className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    />

                    <button
                      type="submit"
                      disabled={!inputText.trim() || isSending}
                      className="h-10 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Send size={13} />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </form>
                )}
              </div>
            </>
          ) : (
            /* Desktop Empty State when no conversation is selected */
            <div className="p-8 text-center space-y-3 my-auto">
              <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-3xl flex items-center justify-center mx-auto border border-teal-100 shadow-xs">
                <MessageSquare size={28} />
              </div>
              <h2 className="text-sm font-black text-slate-800">Select a Conversation</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Choose a conversation from the left or click <strong className="text-teal-700 font-bold">New Chat</strong> to connect with students.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Start New Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                  <UserPlus size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Start New Chat</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Select any student to start chatting</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={newChatSearch}
                  onChange={(e) => setNewChatSearch(e.target.value)}
                  placeholder="Type student nickname (e.g. @Fatty)..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100/80 border border-transparent focus:border-teal-500 focus:bg-white rounded-xl outline-none font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Student Directory List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50 p-2">
              {eligibleNewChatStudents.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                  No matching students found.
                </div>
              ) : (
                eligibleNewChatStudents.map((student) => (
                  <div
                    key={student.id || student.nickname}
                    onClick={() => handleSelectRecipient(student.nickname, student.avatarKey, student.avatarUrl)}
                    className="p-2.5 px-3 flex items-center justify-between rounded-2xl hover:bg-teal-50/70 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-teal-900 flex items-center justify-center overflow-hidden border border-slate-200">
                        <AvatarIcon
                          avatarKey={student.avatarKey}
                          avatarUrl={student.avatarUrl}
                          sizeClassName="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900 group-hover:text-teal-800">
                            {student.nickname}
                          </span>
                          <VerificationBadge
                            isVerified={Boolean(student.isVerified || student.verificationStatus === 'approved')}
                            badgeType={student.badgeType as any}
                            size={12}
                          />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">
                          {student.badgeTitle || 'FUHSI Student'}
                        </p>
                      </div>
                    </div>

                    <button className="px-3 py-1 bg-teal-700 text-white rounded-xl text-[11px] font-bold shadow-2xs group-hover:bg-teal-800 transition-colors">
                      Chat
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Conversation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                  <ShieldAlert size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Report Conversation</h3>
                  <p className="text-[11px] text-slate-500 font-bold">Reporting {activeRecipient?.nickname}</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Violation Category:
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="HARASSMENT">Harassment & Bullying</option>
                  <option value="SEXUAL_HARASSMENT">Sexual Harassment & Inappropriate Behavior</option>
                  <option value="THREAT">Direct Threat & Intimidation</option>
                  <option value="CONTACT_INFO_SOLICITING">Soliciting Private Contact Information</option>
                  <option value="SCAM">Scam or Fraudulent Activity</option>
                  <option value="OTHER">Other Community Policy Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Additional Details / Notes (Optional):
                </label>
                <textarea
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  rows={3}
                  placeholder="Explain what happened and why you are reporting this conversation."
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-3.5 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
