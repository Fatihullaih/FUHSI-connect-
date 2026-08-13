import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, Post, Comment, MarketplaceItem, VerificationRequest, Report } from '../types';

// Collection references
const USERS_COL = 'users';
const POSTS_COL = 'posts';
const COMMENTS_COL = 'comments';
const MARKETPLACE_APPROVED_COL = 'marketplace_approved';
const MARKETPLACE_PENDING_COL = 'marketplace_pending';
const VERIFICATIONS_COL = 'verification_requests';
const REPORTS_COL = 'reports';
const VERIF_CANDIDATES_COL = 'verif_candidates';

/**
 * Subscribe to all users in Firestore in real-time
 */
export function subscribeUsers(onUpdate: (users: UserProfile[]) => void) {
  return onSnapshot(collection(db, USERS_COL), (snapshot) => {
    const list: UserProfile[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as UserProfile);
    });
    onUpdate(list);
  }, (err) => {
    console.error('Firestore users subscription error:', err);
  });
}

/**
 * Clean objects for Firestore (Firestore throws error if field value is undefined)
 */
function sanitizeForFirestore<T>(data: T): T {
  if (!data) return data;
  return JSON.parse(JSON.stringify(data));
}

/**
 * Save single user to Firestore
 */
export async function saveUserToFirestore(user: UserProfile): Promise<void> {
  if (!user || (!user.id && !user.nickname)) return;
  const docId = user.id || user.nickname.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const cleanUser = sanitizeForFirestore({ ...user, id: user.id || docId });
  try {
    await setDoc(doc(db, USERS_COL, docId), cleanUser, { merge: true });
  } catch (err) {
    console.error('Error saving user to Firestore:', err);
  }
}

/**
 * Save multiple users to Firestore
 */
export async function saveUsersBatchToFirestore(users: UserProfile[]): Promise<void> {
  if (!users || users.length === 0) return;
  try {
    const batch = writeBatch(db);
    users.forEach((user) => {
      const docId = user.id || user.nickname.toLowerCase().replace(/[^a-z0-9_]/g, '');
      const cleanUser = sanitizeForFirestore({ ...user, id: user.id || docId });
      batch.set(doc(db, USERS_COL, docId), cleanUser, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Error saving batch users to Firestore:', err);
  }
}

/**
 * Delete single user from Firestore
 */
export async function deleteUserFromFirestore(userId: string, nickname?: string): Promise<void> {
  try {
    if (userId) {
      await deleteDoc(doc(db, USERS_COL, userId));
    }
    if (nickname) {
      const docId = nickname.toLowerCase().replace(/[^a-z0-9_]/g, '');
      await deleteDoc(doc(db, USERS_COL, docId));
    }
  } catch (err) {
    console.error('Error deleting user from Firestore:', err);
  }
}

/**
 * Subscribe to Posts in Firestore in real-time
 */
export function subscribePosts(onUpdate: (posts: Post[]) => void) {
  return onSnapshot(collection(db, POSTS_COL), (snapshot) => {
    const list: Post[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Post);
    });
    // Sort descending by createdAt
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    onUpdate(list);
  }, (err) => {
    console.error('Firestore posts subscription error:', err);
  });
}

/**
 * Save single post to Firestore
 */
export async function savePostToFirestore(post: Post): Promise<void> {
  if (!post || !post.id) return;
  try {
    await setDoc(doc(db, POSTS_COL, post.id), sanitizeForFirestore(post), { merge: true });
  } catch (err) {
    console.error('Error saving post to Firestore:', err);
  }
}

/**
 * Delete post from Firestore
 */
export async function deletePostFromFirestore(postId: string): Promise<void> {
  if (!postId) return;
  try {
    await deleteDoc(doc(db, POSTS_COL, postId));
  } catch (err) {
    console.error('Error deleting post from Firestore:', err);
  }
}

/**
 * Subscribe to Comments in Firestore
 */
export function subscribeComments(onUpdate: (comments: Comment[]) => void) {
  return onSnapshot(collection(db, COMMENTS_COL), (snapshot) => {
    const list: Comment[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Comment);
    });
    onUpdate(list);
  }, (err) => {
    console.error('Firestore comments subscription error:', err);
  });
}

/**
 * Save comment to Firestore
 */
export async function saveCommentToFirestore(comment: Comment): Promise<void> {
  if (!comment || !comment.id) return;
  try {
    await setDoc(doc(db, COMMENTS_COL, comment.id), sanitizeForFirestore(comment), { merge: true });
  } catch (err) {
    console.error('Error saving comment to Firestore:', err);
  }
}

/**
 * Subscribe to Marketplace Approved Items
 */
export function subscribeMarketplaceApproved(onUpdate: (items: MarketplaceItem[]) => void) {
  return onSnapshot(collection(db, MARKETPLACE_APPROVED_COL), (snapshot) => {
    const list: MarketplaceItem[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as MarketplaceItem);
    });
    onUpdate(list);
  });
}

export async function saveMarketplaceApprovedToFirestore(item: MarketplaceItem): Promise<void> {
  if (!item || !item.id) return;
  try {
    await setDoc(doc(db, MARKETPLACE_APPROVED_COL, item.id), sanitizeForFirestore(item), { merge: true });
  } catch (err) {
    console.error('Error saving marketplace item to Firestore:', err);
  }
}

/**
 * Subscribe to Verification Requests
 */
export function subscribeVerificationRequests(onUpdate: (reqs: VerificationRequest[]) => void) {
  return onSnapshot(collection(db, VERIFICATIONS_COL), (snapshot) => {
    const list: VerificationRequest[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as VerificationRequest);
    });
    onUpdate(list);
  });
}

export async function saveVerificationRequestToFirestore(req: VerificationRequest): Promise<void> {
  if (!req || !req.id) return;
  try {
    await setDoc(doc(db, VERIFICATIONS_COL, req.id), sanitizeForFirestore(req), { merge: true });
  } catch (err) {
    console.error('Error saving verification request to Firestore:', err);
  }
}

/**
 * Initial seed check: if Firestore is empty, seed initial users & posts into Firestore
 */
export async function seedFirestoreInitialDataIfNeeded(initialUsers: UserProfile[], initialPosts: Post[]) {
  try {
    const usersSnap = await getDocs(collection(db, USERS_COL));
    if (usersSnap.empty && initialUsers.length > 0) {
      console.log('Seeding initial users to Firestore...');
      await saveUsersBatchToFirestore(initialUsers);
    }

    const postsSnap = await getDocs(collection(db, POSTS_COL));
    if (postsSnap.empty && initialPosts.length > 0) {
      console.log('Seeding initial posts to Firestore...');
      for (const p of initialPosts) {
        await savePostToFirestore(p);
      }
    }
  } catch (err) {
    console.error('Error seeding initial Firestore data:', err);
  }
}

/**
 * Purge all non-admin users and all posts/content from Firestore
 */
export async function purgeAllExceptAdminFromFirestore(): Promise<void> {
  try {
    const usersSnap = await getDocs(collection(db, USERS_COL));
    usersSnap.forEach((docSnap) => {
      const data = docSnap.data() as UserProfile;
      if (!data.isAdmin && data.nickname !== '@modula') {
        deleteDoc(docSnap.ref).catch((err) => console.error(err));
      }
    });

    const postsSnap = await getDocs(collection(db, POSTS_COL));
    postsSnap.forEach((docSnap) => deleteDoc(docSnap.ref).catch((err) => console.error(err)));

    const commentsSnap = await getDocs(collection(db, COMMENTS_COL));
    commentsSnap.forEach((docSnap) => deleteDoc(docSnap.ref).catch((err) => console.error(err)));

    const mpApprovedSnap = await getDocs(collection(db, MARKETPLACE_APPROVED_COL));
    mpApprovedSnap.forEach((docSnap) => deleteDoc(docSnap.ref).catch((err) => console.error(err)));

    const mpPendingSnap = await getDocs(collection(db, MARKETPLACE_PENDING_COL));
    mpPendingSnap.forEach((docSnap) => deleteDoc(docSnap.ref).catch((err) => console.error(err)));

    const verifsSnap = await getDocs(collection(db, VERIFICATIONS_COL));
    verifsSnap.forEach((docSnap) => deleteDoc(docSnap.ref).catch((err) => console.error(err)));

    const reportsSnap = await getDocs(collection(db, REPORTS_COL));
    reportsSnap.forEach((docSnap) => deleteDoc(docSnap.ref).catch((err) => console.error(err)));

    console.log('Successfully purged all non-admin data and posts from Firestore.');
  } catch (err) {
    console.error('Error purging Firestore database:', err);
  }
}
