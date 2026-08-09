import { Post } from '../types';

const SAMPLE_AUTHORS = [
  { nickname: '@MedicCadet_Ila', dept: 'Medicine & Surgery', level: '300L', avatarKey: 'caduceus', badgeType: 'NONE', badgeTitle: '' },
  { nickname: '@NurseTutor_Faith', dept: 'Nursing Science', level: '400L', avatarKey: 'stethoscope', badgeType: 'NONE', badgeTitle: '' },
  { nickname: '@BioChemEnthusiast', dept: 'Biochemistry', level: '200L', avatarKey: 'pill', badgeType: 'NONE', badgeTitle: '' },
  { nickname: '@MLS_LabLead', dept: 'Medical Lab Science', level: '400L', avatarKey: 'microscope', badgeType: 'NONE', badgeTitle: '' },
  { nickname: '@SUG_WelfareExec', dept: 'Student Union Body', level: 'Executive', avatarKey: 'caduceus', badgeType: 'NONE', badgeTitle: '' },
  { nickname: '@PhysioGenius', dept: 'Physiology', level: '300L', avatarKey: 'stethoscope', badgeType: 'NONE', badgeTitle: '' },
  { nickname: '@PharmD_Scholar', dept: 'Pharmacy', level: '200L', avatarKey: 'pill', badgeType: 'NONE', badgeTitle: '' },
  { nickname: '@AnatomyPro_Ila', dept: 'Anatomy', level: '200L', avatarKey: 'caduceus', badgeType: 'NONE', badgeTitle: '' },
  { nickname: '@PublicHealth_Hero', dept: 'Public Health', level: '300L', avatarKey: 'stethoscope', badgeType: 'NONE', badgeTitle: '' },
];

const CATEGORIES = ['General', 'Academic', 'Events', 'Confessions', 'Marketplace', 'LostAndFound'];

const POST_TEMPLATES = [
  {
    content: "Reminder for 300L MB;BS students: Clinical posting roster for Osogbo & Ila General Hospitals will be pasted by 9:00 AM at the Dean's Office bulletin board. Please arrive early with your white coats!",
    category: 'Academic',
    department: 'Medicine & Surgery',
  },
  {
    content: "Quick study question for Biochemistry 202: Who can summarize the key rate-limiting step of Glycolysis vs Gluconeogenesis? Let's discuss in the comments before tomorrow's test! 💡",
    category: 'Academic',
    department: 'Biochemistry',
    pollQuestion: 'Which enzyme regulates the main committed step of Glycolysis?',
    pollOptA: 'Phosphofructokinase-1 (PFK-1)',
    pollOptB: 'Pyruvate Dehydrogenase',
  },
  {
    content: "Lost Item: Found an iPad with a black leather cover at the E-Library ground floor around 4 PM today. Contact the Library Admin counter with proof of lock screen passcode to claim it.",
    category: 'LostAndFound',
    department: 'All Campus',
  },
  {
    content: "📢 Campus Electricity Update: Maintenance team has finished transformer repairs for the Male & Female hostels. Normal power supply has been fully restored. Thanks for your patience!",
    category: 'General',
    department: 'All Campus',
  },
  {
    content: "For Sale: Brand new 3M Littmann Stethoscope (Black Edition) and Diagnostic Penlight. Unopened package from medical supply store. Price is ₦36,000 negotiable. DM if interested!",
    category: 'Marketplace',
    department: 'Medicine & Surgery',
  },
  {
    content: "Nurses Week Celebration 2026: Inter-Departmental Sports & Quiz Competition kicks off on Thursday by 3 PM at the Campus Pavilion. Come support Faculty of Nursing Science! 🏆🩺",
    category: 'Events',
    department: 'Nursing Science',
  },
  {
    content: "CA Exam Prep Tip: Don't just read textbook definitions — focus on clinical scenario questions for Physiology and Pathology. Practice past questions with study groups for best results!",
    category: 'Academic',
    department: 'Physiology',
  },
  {
    content: "The new E-Learning Portal update is now live! You can download PDF lecture slides for 100L-400L directly without login errors. Kudos to FUHSI IT Services!",
    category: 'General',
    department: 'All Campus',
    pollQuestion: 'Have you been able to log into the updated FUHSI portal?',
    pollOptA: 'Yes, working smoothly',
    pollOptB: 'Experiencing minor issues',
  },
  {
    content: "Anatomy Practical Spotting Test prep: Make sure you can identify all branches of the Axillary Artery and brachial plexus cords on the cadaver models before Friday!",
    category: 'Academic',
    department: 'Anatomy',
  },
  {
    content: "Shoutout to the Medical Laboratory Science team for organising the free Blood Group & Genotype screening session at the Student Center today! 👏🔬",
    category: 'Events',
    department: 'Medical Lab Science',
  },
];

export const generateMorePosts = (count: number = 5, startOffset: number = 0): Post[] => {
  const newPosts: Post[] = [];

  for (let i = 0; i < count; i++) {
    const templateIndex = (startOffset + i) % POST_TEMPLATES.length;
    const authorIndex = (startOffset + i) % SAMPLE_AUTHORS.length;

    const tpl = POST_TEMPLATES[templateIndex];
    const author = SAMPLE_AUTHORS[authorIndex];

    const minutesAgo = (startOffset + i + 1) * 12 + Math.floor(Math.random() * 5);
    let timeStr = '30s ago';
    if (minutesAgo < 1) {
      timeStr = `${Math.floor(Math.random() * 45) + 10}s ago`;
    } else if (minutesAgo < 60) {
      timeStr = `${minutesAgo}m ago`;
    } else if (minutesAgo < 1440) {
      const hours = Math.floor(minutesAgo / 60);
      timeStr = `${hours}h ago`;
    } else if (minutesAgo < 5760) {
      const days = Math.floor(minutesAgo / 1440);
      timeStr = `${days}d ago`;
    } else {
      timeStr = `(22/07/2026)`;
    }

    newPosts.push({
      id: `generated_post_${startOffset + i}_${Date.now()}`,
      authorNickname: author.nickname,
      authorBadgeType: author.badgeType as any,
      authorBadgeTitle: author.badgeTitle,
      authorAvatarKey: author.avatarKey,
      department: tpl.department,
      category: tpl.category as any,
      content: tpl.content,
      timestamp: timeStr,
      likesCount: Math.floor(Math.random() * 65) + 5,
      commentsCount: Math.floor(Math.random() * 18),
      isLikedByMe: false,
      isBookmarkedByMe: false,
      isGhostMode: false,
      pollQuestion: tpl.pollQuestion,
      pollOptA: tpl.pollOptA,
      pollOptB: tpl.pollOptB,
      pollVotesA: tpl.pollQuestion ? Math.floor(Math.random() * 40) + 10 : 0,
      pollVotesB: tpl.pollQuestion ? Math.floor(Math.random() * 30) + 5 : 0,
      isFlagged: false,
    });
  }

  return newPosts;
};
