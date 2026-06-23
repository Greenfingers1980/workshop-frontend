// ------------------------------------------------------
// AUDIT TRAIL TYPES
// ------------------------------------------------------
export type AuditTrailEntry = {
  id: number;
  timestamp: string;
  user?: string;

  action: string;          // e.g. "NEW_INVOICE", "POST_JOURNAL"
  description: string;     // human-readable summary

  accountId?: number;
  debit?: number;
  credit?: number;

  customerId?: number;
  supplierId?: number;
  jobId?: number;
  invoiceId?: number;
  receiptId?: number;

  before?: any;
  after?: any;
};

// ------------------------------------------------------
// STORAGE HELPERS
// ------------------------------------------------------
function load<T>(key: string, fallback: T): T {
  return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ------------------------------------------------------
// GET AUDIT TRAIL
// ------------------------------------------------------
export function getAuditTrail(): AuditTrailEntry[] {
  return load("audit-trail", []);
}

// ------------------------------------------------------
// ADD AUDIT ENTRY
// ------------------------------------------------------
export function addAudit(
  entry: Omit<AuditTrailEntry, "id" | "timestamp">
) {
  const trail = getAuditTrail();

  const newEntry: AuditTrailEntry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...entry
  };

  trail.push(newEntry);
  save("audit-trail", trail);
}

// ------------------------------------------------------
// CLEAR AUDIT TRAIL (optional)
// ------------------------------------------------------
export function clearAuditTrail() {
  save("audit-trail", []);
}
