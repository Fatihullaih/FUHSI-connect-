import React, { useState, useMemo } from 'react';
import { Post, MarketplaceItem, UserProfile } from '../types';
import { PostCard } from '../components/PostCard';
import { AuthorProfileModal } from '../components/AuthorProfileModal';
import { AvatarIcon } from '../components/AvatarIcon';
import {
  Search,
  Sparkles,
  TrendingUp,
  User,
  ShoppingBag,
  Hash,
  Building2,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  Crown,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';

interface SearchScreenProps {
  userProfile: UserProfile;
  posts: Post[];
  marketplaceItems: MarketplaceItem[];
  onSelectPost: (post: Post) => void;
  onLikeClick: (post: Post) => void;
  onBookmarkClick: (post: Post) => void;
  onCommentClick: (post: Post) => void;
  onAuthorClick?: (post: Post) => void;
}

interface CampusAccount {
  id: string;
  nickname: string;
  realName: string;
  department: string;
  level: string;
  bio: string;
  badgeType: 'GREEN' | 'BLUE' | 'GOLD' | 'PURPLE' | 'NONE';
  badgeTitle: string;
  avatarKey: string;
  reputationScore: number;
  isVerified: boolean;
}

// Preset verified campus accounts including official SUG Executives & Leaders
const PRESET_ACCOUNTS: CampusAccount[] = [
  {
    id: 'acc_sug_pres',
    nickname: '@SUGPresident',
    realName: 'Hon. Executive President (SUG)',
    department: 'SUG Executive Council',
    level: 'Executive',
    bio: 'Official Account of the Student Union Government President. Serving FUHSI students with integrity & excellence.',
    badgeType: 'GOLD',
    badgeTitle: 'SUG Executive President',
    avatarKey: 'caduceus',
    reputationScore: 5000,
    isVerified: true,
  },
  {
    id: 'acc_sug_welfare',
    nickname: '@SUG_Welfare',
    realName: 'SUG Directorate of Welfare',
    department: 'SUG Executive Council',
    level: 'Executive',
    bio: 'Overseeing student accommodation, campus shuttles, water/electricity supply, and student welfare across Ila-Orangun.',
    badgeType: 'GREEN',
    badgeTitle: 'SUG Welfare Director',
    avatarKey: 'caduceus',
    reputationScore: 4800,
    isVerified: true,
  },
  {
    id: 'acc_sug_treasurer',
    nickname: '@SUGTreasurer',
    realName: 'SUG Financial Director & Treasurer',
    department: 'SUG Executive Council',
    level: 'Executive',
    bio: 'Managing student union dues, community welfare grants, and transparent campus project budgeting.',
    badgeType: 'GOLD',
    badgeTitle: 'SUG Treasurer',
    avatarKey: 'caduceus',
    reputationScore: 4200,
    isVerified: true,
  },
  {
    id: 'acc_sug_pro',
    nickname: '@SUGPRO',
    realName: 'SUG Public Relations Officer',
    department: 'SUG Executive Council',
    level: 'Executive',
    bio: 'Official campus news broadcasts, emergency notices, and academic timetable updates.',
    badgeType: 'GREEN',
    badgeTitle: 'SUG Public Relations',
    avatarKey: 'caduceus',
    reputationScore: 4100,
    isVerified: true,
  },
  {
    id: 'acc_fuhsi_sug',
    nickname: '@FUHSI_SUG_Official',
    realName: 'FUHSI Student Union Body',
    department: 'Student Union Body',
    level: 'Executive',
    bio: 'Official network handle of the Federal University of Health Sciences, Ila-Orangun Student Union Government.',
    badgeType: 'GREEN',
    badgeTitle: 'SUG Welfare Committee',
    avatarKey: 'caduceus',
    reputationScore: 3850,
    isVerified: true,
  },
  {
    id: 'acc_med_hero',
    nickname: '@IlaMedHero',
    realName: 'Adeyemo Oluwaseun Joseph',
    department: 'Medicine & Surgery',
    level: '300L',
    bio: 'FUHSI Student | Learning & Saving Lives 🩺 | Class Rep',
    badgeType: 'BLUE',
    badgeTitle: 'Class Rep & Tech Lead',
    avatarKey: 'caduceus',
    reputationScore: 2450,
    isVerified: true,
  },
  {
    id: 'acc_future_doc',
    nickname: '@FutureDoctor',
    realName: 'Babalola Chinedu',
    department: 'Medicine & Surgery',
    level: '400L',
    bio: 'Clinical postings & clinical skills study group organizer.',
    badgeType: 'GOLD',
    badgeTitle: 'Academic Study Lead',
    avatarKey: 'stethoscope',
    reputationScore: 2180,
    isVerified: true,
  },
  {
    id: 'acc_nurse_queen',
    nickname: '@NurseQueen_Ila',
    realName: 'Amina Bello',
    department: 'Nursing Science',
    level: '300L',
    bio: '300L Nursing Science Class Rep & peer mentor.',
    badgeType: 'BLUE',
    badgeTitle: 'Clinical Skills Mentor',
    avatarKey: 'stethoscope',
    reputationScore: 1890,
    isVerified: true,
  },
  {
    id: 'acc_lab_pro',
    nickname: '@LabPro_MLS',
    realName: 'Emeka Okonkwo',
    department: 'Medical Lab Science',
    level: '400L',
    bio: 'MLS practicals contributor & lab equipment helper.',
    badgeType: 'BLUE',
    badgeTitle: 'Lab Practical Helper',
    avatarKey: 'microscope',
    reputationScore: 1620,
    isVerified: true,
  },
  {
    id: 'acc_preclinical',
    nickname: '@PreClinicalPro',
    realName: 'Oluwatosin Daniel',
    department: 'Anatomy',
    level: '200L',
    bio: 'Histology slides & dissection guide summaries.',
    badgeType: 'NONE',
    badgeTitle: 'Histology Contributor',
    avatarKey: 'caduceus',
    reputationScore: 1250,
    isVerified: false,
  },
  {
    id: 'acc_pharm_boss',
    nickname: '@PharmBoss',
    realName: 'Khadijah Ibrahim',
    department: 'Pharmacy',
    level: '300L',
    bio: 'Pharmacology flashcards & drug mechanism study notes.',
    badgeType: 'NONE',
    badgeTitle: 'Pharmacology Helper',
    avatarKey: 'pill',
    reputationScore: 980,
    isVerified: false,
  },
  {
    id: 'acc_physo_champ',
    nickname: '@PhysoChamp',
    realName: 'Victor Chukwu',
    department: 'Physiology',
    level: '200L',
    bio: 'Neurophysiology CA prep group lead.',
    badgeType: 'NONE',
    badgeTitle: 'CA Study Group Lead',
    avatarKey: 'stethoscope',
    reputationScore: 760,
    isVerified: false,
  },
  {
    id: 'acc_radiology',
    nickname: '@RadiologyExpert',
    realName: 'Grace Adeleke',
    department: 'Radiography',
    level: '400L',
    bio: 'X-Ray imaging & medical physics tutorial creator.',
    badgeType: 'NONE',
    badgeTitle: 'X-Ray Guide Creator',
    avatarKey: 'microscope',
    reputationScore: 540,
    isVerified: false,
  },
  {
    id: 'acc_biochem_whiz',
    nickname: '@BioChemWhiz',
    realName: 'Suleiman Farooq',
    department: 'Biochemistry',
    level: '100L',
    bio: 'Enzyme kinetics & metabolic pathway diagrams.',
    badgeType: 'NONE',
    badgeTitle: 'Enzyme Notes Share',
    avatarKey: 'pill',
    reputationScore: 320,
    isVerified: false,
  },
  {
    id: 'acc_medic_2024',
    nickname: '@MedicStudent_2024',
    realName: 'Tunde Oladipo',
    department: 'Medicine & Surgery',
    level: '200L',
    bio: '200L MBBS Student at FUHSI Ila.',
    badgeType: 'NONE',
    badgeTitle: '',
    avatarKey: 'caduceus',
    reputationScore: 450,
    isVerified: false,
  },
  {
    id: 'acc_campus_prints',
    nickname: '@Ila_Campus_Prints',
    realName: 'Ila Print & Digital Hub',
    department: 'Services & Businesses',
    level: 'Business',
    bio: '24/7 Color Printing, Past Questions & Project Binding opposite Ila Campus Gate 2.',
    badgeType: 'PURPLE',
    badgeTitle: 'Verified Campus Business',
    avatarKey: 'pill',
    reputationScore: 1400,
    isVerified: true,
  },
];

// Helper function to normalize strings for intelligent/smart matching (ignores spaces, underscores, hyphens, @)
const normalize = (str: string): string => {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Fuzzy match similarity score between query and target string
const getMatchScore = (query: string, target: string): number => {
  const normQuery = normalize(query);
  const normTarget = normalize(target);
  if (!normQuery || !normTarget) return 0;
  if (normTarget === normQuery) return 100;
  if (normTarget.startsWith(normQuery)) return 80;
  if (normTarget.includes(normQuery)) return 60;

  // Check token overlap e.g., "sug" and "welfare" in "SUG Welfare Director"
  const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const targetTokens = target.toLowerCase().split(/\s+/).filter(Boolean);
  let matchedTokens = 0;
  for (const qToken of queryTokens) {
    const normQ = normalize(qToken);
    if (normQ && targetTokens.some((tToken) => normalize(tToken).includes(normQ))) {
      matchedTokens++;
    }
  }
  if (queryTokens.length > 0 && matchedTokens > 0) {
    return (matchedTokens / queryTokens.length) * 50;
  }
  return 0;
};

export const SearchScreen: React.FC<SearchScreenProps> = ({
  userProfile,
  posts,
  marketplaceItems,
  onSelectPost,
  onLikeClick,
  onBookmarkClick,
  onCommentClick,
  onAuthorClick,
}) => {
  const [query, setQuery] = useState('');
  
  // Expand / View More state for Accounts and Posts
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [showAllHubItems, setShowAllHubItems] = useState(false);

  // Author profile modal
  const [selectedAuthor, setSelectedAuthor] = useState<UserProfile | null>(null);

  React.useEffect(() => {
    const handlePopState = () => {
      if (selectedAuthor) {
        setSelectedAuthor(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedAuthor]);

  const trendingTopics = [
    'SUG Welfare',
    'SUG President',
    'Anatomy CA 2',
    'Nursing Clinicals',
    'Shuttle Bus',
    'Littmann Stethoscope',
    'Guyton Physiology',
    'Ila Gate 2 Prints',
  ];

  // Compile full accounts list combining presets, post authors, and localStorage users
  const allAccounts = useMemo<CampusAccount[]>(() => {
    const accMap = new Map<string, CampusAccount>();

    // Add presets first
    PRESET_ACCOUNTS.forEach((acc) => {
      accMap.set(normalize(acc.nickname), acc);
    });

    // Add registered users from local storage if available
    try {
      const storedUsers = localStorage.getItem('fuhsi_users_db');
      if (storedUsers) {
        const parsed: UserProfile[] = JSON.parse(storedUsers);
        parsed.forEach((u) => {
          if (u.nickname) {
            const key = normalize(u.nickname);
            if (!accMap.has(key)) {
              accMap.set(key, {
                id: u.id || `usr_${key}`,
                nickname: u.nickname.startsWith('@') ? u.nickname : `@${u.nickname}`,
                realName: u.realName || u.nickname,
                department: u.department || 'FUHSI Student',
                level: u.level || 'Student',
                bio: u.bio || 'FUHSI Student Community Member.',
                badgeType: u.badgeType || 'NONE',
                badgeTitle: u.badgeTitle || '',
                avatarKey: u.avatarKey || 'caduceus',
                reputationScore: u.reputationScore || 500,
                isVerified: Boolean(u.isVerified),
              });
            }
          }
        });
      }
    } catch (e) {
      console.error(e);
    }

    // Add author nicknames from posts
    (posts || []).forEach((p) => {
      const nick = p.authorNickname || p.nickname || p.customNickname;
      if (nick) {
        const key = normalize(nick);
        if (!accMap.has(key)) {
          accMap.set(key, {
            id: `post_author_${key}`,
            nickname: nick.startsWith('@') ? nick : `@${nick}`,
            realName: nick.replace('@', ''),
            department: p.department || 'FUHSI Campus',
            level: 'Student',
            bio: `Active campus contributor on FUHSI Connect.`,
            badgeType: p.authorBadgeType || 'NONE',
            badgeTitle: p.authorBadgeTitle || '',
            avatarKey: p.authorAvatarKey || 'caduceus',
            reputationScore: 800,
            isVerified: p.authorBadgeType !== 'NONE',
          });
        }
      }
    });

    return Array.from(accMap.values());
  }, [posts]);

  // Perform Intelligent Search Matching for Accounts
  const matchingAccounts = useMemo(() => {
    if (!query.trim()) return [];
    
    return allAccounts
      .map((acc) => {
        const nickScore = getMatchScore(query, acc.nickname);
        const nameScore = getMatchScore(query, acc.realName);
        const deptScore = getMatchScore(query, acc.department);
        const titleScore = getMatchScore(query, acc.badgeTitle);
        const maxScore = Math.max(nickScore, nameScore, deptScore, titleScore);
        return { account: acc, score: maxScore };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.account);
  }, [query, allAccounts]);

  // Perform Intelligent Search Matching for Posts
  const matchingPosts = useMemo(() => {
    if (!query.trim()) return [];

    return (posts || [])
      .map((p) => {
        const contentScore = getMatchScore(query, p.content || '');
        const nickScore = getMatchScore(query, p.authorNickname || p.nickname || '');
        const deptScore = getMatchScore(query, p.department || '');
        const maxScore = Math.max(contentScore, nickScore, deptScore);
        return { post: p, score: maxScore };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.post);
  }, [query, posts]);

  // Perform Intelligent Search Matching for Marketplace Items
  const matchingHubItems = useMemo(() => {
    if (!query.trim()) return [];

    return (marketplaceItems || [])
      .map((item) => {
        const titleScore = getMatchScore(query, item.title || '');
        const descScore = getMatchScore(query, item.description || '');
        const catScore = getMatchScore(query, item.category || '');
        const sellerScore = getMatchScore(query, item.sellerNickname || '');
        const maxScore = Math.max(titleScore, descScore, catScore, sellerScore);
        return { item, score: maxScore };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);
  }, [query, marketplaceItems]);

  // Smart Search Suggestions ("Are you looking for...")
  const smartSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    
    // Find closest accounts that might match user intent even with typos
    const suggestions = allAccounts
      .map((acc) => {
        const score = Math.max(
          getMatchScore(query, acc.nickname),
          getMatchScore(query, acc.realName),
          getMatchScore(query, acc.badgeTitle)
        );
        return { nickname: acc.nickname, realName: acc.realName, score };
      })
      .filter((item) => item.score > 0)
      .slice(0, 4);

    return suggestions;
  }, [query, allAccounts]);

  // Reset View More toggle whenever query changes
  const handleQueryChange = (val: string) => {
    setQuery(val);
    setShowAllAccounts(false);
    setShowAllPosts(false);
    setShowAllHubItems(false);
  };

  // Convert account to UserProfile for modal
  const handleAccountClick = (acc: CampusAccount) => {
    const dummyPost: Post = {
      id: `acc_${acc.id}`,
      authorNickname: acc.nickname,
      authorAvatarKey: acc.avatarKey,
      authorBadgeType: acc.badgeType,
      authorBadgeTitle: acc.badgeTitle,
      authorPoints: acc.reputationScore,
      timeAgo: '',
      categoryTag: 'General',
      text: acc.bio,
      likesCount: 0,
      commentsCount: 0,
      isQuarantined: false,
      createdAt: '',
    };

    if (onAuthorClick) {
      onAuthorClick(dummyPost);
    } else {
      const profile: UserProfile = {
        id: acc.id,
        nickname: acc.nickname,
        realName: acc.realName,
        department: acc.department,
        level: acc.level,
        bio: acc.bio,
        badgeType: acc.badgeType,
        badgeTitle: acc.badgeTitle,
        avatarKey: acc.avatarKey,
        reputationScore: acc.reputationScore,
        isVerified: acc.isVerified,
      };
      setSelectedAuthor(profile);
      try { window.history.pushState({ subModal: 'searchAuthor' }, ''); } catch (e) { console.error(e); }
    }
  };

  const displayedAccounts = showAllAccounts ? matchingAccounts : matchingAccounts.slice(0, 3);
  const displayedPosts = showAllPosts ? matchingPosts : matchingPosts.slice(0, 5);
  const displayedHubItems = showAllHubItems ? matchingHubItems : matchingHubItems.slice(0, 3);

  const hasNoResults =
    query.trim() &&
    matchingAccounts.length === 0 &&
    matchingPosts.length === 0 &&
    matchingHubItems.length === 0;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4 pb-28 font-sans">
      {/* Search Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-teal-800 text-teal-100 shadow-xs">
            <Search size={20} />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Campus Search</span>
              <Sparkles size={16} className="text-amber-500 fill-amber-400" />
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              Find accounts, posts, discussions, and campus marketplace items
            </p>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search users, posts, topics, or marketplace..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-teal-600 focus:outline-none transition-all shadow-inner"
          />
          {query && (
            <button
              onClick={() => handleQueryChange('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 text-xs font-bold bg-slate-200 hover:bg-slate-300 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Smart Search Suggestions ("Are you looking for...") */}
      {query.trim() && smartSuggestions.length > 0 && (
        <div className="p-3 bg-teal-50/80 border border-teal-200/90 rounded-2xl text-xs text-teal-900 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-black text-teal-950">
            <Sparkles size={14} className="text-teal-600" />
            <span>Are you looking for...</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {smartSuggestions.map((sug) => (
              <button
                key={sug.nickname}
                onClick={() => handleQueryChange(sug.nickname)}
                className="px-2.5 py-1 bg-white hover:bg-teal-100/80 border border-teal-300 rounded-lg font-bold text-teal-800 hover:text-teal-950 text-[11px] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <User size={12} className="text-teal-600 shrink-0" />
                <span>{sug.nickname}</span>
                <span className="text-[10px] text-teal-600/80 font-medium">({sug.realName})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trending Topics (When no query typed) */}
      {!query.trim() && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
            <TrendingUp size={15} className="text-teal-600" />
            <span>Trending Campus Searches</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((tag) => (
              <button
                key={tag}
                onClick={() => handleQueryChange(tag)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-teal-50 text-slate-800 hover:text-teal-900 border border-slate-200/90 hover:border-teal-300 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Hash size={13} className="text-teal-600 shrink-0" />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {query.trim() && (
        <div className="space-y-5">
          {/* USER ACCOUNTS */}
          {matchingAccounts.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-teal-700" />
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Matching User Accounts ({matchingAccounts.length})
                  </h2>
                </div>
              </div>

              {/* Render Accounts */}
              <div className="divide-y divide-slate-100">
                {displayedAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => handleAccountClick(acc)}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <AvatarIcon avatarKey={acc.avatarKey} size={40} sizeClassName="w-10 h-10 text-teal-700" />
                        {acc.isVerified && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-teal-600 border border-white rounded-full flex items-center justify-center text-white">
                            <CheckCircle2 size={10} />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 leading-snug">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-teal-700 transition-colors">
                            {acc.nickname}
                          </h3>
                          {acc.badgeTitle && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-md text-[10px] font-bold flex items-center gap-0.5">
                              <Crown size={10} className="text-emerald-600" />
                              <span>{acc.badgeTitle}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-slate-700 truncate">{acc.realName}</p>
                        <p className="text-[10px] text-slate-500 font-medium truncate">
                          {acc.department} • {acc.level}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAccountClick(acc);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-800 hover:text-white border border-teal-200 text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-2xs"
                    >
                      <span>View Profile</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {/* View More User Accounts Button */}
              {matchingAccounts.length > 3 && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setShowAllAccounts(!showAllAccounts)}
                    className="w-full py-2.5 px-4 bg-teal-50 hover:bg-teal-100 text-teal-800 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs border border-teal-200/80"
                  >
                    <span>
                      {showAllAccounts
                        ? 'Show Top 3 Accounts'
                        : `View More Accounts (${matchingAccounts.length - 3} remaining)`}
                    </span>
                    {showAllAccounts ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* POSTS */}
          {matchingPosts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-teal-600" />
                  <span>Matching Posts ({matchingPosts.length})</span>
                </h2>
              </div>

              {displayedPosts.map((post, idx) => (
                <PostCard
                  key={post.id || `search_post_${idx}`}
                  post={post}
                  onLikeClick={() => onLikeClick(post)}
                  onBookmarkClick={() => onBookmarkClick(post)}
                  onCommentClick={() => onCommentClick(post)}
                />
              ))}

              {/* View More Posts Button */}
              {matchingPosts.length > 5 && (
                <div className="pt-1">
                  <button
                    onClick={() => setShowAllPosts(!showAllPosts)}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>
                      {showAllPosts
                        ? 'Show Top 5 Posts'
                        : `View More Posts (${matchingPosts.length - 5} remaining)`}
                    </span>
                    {showAllPosts ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MARKETPLACE HUB ITEMS */}
          {matchingHubItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} className="text-teal-700" />
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Marketplace & Hub Matches ({matchingHubItems.length})
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {displayedHubItems.map((item, idx) => (
                  <div
                    key={item.id || `search_hub_${idx}`}
                    className="bg-slate-50 p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      <h3 className="text-xs font-extrabold text-slate-900 truncate mt-1">{item.title}</h3>
                      <p className="text-xs font-black text-teal-800">
                        ₦{(item.adminApprovedPrice ?? item.askingPrice ?? 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        By{' '}
                        <button
                          type="button"
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
                          className="font-bold text-slate-800 hover:text-teal-700 hover:underline cursor-pointer focus:outline-none"
                        >
                          {item.sellerNickname}
                        </button>
                      </p>
                    </div>
                    {item.imageUrls?.[0] && (
                      <img
                        src={item.imageUrls[0]}
                        alt={item.title}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* View More Hub Items Button */}
              {matchingHubItems.length > 3 && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setShowAllHubItems(!showAllHubItems)}
                    className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>
                      {showAllHubItems
                        ? 'Show Top 3 Items'
                        : `View More Items (${matchingHubItems.length - 3} remaining)`}
                    </span>
                    {showAllHubItems ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* No Results Found */}
          {hasNoResults && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <HelpCircle size={24} />
              </div>
              <h3 className="text-sm font-black text-slate-900">No exact matches found for "{query}"</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for different keywords, usernames, or topics.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Author Profile Modal */}
      {selectedAuthor && (
        <AuthorProfileModal
          authorNickname={selectedAuthor.nickname}
          authorAvatarKey={selectedAuthor.avatarKey}
          authorAvatarUrl={selectedAuthor.avatarUrl}
          authorBadgeType={selectedAuthor.badgeType}
          authorBadgeTitle={selectedAuthor.badgeTitle}
          allPosts={posts}
          onClose={() => setSelectedAuthor(null)}
          onCommentClick={(post) => {
            onSelectPost(post);
          }}
        />
      )}
    </div>
  );
};
