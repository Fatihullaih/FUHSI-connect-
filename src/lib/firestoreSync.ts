import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, Post, Comment, MarketplaceItem, VerificationRequest, Report, DirectMessage, HelpDeskInquiry, FollowRecord } from '../types';
import { isDemoUser, isDemoPost, isDemoNickname, isDemoComment, isDemoVerificationRequest, isDemoMarketplaceItem, isDemoDirectMessage } from '../utils/postGenerator';

// Collection references
const USERS_COL = 'users';
const POSTS_COL = 'posts';
const COMMENTS_COL = 'comments';
const MARKETPLACE_APPROVED_COL = 'marketplace_approved';
const MARKETPLACE_PENDING_COL = 'marketplace_pending';
const VERIFICATIONS_COL = 'verification_requests';
const REPORTS_COL = 'reports';
const HELPDESK_COL = 'helpdesk_inquiries';
const VERIF_CANDIDATES_COL = 'verif_candidates';
const DIRECT_MESSAGES_COL = 'direct_messages';
const FOLLOWS_COL = 'follows';
const SETTINGS_COL = 'settings';
const VERIFICATION_SETTINGS_DOC = 'verification_settings';

/**
 * Subscribe to all users in Firestore in real-time
 */
export function subscribeUsers(onUpdate: (users: UserProfile[]) => void) {
  return onSnapshot(collection(db, USERS_COL), (snapshot) => {
    const list: UserProfile[] = [];
    snapshot.forEach((docSnap) => {
      const u = docSnap.data() as UserProfile;
      if (!isDemoUser(u) && !isDemoNickname(u.nickname)) {
        list.push(u);
      }
    });
    onUpdate(list);
  }, (err) => {
    console.warn('Firestore users subscription fallback/warning:', err?.message || err);
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
  if (!user || (!user.id && !user.nickname) || isDemoUser(user) || isDemoNickname(user.nickname)) return;
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
  const nonDemoUsers = (users || []).filter((u) => !isDemoUser(u) && !isDemoNickname(u.nickname));
  if (!nonDemoUsers || nonDemoUsers.length === 0) return;
  try {
    const batch = writeBatch(db);
    nonDemoUsers.forEach((user) => {
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
 * Delete comment from Firestore
 */
export async function deleteCommentFromFirestore(commentId: string): Promise<void> {
  if (!commentId) return;
  try {
    await deleteDoc(doc(db, COMMENTS_COL, commentId));
  } catch (err) {
    console.error('Error deleting comment from Firestore:', err);
  }
}

/**
 * Delete direct message from Firestore
 */
export async function deleteDirectMessageFromFirestore(messageId: string): Promise<void> {
  if (!messageId) return;
  try {
    await deleteDoc(doc(db, DIRECT_MESSAGES_COL, messageId));
  } catch (err) {
    console.error('Error deleting direct message from Firestore:', err);
  }
}

/**
 * Delete report from Firestore
 */
export async function deleteReportFromFirestore(reportId: string): Promise<void> {
  if (!reportId) return;
  try {
    await deleteDoc(doc(db, REPORTS_COL, reportId));
  } catch (err) {
    console.error('Error deleting report from Firestore:', err);
  }
}

/**
 * Subscribe to Posts in Firestore in real-time
 */
export function subscribePosts(onUpdate: (posts: Post[]) => void) {
  return onSnapshot(collection(db, POSTS_COL), (snapshot) => {
    const list: Post[] = [];
    snapshot.forEach((docSnap) => {
      const p = docSnap.data() as Post;
      if (!isDemoPost(p)) {
        list.push(p);
      }
    });
    // Sort descending by createdAt
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    onUpdate(list);
  }, (err) => {
    console.warn('Firestore posts subscription fallback/warning:', err?.message || err);
  });
}

/**
 * Save single post to Firestore
 */
export async function savePostToFirestore(post: Post): Promise<void> {
  if (!post || !post.id || isDemoPost(post)) return;
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
      const c = docSnap.data() as Comment;
      if (!isDemoComment(c)) {
        list.push(c);
      }
    });
    onUpdate(list);
  }, (err) => {
    console.warn('Firestore comments subscription fallback/warning:', err?.message || err);
  });
}

/**
 * Save comment to Firestore
 */
export async function saveCommentToFirestore(comment: Comment): Promise<void> {
  if (!comment || !comment.id || isDemoComment(comment)) return;
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
  return onSnapshot(
    collection(db, MARKETPLACE_APPROVED_COL),
    (snapshot) => {
      const list: MarketplaceItem[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data() as MarketplaceItem;
        if (!isDemoMarketplaceItem(item)) {
          list.push(item);
        }
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore marketplace subscription fallback/warning:', err?.message || err);
    }
  );
}

export async function saveMarketplaceApprovedToFirestore(item: MarketplaceItem): Promise<void> {
  if (!item || !item.id || isDemoMarketplaceItem(item)) return;
  try {
    await setDoc(doc(db, MARKETPLACE_APPROVED_COL, item.id), sanitizeForFirestore(item), { merge: true });
  } catch (err) {
    console.error('Error saving marketplace item to Firestore:', err);
  }
}

export async function deleteMarketplaceApprovedFromFirestore(itemId: string): Promise<void> {
  if (!itemId) return;
  try {
    await deleteDoc(doc(db, MARKETPLACE_APPROVED_COL, itemId));
    await deleteDoc(doc(db, MARKETPLACE_PENDING_COL, itemId));
  } catch (err) {
    console.error('Error deleting marketplace item from Firestore:', err);
  }
}

/**
 * Subscribe to Verification Requests
 */
export function subscribeVerificationRequests(onUpdate: (reqs: VerificationRequest[]) => void) {
  return onSnapshot(
    collection(db, VERIFICATIONS_COL),
    (snapshot) => {
      const list: VerificationRequest[] = [];
      snapshot.forEach((docSnap) => {
        const r = docSnap.data() as VerificationRequest;
        if (!isDemoVerificationRequest(r)) {
          list.push(r);
        }
      });
      // Sort descending by timestamp / creation time
      list.sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime() || 0;
        const timeB = new Date(b.timestamp || 0).getTime() || 0;
        return timeB - timeA;
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore verifications subscription fallback/warning:', err?.message || err);
    }
  );
}

export async function saveVerificationRequestToFirestore(req: VerificationRequest): Promise<void> {
  if (!req || !req.id) return;
  try {
    await setDoc(doc(db, VERIFICATIONS_COL, req.id), sanitizeForFirestore(req), { merge: true });
  } catch (err) {
    console.error('Error saving verification request to Firestore:', err);
  }
}

export async function saveVerificationRequestsBatchToFirestore(reqs: VerificationRequest[]): Promise<void> {
  if (!reqs || reqs.length === 0) return;
  try {
    const batch = writeBatch(db);
    reqs.forEach((r) => {
      if (r && r.id) {
        batch.set(doc(db, VERIFICATIONS_COL, r.id), sanitizeForFirestore(r), { merge: true });
      }
    });
    await batch.commit();
  } catch (err) {
    console.error('Error batch saving verification requests to Firestore:', err);
  }
}

export async function deleteVerificationRequestFromFirestore(requestId: string): Promise<void> {
  if (!requestId) return;
  try {
    await deleteDoc(doc(db, VERIFICATIONS_COL, requestId));
  } catch (err) {
    console.error('Error deleting verification request from Firestore:', err);
  }
}

/**
 * Initial seed check: if Firestore is empty, seed initial users & posts into Firestore
 */
export async function seedFirestoreInitialDataIfNeeded(initialUsers: UserProfile[], initialPosts: Post[]) {
  try {
    const validUsers = (initialUsers || []).filter((u) => !isDemoUser(u) && !isDemoNickname(u.nickname));
    const usersSnap = await getDocs(collection(db, USERS_COL));
    if (usersSnap.empty && validUsers.length > 0) {
      console.log('Seeding initial non-demo users to Firestore...');
      await saveUsersBatchToFirestore(validUsers);
    }

    const validPosts = (initialPosts || []).filter((p) => !isDemoPost(p));
    const postsSnap = await getDocs(collection(db, POSTS_COL));
    if (postsSnap.empty && validPosts.length > 0) {
      console.log('Seeding initial non-demo posts to Firestore...');
      for (const p of validPosts) {
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

/**
 * Purge all demo accounts and demo content from Firestore
 */
export async function purgeDemoAccountsFromFirestore(): Promise<void> {
  try {
    const usersSnap = await getDocs(collection(db, USERS_COL));
    usersSnap.forEach((docSnap) => {
      const data = docSnap.data() as UserProfile;
      if (isDemoUser(data) || isDemoNickname(data.nickname) || isDemoNickname(data.realName)) {
        deleteDoc(docSnap.ref).catch((err) => console.error(err));
      }
    });

    const postsSnap = await getDocs(collection(db, POSTS_COL));
    postsSnap.forEach((docSnap) => {
      const data = docSnap.data() as Post;
      if (isDemoPost(data) || isDemoNickname(data.authorNickname) || isDemoNickname(data.nickname)) {
        deleteDoc(docSnap.ref).catch((err) => console.error(err));
      }
    });

    const commentsSnap = await getDocs(collection(db, COMMENTS_COL));
    commentsSnap.forEach((docSnap) => {
      const data = docSnap.data() as Comment;
      if (isDemoComment(data) || isDemoNickname(data.authorNickname) || isDemoNickname(data.replyToNickname)) {
        deleteDoc(docSnap.ref).catch((err) => console.error(err));
      }
    });

    const mpApprovedSnap = await getDocs(collection(db, MARKETPLACE_APPROVED_COL));
    mpApprovedSnap.forEach((docSnap) => {
      const data = docSnap.data() as MarketplaceItem;
      if (isDemoMarketplaceItem(data) || isDemoNickname(data.sellerNickname)) {
        deleteDoc(docSnap.ref).catch((err) => console.error(err));
      }
    });

    const mpPendingSnap = await getDocs(collection(db, MARKETPLACE_PENDING_COL));
    mpPendingSnap.forEach((docSnap) => {
      const data = docSnap.data() as MarketplaceItem;
      if (isDemoMarketplaceItem(data) || isDemoNickname(data.sellerNickname)) {
        deleteDoc(docSnap.ref).catch((err) => console.error(err));
      }
    });

    const verifsSnap = await getDocs(collection(db, VERIFICATIONS_COL));
    verifsSnap.forEach((docSnap) => {
      const data = docSnap.data() as VerificationRequest;
      if (isDemoVerificationRequest(data) || isDemoNickname(data.applicantNickname)) {
        deleteDoc(docSnap.ref).catch((err) => console.error(err));
      }
    });

    const dmsSnap = await getDocs(collection(db, DIRECT_MESSAGES_COL));
    dmsSnap.forEach((docSnap) => {
      const data = docSnap.data() as DirectMessage;
      if (isDemoDirectMessage(data) || isDemoNickname(data.senderNickname) || isDemoNickname(data.receiverNickname)) {
        deleteDoc(docSnap.ref).catch((err) => console.error(err));
      }
    });

    console.log('Successfully completed Firestore cleanup of demo accounts and content.');
  } catch (err) {
    console.error('Error cleaning demo accounts from Firestore:', err);
  }
}

/**
 * Subscribe to Direct Messages filtered by conversation ID in Firestore
 */
export function subscribeDirectMessagesByConversation(
  conversationId: string,
  onUpdate: (messages: DirectMessage[]) => void,
  onError?: (err: any) => void
) {
  if (!conversationId) {
    onUpdate([]);
    return () => {};
  }

  try {
    const q = query(
      collection(db, DIRECT_MESSAGES_COL),
      where('conversationId', '==', conversationId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const list: DirectMessage[] = [];
        snapshot.forEach((docSnap) => {
          const msg = docSnap.data() as DirectMessage;
          if (!isDemoDirectMessage(msg)) {
            list.push(msg);
          }
        });
        // Sort chronologically
        list.sort((a, b) => {
          const timeA = a.id?.includes('dm_') ? Number(a.id.replace(/\D/g, '')) || 0 : 0;
          const timeB = b.id?.includes('dm_') ? Number(b.id.replace(/\D/g, '')) || 0 : 0;
          return timeA - timeB;
        });
        onUpdate(list);
      },
      (err) => {
        console.error(`Firestore error subscribing to direct messages for ${conversationId}:`, err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.error('Failed to create direct messages subscription:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Save single direct message to Firestore
 */
export async function saveDirectMessageToFirestore(msg: DirectMessage): Promise<void> {
  if (!msg || !msg.id || isDemoDirectMessage(msg)) return;
  try {
    await setDoc(doc(db, DIRECT_MESSAGES_COL, msg.id), sanitizeForFirestore(msg), { merge: true });
  } catch (err) {
    console.error('Error saving direct message to Firestore:', err);
  }
}

/**
 * Subscribe to Verification Fee from Firestore
 */
export function subscribeVerificationFee(onUpdate: (fee: number) => void) {
  return onSnapshot(
    doc(db, SETTINGS_COL, VERIFICATION_SETTINGS_DOC),
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (typeof data?.verificationFee === 'number' && !isNaN(data.verificationFee)) {
          onUpdate(data.verificationFee);
        }
      }
    },
    (err) => {
      console.warn('Firestore verification fee subscription warning:', err?.message || err);
    }
  );
}

/**
 * Save Verification Fee to Firestore
 */
export async function saveVerificationFeeToFirestore(fee: number): Promise<void> {
  if (typeof fee !== 'number' || isNaN(fee)) return;
  try {
    await setDoc(
      doc(db, SETTINGS_COL, VERIFICATION_SETTINGS_DOC),
      { verificationFee: fee, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  } catch (err) {
    console.error('Error saving verification fee to Firestore:', err);
  }
}

/**
 * Subscribe to all direct messages
 */
export function subscribeAllDirectMessages(onUpdate: (messages: DirectMessage[]) => void) {
  return onSnapshot(
    collection(db, DIRECT_MESSAGES_COL),
    (snapshot) => {
      const list: DirectMessage[] = [];
      snapshot.forEach((docSnap) => {
        const msg = docSnap.data() as DirectMessage;
        if (!isDemoDirectMessage(msg)) {
          list.push(msg);
        }
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore all direct messages subscription fallback/warning:', err?.message || err);
    }
  );
}

/**
 * Subscribe to Help Desk Inquiries & Appeals from Firestore
 */
export function subscribeHelpDeskInquiries(onUpdate: (inquiries: HelpDeskInquiry[]) => void) {
  return onSnapshot(
    collection(db, HELPDESK_COL),
    (snapshot) => {
      const list: HelpDeskInquiry[] = [];
      snapshot.forEach((docSnap) => {
        const inq = docSnap.data() as HelpDeskInquiry;
        if (inq && inq.id) {
          list.push(inq);
        }
      });
      // Sort descending by createdAt
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore help desk inquiries subscription fallback/warning:', err?.message || err);
    }
  );
}

/**
 * Save Help Desk inquiry or appeal to Firestore
 */
export async function saveHelpDeskInquiryToFirestore(inquiry: HelpDeskInquiry): Promise<void> {
  if (!inquiry || !inquiry.id) return;
  try {
    await setDoc(doc(db, HELPDESK_COL, inquiry.id), sanitizeForFirestore(inquiry), { merge: true });
  } catch (err) {
    console.error('Error saving Help Desk inquiry to Firestore:', err);
  }
}

/**
 * Update Help Desk inquiry status in Firestore
 */
export async function updateHelpDeskInquiryStatus(inquiryId: string, status: 'PENDING' | 'RESOLVED' | 'UNDER_REVIEW', adminNotes?: string): Promise<void> {
  if (!inquiryId) return;
  try {
    await setDoc(
      doc(db, HELPDESK_COL, inquiryId),
      sanitizeForFirestore({
        status,
        ...(adminNotes ? { adminNotes } : {}),
        resolvedAt: status === 'RESOLVED' ? new Date().toISOString() : undefined,
      }),
      { merge: true }
    );
  } catch (err) {
    console.error('Error updating Help Desk inquiry status:', err);
  }
}

/**
 * Subscribe to all follow relationships in real-time
 */
export function subscribeFollows(onUpdate: (follows: FollowRecord[]) => void) {
  return onSnapshot(
    collection(db, FOLLOWS_COL),
    (snapshot) => {
      const list: FollowRecord[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data() as FollowRecord;
        if (
          item &&
          item.followerNickname &&
          item.followingNickname &&
          !isDemoNickname(item.followerNickname) &&
          !isDemoNickname(item.followingNickname)
        ) {
          list.push(item);
        }
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore follows subscription fallback/warning:', err?.message || err);
    }
  );
}

/**
 * Save single follow relationship to Firestore
 */
export async function saveFollowToFirestore(follow: FollowRecord): Promise<void> {
  if (!follow || !follow.id || !follow.followerNickname || !follow.followingNickname) return;
  if (isDemoNickname(follow.followerNickname) || isDemoNickname(follow.followingNickname)) return;
  try {
    await setDoc(doc(db, FOLLOWS_COL, follow.id), sanitizeForFirestore(follow), { merge: true });
  } catch (err) {
    console.error('Error saving follow relationship to Firestore:', err);
  }
}

/**
 * Delete a follow relationship from Firestore
 */
export async function deleteFollowFromFirestore(docId: string): Promise<void> {
  if (!docId) return;
  try {
    await deleteDoc(doc(db, FOLLOWS_COL, docId));
  } catch (err) {
    console.error('Error deleting follow relationship from Firestore:', err);
  }
}





