import React, { useState } from 'react';
import { Post, Report, VerificationRequest, MarketplaceItem, UserProfile, BadgeType } from '../types';
import { Shield, Lock, Search, Eye, CheckCircle2, XCircle, AlertTriangle, MessageSquare, Send, Award, RefreshCw, Key, Check, UserCheck, ShoppingBag, PhoneCall, AlertCircle } from 'lucide-react';
import { VerificationBadge } from '../components/VerificationBadge';
import { INITIAL_VERIFICATION_CANDIDATES } from '../data/initialData';

interface ModerationScreenProps {
  userProfile: UserProfile | null;
  flaggedPosts: Post[];
  reports: Report[];
  verificationRequests: VerificationRequest[];
  pendingMarketplaceItems: MarketplaceItem[];
  onToggleAntiDoxxing: (enabled: boolean) => void;
  onToggleProfanityShield: (enabled: boolean) => void;
  onDismissReport: (reportId: string, postId: string) => void;
  onQuarantinePost: (reportId: string, postId: string) => void;
  onDeletePost: (postId: string) => void;
  onUpdateBadge: (badgeType: BadgeType, badgeTitle: string) => void;
  onUpdateReputationScore: (newScore: number) => void;
  onUpdateVerificationRequestStatus: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  onAdminApproveMarketplaceItem: (id: string, approvedPrice: number, note: string) => void;
  onAdminRejectMarketplaceItem: (id: string, note: string) => void;
  onSendPriceAdvisory: (id: string, suggestedPrice: number, message: string) => void;
}

export const ModerationScreen: React.FC<ModerationScreenProps> = ({
  userProfile,
  flaggedPosts,
  reports,
  verificationRequests,
  pendingMarketplaceItems,
  onToggleAntiDoxxing,
  onToggleProfanityShield,
  onDismissReport,
  onQuarantinePost,
  onDeletePost,
  onUpdateBadge,
  onUpdateReputationScore,
  onUpdateVerificationRequestStatus,
  onAdminApproveMarketplaceItem,
  onAdminRejectMarketplaceItem,
  onSendPriceAdvisory,
}) => {
  // Toggles state
  const [antiDoxxing, setAntiDoxxing] = useState(true);
  const [profanityShield, setProfanityShield] = useState(true);

  // Identity Lookup State
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<{
    realName: string;
    matricNumber: string;
    emergencyHomePhone: string;
    department: string;
  } | null>(null);

  // Admin Hotline Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'admin'; text: string; time: string }>>([
    { sender: 'admin', text: 'FUHSI Admin Hotline active. How can we assist with your campus safety, trade requests, or verification?', time: '10:00 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Admin Badge Modifier State
  const [selectedBadgeType, setSelectedBadgeType] = useState<BadgeType>(userProfile?.badgeType || 'BLUE');
  const [badgeTitleInput, setBadgeTitleInput] = useState(userProfile?.badgeTitle || 'Class Rep & Tech Lead');
  const [reputationInput, setReputationInput] = useState(userProfile?.reputationScore || 2450);
  const [adminUpdateToast, setAdminUpdateToast] = useState(false);

  // Pending Student Registrations Approval State
  const [pendingRegistrations, setPendingRegistrations] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem('fuhsi_users_db');
      if (stored) {
        const list: UserProfile[] = JSON.parse(stored);
        const unapproved = list.filter((u) => u.isApproved === false);
        if (unapproved.length > 0) return unapproved;
      }
    } catch (err) {
      console.error(err);
    }
    return [
      {
        id: 'usr_pending_demo_1',
        nickname: '@FreshMedStudent',
        realName: 'Adegoke Emmanuel Temitope',
        matricNumber: '25/MBS/088',
        emergencyHomePhone: '08023456789',
        department: 'Medicine and Surgery (MBBS)',
        level: '100L',
        bio: 'Fresh 100L MBBS Student seeking account approval.',
        isApproved: false,
        isVerified: false,
      },
      {
        id: 'usr_pending_demo_2',
        nickname: '@NurseGrace_Ila',
        realName: 'Olanrewaju Grace Omowumi',
        matricNumber: '24/NSC/412',
        emergencyHomePhone: '08134567890',
        department: 'Nursing Science (NSC)',
        level: '200L',
        bio: '200L Nursing student registered on FUHSI Connect.',
        isApproved: false,
        isVerified: false,
      },
    ];
  });

  const [approvalToast, setApprovalToast] = useState<string | null>(null);

  const handleApproveRegistration = (userId: string, nick: string) => {
    try {
      const stored = localStorage.getItem('fuhsi_users_db');
      if (stored) {
        let list: UserProfile[] = JSON.parse(stored);
        list = list.map((u) => u.id === userId ? { ...u, isApproved: true, isVerified: true, badgeTitle: 'Verified Student' } : u);
        localStorage.setItem('fuhsi_users_db', JSON.stringify(list));
      }
      const activeStored = localStorage.getItem('fuhsi_active_user');
      if (activeStored) {
        const active: UserProfile = JSON.parse(activeStored);
        if (active.id === userId) {
          localStorage.setItem('fuhsi_active_user', JSON.stringify({ ...active, isApproved: true, isVerified: true, badgeTitle: 'Verified Student' }));
        }
      }
    } catch (err) {
      console.error(err);
    }

    setPendingRegistrations((prev) => prev.filter((u) => u.id !== userId));
    setApprovalToast(`✓ Registration approved for ${nick}! Student account is now active & verified.`);
    setTimeout(() => setApprovalToast(null), 3500);
  };

  const handleRejectRegistration = (userId: string, nick: string) => {
    try {
      const stored = localStorage.getItem('fuhsi_users_db');
      if (stored) {
        let list: UserProfile[] = JSON.parse(stored);
        list = list.filter((u) => u.id !== userId);
        localStorage.setItem('fuhsi_users_db', JSON.stringify(list));
      }
    } catch (err) {
      console.error(err);
    }

    setPendingRegistrations((prev) => prev.filter((u) => u.id !== userId));
    setApprovalToast(`Registration declined for ${nick}.`);
    setTimeout(() => setApprovalToast(null), 3000);
  };

  // Price Advisory Modal State
  const [advisoryItem, setAdvisoryItem] = useState<MarketplaceItem | null>(null);
  const [suggestedPrice, setSuggestedPrice] = useState<number>(0);
  const [advisoryMsg, setAdvisoryMsg] = useState('');

  // Admin Marketplace Middleman Trade Desk State
  const [adminTradeRequests, setAdminTradeRequests] = useState([
    {
      id: 'req_1',
      buyerNickname: '@MedBoss',
      itemTitle: '3M Littmann Classic III Stethoscope',
      sellerNickname: '@IlaMedHero',
      price: 38000,
      meetupPoint: 'Main Library Entrance',
      timestamp: '10 mins ago',
      status: 'PENDING_SELLER_CHECK' as 'PENDING_SELLER_CHECK' | 'SELLER_CONTACTED' | 'CONFIRMED_AVAILABLE' | 'UNAVAILABLE' | 'PENALIZED',
      adminNote: 'Buyer pledge logged. Awaiting seller confirmation.'
    },
    {
      id: 'req_2',
      buyerNickname: '@NurseQueen_Ila',
      itemTitle: 'Guyton and Hall Medical Physiology Textbook',
      sellerNickname: '@BookWorm_Ila',
      price: 16000,
      meetupPoint: 'Matriculation Pavilion',
      timestamp: '25 mins ago',
      status: 'CONFIRMED_AVAILABLE' as 'PENDING_SELLER_CHECK' | 'SELLER_CONTACTED' | 'CONFIRMED_AVAILABLE' | 'UNAVAILABLE' | 'PENALIZED',
      adminNote: 'Seller confirmed available. Both parties notified for safe meet-up.'
    }
  ]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    // Simulate encrypted lookup in FUHSI Admin Database
    if (lookupQuery.includes('1042') || lookupQuery.toLowerCase().includes('medhero')) {
      setLookupResult({
        realName: 'Adeyemo Oluwaseun Joseph',
        matricNumber: '2023/1042',
        emergencyHomePhone: '08031234567',
        department: 'Medicine & Surgery (300L)',
      });
    } else {
      setLookupResult({
        realName: 'Okonkwo Chinedu Emmanuel',
        matricNumber: '2022/0891',
        emergencyHomePhone: '08098765432',
        department: 'Nursing Science (400L)',
      });
    }
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = { sender: 'user' as const, text: chatInput, time: 'Just now' };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'admin',
          text: 'Message received by FUHSI Security & SUG Welfare Council. An officer will reply shortly.',
          time: 'Just now',
        },
      ]);
    }, 1000);
  };

  const handleSaveBadgeAndRep = () => {
    onUpdateBadge(selectedBadgeType, badgeTitleInput);
    onUpdateReputationScore(reputationInput);
    setAdminUpdateToast(true);
    setTimeout(() => setAdminUpdateToast(false), 2000);
  };

  const handleSendAdvisory = () => {
    if (advisoryItem) {
      onSendPriceAdvisory(advisoryItem.id, suggestedPrice, advisoryMsg);
      setAdvisoryItem(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 px-4 pt-4 space-y-4">
      {/* Moderation Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-lg border border-indigo-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-base">FUHSI Safety & Moderation Council</h1>
            <p className="text-xs text-indigo-200">
              Marketplace Trade Middleman Desk, Anti-Doxxing Safeguards & Identity Vault
            </p>
          </div>
        </div>
      </div>

      {/* Safety Toggles Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h2 className="font-bold text-slate-900 text-sm">Automated Safety Engines</h2>

        <div className="space-y-2 text-xs">
          {/* Toggle 1: Anti-Doxxing */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="font-bold text-slate-800">Automated Anti-Doxxing Phone/Link Filter</p>
              <p className="text-slate-500">Automatically redacts leaked phone numbers & external web links.</p>
            </div>
            <button
              onClick={() => {
                const next = !antiDoxxing;
                setAntiDoxxing(next);
                onToggleAntiDoxxing(next);
              }}
              className={`px-3 py-1.5 rounded-full font-bold text-xs transition-colors ${
                antiDoxxing ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {antiDoxxing ? 'ACTIVE' : 'OFF'}
            </button>
          </div>

          {/* Toggle 2: Profanity Shield */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="font-bold text-slate-800">Profanity & Defamation Shield</p>
              <p className="text-slate-500">Filters abusive language and unverified harassment claims.</p>
            </div>
            <button
              onClick={() => {
                const next = !profanityShield;
                setProfanityShield(next);
                onToggleProfanityShield(next);
              }}
              className={`px-3 py-1.5 rounded-full font-bold text-xs transition-colors ${
                profanityShield ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {profanityShield ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* PENDING STUDENT ACCOUNT REGISTRATIONS APPROVAL DESK */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-teal-900">
              <UserCheck className="w-4 h-4 text-teal-600" /> Pending Student Account Approvals ({pendingRegistrations.length})
            </h2>
            <p className="text-[11px] text-slate-500">
              Review and approve new student registrations before full campus posting privileges are enabled.
            </p>
          </div>
          <span className="text-xs font-extrabold bg-amber-50 text-amber-900 px-2.5 py-1 rounded-full border border-amber-200">
            {pendingRegistrations.length} Pending Approval
          </span>
        </div>

        {approvalToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-in fade-in">
            {approvalToast}
          </div>
        )}

        {pendingRegistrations.length === 0 ? (
          <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <CheckCircle2 size={24} className="mx-auto text-teal-600 mb-1" />
            <p className="font-bold text-slate-800">All registered student accounts are approved!</p>
            <p className="text-[11px] text-slate-500 mt-0.5">New account registrations submitted by students will appear here for admin sign-off.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRegistrations.map((user) => (
              <div key={user.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{user.nickname}</span>
                      <span className="text-[10px] font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-md">
                        {user.department} ({user.level})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 font-medium mt-0.5">
                      👤 Student Real Name: <span className="font-bold text-slate-900">{user.realName}</span>
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Matric Number: <span className="font-mono font-bold text-slate-800">{user.matricNumber || '24/MBS/012'}</span> • Phone: <span className="font-bold text-teal-700">{user.emergencyHomePhone || 'N/A'}</span>
                    </p>
                  </div>

                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full border bg-amber-100 text-amber-900 border-amber-300">
                    ⏳ AWAITING ADMIN APPROVAL
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-800">Bio:</span> {user.bio}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleApproveRegistration(user.id, user.nickname)}
                    className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve Student Registration</span>
                  </button>

                  <button
                    onClick={() => handleRejectRegistration(user.id, user.nickname)}
                    className="py-2 px-4 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADMIN MARKETPLACE MIDDLEMAN TRADE DESK */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-teal-900">
              <ShoppingBag className="w-4 h-4 text-teal-600" /> Admin Marketplace Middleman Control Desk ({adminTradeRequests.length})
            </h2>
            <p className="text-[11px] text-slate-500">
              Admin acts as trusted middleman: contact sellers privately, verify availability, & arrange safe campus meet-ups.
            </p>
          </div>
          <span className="text-xs font-bold bg-teal-50 text-teal-800 px-2.5 py-1 rounded-full border border-teal-200">
            Zero Escrow / Safe Meetups
          </span>
        </div>

        <div className="space-y-3">
          {adminTradeRequests.map((req) => (
            <div key={req.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 text-sm">{req.buyerNickname}</span>
                    <span className="text-[10px] text-slate-500">wants to buy</span>
                    <span className="font-extrabold text-teal-800">{req.itemTitle}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Listed by <span className="font-bold text-slate-800">{req.sellerNickname}</span> for <span className="font-bold text-teal-700">₦{req.price.toLocaleString()}</span> • Meet-up: <span className="font-bold">{req.meetupPoint}</span>
                  </p>
                </div>

                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                  req.status === 'CONFIRMED_AVAILABLE' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                  req.status === 'SELLER_CONTACTED' ? 'bg-indigo-100 text-indigo-900 border-indigo-300' :
                  req.status === 'UNAVAILABLE' ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  {req.status === 'CONFIRMED_AVAILABLE' ? '✅ AVAILABLE & MEET-UP ARRANGED' :
                   req.status === 'SELLER_CONTACTED' ? '📲 SELLER CONTACTED PRIVATELY' :
                   req.status === 'UNAVAILABLE' ? '❌ ITEM UNAVAILABLE' : '🔔 PENDING ADMIN SELLER CHECK'}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white border border-slate-200/80 text-[11px] text-slate-700">
                <span className="font-bold text-slate-900">Admin Log:</span> {req.adminNote}
              </div>

              {/* Admin Actions */}
              <div className="flex gap-2 pt-1 flex-wrap">
                <button
                  onClick={() => {
                    setAdminTradeRequests(prev => prev.map(r => r.id === req.id ? {
                      ...r,
                      status: 'SELLER_CONTACTED',
                      adminNote: `Admin sent private prompt to ${req.sellerNickname}: 'A verified student (${req.buyerNickname}) is ready to buy your ${req.itemTitle} for ₦${req.price.toLocaleString()}. Do you still have it available?'`
                    } : r));
                  }}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <PhoneCall size={13} />
                  <span>Contact Seller Privately</span>
                </button>

                <button
                  onClick={() => {
                    setAdminTradeRequests(prev => prev.map(r => r.id === req.id ? {
                      ...r,
                      status: 'CONFIRMED_AVAILABLE',
                      adminNote: `Seller ${req.sellerNickname} confirmed item is available! Both buyer and seller notified for safe campus exchange at ${req.meetupPoint}.`
                    } : r));
                  }}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <CheckCircle2 size={13} />
                  <span>Confirm & Schedule Meet-up</span>
                </button>

                <button
                  onClick={() => {
                    setAdminTradeRequests(prev => prev.map(r => r.id === req.id ? {
                      ...r,
                      status: 'UNAVAILABLE',
                      adminNote: `Seller informed Admin item was sold elsewhere. Buyer ${req.buyerNickname} notified.`
                    } : r));
                  }}
                  className="py-1.5 px-3 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs transition-colors"
                >
                  Mark Unavailable
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confidential Private Chat with Admin Hotline */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-teal-600" /> Confidential Private Admin Hotline
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
            Strictly Private
          </span>
        </div>

        <div className="h-40 overflow-y-auto space-y-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl max-w-[85%] ${
                msg.sender === 'user'
                  ? 'bg-teal-600 text-white ml-auto text-right'
                  : 'bg-white text-slate-800 border border-slate-200 mr-auto'
              }`}
            >
              <p className="font-medium">{msg.text}</p>
              <span className={`text-[9px] mt-0.5 block opacity-75`}>{msg.time}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendChatMessage} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type private confidential message to FUHSI Admin..."
            className="flex-1 text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Admin Student Identity & Emergency Phone Lookup */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-600" /> Student Identity & Secret Phone Vault
        </h2>
        <p className="text-xs text-slate-500">
          Search matriculation number or handle to decrypt student real identity & emergency home contact:
        </p>

        <form onSubmit={handleLookup} className="flex gap-2">
          <input
            type="text"
            value={lookupQuery}
            onChange={(e) => setLookupQuery(e.target.value)}
            placeholder="Enter @nickname or Matric No..."
            className="flex-1 text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors"
          >
            Decrypt Lookup
          </button>
        </form>

        {lookupResult && (
          <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs space-y-1.5 animate-in fade-in">
            <p className="font-bold text-indigo-950 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-indigo-600" /> Decrypted Student Record:
            </p>
            <div className="grid grid-cols-2 gap-2 text-indigo-900 font-medium">
              <div>
                <span className="text-slate-500 block text-[10px]">REAL NAME:</span>
                <span className="font-bold">{lookupResult.realName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">MATRIC NUMBER:</span>
                <span className="font-bold">{lookupResult.matricNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">COMPULSORY PHONE:</span>
                <span className="font-bold text-teal-700">{lookupResult.emergencyHomePhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">DEPARTMENT:</span>
                <span className="font-bold">{lookupResult.department}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Factor Verification Candidates Review Queue */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-teal-800">
              <UserCheck className="w-4 h-4 text-teal-600" /> Automated Verification Eligibility Queue
            </h2>
            <p className="text-[11px] text-slate-500">
              Students who met multi-factor formula (90+ days tenure, 0 strikes, 1200+ rep score, quality posts)
            </p>
          </div>
          <span className="text-xs font-extrabold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            {verifCandidates.filter(c => c.status === 'ELIGIBLE_PENDING_ADMIN').length} Pending Approval
          </span>
        </div>

        <div className="space-y-3">
          {verifCandidates.map((cand) => (
            <div key={cand.id} className={`p-3.5 rounded-xl border space-y-2.5 text-xs ${
              cand.status === 'APPROVED_VERIFIED' ? 'bg-emerald-50/60 border-emerald-200' :
              cand.status === 'REJECTED' ? 'bg-rose-50/60 border-rose-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{cand.nickname}</span>
                    <span className="text-[10px] font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-md">
                      {cand.department} ({cand.level})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    👤 Encrypted Identity: <span className="font-bold text-slate-900">{cand.realName}</span> • Matric: <span className="font-mono text-slate-800">{cand.matricNumber}</span>
                  </p>
                </div>

                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                  cand.status === 'APPROVED_VERIFIED' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                  cand.status === 'REJECTED' ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  {cand.status === 'APPROVED_VERIFIED' ? '✔️ VERIFIED BY ADMIN' :
                   cand.status === 'REJECTED' ? '❌ REJECTED' : '🔔 AUTO-ELIGIBLE: PENDING ADMIN'}
                </span>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-2.5 rounded-lg border border-slate-200/80 text-center text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Tenure</span>
                  <span className="font-black text-slate-800">{cand.accountAgeDays} days</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Rep Score</span>
                  <span className="font-black text-amber-600">{cand.reputationScore} pts</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Likes / Comments</span>
                  <span className="font-black text-teal-700">{cand.likesReceived} 👍 / {cand.commentsCount} 💬</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Violations</span>
                  <span className="font-black text-emerald-600">{cand.strikes} strikes (Clean)</span>
                </div>
              </div>

              {cand.status === 'ELIGIBLE_PENDING_ADMIN' && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setVerifCandidates(prev => prev.map(c => c.id === cand.id ? { ...c, status: 'APPROVED_VERIFIED' } : c));
                      onUpdateBadge('GOLD', 'Verified Gold Campus Contributor');
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve Official Verification</span>
                  </button>

                  <button
                    onClick={() => {
                      setVerifCandidates(prev => prev.map(c => c.id === cand.id ? { ...c, status: 'REJECTED' } : c));
                    }}
                    className="px-4 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs transition-colors"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Admin Badge & Reputation Manager */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-600" /> Badge Tier & Reputation Score Manager
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Badge Tier</label>
            <select
              value={selectedBadgeType}
              onChange={(e) => setSelectedBadgeType(e.target.value as BadgeType)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 bg-white font-bold"
            >
              <option value="BLUE">BLUE (Trusted Leader)</option>
              <option value="GREEN">GREEN (SUG Official)</option>
              <option value="PURPLE">PURPLE (System Admin)</option>
              <option value="GOLD">GOLD (Honorary Member)</option>
              <option value="NONE">NONE (Standard Student)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Badge Title</label>
            <input
              type="text"
              value={badgeTitleInput}
              onChange={(e) => setBadgeTitleInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Reputation Score (Pts)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={reputationInput}
              onChange={(e) => setReputationInput(Number(e.target.value))}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800"
            />
            <button
              onClick={() => setReputationInput((r) => r + 50)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs"
            >
              +50
            </button>
            <button
              onClick={() => setReputationInput((r) => Math.max(0, r - 50))}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs"
            >
              -50
            </button>
          </div>
        </div>

        {adminUpdateToast && (
          <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl text-center">
            ✓ Admin changes saved successfully!
          </p>
        )}

        <button
          onClick={handleSaveBadgeAndRep}
          className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-colors"
        >
          Update Student Badges & Score
        </button>
      </div>

      {/* Marketplace Price Review & Benchmark Queue */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          🛍️ Marketplace Price Review & Benchmark Queue ({pendingMarketplaceItems.length})
        </h2>

        {pendingMarketplaceItems.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No pending marketplace items awaiting review.</p>
        ) : (
          <div className="space-y-3">
            {pendingMarketplaceItems.map((item) => (
              <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">{item.title}</h3>
                    <p className="text-[11px] text-slate-500">
                      Seller: {item.sellerNickname} • Asking Price: ₦{item.askingPrice.toLocaleString()}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                    PENDING REVIEW
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onAdminApproveMarketplaceItem(item.id, item.askingPrice, 'Approved at asking price')}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Approve ₦{item.askingPrice.toLocaleString()}
                  </button>

                  <button
                    onClick={() => {
                      setAdvisoryItem(item);
                      setSuggestedPrice(Math.round(item.askingPrice * 0.9));
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors"
                  >
                    Suggest Price
                  </button>

                  <button
                    onClick={() => onAdminRejectMarketplaceItem(item.id, 'Price exceeds campus benchmark')}
                    className="py-1.5 px-3 rounded-lg bg-rose-100 text-rose-800 font-bold hover:bg-rose-200 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Moderation Council Queue */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-rose-700">
          <AlertTriangle className="w-4 h-4" /> Moderation Council Flagged Posts ({flaggedPosts.length})
        </h2>

        {flaggedPosts.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No flagged posts requiring moderation attention.</p>
        ) : (
          <div className="space-y-3">
            {flaggedPosts.map((post) => (
              <div key={post.id} className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-rose-950">{post.authorNickname}</span>
                  <span className="text-[10px] text-rose-700 font-semibold">{post.timestamp}</span>
                </div>
                <p className="text-slate-800">{post.content}</p>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onDeletePost(post.id)}
                    className="flex-1 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors"
                  >
                    Delete Post
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: SUGGEST PRICE ADVISORY */}
      {advisoryItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Send Price Advisory Note</h3>
              <button onClick={() => setAdvisoryItem(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-600">
                Item: <span className="font-bold text-slate-900">{advisoryItem.title}</span> (Asking: ₦{advisoryItem.askingPrice.toLocaleString()})
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Suggested Price Benchmark (₦)</label>
                <input
                  type="number"
                  value={suggestedPrice}
                  onChange={(e) => setSuggestedPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Advisory Message to Seller</label>
                <textarea
                  value={advisoryMsg}
                  onChange={(e) => setAdvisoryMsg(e.target.value)}
                  placeholder="e.g. SUG Commerce suggests lowering asking price to match current 300L student market rate..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 p-2 text-slate-800"
                />
              </div>

              <button
                onClick={handleSendAdvisory}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Send Price Advisory Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
