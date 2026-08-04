import React, { useState } from 'react';
import { MarketplaceItem, UserProfile, DirectMessage, ChatConversation } from '../types';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Tag, 
  MapPin, 
  Eye, 
  Plus, 
  Check, 
  Star, 
  DollarSign, 
  MessageSquare,
  Send,
  Camera,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

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
}

export const CampusHubScreen: React.FC<CampusHubScreenProps> = ({
  userProfile,
  approvedMarketplaceItems,
  pendingMarketplaceItems = [],
  onSubmitMarketplaceItem,
  onRecordDmBuyIntent,
  onMarkAsSold,
  onApplyVerificationWithFee,
  onAuthorClick,
}) => {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'chats'>('marketplace');

  // Sell Item Form Modal State
  const [showSellModal, setShowSellModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Medical Equipment');
  const [askingPrice, setAskingPrice] = useState<number | ''>('');
  const [conditionTag, setConditionTag] = useState('Like New (Used 2 Weeks)');
  const [description, setDescription] = useState('');
  const [sellerPhone, setSellerPhone] = useState(userProfile?.emergencyHomePhone || '08031234567');
  const [meetupPoint, setMeetupPoint] = useState('Main Library Entrance');
  
  // 4-6 Photos State
  const [photo1, setPhoto1] = useState('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80');
  const [photo2, setPhoto2] = useState('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80');
  const [photo3, setPhoto3] = useState('https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80');
  const [photo4, setPhoto4] = useState('https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80');
  const [photo5, setPhoto5] = useState('');
  const [photo6, setPhoto6] = useState('');
  
  const [sellSuccessMsg, setSellSuccessMsg] = useState(false);
  const [formError, setFormError] = useState('');

  // Buy Intent & Pledge Modal State
  const [buyModalItem, setBuyModalItem] = useState<MarketplaceItem | null>(null);
  const [buyIntentType, setBuyIntentType] = useState<'interested' | 'buynow' | 'ready'>('ready');
  const [pledgeChecked, setPledgeChecked] = useState(false);
  const [buyIntentSuccess, setBuyIntentSuccess] = useState(false);

  // Admin Middleman Trade Desk Conversations State
  const [conversations, setConversations] = useState<ChatConversation[]>([
    {
      id: 'conv_admin_desk',
      otherUserNickname: '🛡️ FUHSI Admin Trade Desk',
      lastMessage: 'Admin Middleman Active: All purchase requests are routed here to verify availability with seller.',
      lastTimestamp: 'Live Desk',
      itemId: 'item_1',
      itemTitle: '3M Littmann Classic III Stethoscope',
      itemPrice: 38000,
      meetupPoint: 'Main Library Entrance',
      unreadCount: 0
    }
  ]);
  const [activeConvId, setActiveConvId] = useState<string | null>('conv_admin_desk');
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([
    {
      id: 'dm_admin_1',
      conversationId: 'conv_admin_desk',
      senderNickname: '🛡️ FUHSI Admin Trade Desk',
      receiverNickname: userProfile?.nickname || '@FUHSI_Student',
      text: 'Welcome to the FUHSI Admin Marketplace Middleman Desk!\n\nInstead of direct seller DMs (which risk harassment and fake buyers), Admin acts as the trusted middleman.\n\nWhen you request to buy an item, we contact the seller privately to confirm availability. Once verified, we schedule a safe campus meet-up where you inspect the item and pay the seller directly!',
      timestamp: 'Live Desk',
      isPledgeConfirmed: true
    }
  ]);
  const [chatInputText, setChatInputText] = useState('');

  // Sold Rating Modal State
  const [soldModalItem, setSoldModalItem] = useState<MarketplaceItem | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingTag, setRatingTag] = useState('Honest Seller ⭐⭐⭐⭐⭐');

  // Multi-photo Preview Lightbox State
  const [previewPhotoItem, setPreviewPhotoItem] = useState<MarketplaceItem | null>(null);
  const [previewPhotoIdx, setPreviewPhotoIdx] = useState(0);

  // Popstate listener for back button navigation in CampusHubScreen
  React.useEffect(() => {
    const handlePopState = () => {
      if (previewPhotoItem) {
        setPreviewPhotoItem(null);
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
  }, [previewPhotoItem, buyModalItem, showSellModal, soldModalItem]);

  const categories = [
    'Medical Equipment',
    'Textbooks & Books',
    'Lab Gear',
    'Electronics & Gadgets',
    'Hostel Essentials',
  ];

  const meetupLocations = [
    'Main Library Entrance',
    'Central Cafeteria Complex',
    'Medical Faculty Reception',
    'FUHSI School Main Gate',
    'Matriculation Pavilion',
  ];

  // Live 10% Fee calculations
  const priceVal = typeof askingPrice === 'number' ? askingPrice : 0;
  const adminFee = Math.round(priceVal * 0.1);
  const netPayout = priceVal - adminFee;

  // Auto fill sample 4-photo sets
  const handleLoadSamplePhotos = (presetCategory: string) => {
    if (presetCategory === 'Medical Equipment') {
      setPhoto1('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80');
      setPhoto2('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80');
      setPhoto3('https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80');
      setPhoto4('https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80');
    } else {
      setPhoto1('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80');
      setPhoto2('https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80');
      setPhoto3('https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80');
      setPhoto4('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80');
    }
  };

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Please enter a descriptive product title.');
      return;
    }
    if (!askingPrice || priceVal <= 0) {
      setFormError('Please enter a valid asking price.');
      return;
    }

    // Collect provided photo URLs
    const photos = [photo1, photo2, photo3, photo4, photo5, photo6].filter((p) => p.trim().length > 0);

    if (photos.length < 4) {
      setFormError(`At least 4 clear photos are required to post an item (currently provided: ${photos.length}). Please fill Photo 1 through Photo 4.`);
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
      imageUrls: photos,
    });

    setSellSuccessMsg(true);
    setTimeout(() => {
      setSellSuccessMsg(false);
      setShowSellModal(false);
      setTitle('');
      setAskingPrice('');
      setDescription('');
      setFormError('');
    }, 1800);
  };

  // ROUTE REQUEST TO BUY DIRECTLY TO ADMIN MIDDLEMAN (NO DIRECT PRIVATE SELLER DM)
  const handleConfirmPledgeAndOpenDM = () => {
    if (!buyModalItem || !pledgeChecked) return;

    // Record intent count
    onRecordDmBuyIntent(buyModalItem.id);

    const convId = 'conv_admin_desk';
    const buyerNickname = userProfile?.nickname || '@FUHSI_Student';

    // Buyer message sent to Admin Middleman
    const itemPriceFormatted = (buyModalItem.adminApprovedPrice ?? buyModalItem.askingPrice ?? 0).toLocaleString();
    const buyerRequestText = `Hello Admin, I am interested in buying "${buyModalItem.title}" listed by @${buyModalItem.sellerNickname} for ₦${itemPriceFormatted}.\n\nI confirm I am a serious buyer and ready to pay at the safe campus meet-up location (${buyModalItem.meetupPoint}).`;

    const newBuyerMsg: DirectMessage = {
      id: `dm_${Date.now()}`,
      conversationId: convId,
      senderNickname: buyerNickname,
      receiverNickname: '🛡️ FUHSI Admin Trade Desk',
      text: buyerRequestText,
      timestamp: 'Just now',
      itemId: buyModalItem.id,
      itemTitle: buyModalItem.title,
      itemPrice: buyModalItem.adminApprovedPrice ?? buyModalItem.askingPrice,
      meetupPoint: buyModalItem.meetupPoint,
      isPledgeConfirmed: true
    };

    // Automated Admin Response reassuring buyer
    const adminResponseText = `🛡️ [ADMIN MIDDLEMAN ACKNOWLEDGMENT]\nHello ${buyerNickname}! Your purchase request for "${buyModalItem.title}" listed by @${buyModalItem.sellerNickname} at ₦${itemPriceFormatted} has been logged.\n\n📱 Next Step: We are now contacting @${buyModalItem.sellerNickname} privately to confirm if the item is still available.\n📍 Proposed Meet-Up: ${buyModalItem.meetupPoint}\n\nNote: Payment is completed directly between you and the seller at the meet-up point after inspection. Admin does not collect or hold money.`;

    const newAdminMsg: DirectMessage = {
      id: `dm_resp_${Date.now()}`,
      conversationId: convId,
      senderNickname: '🛡️ FUHSI Admin Trade Desk',
      receiverNickname: buyerNickname,
      text: adminResponseText,
      timestamp: 'Just now',
      itemId: buyModalItem.id,
      itemTitle: buyModalItem.title,
      itemPrice: buyModalItem.adminApprovedPrice,
      meetupPoint: buyModalItem.meetupPoint
    };

    setDirectMessages((prev) => [...prev, newBuyerMsg, newAdminMsg]);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              lastMessage: `Buy request logged for ${buyModalItem.title} (₦${buyModalItem.adminApprovedPrice.toLocaleString()})`,
              lastTimestamp: 'Just now'
            }
          : c
      )
    );

    setActiveConvId(convId);
    setBuyIntentSuccess(true);

    setTimeout(() => {
      setBuyIntentSuccess(false);
      setBuyModalItem(null);
      setPledgeChecked(false);
      setActiveTab('chats'); // Switch directly to Admin Trade Desk Tab!
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
      timestamp: 'Just now',
    };

    setDirectMessages((prev) => [...prev, newMsg]);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? { ...c, lastMessage: chatInputText.trim(), lastTimestamp: 'Just now' }
          : c
      )
    );
    setChatInputText('');
  };

  const handleConfirmSold = () => {
    if (soldModalItem) {
      onMarkAsSold(soldModalItem.id, ratingStars, ratingTag);
      setSoldModalItem(null);
    }
  };

  const activeMessages = directMessages.filter((m) => m.conversationId === activeConvId);
  const currentConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="max-w-3xl mx-auto pb-24 px-4 pt-4 space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0 text-teal-300">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base">FUHSI Campus Trusted Marketplace</h1>
              <p className="text-xs text-teal-200">
                Admin Middleman Trade • 4-6 Photos Required • No Direct Harassment • Safe Meet-Up Points
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex-1 min-w-[110px] py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'marketplace'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>🛍️</span> Marketplace
        </button>

        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 relative ${
            activeTab === 'chats'
              ? 'bg-white text-slate-900 shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          <span>{userProfile?.isAdmin ? '🛡️' : '📩'}</span>
          <span>{userProfile?.isAdmin ? 'Admin Trade Desk' : 'My Trade Requests & Listings'}</span>
          {conversations.some((c) => c.unreadCount > 0) && (
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* TAB 1: MARKETPLACE */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          {/* Action Bar & Info */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm gap-2">
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span>Approved FUHSI Student Listings</span>
                <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                  Admin Middleman Shield Active
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                4-6 clear photos verified by Admin. Requests to buy go directly to Admin to verify availability privately before scheduling safe meet-ups!
              </p>
            </div>
            <button
              onClick={() => {
                setShowSellModal(true);
                handleLoadSamplePhotos('Medical Equipment');
              }}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              Post Item to Sell
            </button>
          </div>

          {/* Marketplace Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {approvedMarketplaceItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col justify-between transition-all ${
                  item.status === 'SOLD' ? 'border-slate-200 opacity-80' : 'border-slate-200/80 hover:border-teal-500/50'
                }`}
              >
                <div>
                  {/* Photo Thumbnail Carousel Preview */}
                  <div
                    onClick={() => {
                      setPreviewPhotoItem(item);
                      setPreviewPhotoIdx(0);
                    }}
                    className="relative h-48 bg-slate-950 cursor-pointer overflow-hidden group"
                  >
                    <img
                      src={item.imageUrls[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {item.status === 'SOLD' && (
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="px-4 py-1.5 rounded-full bg-rose-600 text-white font-black text-xs tracking-wider shadow-lg">
                          ✓ SOLD
                        </span>
                      </div>
                    )}

                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                      {item.category}
                    </div>

                    <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                      <Camera className="w-3 h-3 text-teal-300" /> {item.imageUrls.length} Clear Photos
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h3>
                      <span className="font-black text-teal-700 text-base shrink-0">
                        ₦{(item.adminApprovedPrice ?? 0).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>

                    <div className="flex items-center gap-2 flex-wrap text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                        {item.conditionTag}
                      </span>
                      <span className="flex items-center gap-1 text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                        <MapPin className="w-3 h-3 text-teal-600" /> {item.meetupPoint}
                      </span>
                    </div>

                    {item.sellerRatingTag && (
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {item.sellerRatingTag}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-3.5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-2 mt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">
                      Seller:{' '}
                      <button
                        onClick={() => {
                          if (onAuthorClick) {
                            onAuthorClick({
                              id: `seller_${item.id}`,
                              authorNickname: item.sellerNickname,
                              timeAgo: 'Marketplace',
                              categoryTag: 'Trade',
                              text: `Seller of ${item.title}`,
                              likesCount: 0,
                              commentsCount: 0,
                              createdAt: '',
                            });
                          }
                        }}
                        className="font-bold text-slate-800 hover:text-teal-700 hover:underline focus:outline-none transition-colors"
                        title="Click to view seller profile"
                      >
                        {item.sellerNickname}
                      </button>
                    </span>
                    <span className="text-teal-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Admin Protected Trade
                    </span>
                  </div>

                  {item.status === 'SOLD' ? (
                    <div className="w-full py-2 bg-slate-200 text-slate-700 rounded-xl font-bold text-xs text-center">
                      Transaction Completed
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          setBuyModalItem(item);
                          setBuyIntentType('ready');
                        }}
                        className="py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Request to Buy (via Admin)</span>
                      </button>

                      {item.sellerNickname === userProfile?.nickname ? (
                        <button
                          onClick={() => setSoldModalItem(item)}
                          className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                        >
                          Mark Sold
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setBuyModalItem(item);
                            setBuyIntentType('buynow');
                          }}
                          className="py-2 px-3 rounded-xl bg-teal-900 hover:bg-slate-900 text-white font-bold text-xs transition-colors"
                        >
                          ⚡ Buy Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MY TRADE REQUESTS & SUBMITTED LISTINGS */}
      {activeTab === 'chats' && (
        <div className="space-y-4">
          {/* MY SUBMITTED MARKETPLACE LISTINGS & APPROVAL STATUS TRACKER */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4 text-teal-600" />
                  My Submitted Marketplace Listings
                </h3>
                <p className="text-[11px] text-slate-500">
                  Track admin price review, benchmark status, and live marketplace publication status.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSellModal(true);
                  handleLoadSamplePhotos('Medical Equipment');
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Post New Item
              </button>
            </div>

            {(() => {
              const myPending = (pendingMarketplaceItems || []).filter(
                (item) => item.sellerNickname === userProfile?.nickname
              );
              const myApproved = approvedMarketplaceItems.filter(
                (item) => item.sellerNickname === userProfile?.nickname
              );
              const totalMyItems = myPending.length + myApproved.length;

              if (totalMyItems === 0) {
                return (
                  <div className="p-4 text-center text-slate-500 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
                    <p className="font-bold text-slate-700">You haven't posted any marketplace items yet.</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      When you submit an item for sale, it is saved automatically and stays in <span className="font-bold text-amber-700">Pending Approval</span> state until an admin reviews and approves it.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-2.5">
                  {/* Render Pending Items */}
                  {myPending.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-3">
                          {item.imageUrls?.[0] && (
                            <img src={item.imageUrls[0]} alt={item.title} className="w-12 h-12 rounded-lg object-cover border border-amber-300 shrink-0" />
                          )}
                          <div>
                            <h4 className="font-bold text-slate-900">{item.title}</h4>
                            <p className="text-[11px] text-slate-600">
                              Category: <span className="font-semibold">{item.category}</span> • Asking Price: <span className="font-bold text-teal-800">₦{item.askingPrice.toLocaleString()}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">📍 Meet-up: {item.meetupPoint}</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-950 font-extrabold text-[10px] flex items-center gap-1 border border-amber-300 shrink-0 shadow-xs">
                          <Clock className="w-3 h-3 text-amber-800 animate-spin" /> PENDING ADMIN APPROVAL
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-white/90 border border-amber-200 text-[11px] text-amber-900 font-medium flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>
                          Your listing is saved and waiting for Admin price benchmark review. Once approved, it will automatically appear live on the Marketplace!
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Render Approved Items */}
                  {myApproved.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-3">
                          {item.imageUrls?.[0] && (
                            <img src={item.imageUrls[0]} alt={item.title} className="w-12 h-12 rounded-lg object-cover border border-emerald-300 shrink-0" />
                          )}
                          <div>
                            <h4 className="font-bold text-slate-900">{item.title}</h4>
                            <p className="text-[11px] text-slate-600">
                              Category: <span className="font-semibold">{item.category}</span> • Price: <span className="font-bold text-teal-800">₦{(item.adminApprovedPrice ?? item.askingPrice).toLocaleString()}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">📍 Meet-up: {item.meetupPoint}</p>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] flex items-center gap-1 border shrink-0 shadow-xs ${
                          item.status === 'SOLD'
                            ? 'bg-slate-200 text-slate-700 border-slate-300'
                            : 'bg-emerald-200 text-emerald-900 border-emerald-300'
                        }`}>
                          {item.status === 'SOLD' ? '✓ SOLD' : '✅ APPROVED & LIVE'}
                        </span>
                      </div>

                      {item.status !== 'SOLD' && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => setSoldModalItem(item)}
                            className="px-3 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] transition-colors"
                          >
                            Mark Item as Sold
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* ADMIN MIDDLEMAN CHAT & TRADE REQUESTS DESK */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[420px]">
            {/* Conversations Sidebar */}
            <div className="w-full md:w-1/3 border-r border-slate-100 bg-slate-50/50 p-3 space-y-2">
              <h3 className="font-extrabold text-slate-900 text-xs px-2 py-1 uppercase tracking-wider text-slate-500">
                Trade Desk Channels
              </h3>
              <div className="space-y-1.5">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all border ${
                      activeConvId === conv.id
                        ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-xs">{conv.otherUserNickname}</span>
                      <span className={`text-[9px] ${activeConvId === conv.id ? 'text-teal-100' : 'text-slate-400'}`}>
                        {conv.lastTimestamp}
                      </span>
                    </div>
                    {conv.itemTitle && (
                      <p className={`text-[10px] font-bold mt-0.5 line-clamp-1 ${activeConvId === conv.id ? 'text-teal-100' : 'text-teal-700'}`}>
                        📦 {conv.itemTitle} (₦{(conv.itemPrice ?? 0).toLocaleString()})
                      </p>
                    )}
                    <p className={`text-[11px] line-clamp-1 mt-1 ${activeConvId === conv.id ? 'text-teal-50' : 'text-slate-500'}`}>
                      {conv.lastMessage}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Message Thread */}
            <div className="flex-1 flex flex-col justify-between p-4 bg-white">
              {currentConv ? (
                <>
                  {/* Chat Header */}
                  <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-teal-600" />
                        {currentConv.otherUserNickname}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Admin oversees marketplace requests to eliminate spam, harassment & fraud.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-teal-50 text-teal-800 text-[10px] font-extrabold rounded-full border border-teal-200">
                      Trusted Middleman Active
                    </span>
                  </div>

                  {/* Message Log */}
                  <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-[320px]">
                    {activeMessages.map((msg) => {
                      const isMe = msg.senderNickname === userProfile?.nickname;
                      return (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-2xl max-w-[85%] space-y-1 text-xs ${
                            isMe
                              ? 'bg-teal-600 text-white ml-auto rounded-br-xs shadow-xs'
                              : 'bg-slate-100 text-slate-800 mr-auto rounded-bl-xs border border-slate-200'
                          }`}
                        >
                          {msg.isPledgeConfirmed && (
                            <div className="p-2 rounded-xl bg-teal-700/80 text-teal-50 text-[11px] font-bold mb-1 border border-teal-500/40">
                              🛡️ SERIOUS BUYER PLEDGE LOGGED BY ADMIN
                            </div>
                          )}
                          <p className="whitespace-pre-line font-medium leading-relaxed">{msg.text}</p>
                          <span className={`text-[9px] block text-right opacity-75`}>{msg.timestamp}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSendDirectMessage} className="pt-3 border-t border-slate-100 flex gap-2">
                    <input
                      type="text"
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      placeholder="Reply to FUHSI Admin Trade Desk..."
                      className="flex-1 text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs italic">
                  Select a conversation to start chatting
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SELL AN ITEM FORM (4-6 PHOTOS REQUIRED!) */}
      {showSellModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Post Item for Sale on Campus</h3>
                <p className="text-[11px] text-teal-700 font-bold">📷 At least 4 clear photos required for admin review</p>
              </div>
              <button onClick={() => setShowSellModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {sellSuccessMsg ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center">
                ✓ Item submitted with 4+ photos to SUG Commerce for 10% price benchmark check & approval!
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
                    placeholder="e.g. 3M Littmann Stethoscope or Guyton Physiology Textbook"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        handleLoadSamplePhotos(e.target.value);
                      }}
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 bg-white font-medium"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Asking Price (₦)</label>
                    <input
                      type="number"
                      value={askingPrice}
                      onChange={(e) => setAskingPrice(Number(e.target.value) || '')}
                      placeholder="e.g. 38000"
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 font-bold"
                      required
                    />
                  </div>
                </div>

                {/* Live 10% Commission Calculator Box */}
                {priceVal > 0 && (
                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs space-y-1">
                    <p className="font-bold text-teal-900">💰 Live Campus Commission Breakdown:</p>
                    <div className="flex justify-between text-teal-800">
                      <span>Listed Price:</span>
                      <span>₦{priceVal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-teal-800">
                      <span>10% Campus Server Fee:</span>
                      <span>- ₦{adminFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-black text-teal-950 border-t border-teal-200/80 pt-1">
                      <span>Your Net Payout:</span>
                      <span>₦{netPayout.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Safe Public Campus Meet-Up Point</label>
                  <select
                    value={meetupPoint}
                    onChange={(e) => setMeetupPoint(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 bg-white font-bold"
                  >
                    {meetupLocations.map((loc) => (
                      <option key={loc} value={`📍 ${loc}`}>📍 {loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description & Honest Condition</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe item condition, inclusions, accessories, reason for selling..."
                    rows={2}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800"
                    required
                  />
                </div>

                {/* 4 to 6 Clear Photos Section */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-extrabold text-slate-900">
                      📷 4–6 Clear Photo URLs (Required)
                    </label>
                    <button
                      type="button"
                      onClick={() => handleLoadSamplePhotos(category)}
                      className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md hover:bg-teal-100"
                    >
                      Load Sample 4-Photo Pack
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">Photo 1 (Front View) *</span>
                      <input
                        type="url"
                        value={photo1}
                        onChange={(e) => setPhoto1(e.target.value)}
                        placeholder="https://..."
                        className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">Photo 2 (Side/Back View) *</span>
                      <input
                        type="url"
                        value={photo2}
                        onChange={(e) => setPhoto2(e.target.value)}
                        placeholder="https://..."
                        className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">Photo 3 (Label / Serial View) *</span>
                      <input
                        type="url"
                        value={photo3}
                        onChange={(e) => setPhoto3(e.target.value)}
                        placeholder="https://..."
                        className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">Photo 4 (Accessories View) *</span>
                      <input
                        type="url"
                        value={photo4}
                        onChange={(e) => setPhoto4(e.target.value)}
                        placeholder="https://..."
                        className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-800"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Submit 4-Photo Item to Admin Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADMIN MIDDLEMAN BUY REQUEST & SERIOUS BUYER PLEDGE */}
      {buyModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" /> Request to Buy (via Admin Middleman)
              </h3>
              <button onClick={() => setBuyModalItem(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            {buyIntentSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold text-center space-y-1.5">
                <p className="text-sm">✓ Request Submitted to Admin Desk!</p>
                <p className="text-[11px] font-medium text-emerald-800">
                  Opening FUHSI Admin Trade Desk... Admin will contact @{buyModalItem.sellerNickname} privately to verify item availability.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                {/* Item Summary Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <p className="font-extrabold text-slate-900 text-sm">{buyModalItem.title}</p>
                    <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 font-black text-xs">
                      ₦{(buyModalItem.adminApprovedPrice ?? buyModalItem.askingPrice ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Seller: <span className="font-bold text-slate-800">{buyModalItem.sellerNickname}</span>
                  </p>
                  <p className="text-teal-800 text-[11px] font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" /> Safe Meet-up Location: {buyModalItem.meetupPoint}
                  </p>
                </div>

                {/* Why Admin Middleman Box */}
                <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-200 text-teal-900 space-y-1 text-[11px]">
                  <p className="font-bold text-teal-950 flex items-center gap-1">
                    🛡️ How the Admin Middleman Works:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-teal-800">
                    <li>Your request goes directly to FUHSI Admin Desk (Not a direct seller DM).</li>
                    <li>Admin contacts @{buyModalItem.sellerNickname} privately to check if the item is available.</li>
                    <li>Both parties meet at {buyModalItem.meetupPoint} for safe physical inspection & payment.</li>
                    <li>No money is held or collected by Admin.</li>
                  </ul>
                </div>

                {/* Serious Buyer System Notice */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
                  <p className="font-extrabold text-amber-950 flex items-center gap-1.5 text-xs">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Serious Buyer System Notice</span>
                  </p>
                  <p className="text-[11px] leading-relaxed text-amber-900">
                    By continuing, you confirm that you genuinely intend to purchase this item. Repeated false requests or failing to appear at safe meet-ups will result in reputation point deductions or marketplace suspension.
                  </p>

                  <label className="flex items-start gap-2 pt-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pledgeChecked}
                      onChange={(e) => setPledgeChecked(e.target.checked)}
                      className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 w-4 h-4 shrink-0"
                    />
                    <span className="font-extrabold text-slate-900 text-[11px] leading-snug">
                      "I confirm my genuine intention to buy '{buyModalItem.title}' at ₦{(buyModalItem.adminApprovedPrice ?? buyModalItem.askingPrice ?? 0).toLocaleString()} and request Admin to verify availability."
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleConfirmPledgeAndOpenDM}
                  disabled={!pledgeChecked}
                  className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                    pledgeChecked
                      ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Purchase Request to Admin Desk</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: MULTI-PHOTO LIGHTBOX PREVIEW */}
      {previewPhotoItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-4 text-white space-y-3 border border-slate-800">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">{previewPhotoItem.title}</h3>
                <p className="text-[10px] text-teal-400 font-bold">
                  Photo {previewPhotoIdx + 1} of {previewPhotoItem.imageUrls.length}
                </p>
              </div>
              <button onClick={() => setPreviewPhotoItem(null)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            <div className="h-64 rounded-xl overflow-hidden bg-black flex items-center justify-center p-1">
              <img
                src={previewPhotoItem.imageUrls[previewPhotoIdx]}
                alt="preview"
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="flex gap-2 justify-center overflow-x-auto py-1">
              {previewPhotoItem.imageUrls.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setPreviewPhotoIdx(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border transition-all ${
                    previewPhotoIdx === idx ? 'border-teal-400 ring-2 ring-teal-400 scale-105' : 'border-slate-700 opacity-60'
                  }`}
                >
                  <img src={url} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MARK AS SOLD WITH RATING STARS */}
      {soldModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Mark Item as Sold</h3>
              <button onClick={() => setSoldModalItem(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-700 font-medium">
                Marking <span className="font-bold">{soldModalItem.title}</span> as SOLD. Select seller rating tag to display:
              </p>

              <div className="flex items-center gap-2 justify-center py-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setRatingStars(s);
                      setRatingTag(`Honest Seller ${'⭐'.repeat(s)}`);
                    }}
                    className={`text-2xl transition-transform hover:scale-110 ${s <= ratingStars ? 'text-amber-500' : 'text-slate-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setRatingTag('Honest Seller ⭐⭐⭐⭐⭐')}
                  className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold hover:bg-amber-100"
                >
                  Honest Seller ⭐⭐⭐⭐⭐
                </button>
                <button
                  type="button"
                  onClick={() => setRatingTag('Fast Payment ⭐⭐⭐⭐⭐')}
                  className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold hover:bg-amber-100"
                >
                  Fast Payment ⭐⭐⭐⭐⭐
                </button>
              </div>

              <button
                onClick={handleConfirmSold}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Confirm Sold & Save Seller Rating Tag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
