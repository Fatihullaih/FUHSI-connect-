import { UserProfile, Post, Notice, Resource, CampusEvent, ModerationReport, DepartmentRanking, Comment } from './types';

export const INITIAL_USER: UserProfile = {
  id: 'user_001',
  nickname: 'MedicPioneer_24',
  realName: 'Adepoju Fatih',
  studentId: 'FUHSI/2022/MED/089',
  department: 'Medicine & Surgery',
  level: '300 Level',
  bio: 'aspiring neurosurgeon | passion for public health & medical tech 🩺🔬',
  avatarId: 'caduceus',
  reputationPoints: 485,
  badge: 'Campus Scholar',
  strikes: 0,
  isBanned: false,
  privacyMode: 'Nickname'
};

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_101',
    authorNickname: 'AnatomyWizard',
    authorAvatarId: 'brain',
    authorDepartment: 'Medicine & Surgery',
    authorLevel: '200 Level',
    content: 'Quick revision tip for Neuroanatomy test tomorrow: Focus heavily on cranial nerve pathways and ventricular system CSF flow! I uploaded my condensed memory charts to the Campus Hub Resource section. Good luck everyone! 🧠📚',
    category: 'Academic',
    timestamp: '25 mins ago',
    upvotes: 42,
    downvotes: 1,
    commentCount: 8,
    shareCount: 14,
    userVote: 'up',
    isBookmarked: true,
    status: 'Active'
  },
  {
    id: 'post_102',
    authorNickname: 'PharmaCadet',
    authorAvatarId: 'capsule',
    authorDepartment: 'Nursing Science',
    authorLevel: '400 Level',
    content: 'Does anyone know if the Central Library reading room will stay open past 10 PM during exam week? The air conditioning in Block C hostel has been failing all afternoon.',
    category: 'General',
    timestamp: '1 hour ago',
    upvotes: 28,
    downvotes: 0,
    commentCount: 12,
    shareCount: 3,
    userVote: null,
    isBookmarked: false,
    status: 'Active'
  },
  {
    id: 'post_103',
    authorNickname: 'SilentObserver_99',
    authorAvatarId: 'mask',
    authorDepartment: 'Public Health',
    authorLevel: '100 Level',
    content: 'Honestly, freshers orientation was super insightful! Big shoutout to the student executive committee for organizing the medical screening so efficiently yesterday. Feeling proud to be at FUHSI! 💙✨',
    category: 'Confessions',
    timestamp: '3 hours ago',
    upvotes: 65,
    downvotes: 2,
    commentCount: 5,
    shareCount: 9,
    userVote: null,
    isBookmarked: false,
    status: 'Active'
  },
  {
    id: 'post_104',
    authorNickname: 'LabPro_Ila',
    authorAvatarId: 'microscope',
    authorDepartment: 'Medical Lab Science',
    authorLevel: '300 Level',
    content: 'Selling a slightly used Littmann Classic III Stethoscope (Navy Blue Edition) + original Littmann carrying case. Perfect for clinical rotations! Price negotiable. DM if interested!',
    category: 'Marketplace',
    timestamp: '5 hours ago',
    upvotes: 19,
    downvotes: 0,
    commentCount: 6,
    shareCount: 2,
    userVote: null,
    isBookmarked: false,
    status: 'Active'
  },
  {
    id: 'post_105',
    authorNickname: 'CampusScout',
    authorAvatarId: 'compass',
    authorDepartment: 'Physiotherapy',
    authorLevel: '200 Level',
    content: 'FOUND: A blue Casio Scientific Calculator (FX-991EX) in Lecture Hall 2 after the Biostatistics lecture at 2 PM today. Please identify the unique sticker on the back to claim!',
    category: 'LostAndFound',
    timestamp: '6 hours ago',
    upvotes: 34,
    downvotes: 0,
    commentCount: 4,
    shareCount: 11,
    userVote: 'up',
    isBookmarked: false,
    status: 'Active'
  },
  {
    id: 'post_106',
    authorNickname: 'HealthTechLead',
    authorAvatarId: 'dna',
    authorDepartment: 'Nutrition & Dietetics',
    authorLevel: '300 Level',
    content: 'FUHSI Annual Health Hackathon registration is now officially open! Theme: Digital Interventions for Rural Health Care in Nigeria. Cash prizes + incubation support available. Check the Events tab in Campus Hub!',
    category: 'Events',
    timestamp: '8 hours ago',
    upvotes: 88,
    downvotes: 1,
    commentCount: 15,
    shareCount: 29,
    userVote: 'up',
    isBookmarked: true,
    status: 'Active'
  }
];

export const INITIAL_COMMENTS: Record<string, Comment[]> = {
  'post_101': [
    {
      id: 'c_1',
      postId: 'post_101',
      authorNickname: 'PulseRider',
      authorAvatarId: 'heart',
      content: 'Thank you so much! Those cranial nerve charts saved my continuous assessment test last semester.',
      timestamp: '18 mins ago',
      upvotes: 7,
      userVote: 'up'
    },
    {
      id: 'c_2',
      postId: 'post_101',
      authorNickname: 'BioChemPro',
      authorAvatarId: 'flask',
      content: 'Downloaded! Really appreciate the clear distinction between sensory and motor nuclei.',
      timestamp: '10 mins ago',
      upvotes: 3,
      userVote: null
    }
  ],
  'post_102': [
    {
      id: 'c_3',
      postId: 'post_102',
      authorNickname: 'LibraryPrefect',
      authorAvatarId: 'book',
      content: 'Yes! Official notice confirmed library extenders will run until midnight starting Monday.',
      timestamp: '45 mins ago',
      upvotes: 12,
      userVote: null
    }
  ]
};

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'not_1',
    title: 'First Semester Examination Schedule & Hall Allocations',
    content: 'The Management has published the draft examination timetable for 100L-400L students. Students are urged to cross-check course codes and report any conflicts to the Dean of Student Affairs by Friday.',
    category: 'Exam',
    publisher: 'Office of the Academic Registrar',
    date: 'July 28, 2026',
    urgent: true,
    read: false
  },
  {
    id: 'not_2',
    title: 'Mandatory Clinical Orientation for 300L Nursing & Medical Students',
    content: 'All 300L students proceeding for teaching hospital ward rotations must report at the Multipurpose Auditorium at 9:00 AM on Monday for mandatory infection control and lab safety briefing.',
    category: 'Academic',
    publisher: 'Faculty of Clinical Sciences',
    date: 'July 26, 2026',
    urgent: true,
    read: false
  },
  {
    id: 'not_3',
    title: 'Hostel Maintenance & Water Supply Upgrade Schedule',
    content: 'Routine maintenance of water treatment units at Male and Female Hall B will take place this Saturday between 7 AM and 12 PM. Water reservoirs will be pre-filled prior.',
    category: 'Hostel',
    publisher: 'Student Housing & Welfare',
    date: 'July 24, 2026',
    urgent: false,
    read: true
  }
];

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'res_1',
    title: 'Neuroanatomy High-Yield Revision Summary & Mindmaps',
    courseCode: 'ANA 301',
    department: 'Medicine & Surgery',
    level: '300 Level',
    fileType: 'PDF',
    fileSize: '4.8 MB',
    uploaderNickname: 'AnatomyWizard',
    downloads: 342,
    rating: 4.9,
    dateAdded: 'July 25, 2026'
  },
  {
    id: 'res_2',
    title: 'Pharmacology Drug Classifications & Mechanisms Matrix',
    courseCode: 'PHA 302',
    department: 'Nursing Science',
    level: '300 Level',
    fileType: 'PDF',
    fileSize: '2.1 MB',
    uploaderNickname: 'PharmaCadet',
    downloads: 215,
    rating: 4.8,
    dateAdded: 'July 22, 2026'
  },
  {
    id: 'res_3',
    title: 'Biostatistics Past Questions & Solved Worked Examples (2020-2025)',
    courseCode: 'STA 201',
    department: 'Public Health',
    level: '200 Level',
    fileType: 'DOCX',
    fileSize: '1.5 MB',
    uploaderNickname: 'StatMaster_FUHSI',
    downloads: 512,
    rating: 5.0,
    dateAdded: 'July 20, 2026'
  },
  {
    id: 'res_4',
    title: 'Hematology Lab Practical Manual & Slide Diagnostics',
    courseCode: 'MLS 305',
    department: 'Medical Lab Science',
    level: '300 Level',
    fileType: 'PPTX',
    fileSize: '12.4 MB',
    uploaderNickname: 'LabPro_Ila',
    downloads: 189,
    rating: 4.7,
    dateAdded: 'July 18, 2026'
  }
];

export const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: 'evt_1',
    title: 'FUHSI MedTech & Digital Health Innovation Summit 2026',
    location: 'Main University Auditorium',
    date: 'August 12, 2026',
    time: '10:00 AM - 3:30 PM',
    category: 'Seminar',
    organizer: 'FUHSI Innovation & Health Tech Society',
    description: 'Keynote speeches from leading Nigerian healthtech founders, student project demonstrations, and panel on AI in diagnostics.',
    rsvpCount: 142,
    isRsvped: true
  },
  {
    id: 'evt_2',
    title: 'Inter-Departmental Medical Football Tournament: Finals',
    location: 'FUHSI Sports Complex Pitch',
    date: 'August 08, 2026',
    time: '4:00 PM',
    category: 'Sports',
    organizer: 'Sports Directorate & SUG',
    description: 'Medicine & Surgery vs. Nursing Science in the grand finale of the Vice Chancellor Cup!',
    rsvpCount: 290,
    isRsvped: false
  },
  {
    id: 'evt_3',
    title: 'Free Community Health Outreach & Blood Pressure Drive',
    location: 'Ila-Orangun Central Market Square',
    date: 'August 15, 2026',
    time: '8:30 AM - 2:00 PM',
    category: 'Health',
    organizer: 'Public Health Association & Medical Students Org',
    description: 'Student-led community health awareness, screening, and health education under clinical supervisor guidance.',
    rsvpCount: 98,
    isRsvped: false
  }
];

export const INITIAL_MODERATION_REPORTS: ModerationReport[] = [
  {
    id: 'mod_1',
    postId: 'post_901',
    postContent: 'Unverified exam answers leaked for tomorrow test! Pay 2k to get PDF sample!',
    postAuthor: 'ScamTrap_007',
    reportedBy: 'PeerGuardian',
    reason: 'Academic Fraud / Exam Misconduct Promotion',
    timestamp: '2 hours ago',
    status: 'Pending',
    notes: 'Requires immediate action as exam integrity policy violation.'
  },
  {
    id: 'mod_2',
    postId: 'post_902',
    postContent: 'Targeted aggressive harassment post mentioning specific student in Block A.',
    postAuthor: 'AnonHarasser',
    reportedBy: 'HostelRep',
    reason: 'Cyberbullying & Personal Harassment',
    timestamp: '4 hours ago',
    status: 'Pending',
    notes: 'Content violates FUHSI Student Code of Conduct Section 4.2.'
  }
];

export const DEPARTMENT_RANKINGS: DepartmentRanking[] = [
  {
    name: 'Medicine & Surgery',
    code: 'MED',
    totalPoints: 14250,
    activeStudents: 420,
    topContributor: 'AnatomyWizard'
  },
  {
    name: 'Nursing Science',
    code: 'NUR',
    totalPoints: 11800,
    activeStudents: 380,
    topContributor: 'PharmaCadet'
  },
  {
    name: 'Medical Laboratory Science',
    code: 'MLS',
    totalPoints: 9400,
    activeStudents: 290,
    topContributor: 'LabPro_Ila'
  },
  {
    name: 'Public Health',
    code: 'PBH',
    totalPoints: 8900,
    activeStudents: 260,
    topContributor: 'StatMaster_FUHSI'
  },
  {
    name: 'Physiotherapy',
    code: 'PTH',
    totalPoints: 7200,
    activeStudents: 190,
    topContributor: 'CampusScout'
  },
  {
    name: 'Nutrition & Dietetics',
    code: 'NUT',
    totalPoints: 6100,
    activeStudents: 160,
    topContributor: 'HealthTechLead'
  }
];
