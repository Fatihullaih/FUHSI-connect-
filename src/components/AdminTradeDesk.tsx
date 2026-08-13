import React, { useState, useEffect } from 'react';
import { MarketplaceItem, UserProfile, Report } from '../types';
import { 
  MarketplaceTransaction, 
  TransactionStatus, 
  getStoredTransactions, 
  saveStoredTransactions, 
  upsertTransaction, 
  updateTransactionStatus 
} from '../utils/tradeDeskUtils';
import { 
  ShieldCheck, 
  Tag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  MessageSquare, 
  Send, 
  Phone, 
  User, 
  MapPin, 
  Search, 
  DollarSign, 
  RefreshCw, 
  FileText,
  Lock,
  ShoppingBag,
  Info,
  Check
} from 'lucide-react';

interface AdminTradeDeskProps {
  userProfile: UserProfile | null;
  approvedMarketplaceItems: MarketplaceItem[];
  pendingMarketplaceItems: MarketplaceItem[];
  reports?: Report[];
  onAdminApproveMarketplaceItem: (id: string, approvedPrice: number, note: string) => void;
  onAdminRejectMarketplaceItem: (id: string, note: string) => void;
  onResolveReport?: (reportId: string) => void;
}

export const AdminTradeDesk: React.FC<AdminTradeDeskProps> = ({
  userProfile,
  approvedMarketplaceItems = [],
  pendingMarketplaceItems = [],
  reports = [],
  onAdminApproveMarketplaceItem,
  onAdminRejectMarketplaceItem,
  onResolveReport,
}) => {
  // Guard Check
  if (!userProfile?.isAdmin) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-center space-y-2">
        <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
        <h3 className="font-extrabold text-sm">Access Denied</h3>
        <p className="text-xs">Only authenticated administrators can view or access the Admin Trade Desk.</p>
      </div>
    );
  }

  // Active Trade Desk Sub-Tab State
  const [activeSubTab, setActiveSubTab] = useState<'TRANSACTIONS' | 'PENDING' | 'DIRECTORY' | 'COMPLAINTS' | 'MESSENGER'>('TRANSACTIONS');

  // Transactions State
  const [transactions, setTransactions] = useState<MarketplaceTransaction[]>(() => getStoredTransactions());

  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  // Transaction Status Filter
  const [txFilter, setTxFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'RETURNED' | 'COMPLAINTS'>('ALL');

  // Seller Directory Search
  const [directorySearch, setDirectorySearch] = useState('');

  // Messenger / Contact Seller or Buyer State
  const [recipientNick, setRecipientNick] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messageToast, setMessageToast] = useState<string | null>(null);

  // Price Advisory Modal State
  const [advisoryItem, setAdvisoryItem] = useState<MarketplaceItem | null>(null);
  const [suggestedPrice, setSuggestedPrice] = useState<number>(0);
  const [advisoryNote, setAdvisoryNote] = useState('');

  // Status Badge Helper
  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] flex items-center gap-1">⏳ PENDING REVIEW</span>;
      case 'APPROVED_LIVE':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-[10px] flex items-center gap-1">✅ APPROVED & LIVE</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300 font-extrabold text-[10px] flex items-center gap-1">❌ REJECTED</span>;
      case 'BUYER_REQUEST_LOGGED':
        return <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300 font-extrabold text-[10px] flex items-center gap-1">📩 BUYER REQUEST LOGGED</span>;
      case 'IN_NEGOTIATION':
        return <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 font-extrabold text-[10px] flex items-center gap-1">💬 IN NEGOTIATION</span>;
      case 'MEETUP_SCHEDULED':
        return <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-300 font-extrabold text-[10px] flex items-center gap-1">📍 MEETUP SCHEDULED</span>;
      case 'COMPLETED_SOLD':
        return <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white border border-slate-700 font-extrabold text-[10px] flex items-center gap-1">✓ COMPLETED & SOLD</span>;
      case 'RETURNED_DISPUTED':
        return <span className="px-2.5 py-1 rounded-full bg-rose-200 text-rose-950 border border-rose-400 font-extrabold text-[10px] flex items-center gap-1">⚠️ RETURNED / DISPUTED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-[10px]">{status}</span>;
    }
  };

  // Handler: Change Transaction Status
  const handleStatusChange = (txId: string, newStatus: TransactionStatus) => {
    const updated = updateTransactionStatus(txId, newStatus);
    setTransactions(updated);
  };

  // Handler: Update Transaction Note
  const handleNoteUpdate = (txId: string, noteText: string) => {
    const nextList = transactions.map((t) => (t.id === txId ? { ...t, adminNotes: noteText, updatedAt: new Date().toISOString() } : t));
    setTransactions(nextList);
    saveStoredTransactions(nextList);
  };

  // Handler: Dispatch Official Admin Trade Desk Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientNick.trim() || !messageText.trim()) return;

    const cleanNick = recipientNick.trim().toLowerCase().replace(/^@/, '');
    const notifKey = `fuhsi_user_notifications_${cleanNick}`;

    const adminNotif = {
      id: `admin_msg_${Date.now()}`,
      type: 'ADMIN_TRADE_DESK',
      title: '🛡️ Official Message from FUHSI Admin Trade Desk',
      message: messageText.trim(),
      timestamp: 'Just now',
      isRead: false,
      senderNickname: '🛡️ FUHSI Admin Trade Desk',
    };

    try {
      const existingStr = localStorage.getItem(notifKey);
      const existing = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem(notifKey, JSON.stringify([adminNotif, ...existing]));
    } catch (err) {
      console.error(err);
    }

    setMessageToast(`✓ Message dispatched to @${cleanNick} inbox & trade notifications!`);
    setMessageText('');
    setTimeout(() => setMessageToast(null), 4000);
  };

  // Filtered Transactions
  const filteredTransactions = transactions.filter((t) => {
    if (txFilter === 'ACTIVE') return t.status === 'IN_NEGOTIATION' || t.status === 'MEETUP_SCHEDULED' || t.status === 'BUYER_REQUEST_LOGGED';
    if (txFilter === 'COMPLETED') return t.status === 'COMPLETED_SOLD';
    if (txFilter === 'RETURNED') return t.status === 'RETURNED_DISPUTED';
    if (txFilter === 'COMPLAINTS') return t.hasComplaint === true;
    return true;
  });

  // All Sellers Directory
  const allListings = [...pendingMarketplaceItems, ...approvedMarketplaceItems];

  const filteredDirectory = allListings.filter((item) => {
    if (!directorySearch.trim()) return true;
    const q = directorySearch.toLowerCase();
    return (
      item.sellerNickname.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-teal-200/80 shadow-md p-4 sm:p-5 space-y-4">
      {/* Admin Trade Desk Main Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 border border-teal-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 font-extrabold text-xl shrink-0">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base sm:text-lg">FUHSI Admin Trade Desk</h2>
              <span className="px-2 py-0.5 rounded-full bg-teal-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                Admin Exclusive
              </span>
            </div>
            <p className="text-xs text-teal-200 font-medium">
              Central Management for Student Listings, Middleman Transactions, Price Review & Disputes
            </p>
          </div>
        </div>

        {/* Quick Trade Desk Counter Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 font-bold flex items-center gap-1.5">
            <Clock size={14} />
            <span>{pendingMarketplaceItems.length} Pending</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 font-bold flex items-center gap-1.5">
            <ShoppingBag size={14} />
            <span>{approvedMarketplaceItems.length} Live Items</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-bold flex items-center gap-1.5">
            <MessageSquare size={14} />
            <span>{transactions.length} Total Tx</span>
          </div>
        </div>
      </div>

      {/* Trade Desk Sub-Navigation Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('TRANSACTIONS')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'TRANSACTIONS'
              ? 'bg-teal-700 text-white shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900 font-semibold'
          }`}
        >
          <FileText size={14} />
          <span>Transactions & Requests ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PENDING')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 relative cursor-pointer ${
            activeSubTab === 'PENDING'
              ? 'bg-teal-700 text-white shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900 font-semibold'
          }`}
        >
          <Clock size={14} />
          <span>Pending Review ({pendingMarketplaceItems.length})</span>
          {pendingMarketplaceItems.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('DIRECTORY')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'DIRECTORY'
              ? 'bg-teal-700 text-white shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900 font-semibold'
          }`}
        >
          <User size={14} />
          <span>Sellers Directory ({allListings.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('COMPLAINTS')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'COMPLAINTS'
              ? 'bg-teal-700 text-white shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900 font-semibold'
          }`}
        >
          <AlertTriangle size={14} />
          <span>Disputes & Complaints</span>
        </button>

        <button
          onClick={() => setActiveSubTab('MESSENGER')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'MESSENGER'
              ? 'bg-teal-700 text-white shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900 font-semibold'
          }`}
        >
          <Send size={14} />
          <span>Contact User</span>
        </button>
      </div>

      {/* SUB-TAB 1: TRANSACTIONS & BUYER REQUESTS */}
      {activeSubTab === 'TRANSACTIONS' && (
        <div className="space-y-3">
          {/* Status Filter Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>Managed Marketplace Transactions</span>
            </h3>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-wrap text-xs">
              <button
                onClick={() => setTxFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  txFilter === 'ALL' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({transactions.length})
              </button>
              <button
                onClick={() => setTxFilter('ACTIVE')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  txFilter === 'ACTIVE' ? 'bg-indigo-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Negotiation / Meetup ({transactions.filter(t => t.status === 'IN_NEGOTIATION' || t.status === 'MEETUP_SCHEDULED').length})
              </button>
              <button
                onClick={() => setTxFilter('COMPLETED')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  txFilter === 'COMPLETED' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed ({transactions.filter(t => t.status === 'COMPLETED_SOLD').length})
              </button>
              <button
                onClick={() => setTxFilter('RETURNED')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  txFilter === 'RETURNED' ? 'bg-rose-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Returned / Disputed ({transactions.filter(t => t.status === 'RETURNED_DISPUTED').length})
              </button>
            </div>
          </div>

          {/* Transactions List */}
          {filteredTransactions.length === 0 ? (
            <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              No transactions match the selected filter.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-slate-900 text-sm">{tx.itemTitle}</h4>
                        <span className="text-[10px] font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-md">
                          ₦{tx.itemPrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Cat: {tx.itemCategory}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        📍 Preferred Meetup: <strong className="text-slate-800">{tx.meetupPoint}</strong>
                      </p>
                    </div>

                    <div className="shrink-0">
                      {getStatusBadge(tx.status)}
                    </div>
                  </div>

                  {/* Buyer & Seller Contact Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] block">SELLER DETAILS</span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-extrabold text-slate-900">{tx.sellerNickname}</span>
                        <span className="font-mono text-teal-800 font-bold">{tx.sellerPhone}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] block">BUYER REQUEST DETAILS</span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-extrabold text-slate-900">{tx.buyerNickname || 'Pending Inquiry'}</span>
                        <span className="font-mono text-teal-800 font-bold">{tx.buyerPhone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dispute Note if any */}
                  {tx.hasComplaint && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-[11px] font-medium flex items-start gap-1.5">
                      <AlertTriangle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-extrabold">Marketplace Dispute / Complaint Logged:</strong>
                        <p>{tx.complaintReason}</p>
                      </div>
                    </div>
                  )}

                  {/* Admin Notes Box */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">
                      Admin Trade Desk Permanent Log & Internal Notes
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tx.adminNotes}
                        onChange={(e) => handleNoteUpdate(tx.id, e.target.value)}
                        placeholder="Add permanent transaction notes..."
                        className="flex-1 text-xs rounded-lg border border-slate-300 p-2 text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  {/* Action Bar: Manage Transaction State */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/80 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-500">Update Status:</span>

                      <button
                        onClick={() => handleStatusChange(tx.id, 'IN_NEGOTIATION')}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          tx.status === 'IN_NEGOTIATION'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        In Negotiation
                      </button>

                      <button
                        onClick={() => handleStatusChange(tx.id, 'MEETUP_SCHEDULED')}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          tx.status === 'MEETUP_SCHEDULED'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        Meetup Scheduled
                      </button>

                      <button
                        onClick={() => handleStatusChange(tx.id, 'COMPLETED_SOLD')}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          tx.status === 'COMPLETED_SOLD'
                            ? 'bg-slate-900 text-white'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                        }`}
                      >
                        ✓ Mark Completed & Sold
                      </button>

                      <button
                        onClick={() => handleStatusChange(tx.id, 'RETURNED_DISPUTED')}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          tx.status === 'RETURNED_DISPUTED'
                            ? 'bg-rose-700 text-white'
                            : 'bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200'
                        }`}
                      >
                        ⚠️ Returned / Disputed
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setRecipientNick(tx.sellerNickname);
                        setActiveSubTab('MESSENGER');
                      }}
                      className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-[11px] flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Send size={12} /> Contact Seller
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: PENDING REVIEW QUEUE */}
      {activeSubTab === 'PENDING' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              Pending Marketplace Listings Queue ({pendingMarketplaceItems.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Review seller asking prices against campus benchmark before publishing live.
            </span>
          </div>

          {pendingMarketplaceItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <CheckCircle2 size={24} className="mx-auto text-teal-600" />
              <p className="font-bold text-slate-800">No pending marketplace submissions awaiting review!</p>
              <p className="text-[11px] text-slate-500">
                New marketplace posts submitted by students will automatically queue here for Admin Price Benchmark review.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMarketplaceItems.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {item.imageUrls?.[0] && (
                        <img
                          src={item.imageUrls[0]}
                          alt={item.title}
                          className="w-16 h-16 rounded-xl object-cover border border-amber-300 shrink-0 shadow-2xs"
                        />
                      )}
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{item.title}</h4>
                        <p className="text-[11px] text-slate-700 mt-0.5">
                          Category: <span className="font-bold text-slate-900">{item.category}</span> • Condition: <span className="font-bold text-teal-800">{item.conditionTag}</span>
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Seller: <strong className="text-slate-900">{item.sellerNickname}</strong> ({item.sellerPhone}) • Meetup: <strong>{item.meetupPoint}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500 italic mt-1 bg-white p-2 rounded-lg border border-amber-200">
                          "{item.description}"
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Seller Asking Price</span>
                      <span className="text-base font-black text-teal-900">₦{item.askingPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/80 flex-wrap">
                    <button
                      onClick={() => onAdminApproveMarketplaceItem(item.id, item.askingPrice, 'Approved at asking price')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 size={14} /> Approve ₦{item.askingPrice.toLocaleString()}
                    </button>

                    <button
                      onClick={() => {
                        setAdvisoryItem(item);
                        setSuggestedPrice(Math.round(item.askingPrice * 0.85));
                      }}
                      className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <DollarSign size={14} /> Suggest Benchmark
                    </button>

                    <button
                      onClick={() => onAdminRejectMarketplaceItem(item.id, 'Price exceeds campus benchmark or invalid photos')}
                      className="px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: SELLERS & LISTINGS DIRECTORY */}
      {activeSubTab === 'DIRECTORY' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              Campus Sellers & Listings Directory ({allListings.length})
            </h3>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder="Search seller @nickname or title..."
                className="w-full text-xs rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {filteredDirectory.length === 0 ? (
            <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl text-xs">
              No listings found matching "{directorySearch}".
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDirectory.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-3">
                    {item.imageUrls?.[0] && (
                      <img src={item.imageUrls[0]} alt={item.title} className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                    )}
                    <div>
                      <h4 className="font-extrabold text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        Seller: <strong className="text-teal-800">{item.sellerNickname}</strong> ({item.sellerPhone}) • Price: <strong className="text-slate-900">₦{(item.adminApprovedPrice ?? item.askingPrice).toLocaleString()}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      item.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      item.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      item.status === 'SOLD' ? 'bg-slate-200 text-slate-700' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.status}
                    </span>

                    <button
                      onClick={() => {
                        setRecipientNick(item.sellerNickname);
                        setActiveSubTab('MESSENGER');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Send size={10} /> Message Seller
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: DISPUTES & COMPLAINTS */}
      {activeSubTab === 'COMPLAINTS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
              <AlertTriangle size={14} />
              <span>Marketplace Complaints & Dispute Resolution</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Admin Middleman intervention to protect campus trust.
            </span>
          </div>

          {transactions.filter(t => t.hasComplaint).length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <CheckCircle2 size={24} className="mx-auto text-emerald-600" />
              <p className="font-bold text-slate-800">No active marketplace transaction complaints or disputes!</p>
              <p className="text-[11px] text-slate-500">
                All middleman trades are running smoothly with high trust.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.filter(t => t.hasComplaint).map((tx) => (
                <div key={tx.id} className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2.5 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-rose-950 text-sm">{tx.itemTitle}</h4>
                      <p className="text-[11px] text-slate-700 mt-0.5">
                        Seller: <strong>{tx.sellerNickname}</strong> • Buyer: <strong>{tx.buyerNickname}</strong>
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-rose-200 text-rose-900 font-extrabold text-[10px] border border-rose-300">
                      DISPUTE OPEN
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-rose-200 text-slate-800 font-medium">
                    <span className="text-[10px] font-extrabold text-rose-700 uppercase block">COMPLAINT STATEMENT:</span>
                    <p className="mt-0.5 text-[11px]">{tx.complaintReason}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleStatusChange(tx.id, 'RETURNED_DISPUTED')}
                      className="px-3 py-1.5 rounded-lg bg-rose-700 text-white font-extrabold text-xs hover:bg-rose-800 transition-colors cursor-pointer"
                    >
                      Authorize Return & Cancel Trade
                    </button>

                    <button
                      onClick={() => handleStatusChange(tx.id, 'COMPLETED_SOLD')}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Dismiss Complaint & Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 5: DIRECT MESSENGER */}
      {activeSubTab === 'MESSENGER' && (
        <div className="space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Send size={14} className="text-teal-600" />
              <span>Contact Seller or Buyer via Official Admin Trade Desk</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Send an official system message directly into any student's in-app inbox and trade notifications.
            </p>
          </div>

          {messageToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-xs rounded-xl animate-in fade-in">
              {messageToast}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Student Username / Nickname</label>
              <input
                type="text"
                value={recipientNick}
                onChange={(e) => setRecipientNick(e.target.value)}
                placeholder="e.g. @fuhsileader or @medstudent_2026"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-900 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Trade Desk Message Content</label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="e.g. FUHSI Admin Trade Desk notice: Please bring your stethoscope to SUG Secretariat for buyer physical inspection at 3:00 PM."
                rows={3}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send size={14} />
              <span>Dispatch Message from FUHSI Admin Trade Desk</span>
            </button>
          </form>
        </div>
      )}

      {/* MODAL: SUGGEST BENCHMARK PRICE */}
      {advisoryItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm">Send Benchmark Price Advisory Note</h3>
              <button onClick={() => setAdvisoryItem(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-2">
              <p className="text-slate-600">
                Item: <span className="font-extrabold text-slate-900">{advisoryItem.title}</span> (Seller Asking: ₦{advisoryItem.askingPrice.toLocaleString()})
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Suggested Benchmark Price (₦)</label>
                <input
                  type="number"
                  value={suggestedPrice}
                  onChange={(e) => setSuggestedPrice(Number(e.target.value))}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2 text-slate-900 font-bold bg-white"
                />
              </div>

              <button
                onClick={() => {
                  onAdminApproveMarketplaceItem(advisoryItem.id, suggestedPrice, `Approved at adjusted benchmark ₦${suggestedPrice.toLocaleString()}`);
                  setAdvisoryItem(null);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-colors"
              >
                Approve at ₦{suggestedPrice.toLocaleString()} Benchmark Price
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
