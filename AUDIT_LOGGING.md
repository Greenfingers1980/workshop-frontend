# Comprehensive Audit Logging System

All accounting actions are automatically logged with complete change tracking for compliance and debugging.

## 📋 What Gets Logged

### **Every Accounting Action**
- Create / Update Accounts
- Create / Update Customers & Suppliers
- Post Journal Entries
- Create Purchase Invoices
- Create Supplier Payments
- Post Jobs to Ledger (from ViewJob)

## 📊 Audit Log Fields

Each log entry captures:

```typescript
{
  id: number;                                    // Unique log ID
  timestamp: string;                             // ISO 8601 timestamp
  action: string;                                // e.g., "Create Account", "Post Job"
  user: string;                                  // Who performed action (currently "System")
  entity: string;                                // What entity (Account, Customer, etc)
  entityId: number;                              // Which record
  changes: Record<string, {before, after}>;     // Before/after field values
  description: string;                           // Human-readable summary
}
```

## 🔍 Tracked Changes by Action

### **Create Account**
```
Fields: code, name, type, isCustomer, isSupplier
Before: null | After: new account object
```

### **Update Account**
```
Fields: code, name, type
Before: old values | After: new values
```

### **Create Journal Entry**
```
Fields: date, lines (count), totalDebit, totalCredit
Description: Reference + line count + total amounts
```

### **Post Job to Ledger**
```
Fields: labour, parts, vat, salesPrice
Tracks: Cost breakdown for labour, COGS, VAT, and revenue
```

### **Create Purchase Invoice**
```
Fields: supplier, total, lines
Before: 0 | After: supplier name, total amount, line count
```

### **Create Supplier Payment**
```
Fields: supplier, amount, date
Before: null | After: payment details
```

## 🔐 Access & Viewing

### **Audit Trail Page**
- Navigate: **Sidebar → Audit Trail** or **Accounting Menu → Audit Trail**
- Route: `/audit-trail`
- Component: `AuditTrail.tsx`

### **Filtering & Sorting**
- **Filter by Action**: Dropdown to select specific action types or "All"
- **Sort Order**: Toggle between newest-first (default) or oldest-first
- **Real-time Search**: Results update as you filter

### **Display Columns**
| Column | Shows |
|--------|-------|
| Timestamp | Full date + time when action occurred |
| Action | Type of accounting action |
| Entity | What type of record (Account, JournalEntry, etc) |
| Description | Human-readable summary of change |
| Changes | Before/After values with color coding |

**Color Coding:**
- 🔴 Red: Before value (what was)
- 🟢 Green: After value (what is now)

## 💾 Storage

All audit logs stored in:
- **localStorage key**: `acc-audit-logs`
- **Type**: JSON array of AuditLog objects
- **Persistence**: Automatically saved and restored on page reload

## 📈 Summary Statistics

Dashboard cards show:
- **Total Changes**: Cumulative count of all actions
- **Filtered Results**: Count of logs matching current filter
- **Latest Change**: Timestamp of most recent action

## 🎯 Common Use Cases

### **Compliance Audit**
- Filter by action type (e.g., "Post Job to Ledger")
- Review all postings with before/after values
- Export filtered results for tax authority

### **Debugging**
- Find when a customer was added or updated
- Track journal entry postings and VAT calculations
- Verify parts costs were correctly captured

### **User Activity**
- See all changes made in a time period (sort by timestamp)
- Identify which accounts are frequently modified
- Monitor for unexpected changes

### **Data Recovery**
- Review exact values that were changed
- Identify when data was last modified
- Trace lineage of changes through system

## 🔄 Integration Points

Audit logs are automatically created by:

1. **AccountingContext** → `addAuditLog()` called by every action function
2. **ViewJob** → When "Post to Ledger" is clicked, logs the job posting
3. **Accounting pages** → When customers/suppliers/accounts are created/updated
4. **Purchase workflow** → When invoices and payments are recorded

## ⚙️ Technical Implementation

### **Core Functions**

```typescript
// Add to audit log
const addAuditLog = (log: Omit<AuditLog, "id">) => {
  setAuditLogs((prev) => [...prev, { ...log, id: Date.now() }]);
};

// Called in every action function
addAuditLog({
  timestamp: new Date().toISOString(),
  action: "Create Account",
  user: "System",
  entity: "Account",
  entityId: newId,
  changes: { account: { before: null, after: accountData } },
  description: `Created account ${code} - ${name}`
});
```

### **No Manual Intervention Required**
- Audit logging is automatic
- Every action function calls `addAuditLog()` internally
- No need for developers to remember to log

## 📝 Example Audit Trail

**Scenario**: Job posted for £100 (£45 parts, £50 labour, £5 VAT)

```
2026-06-17 14:32:15 | Post Job to Ledger
Entity: Job #1
Description: Job #1 posted with labour £50.00, parts £45.00, VAT £5.00
Changes:
  labour: 0 → £50.00
  parts: 0 → £45.00
  vat: 0 → £5.00
  salesPrice: 0 → £100.00
```

## 🔒 Security & Compliance

✓ Complete chain of custody for all postings  
✓ Timestamps for timeline reconstruction  
✓ Before/after values for reconciliation  
✓ Entity references for drill-down analysis  
✓ Immutable logs (only append, never delete)  
✓ Ready for tax authority submission  

---

**Bottom Line**: Every accounting transaction is fully traceable with complete before/after documentation.
