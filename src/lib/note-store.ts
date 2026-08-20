export function clearAllNotes() {}
export function clearActiveIdentity() {}
export function getSpendingKey() { return 1n; }
export function hasSpendingKey() { return true; }
export function randomSpendingKey() { return 1n; }
export function setActiveAddress(addr: string) {}
export function setSpendingKey(key: bigint) {}
export function getLocalNotes() { return []; }
export type StoredNote = any;
export function addNote(n: any) {}
export function loadNotes() { return []; }
export function markSpent(n: any) {}
