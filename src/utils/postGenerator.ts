import { Post, UserProfile } from '../types';

export const DEMO_NICKNAMES = new Set([
  'mediccadet_ila',
  'nursetutor_faith',
  'biochementhusiast',
  'mls_lablead',
  'sug_welfareexec',
  'physiogenius',
  'pharmd_scholar',
  'anatomypro_ila',
  'publichealth_hero',
  'medicpioneer_24',
  'nursechisom',
  'dribrahim',
  'tunde',
  'medscholar',
  'nurseprecious',
  'anatomywizard',
  'pharmacadet',
  'statmaster_fuhsi',
  'fuhsileader',
  'nurse_grace',
  'pathology_guru',
  'gadget_plug_campus',
  'medstudent_2026',
  'doctor_in_making',
  'nursing_student_a',
  'freshman_fuhsi'
]);

export function isDemoNickname(nick?: string): boolean {
  if (!nick) return false;
  const clean = nick.trim().toLowerCase().replace(/^@/, '');
  return DEMO_NICKNAMES.has(clean) || clean.startsWith('demo_') || clean.startsWith('sample_') || clean.startsWith('mock_');
}

export function isDemoUser(u: Partial<UserProfile>): boolean {
  if (!u) return false;
  if (u.isAdmin || u.nickname === '@modula' || u.id === 'usr_admin_modula') return false;
  if (isDemoNickname(u.nickname)) return true;
  if (u.id && (u.id.startsWith('demo_') || u.id.startsWith('sample_') || u.id.startsWith('mock_') || u.id.startsWith('user_001') || u.id.startsWith('post_author_'))) {
    // If it's a generated author from a demo post or demo user, flag as demo
    const cleanNick = (u.nickname || '').trim().toLowerCase().replace(/^@/, '');
    if (DEMO_NICKNAMES.has(cleanNick)) return true;
  }
  return false;
}

export function isDemoPost(p: Partial<Post>): boolean {
  if (!p) return false;
  if (isDemoNickname(p.authorNickname || p.nickname || p.customNickname)) return true;
  if (p.id && (p.id.startsWith('sample_') || p.id.startsWith('demo_') || p.id.startsWith('mock_') || p.id.startsWith('post_seed_') || p.id.startsWith('gen_'))) return true;
  return false;
}

export const generateMorePosts = (_count: number = 5, _startOffset: number = 0): Post[] => {
  return [];
};

