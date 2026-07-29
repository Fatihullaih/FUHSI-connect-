import React, { useState } from 'react';
import { MarketplaceItem, UserProfile } from '../types';
import { ShoppingBag, ShieldCheck, Tag, MapPin, Eye, Plus, Heart, Check, Star, DollarSign, ExternalLink, HelpCircle } from 'lucide-react';

interface CampusHubScreenProps {
  userProfile: UserProfile | null;
  approvedMarketplaceItems: MarketplaceItem[];
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
}

export const CampusHubScreen: React.FC<CampusHubScreenProps> = ({
  userProfile,
  approvedMarketplaceItems,
  onSubmitMarketplaceItem,
  onRecordDmBuyIntent,
  onMarkAsSold,
  onApplyVerificationWithFee,
}) => {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'fund' | 'verfee' | 'perks'>('marketplace');

  // Sell Item Form Modal State
  const [showSellModal, setShowSellModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Medical Equipment');
  const [askingPrice, setAskingPrice] = useState<number | ''>('');
  const [conditionTag, setConditionTag] = useState('Like New (Used 2 Weeks)');
  const [description, setDescription] = useState('');
  const [sellerPhone, setSellerPhone] = useState(userProfile?.emergencyHomePhone || '08031234567');
  const [meetupPoint, setMeetupPoint] = useState('Main Library Entrance');
  const [imageUrl, setImageUrl] = useState('');
  const [sellSuccessMsg, setSellSuccessMsg] = useState(false);

  // Buy Intent Modal State
  const [buyModalItem, setBuyModalItem] = useState<MarketplaceItem | null>(null);
  const [buyIntentSuccess, setBuyIntentSuccess] = useState(false);

  // Sold Rating Modal State
  const [soldModalItem, setSoldModalItem] = useState<MarketplaceItem | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingTag, setRatingTag] = useState('Trusted Seller ⭐⭐⭐⭐⭐');

  // Multi-photo Preview Modal State
  const [previewPhotoItem, setPreviewPhotoItem] = useState<MarketplaceItem | null>(null);
  const [previewPhotoIdx, setPreviewPhotoIdx] = useState(0);

  const categories = [
    'Medical Equipment',
    'Textbooks & Books',
    'Lab Gear',
    'Electronics & Gadgets',
    'Hostel Essentials',
  ];

  const meetupLocations = [
    'Main Library Entrance',
    'Faculty Reception Hall',
    'Cafeteria Hall Entrance',
    'School Main Gate Pavilion',
    'Matriculation Pavilion Ground',
  ];

  // 10% Fee calculations
  const priceVal = typeof askingPrice === 'number' ? askingPrice : 0;
  const adminFee = Math.round(priceVal * 0.1);
  const netPayout = priceVal - adminFee;

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !askingPrice) return;

    const images = imageUrl.trim()
      ? [imageUrl.trim()]
      : ['https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80'];

    onSubmitMarketplaceItem({
      title,
      category,
      askingPrice: priceVal,
      conditionTag,
      description,
      sellerPhone,
      meetupPoint,
      imageUrls: images,
    });

    setSellSuccessMsg(true);
    setTimeout(() => {
      setSellSuccessMsg(false);
      setShowSellModal(false);
      setTitle('');
      setAskingPrice('');
      setDescription('');
    }, 1800);
  };

  const handleConfirmBuyIntent = () => {
    if (buyModalItem) {
      onRecordDmBuyIntent(buyModalItem.id);
      setBuyIntentSuccess(true);
      setTimeout(() => {
        setBuyIntentSuccess(false);
        setBuyModalItem(null);
      }, 2000);
    }
  };

  const handleConfirmSold = () => {
    if (soldModalItem) {
      onMarkAsSold(soldModalItem.id, ratingStars, ratingTag);
      setSoldModalItem(null);
    }
  };

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
              <h1 className="font-extrabold text-base">FUHSI Campus Hub & Commerce</h1>
              <p className="text-xs text-teal-200">
                Verified Student Marketplace, Safe Meet-Up Locations & Community Fund
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex-1 min-w-[120px] py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'marketplace'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>🛍️</span> Marketplace
        </button>
        <button
          onClick={() => setActiveTab('fund')}
          className={`flex-1 min-w-[120px] py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'fund'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>📊</span> Server Fund
        </button>
        <button
          onClick={() => setActiveTab('verfee')}
          className={`flex-1 min-w-[120px] py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'verfee'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>⭐</span> Verification Fee
        </button>
        <button
          onClick={() => setActiveTab('perks')}
          className={`flex-1 min-w-[120px] py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'perks'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>❤️</span> Donor Perks
        </button>
      </div>

      {/* TAB 1: MARKETPLACE */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          {/* Action Bar & Info */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Approved Student Items</h2>
              <p className="text-[11px] text-slate-500">
                Fixed prices checked by SUG Commerce. 10% campus fee supports student fund.
              </p>
            </div>
            <button
              onClick={() => setShowSellModal(true)}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              Sell an Item
            </button>
          </div>

          {/* Marketplace Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {approvedMarketplaceItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  {/* Image Carousel / Clickable Photo */}
                  <div
                    onClick={() => {
                      setPreviewPhotoItem(item);
                      setPreviewPhotoIdx(0);
                    }}
                    className="relative h-44 bg-slate-100 cursor-pointer overflow-hidden group"
                  >
                    <img
                      src={item.imageUrls[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                      {item.category}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {item.imageUrls.length} photos
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h3>
                      <span className="font-black text-teal-700 text-base shrink-0">
                        ₦{item.adminApprovedPrice.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>

                    <div className="flex items-center gap-2 flex-wrap text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                        {item.conditionTag}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 font-medium">
                        <MapPin className="w-3 h-3 text-teal-600" /> {item.meetupPoint}
                      </span>
                    </div>

                    {item.sellerRatingTag && (
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {item.sellerRatingTag}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-3.5 pt-0 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2 mt-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Seller: <span className="font-bold text-slate-800">{item.sellerNickname}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {item.sellerNickname === userProfile?.nickname && (
                      <button
                        onClick={() => setSoldModalItem(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs hover:bg-emerald-200 transition-colors"
                      >
                        Mark Sold
                      </button>
                    )}

                    <button
                      onClick={() => setBuyModalItem(item)}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors"
                    >
                      Request Buy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SERVER & COMMUNITY FUND */}
      {activeTab === 'fund' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-bold text-slate-900 text-base">FUHSI Connect Server & Domain Fund</h2>
                <p className="text-xs text-slate-500">
                  Transparency Dashboard: Funding Cloud Run server, SSL certificates & database storage.
                </p>
              </div>
              <span className="font-extrabold text-teal-700 text-sm bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                78% Funded
              </span>
            </div>

            {/* Progress Meter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Raised: ₦117,000</span>
                <span>Goal: ₦150,000 / Year</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full w-[78%]" />
              </div>
            </div>

            {/* Budget Breakdown */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-slate-500 font-medium">Cloud Server Hosting</p>
                <p className="font-extrabold text-slate-800">₦90,000 / year</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-slate-500 font-medium">Database & Media Vault</p>
                <p className="font-extrabold text-slate-800">₦40,000 / year</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-slate-500 font-medium">Custom Domain & SSL</p>
                <p className="font-extrabold text-slate-800">₦12,000 / year</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-slate-500 font-medium">Domain Privacy Shield</p>
                <p className="font-extrabold text-slate-800">₦8,000 / year</p>
              </div>
            </div>

            {/* Recent Donors List */}
            <div className="pt-2 space-y-2">
              <h3 className="font-bold text-slate-800 text-xs">Recent Community Supporters</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg bg-teal-50/50 border border-teal-100">
                  <span className="font-bold text-slate-800">👑 Anonymous MB;BS Alumnus</span>
                  <span className="font-extrabold text-teal-700">₦50,000</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800">@IlaMedHero (300L Medicine)</span>
                  <span className="font-extrabold text-teal-700">₦15,000</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800">@NurseQueen_Ila (Nursing)</span>
                  <span className="font-extrabold text-teal-700">₦10,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VERIFICATION FEE */}
      {activeTab === 'verfee' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-base">Verification Review Processing Fee (₦1,500)</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Students who reach 3,000 Reputation Points can pay a ₦1,500 processing fee to request expedited identity & student card credential review by the Admin Board:
            </p>

            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 space-y-2 text-xs">
              <p className="font-bold text-teal-900">What does the ₦1,500 Verification Review Fee cover?</p>
              <ul className="list-disc pl-4 space-y-1 text-teal-800">
                <li>Manual verification of student matriculation record with official FUHSI database.</li>
                <li>Issuance of Blue or Green Verified Leader badge on handle.</li>
                <li>Priority listing on Weekly Rankings and Marketplace postings.</li>
                <li>Support towards student server maintenance expenses.</li>
              </ul>
            </div>

            <button
              onClick={onApplyVerificationWithFee}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Pay ₦1,500 & Submit Verification Credentials
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: DONOR PERKS */}
      {activeTab === 'perks' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-base">Community Donor Perks & Honors</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-xl">🌟</span>
                <h3 className="font-bold text-amber-900">Donor Badge on Profile</h3>
                <p className="text-amber-800 text-[11px]">Special gold star honor badge displayed on your nickname profile.</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
                <span className="text-xl">🚀</span>
                <h3 className="font-bold text-purple-900">Priority Marketplace Pin</h3>
                <p className="text-purple-800 text-[11px]">Your marketplace items stay pinned near top for faster sales.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SELL AN ITEM FORM */}
      {showSellModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Post Item for Sale on Campus</h3>
              <button onClick={() => setShowSellModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {sellSuccessMsg ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center">
                ✓ Item submitted to SUG Commerce for 10% price benchmark check & approval!
              </div>
            ) : (
              <form onSubmit={handleSellSubmit} className="space-y-3">
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
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 bg-white"
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
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800"
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
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 bg-white"
                  >
                    {meetupLocations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description & Condition</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe item condition, inclusions, and reason for selling..."
                    rows={2}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Photo Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/item.jpg"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Submit Item to SUG Commerce
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: BUY INTENT ADMIN MEDIATION */}
      {buyModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" /> Admin-Mediated Safe Buy Flow
              </h3>
              <button onClick={() => setBuyModalItem(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {buyIntentSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center">
                ✓ Buy interest recorded! Admin Hotline will mediate the safe meet-up at {buyModalItem.meetupPoint}.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-slate-700 font-medium">
                  You are requesting to buy <span className="font-bold text-slate-900">{buyModalItem.title}</span> for{' '}
                  <span className="font-black text-teal-700">₦{buyModalItem.adminApprovedPrice.toLocaleString()}</span>.
                </p>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  <p className="font-bold">🛡️ FUHSI Campus Safety Guarantee:</p>
                  <p className="text-[11px] leading-relaxed">
                    Unmediated private DMs are blocked to prevent scams. Meet-up must occur at designated public location:{' '}
                    <span className="font-bold">{buyModalItem.meetupPoint}</span>.
                  </p>
                </div>

                <button
                  onClick={handleConfirmBuyIntent}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Confirm Request via Admin Hotline
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: MULTI-PHOTO PREVIEW */}
      {previewPhotoItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-4 text-white space-y-3 border border-slate-800">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">{previewPhotoItem.title}</h3>
              <button onClick={() => setPreviewPhotoItem(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="h-64 rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <img
                src={previewPhotoItem.imageUrls[previewPhotoIdx]}
                alt="preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="flex gap-2 justify-center">
              {previewPhotoItem.imageUrls.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setPreviewPhotoIdx(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border ${
                    previewPhotoIdx === idx ? 'border-teal-400 ring-2 ring-teal-400' : 'border-slate-700 opacity-60'
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
                      setRatingTag(`Trusted Seller ${'⭐'.repeat(s)}`);
                    }}
                    className={`text-2xl ${s <= ratingStars ? 'text-amber-500' : 'text-slate-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <button
                onClick={handleConfirmSold}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Confirm Sold & Award Seller Stars
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
