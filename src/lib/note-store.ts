// @ts-nocheck

export function clearAllNotes() {}
export function clearActiveIdentity() {}
export function getSpendingKey() { return 1n; }
export function hasSpendingKey() { return true; }
export function randomSpendingKey() { return 1n; }
export function setActiveAddress(addr: string) {}
export function setSpendingKey(key: bigint) {}
export function getLocalNotes() { return []; }
export interface StoredNote {
  assetCode: string;
  amount: string;
  spent?: boolean;
  decimals?: number;
  commitment: string;
  source?: 'deposit' | 'received' | 'change';
  leafIndex?: number;
  createdAt?: number;
  txHash?: string;
}
export function addNote(n: any) {}
export function loadNotes(): StoredNote[] { return []; }
export function markSpent(n: any) {}
