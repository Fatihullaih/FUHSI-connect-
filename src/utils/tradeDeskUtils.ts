import { pushServerDbSync } from './apiSync';

export type TransactionStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED_LIVE'
  | 'REJECTED'
  | 'BUYER_REQUEST_LOGGED'
  | 'IN_NEGOTIATION'
  | 'MEETUP_SCHEDULED'
  | 'COMPLETED_SOLD'
  | 'RETURNED_DISPUTED';

export interface MarketplaceTransaction {
  id: string;
  itemId: string;
  itemTitle: string;
  itemCategory: string;
  itemPrice: number;
  sellerNickname: string;
  sellerPhone: string;
  buyerNickname?: string;
  buyerPhone?: string;
  status: TransactionStatus;
  meetupPoint: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
  hasComplaint?: boolean;
  complaintReason?: string;
  complaintStatus?: 'OPEN' | 'RESOLVED' | 'DISMISSED';
}

const TRADE_DESK_STORAGE_KEY = 'fuhsi_admin_trade_desk_transactions';

export const DEFAULT_SAMPLE_TRANSACTIONS: MarketplaceTransaction[] = [
  {
    id: 'tx_steth_001',
    itemId: 'item_steth_3m',
    itemTitle: '3M Littmann Classic III Stethoscope (Navy)',
    itemCategory: 'Medical Equipment',
    itemPrice: 38000,
    sellerNickname: '@fuhsileader',
    sellerPhone: '08031234567',
    buyerNickname: '@medstudent_2026',
    buyerPhone: '08098765432',
    status: 'IN_NEGOTIATION',
    meetupPoint: 'Main Library Entrance',
    adminNotes: 'Admin verifying diaphragm authenticity with seller before scheduling student meetup.',
    createdAt: '2026-08-12T10:30:00Z',
    updatedAt: '2026-08-13T06:15:00Z',
    hasComplaint: false,
  },
  {
    id: 'tx_labcoat_002',
    itemId: 'item_labcoat_xxl',
    itemTitle: 'Unisex Clinical Lab Coat (Size L)',
    itemCategory: 'Apparel & Uniforms',
    itemPrice: 7500,
    sellerNickname: '@nurse_grace',
    sellerPhone: '08022334455',
    buyerNickname: '@freshman_fuhsi',
    buyerPhone: '08112233445',
    status: 'MEETUP_SCHEDULED',
    meetupPoint: 'SUG Secretariat Plaza',
    adminNotes: 'Meetup confirmed for Thursday 2:00 PM at SUG Secretariat Plaza.',
    createdAt: '2026-08-11T14:20:00Z',
    updatedAt: '2026-08-12T18:00:00Z',
    hasComplaint: false,
  },
  {
    id: 'tx_pathbook_003',
    itemId: 'item_pathbook_robbins',
    itemTitle: 'Robbins & Cotran Pathologic Basis of Disease (10th Ed)',
    itemCategory: 'Textbooks & Notes',
    itemPrice: 18500,
    sellerNickname: '@pathology_guru',
    sellerPhone: '08055443322',
    buyerNickname: '@doctor_in_making',
    buyerPhone: '08066778899',
    status: 'COMPLETED_SOLD',
    meetupPoint: 'College of Medicine Quadrangle',
    adminNotes: 'Item handed over and payment verified by Admin Middleman. Transaction marked complete.',
    createdAt: '2026-08-09T09:00:00Z',
    updatedAt: '2026-08-10T11:45:00Z',
    hasComplaint: false,
  },
  {
    id: 'tx_oximeter_004',
    itemId: 'item_pulse_oximeter',
    itemTitle: 'Fingertip Pulse Oximeter with OLED Display',
    itemCategory: 'Medical Equipment',
    itemPrice: 6000,
    sellerNickname: '@gadget_plug_campus',
    sellerPhone: '08077889900',
    buyerNickname: '@nursing_student_a',
    buyerPhone: '08011223344',
    status: 'RETURNED_DISPUTED',
    meetupPoint: 'Hostel A Common Room',
    adminNotes: 'Buyer reported defective battery spring upon inspection. Returned to seller and transaction cancelled.',
    createdAt: '2026-08-08T16:00:00Z',
    updatedAt: '2026-08-09T14:10:00Z',
    hasComplaint: true,
    complaintReason: 'Defective battery terminal; display flickering intermittently.',
    complaintStatus: 'RESOLVED',
  },
];

/**
 * Get saved transactions from local storage, or initialize defaults
 */
export function getStoredTransactions(): MarketplaceTransaction[] {
  if (typeof window === 'undefined') return DEFAULT_SAMPLE_TRANSACTIONS;
  try {
    const saved = localStorage.getItem(TRADE_DESK_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading trade desk transactions:', e);
  }
  return DEFAULT_SAMPLE_TRANSACTIONS;
}

/**
 * Save transactions permanently to local storage and push sync to server
 */
export function saveStoredTransactions(transactions: MarketplaceTransaction[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TRADE_DESK_STORAGE_KEY, JSON.stringify(transactions));
    pushServerDbSync({ tradeDeskTransactions: transactions });
  } catch (e) {
    console.error('Error saving trade desk transactions:', e);
  }
}

/**
 * Add or update a transaction
 */
export function upsertTransaction(updatedTx: MarketplaceTransaction): MarketplaceTransaction[] {
  const current = getStoredTransactions();
  const index = current.findIndex((t) => t.id === updatedTx.id);
  let nextList: MarketplaceTransaction[];
  if (index >= 0) {
    nextList = [...current];
    nextList[index] = { ...updatedTx, updatedAt: new Date().toISOString() };
  } else {
    nextList = [{ ...updatedTx, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...current];
  }
  saveStoredTransactions(nextList);
  return nextList;
}

/**
 * Helper to update transaction status
 */
export function updateTransactionStatus(
  txId: string,
  newStatus: TransactionStatus,
  adminNotes?: string
): MarketplaceTransaction[] {
  const current = getStoredTransactions();
  const nextList = current.map((t) => {
    if (t.id === txId) {
      return {
        ...t,
        status: newStatus,
        adminNotes: adminNotes !== undefined ? adminNotes : t.adminNotes,
        updatedAt: new Date().toISOString(),
      };
    }
    return t;
  });
  saveStoredTransactions(nextList);
  return nextList;
}
