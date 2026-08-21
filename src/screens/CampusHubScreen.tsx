import React, { useState, useEffect, useMemo } from 'react';
import { MarketplaceItem, UserProfile, DirectMessage, ChatConversation } from '../types';
import { 
  ShoppingBag, 
  ShieldCheck, 
  MapPin, 
  Eye, 
  Plus, 
  Star, 
  Send, 
  Camera, 
  AlertCircle, 
  Clock, 
  Info, 
  ShieldAlert, 
  Lock, 
  Upload, 
  Trash2, 
  Search, 
  User, 
  X, 
  CheckCircle2, 
  SlidersHorizontal, 
  ChevronRight, 
  ExternalLink, 
  MessageCircle, 
  Tag,
  BadgePercent,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { checkIsUserVerified } from '../utils/verificationUtils';
import { compressImageFile } from '../utils/imageUtils';
import { VerificationModal } from '../components/VerificationModal';
import { getStoredDirectMessages, sendDirectMessage, CONVERSATIONS_KEY, formatMessageTime } from '../utils/messagingUtils';

interface CampusHubScreenProps {
  userProfile: UserProfile | null;
  approvedMarketplaceItems: MarketplaceItem[];
  pendingMarketplaceItems?: MarketplaceItem[];
  onSubmitMarketplaceItem: (itemData: {
    title: string;
    category: string;
    askingPrice: number;
    conditionTag: string;
    description: string;
    sellerPhone: string;
    meetupPoint: string;
    imageUrls: string[];
  }) => void;
  onRecordDmBuyIntent: (itemId: string) => void;
  onMarkAsSold: (itemId: string, ratingStars: number, ratingTag: string) => void;
  onApplyVerificationWithFee: () => void;
  onAuthorClick?: (post: any) => void;
  onOpenAdminConsole?: () => void;
}

// Category definitions matching the design
const CATEGORY_OPTIONS = [
  { id: 'All', label: 'All', icon: '📦' },
  { id: 'Phones', label: 'Phones', icon: '📱' },
  { id: 'Digital', label: 'Digital', icon: '📁' },
  { id: 'Services', label: 'Services', icon: '🛠️' },
  { id: 'Electronics', label: 'Electronics', icon: '💻' },
  { id: 'Fashion', label: 'Fashion', icon: '👕' },
  { id: 'Medical Equipment', label: 'Medical Equipment', icon: '🩺' },
  { id: 'Textbooks', label: 'Textbooks', icon: '📚' },
  { id: 'Housing', label: 'Housing', icon: '🏠' },
];

export const formatPriceShort = (price: number): string => {
  if (!price && price !== 0) return '₦0';
  if (price >= 1000000) {
    const m = price / 1000000;
    return `₦${m % 1 === 0 ? m : m.toFixed(1)}M`;
  }
  if (price >= 1000) {
    const k = price / 1000;
    return `₦${k % 1 === 0 ? k : k.toFixed(1)}K`;
  }
  return `₦${price.toLocaleString()}`;
};

/**
 * Calculates human-readable sold status and 7-day auto-purge expiration
 */
export function getSoldStatusInfo(item: MarketplaceItem): {
  isSold: boolean;
  soldBadgeText: string;
  isExpired: boolean;
  daysAgo: number;
} {
  if (item.status !== 'SOLD') {
    return { isSold: false, soldBadgeText: '', isExpired: false, daysAgo: -1 };
  }

  // Parse sold date or fallback to now
  const soldTimestamp = item.soldAt ? new Date(item.soldAt).getTime() : Date.now();
  const diffMs = Date.now() - soldTimestamp;
  const daysAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  // If sold more than 7 days ago, it is expired and must be purged
  if (daysAgo > 7) {
    return { isSold: true, soldBadgeText: 'Expired', isExpired: true, daysAgo };
  }

  if (daysAgo === 0) {
    return { isSold: true, soldBadgeText: 'Sold today', isExpired: false, daysAgo: 0 };
  } else if (daysAgo === 1) {
    return { isSold: true, soldBadgeText: 'Sold 1 day ago', isExpired: false, daysAgo: 1 };
  } else {
    return { isSold: true, soldBadgeText: `Sold ${daysAgo} days ago`, isExpired: false, daysAgo };
  }
}

export const CampusHubScreen: React.FC<CampusHubScreenProps> = ({
  userProfile,
  approvedMarketplaceItems = [],
  pendingMarketplaceItems = [],
  onSubmitMarketplaceItem,
  onRecordDmBuyIntent,
  onMarkAsSold,
  onApplyVerificationWithFee: _onApplyVerificationWithFee,
  onAuthorClick,
  onOpenAdminConsole: _onOpenAdminConsole,
}) => {
  // Navigation & filter state
  const [activeView, setActiveView] = useState<'listings' | 'my_trades'>('listings');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Item Details Preview Modal State (Picture 2)
  const [detailsModalItem, setDetailsModalItem] = useState<MarketplaceItem | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);

  // Sell Item Form Modal State
  const [showSellModal, setShowSellModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Phones');
  const [askingPrice, setAskingPrice] = useState<number | ''>('');
  const [conditionTag, setConditionTag] = useState('New');
  const [description, setDescription] = useState('');
  const [sellerPhone] = useState(userProfile?.emergencyHomePhone || '');
  const [meetupPoint, setMeetupPoint] = useState('FUHSI School Main Gate');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [sellSuccessMsg, setSellSuccessMsg] = useState(false);
  const [formError, setFormError] = useState('');

  // Buy Intent & Middleman Modal State
  const [buyModalItem, setBuyModalItem] = useState<MarketplaceItem | null>(null);
  const [pledgeChecked, setPledgeChecked] = useState(false);
  const [buyIntentSuccess, setBuyIntentSuccess] = useState(false);
  const [showMarketplaceLockModal, setShowMarketplaceLockModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Mark Sold Modal State
  const [soldModalItem, setSoldModalItem] = useState<MarketplaceItem | null>(null);
  const [soldSuccessNotify, setSoldSuccessNotify] = useState(false);

  const isVerifiedUser = checkIsUserVerified(userProfile?.nickname, userProfile);

  // Admin Middleman Trade Desk Conversations State
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const stored = localStorage.getItem(CONVERSATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'conv_admin_desk',
        otherUserNickname: '🛡️ Trade Desk',
        lastMessage: 'Trade Desk Active: Connect with buyers & sellers safely on campus.',
        lastTimestamp: formatMessageTime(),
        itemId: 'item_1',
        itemTitle: 'Campus Marketplace Trade Desk',
        itemPrice: 0,
        meetupPoint: 'FUHSI School Main Gate',
        unreadCount: 0
      }
    ];
  });

  const [activeConvId, setActiveConvId] = useState<string | null>('conv_admin_desk');
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>(() => {
    const msgs = getStoredDirectMessages();
    if (msgs.length > 0) return msgs;
    return [
      {
        id: 'dm_admin_1',
        conversationId: 'conv_admin_desk',
        senderNickname: '🛡️ Trade Desk',
        receiverNickname: userProfile?.nickname || '@FUHSI_Student',
        text: 'Welcome to the Official FUHSI Trade Desk!\n\n💡 Safe campus trading with FUHSI-Connect.',
        timestamp: formatMessageTime(),
        isPledgeConfirmed: true
      }
    ];
  });
  const [chatInputText, setChatInputText] = useState('');

  // Listen for direct messages and conversations updates
  useEffect(() => {
    const handleDmUpdated = () => {
      const msgs = getStoredDirectMessages();
      setDirectMessages(msgs);
      try {
        const stored = localStorage.getItem(CONVERSATIONS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setConversations(parsed);
        }
      } catch (e) {}
    };
    window.addEventListener('fuhsi_direct_message_updated', handleDmUpdated);
    return () => window.removeEventListener('fuhsi_direct_message_updated', handleDmUpdated);
  }, []);

  // Popstate listener for back button navigation
  useEffect(() => {
    const handlePopState = () => {
      if (detailsModalItem) {
        setDetailsModalItem(null);
        return;
      }
      if (buyModalItem) {
        setBuyModalItem(null);
        return;
      }
      if (showSellModal) {
        setShowSellModal(false);
        return;
      }
      if (soldModalItem) {
        setSoldModalItem(null);
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [detailsModalItem, buyModalItem, showSellModal, soldModalItem]);

  // Meetup locations
  const meetupLocations = [
    'FUHSI School Main Gate',
    'School Market',
    'Matriculation Pavillion',
    'Owuoluwa Junction',
    'Just-Love Kitchen',
    'College High school Junction',
    'School Hostel',
  ];

  // Price calculations for posting form
  const priceVal = typeof askingPrice === 'number' ? askingPrice : 0;
  const adminFee = Math.round(priceVal * 0.1);
  const netPayout = priceVal - adminFee;

  // Filter listings based on category, search query, and 7-DAY AUTO-PURGE FOR SOLD ITEMS
  const filteredListings = useMemo(() => {
    return approvedMarketplaceItems.filter((item) => {
      // 7-day auto purge for sold items (never show >7 days)
      const soldInfo = getSoldStatusInfo(item);
      if (soldInfo.isExpired) {
        return false;
      }

      const matchesCat =
        selectedCategory === 'All' ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Phones' && item.category?.toLowerCase().includes('phone')) ||
        (selectedCategory === 'Electronics' && (item.category?.toLowerCase().includes('electron') || item.category?.toLowerCase().includes('gadget'))) ||
        (selectedCategory === 'Textbooks' && (item.category?.toLowerCase().includes('book') || item.category?.toLowerCase().includes('study'))) ||
        (selectedCategory === 'Medical Equipment' && (item.category?.toLowerCase().includes('medic') || item.category?.toLowerCase().includes('lab')));

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.sellerNickname?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.meetupPoint?.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [approvedMarketplaceItems, selectedCategory, searchQuery]);

  // Handle Photo upload
  const handlePhotosFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const remainingSlots = 6 - uploadedPhotos.length;
    if (remainingSlots <= 0) return;

    const filesToProcess = files.slice(0, remainingSlots);
    for (const file of filesToProcess) {
      try {
        const compressed = await compressImageFile(file, 800, 800, 0.75);
        setUploadedPhotos((prev) => [...prev, compressed]);
      } catch (err) {
        console.error('Photo compression error:', err);
      }
    }
    e.target.value = '';
  };

  const handleRemoveUploadedPhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Listing Handler
  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Please enter a descriptive item title.');
      return;
    }
    if (!askingPrice || priceVal <= 0) {
      setFormError('Please enter a valid asking price.');
      return;
    }
    if (uploadedPhotos.length < 1) {
      setFormError('Please select at least 1 clear photo of the item from your device.');
      return;
    }

    onSubmitMarketplaceItem({
      title,
      category,
      askingPrice: priceVal,
      conditionTag,
      description,
      sellerPhone,
      meetupPoint,
      imageUrls: uploadedPhotos,
    });

    setSellSuccessMsg(true);
    setTimeout(() => {
      setSellSuccessMsg(false);
      setShowSellModal(false);
      setTitle('');
      setAskingPrice('');
      setDescription('');
      setUploadedPhotos([]);
      setFormError('');
    }, 1600);
  };

  /**
   * Official WhatsApp Trade Desk Routing with 10% Escrow Protection
   * When buyers click WhatsApp, they are routed through the official Trade Desk Coordinator
   * to guarantee the 10% commission for the platform and ensure safe payment & handoff.
   */
  const handleOpenTradeDeskWhatsApp = (item: MarketplaceItem) => {
    const rawPhone = item.sellerPhone || userProfile?.emergencyHomePhone || '08000000000';
    let cleanPhone = rawPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '234' + cleanPhone.substring(1);
    }

    const price = item.adminApprovedPrice ?? item.askingPrice ?? 0;
    const message = `Hello, I saw your listing for "${item.title}" (₦${price.toLocaleString()}) on FUHSI-Connect. I would like to buy it and meet up at ${item.meetupPoint || 'FUHSI School Main Gate'}.`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Buy Intent & Pledge via In-App Admin Desk
  const handleConfirmPledgeAndOpenDM = () => {
    if (!buyModalItem || !pledgeChecked) return;

    onRecordDmBuyIntent(buyModalItem.id);

    const price = buyModalItem.adminApprovedPrice ?? buyModalItem.askingPrice ?? 0;
    const fee = Math.round(price * 0.1);
    const sellerPayout = price - fee;
    const convId = 'conv_admin_desk';
    const buyerNickname = userProfile?.nickname || '@FUHSI_Student';
    const itemPriceFormatted = price.toLocaleString();

    const buyerRequestText = `Hello Admin, I am interested in buying "${buyModalItem.title}" listed by ${buyModalItem.sellerNickname} for ₦${itemPriceFormatted}.\nI am ready to meet at (${buyModalItem.meetupPoint}).`;

    const currentTime = formatMessageTime();

    const newBuyerMsg: DirectMessage = {
      id: `dm_${Date.now()}`,
      conversationId: convId,
      senderNickname: buyerNickname,
      receiverNickname: '🛡️ Trade Desk',
      text: buyerRequestText,
      timestamp: currentTime,
      itemId: buyModalItem.id,
      itemTitle: buyModalItem.title,
      itemPrice: price,
      meetupPoint: buyModalItem.meetupPoint,
      isPledgeConfirmed: true
    };

    // Pick a suitable item icon based on category/title
    const getItemIcon = (cat?: string, tit?: string) => {
      const c = (cat || '').toLowerCase();
      const t = (tit || '').toLowerCase();
      if (c.includes('phone') || t.includes('phone') || t.includes('spark') || t.includes('iphone') || t.includes('samsung')) return '📱';
      if (c.includes('electronic') || t.includes('fan') || t.includes('laptop') || t.includes('charger') || t.includes('tv')) return '⚡';
      if (c.includes('digital')) return '📁';
      if (c.includes('service')) return '🛠️';
      if (c.includes('fashion') || t.includes('shirt') || t.includes('cloth') || t.includes('shoe')) return '👕';
      if (c.includes('medical') || t.includes('stethoscope') || t.includes('scrub') || t.includes('coat')) return '🩺';
      if (c.includes('textbook') || t.includes('book')) return '📚';
      if (c.includes('housing') || t.includes('hostel') || t.includes('room')) return '🏠';
      return '📦';
    };

    const itemIcon = getItemIcon(buyModalItem.category, buyModalItem.title);

    const newAdminMsg: DirectMessage = {
      id: `dm_resp_${Date.now()}`,
      conversationId: convId,
      senderNickname: '🛡️ Trade Desk',
      receiverNickname: buyerNickname,
      text: `🛡️ [PURCHASE REQUEST LOGGED]\nHello ${buyerNickname}!\nYour trade ticket for "${buyModalItem.title}" has been created.\n\n💰 Total Price: ₦${itemPriceFormatted}\n${itemIcon} Item: ${buyModalItem.title}\n📍 Campus Meetup: ${buyModalItem.meetupPoint}\n\nOur coordinator will verify the seller's availability. Inspect the item thoroughly before authorizing final payout release.`,
      timestamp: currentTime,
      itemId: buyModalItem.id,
      itemTitle: buyModalItem.title,
      itemPrice: price,
      meetupPoint: buyModalItem.meetupPoint
    };

    sendDirectMessage(newBuyerMsg);
    sendDirectMessage(newAdminMsg);

    setActiveConvId(convId);
    setBuyIntentSuccess(true);

    setTimeout(() => {
      setBuyIntentSuccess(false);
      setBuyModalItem(null);
      setPledgeChecked(false);
      setActiveView('my_trades');
    }, 1200);
  };

  const handleSendDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !activeConvId) return;

    const currentConv = conversations.find((c) => c.id === activeConvId);
    if (!currentConv) return;

    const newMsg: DirectMessage = {
      id: `dm_${Date.now()}`,
      conversationId: activeConvId,
      senderNickname: userProfile?.nickname || '@FUHSI_Student',
      receiverNickname: currentConv.otherUserNickname,
      text: chatInputText.trim(),
      timestamp: formatMessageTime(),
    };

    sendDirectMessage(newMsg);
    setChatInputText('');
  };

  // Confirm Mark as Sold
  const handleConfirmSold = () => {
    if (soldModalItem) {
      onMarkAsSold(soldModalItem.id, 5, 'Verified Sold');
      setSoldSuccessNotify(true);
      setTimeout(() => {
        setSoldSuccessNotify(false);
        setSoldModalItem(null);
        if (detailsModalItem && detailsModalItem.id === soldModalItem.id) {
          setDetailsModalItem({
            ...detailsModalItem,
            status: 'SOLD',
            soldAt: new Date().toISOString(),
          });
        }
      }, 900);
    }
  };

  const activeMessages = directMessages.filter((m) => m.conversationId === activeConvId);

  // My pending & approved counts
  const myPending = (pendingMarketplaceItems || []).filter(
    (item) => item.sellerNickname === userProfile?.nickname
  );
  const myApproved = approvedMarketplaceItems.filter(
    (item) => item.sellerNickname === userProfile?.nickname
  );

  return (
    <div className="max-w-2xl mx-auto pb-28 px-3 sm:px-4 pt-2 space-y-4">
      {/* 1. GREEN HEADER (Matching User Image 1) */}
      <div className="bg-[#0a6627] text-white rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight flex items-center gap-2">
              <span>FUHSI MARKETPLACE</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5 font-medium">
              Buy, sell, and promote your items on FUHSI-Connect.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* View My Listings & Trades */}
            <button
              onClick={() => setActiveView(activeView === 'listings' ? 'my_trades' : 'listings')}
              className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold border ${
                activeView === 'my_trades'
                  ? 'bg-white text-[#0a6627] border-white shadow-sm'
                  : 'bg-emerald-800/80 hover:bg-emerald-800 text-white border-emerald-600/50'
              }`}
              title="Toggle My Listings & Trade Desk"
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">
                {activeView === 'listings' ? 'My Trades' : 'View Hub'}
              </span>
              {(myPending.length > 0 || conversations.some((c) => c.unreadCount > 0)) && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Search Items Input Bar */}
        <div className="relative mt-3.5">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white text-slate-900 text-xs sm:text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: MAIN MARKETPLACE LISTINGS & CATEGORIES */}
      {activeView === 'listings' && (
        <div className="space-y-4">
          {/* 2. BROWSE CATEGORIES (Matching User Image 1) */}
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-600 mb-2 px-1">
              Browse Categories
            </h2>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1.5">
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0a6627] text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. LATEST LISTINGS (Matching User Image 1) */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-xs sm:text-sm font-bold text-slate-600 flex items-center gap-1.5">
                <span>Latest Listings</span>
                <span className="text-[11px] font-normal text-slate-400">
                  (Includes live items & recent 7-day deals)
                </span>
              </h2>
              {selectedCategory !== 'All' && (
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  Clear filter ({selectedCategory})
                </button>
              )}
            </div>

            <div className="space-y-3">
              {filteredListings.map((item) => {
                const soldInfo = getSoldStatusInfo(item);
                const isSold = soldInfo.isSold;
                const isOwner = item.sellerNickname === userProfile?.nickname;
                const mainPhoto = item.imageUrls?.[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400';
                const priceVal = item.adminApprovedPrice ?? item.askingPrice ?? 0;
                const priceFormatted = formatPriceShort(priceVal);
                const locationText = item.meetupPoint?.replace(/^📍\s*/, '') || 'Ayeka, Ondo State';

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setDetailsModalItem(item);
                      setActivePhotoIdx(0);
                    }}
                    className={`bg-white rounded-2xl border p-3 sm:p-4 shadow-xs hover:shadow-md transition-all flex items-start gap-3 sm:gap-4 cursor-pointer group relative ${
                      isSold 
                        ? 'border-rose-200/90 bg-rose-50/20 hover:border-rose-300' 
                        : 'border-slate-200/90 hover:border-emerald-500/50'
                    }`}
                  >
                    {/* Left Thumbnail Photo with Sold Overlay */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 relative">
                      <img
                        src={mainPhoto}
                        alt={item.title}
                        className={`w-full h-full object-cover transition-transform duration-300 ${
                          isSold ? 'grayscale-[30%] opacity-90' : 'group-hover:scale-105'
                        }`}
                        loading="lazy"
                      />
                      {isSold && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex flex-col items-center justify-center p-1 text-center">
                          <span className="text-[10px] font-black text-white px-2 py-0.5 rounded-full bg-rose-600 shadow-sm uppercase tracking-wider">
                            SOLD
                          </span>
                          <span className="text-[9px] font-bold text-rose-100 mt-0.5 leading-tight">
                            {soldInfo.soldBadgeText}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right Listing Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                      <div>
                        {/* Title & Price Row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-[#0a6627] transition-colors">
                              {item.title}
                            </h3>
                            {/* Sold Tag if Sold */}
                            {isSold && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-md mt-0.5">
                                <span>🏷️</span>
                                <span>{soldInfo.soldBadgeText}</span>
                              </span>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`font-extrabold text-sm sm:text-base ${
                              isSold ? 'text-slate-500 line-through' : 'text-[#0a6627]'
                            }`}>
                              {priceFormatted}
                            </span>
                            {isSold && (
                              <span className="block text-[9px] font-bold text-rose-600">
                                DEAL CLOSED
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Author Nickname & Location Row */}
                        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-600 font-medium mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-slate-800 font-semibold">
                            <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{item.sellerNickname || 'FUHSI Student'}</span>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1 text-slate-500 line-clamp-1">
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            <span>{locationText}</span>
                          </span>
                        </div>

                        {/* Description snippet / Specs */}
                        <p className="text-[11px] sm:text-xs text-slate-600 mt-1 line-clamp-1">
                          {item.description || `${item.conditionTag} • ${item.category}`}
                        </p>
                      </div>

                      {/* Action buttons (View Details & Interested / Mark Sold) */}
                      <div
                        className="flex items-center gap-2 mt-2.5 pt-1 flex-wrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setDetailsModalItem(item);
                            setActivePhotoIdx(0);
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        >
                          View Details
                        </button>

                        {!isSold ? (
                          <>
                            {!isOwner ? (
                              <button
                                onClick={() => setBuyModalItem(item)}
                                className="px-3 py-1 bg-[#0a6627] hover:bg-[#08521f] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <ShoppingBag size={13} />
                                <span>Interested</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setSoldModalItem(item)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg border border-rose-200 transition-colors cursor-pointer"
                              >
                                Mark Sold
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                            <CheckCircle2 size={13} />
                            <span>{soldInfo.soldBadgeText} (Missed Deal)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredListings.length > 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 font-medium">
                  No more listings
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
                    🛍️
                  </div>
                  <p className="font-bold text-slate-700 text-sm">No items found matching your filter</p>
                  <p className="text-xs text-slate-500">
                    {searchQuery ? `No results for "${searchQuery}"` : 'Be the first student to post an item in this category!'}
                  </p>
                  <button
                    onClick={() => {
                      if (isVerifiedUser) {
                        setShowSellModal(true);
                      } else {
                        setShowMarketplaceLockModal(true);
                      }
                    }}
                    className="px-4 py-2 bg-[#0a6627] hover:bg-[#08521f] text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} /> Post an Item Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MY SUBMITTED LISTINGS & ADMIN TRADE DESK */}
      {activeView === 'my_trades' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#0a6627]" />
                <span>My Submitted Listings & Trade Desk</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track your active item sales, admin approvals, and trade desk chats.
              </p>
            </div>
            <button
              onClick={() => setActiveView('listings')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Back to Hub
            </button>
          </div>

          {/* User's Items List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
              My Items ({myPending.length + myApproved.length})
            </h3>

            {myPending.length === 0 && myApproved.length === 0 ? (
              <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-xl text-xs">
                You haven't posted any marketplace items yet. Click the floating "+" button to list your first item!
              </div>
            ) : (
              <div className="space-y-2.5">
                {myPending.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {item.imageUrls?.[0] && (
                        <img src={item.imageUrls[0]} alt={item.title} className="w-12 h-12 rounded-lg object-cover border border-amber-300 shrink-0" />
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900">{item.title}</h4>
                        <p className="text-[11px] text-slate-600">
                          ₦{item.askingPrice.toLocaleString()} • {item.category}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-950 font-bold text-[10px] shrink-0 flex items-center gap-1">
                      <Clock size={12} /> Pending Review
                    </span>
                  </div>
                ))}

                {myApproved.map((item) => {
                  const soldInfo = getSoldStatusInfo(item);
                  return (
                    <div key={item.id} className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {item.imageUrls?.[0] && (
                          <img src={item.imageUrls[0]} alt={item.title} className="w-12 h-12 rounded-lg object-cover border border-emerald-300 shrink-0" />
                        )}
                        <div>
                          <h4 className="font-bold text-slate-900">{item.title}</h4>
                          <p className="text-[11px] text-slate-600">
                            ₦{(item.adminApprovedPrice ?? item.askingPrice).toLocaleString()} • {item.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] shrink-0 ${
                          soldInfo.isSold ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-200 text-emerald-950'
                        }`}>
                          {soldInfo.isSold ? `✓ ${soldInfo.soldBadgeText}` : 'LIVE'}
                        </span>
                        {!soldInfo.isSold && (
                          <button
                            onClick={() => setSoldModalItem(item)}
                            className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold text-[10px] hover:bg-rose-700 cursor-pointer"
                          >
                            Mark Sold
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Trade Desk Chat Area */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Trade Desk
            </h3>

            <div className="border border-slate-100 rounded-xl bg-slate-50/50 p-3 max-h-72 overflow-y-auto space-y-2.5 text-xs">
              {activeMessages.map((msg) => {
                const isMe = msg.senderNickname === userProfile?.nickname;
                return (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-2xl max-w-[85%] space-y-1 ${
                      isMe
                        ? 'bg-[#0a6627] text-white ml-auto rounded-br-xs'
                        : 'bg-white text-slate-800 mr-auto rounded-bl-xs border border-slate-200 shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line font-medium leading-relaxed">{msg.text}</p>
                    <span className="text-[9px] block text-right opacity-70">{formatMessageTime(msg.timestamp)}</span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendDirectMessage} className="flex gap-2">
              <input
                type="text"
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                placeholder="Reply to Trade Desk..."
                className="flex-1 text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#0a6627] hover:bg-[#08521f] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. FLOATING ACTION BUTTON (FAB) FOR "POST ITEM" */}
      <button
        onClick={() => {
          if (isVerifiedUser) {
            setShowSellModal(true);
          } else {
            setShowMarketplaceLockModal(true);
          }
        }}
        className="fixed bottom-20 sm:bottom-8 right-5 sm:right-8 z-40 bg-[#0a6627] hover:bg-[#08521f] text-white rounded-full p-3.5 sm:px-5 sm:py-3.5 shadow-2xl shadow-emerald-950/40 flex items-center gap-2 border-2 border-white/90 active:scale-95 transition-all cursor-pointer group"
        title="Post Item for Sale"
      >
        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
        <span className="font-extrabold text-xs sm:text-sm tracking-wide hidden sm:inline">
          Post Item
        </span>
      </button>

      {/* 5. "VIEW DETAILS" MODAL (Matching User Image 2) */}
      {detailsModalItem && (() => {
        const soldInfo = getSoldStatusInfo(detailsModalItem);
        const isSold = soldInfo.isSold;
        const itemPrice = detailsModalItem.adminApprovedPrice ?? detailsModalItem.askingPrice ?? 0;
        const fee = Math.round(itemPrice * 0.1);
        const sellerNet = itemPrice - fee;
        const isOwner = detailsModalItem.sellerNickname === userProfile?.nickname;

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 my-auto relative max-h-[92vh] overflow-y-auto no-scrollbar">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase flex items-center gap-2">
                  <span>VIEW DETAILS</span>
                  {isSold && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[10px]">
                      {soldInfo.soldBadgeText}
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setDetailsModalItem(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Large Photo Preview with Rounded Corners (Matching Picture 2) */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 w-full h-64 sm:h-72">
                <img
                  src={
                    detailsModalItem.imageUrls?.[activePhotoIdx] ||
                    detailsModalItem.imageUrls?.[0] ||
                    'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600'
                  }
                  alt={detailsModalItem.title}
                  className={`w-full h-full object-contain bg-slate-900/5 ${
                    isSold ? 'grayscale-[20%]' : ''
                  }`}
                />

                {isSold && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center">
                    <span className="px-4 py-1.5 rounded-full bg-rose-600 text-white font-black text-xs sm:text-sm tracking-wider shadow-lg">
                      ✓ {soldInfo.soldBadgeText.toUpperCase()}
                    </span>
                    <p className="text-rose-100 text-[11px] font-bold mt-1.5 max-w-xs">
                      ⚡ Deal Completed on Campus! (Archiving in {Math.max(1, 7 - soldInfo.daysAgo)} days)
                    </p>
                  </div>
                )}
              </div>

              {/* Photo Thumbnails selector (if multiple photos) */}
              {detailsModalItem.imageUrls && detailsModalItem.imageUrls.length > 1 && (
                <div className="flex gap-2 justify-center overflow-x-auto py-1">
                  {detailsModalItem.imageUrls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activePhotoIdx === idx
                          ? 'border-[#0a6627] ring-2 ring-emerald-400 scale-105'
                          : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Title & Price Row (Matching Picture 2) */}
              <div className="flex items-start justify-between gap-3 pt-1">
                <h3 className="font-black text-slate-900 text-lg sm:text-xl leading-tight">
                  {detailsModalItem.title}
                </h3>
                <span className={`font-black text-lg sm:text-2xl shrink-0 ${
                  isSold ? 'text-slate-400 line-through' : 'text-[#0a6627]'
                }`}>
                  {formatPriceShort(itemPrice)}
                </span>
              </div>

              {/* Sub-row: 👤 Nickname, 📍 Location, 👁️ Views (Matching Picture 2) */}
              <div className="flex items-center gap-3 text-xs text-slate-600 font-medium flex-wrap">
                <span className="flex items-center gap-1 text-slate-900 font-bold">
                  <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{detailsModalItem.sellerNickname || 'FUHSI Student'}</span>
                </span>

                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{detailsModalItem.meetupPoint?.replace(/^📍\s*/, '') || 'Ayeka, Ondo State'}</span>
                </span>

                <span className="flex items-center gap-1 text-slate-500 ml-auto">
                  <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{detailsModalItem.viewCount || 24}</span>
                </span>
              </div>

              {/* Description Section (Matching Picture 2) */}
              <div className="space-y-1 pt-1 text-xs">
                <p className="font-bold text-slate-900 text-xs">
                  Description:
                </p>
                <p className="text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                  {detailsModalItem.description || 'No additional description provided for this listing.'}
                </p>
              </div>

              {/* Price & Protection Note */}
              {!isSold && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-xs flex justify-between items-center text-slate-700">
                  <span>Price: <strong className="text-slate-900 font-bold">₦{itemPrice.toLocaleString()}</strong></span>
                  <span className="text-[11px] text-slate-500">Seller receives: <strong className="text-emerald-800 font-bold">₦{sellerNet.toLocaleString()}</strong> (10% platform fee)</span>
                </div>
              )}

              {/* Sold Record Notification if already purchased */}
              {isSold && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs space-y-1">
                  <p className="font-bold text-rose-900 flex items-center gap-1.5">
                    <span>⚡ Completed Deal Record</span>
                    <span className="text-rose-700 font-normal">({soldInfo.soldBadgeText})</span>
                  </p>
                  <p className="text-rose-800 text-[11px] leading-relaxed">
                    This item was successfully sold on FUHSI-Connect. It remains as a campus price reference for 7 days before being automatically purged.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                {!isSold ? (
                  <>
                    {!isOwner ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setBuyModalItem(detailsModalItem);
                          }}
                          className="w-full py-3 bg-[#0a6627] hover:bg-[#08521f] text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Interested</span>
                        </button>

                        <button
                          onClick={() => {
                            if (onAuthorClick) {
                              onAuthorClick({
                                id: `seller_${detailsModalItem.id}`,
                                authorNickname: detailsModalItem.sellerNickname,
                                timeAgo: 'Marketplace',
                                categoryTag: 'Trade',
                                text: `Seller of ${detailsModalItem.title}`,
                                likesCount: 0,
                                commentsCount: 0,
                                createdAt: '',
                              });
                              setDetailsModalItem(null);
                            }
                          }}
                          className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                        >
                          <User size={13} className="text-slate-500" />
                          <span>View Seller Profile</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSoldModalItem(detailsModalItem);
                        }}
                        className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark as Sold</span>
                      </button>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full py-3 bg-slate-100 text-slate-500 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
                    >
                      <span>✓ Item Sold ({soldInfo.soldBadgeText})</span>
                    </button>

                    {isOwner && (
                      <p className="text-[11px] text-center text-slate-500">
                        You marked this item as sold. It will auto-delete in {Math.max(1, 7 - soldInfo.daysAgo)} days.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: MARK AS SOLD CONFIRMATION (SIMPLIFIED) */}
      {soldModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-slate-900 text-sm">Mark as Sold</h3>
              <button onClick={() => setSoldModalItem(null)} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
            </div>

            {soldSuccessNotify ? (
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl text-center space-y-1">
                <CheckCircle2 size={24} className="text-emerald-600 mx-auto" />
                <p className="font-black text-sm">Item Marked as Sold!</p>
                <p className="text-xs text-emerald-700">Tagged as "Sold today". Will automatically purge after 7 days.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-700 leading-relaxed">
                  Are you sure you want to mark <strong className="text-slate-900 font-bold">"{soldModalItem.title}"</strong> as sold?
                </p>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSoldModalItem(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSold}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                  >
                    Yes, Mark as Sold
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: POST ITEM FORM */}
      {showSellModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Post Item for Sale on Campus</h3>
                <p className="text-[11px] text-emerald-700 font-bold">📷 Clear device photos & description required</p>
              </div>
              <button onClick={() => setShowSellModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            {sellSuccessMsg ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center">
                ✓ Item submitted successfully to FUHSI Marketplace!
              </div>
            ) : (
              <form onSubmit={handleSellSubmit} className="space-y-3">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Item Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. TECNO Spark 8"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {CATEGORY_OPTIONS.filter((c) => c.id !== 'All').map((c) => (
                        <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Asking Price (₦)</label>
                    <input
                      type="number"
                      value={askingPrice}
                      onChange={(e) => setAskingPrice(Number(e.target.value) || '')}
                      placeholder="e.g. 10000"
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                    {priceVal > 0 && (
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        Note: 10% (₦{adminFee.toLocaleString()}) will be for platform commission. You will receive ₦{netPayout.toLocaleString()}.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Condition Tag</label>
                    <select
                      value={conditionTag}
                      onChange={(e) => setConditionTag(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="New">New</option>
                      <option value="Newly used">Newly used</option>
                      <option value="Fairly Used">Fairly Used</option>
                      <option value="Refurbished / Working">Refurbished / Working</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Safe Meet-up Point</label>
                    <select
                      value={meetupPoint}
                      onChange={(e) => setMeetupPoint(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {meetupLocations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description & Specs</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe item condition, memory, accessories, inclusions..."
                    rows={3}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* Photos Upload Section */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Camera size={15} className="text-emerald-600" />
                      <span>Item Photos (1–6 Photos)</span>
                    </label>
                    <span className="text-[10px] font-extrabold text-slate-500">
                      {uploadedPhotos.length} / 6 selected
                    </span>
                  </div>

                  {uploadedPhotos.length < 6 && (
                    <label className="flex items-center justify-center gap-2 p-3 bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-xl cursor-pointer hover:bg-emerald-100 transition-colors">
                      <Upload size={16} className="text-emerald-700" />
                      <span className="text-xs font-bold text-emerald-800">
                        Select Item Photos from Device
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotosFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}

                  {uploadedPhotos.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                      {uploadedPhotos.map((photo, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-square group">
                          <img src={photo} alt={`Item ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveUploadedPhoto(idx)}
                            className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-rose-700"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#0a6627] hover:bg-[#08521f] text-white font-extrabold text-xs transition-colors cursor-pointer shadow-md"
                >
                  Submit Item Listing
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: IN-APP BUY INTENT PLEDGE & ESCROW */}
      {buyModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>FUHSI Safe Escrow Trade Request</span>
              </h3>
              <button onClick={() => setBuyModalItem(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {buyIntentSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center">
                ✓ Trade request opened with Admin Escrow Desk!
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  You are opening a protected escrow purchase for <strong className="text-slate-900">{buyModalItem.title}</strong> listed by <strong className="text-slate-900">{buyModalItem.sellerNickname}</strong> at <strong className="text-[#0a6627]">₦{(buyModalItem.adminApprovedPrice ?? buyModalItem.askingPrice).toLocaleString()}</strong>.
                </p>

                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 space-y-1 text-slate-700">
                  <p className="font-bold text-emerald-950">🛡️ Campus Safety Guarantees:</p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-emerald-900">
                    <li>Designated campus meetup: <strong>{buyModalItem.meetupPoint?.startsWith('📍') ? buyModalItem.meetupPoint : `📍 ${buyModalItem.meetupPoint}`}</strong></li>
                    <li>Inspect the item in broad daylight before payout release</li>
                    <li>10% platform protection covers fraud prevention & disputes</li>
                  </ul>
                </div>

                <label className="flex items-start gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={pledgeChecked}
                    onChange={(e) => setPledgeChecked(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-600 font-medium">
                    I agree to meet safely on campus, inspect the item thoroughly, and abide by FUHSI trade guidelines.
                  </span>
                </label>

                <button
                  disabled={!pledgeChecked}
                  onClick={handleConfirmPledgeAndOpenDM}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition-colors shadow-md ${
                    pledgeChecked 
                      ? 'bg-[#0a6627] hover:bg-[#08521f] text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Confirm Escrow Purchase Ticket
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: VERIFICATION LOCK */}
      {showMarketplaceLockModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Lock size={22} />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Verification Required</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To keep the marketplace secure and scam-free, only verified FUHSI students can post items for sale.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowMarketplaceLockModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowMarketplaceLockModal(false);
                  setShowVerificationModal(true);
                }}
                className="flex-1 py-2.5 bg-[#0a6627] hover:bg-[#08521f] text-white font-bold text-xs rounded-xl"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification modal instance */}
      {showVerificationModal && (
        <VerificationModal
          userProfile={userProfile}
          onClose={() => setShowVerificationModal(false)}
          onSubmitVerification={() => {
            setShowVerificationModal(false);
          }}
        />
      )}
    </div>
  );
};
