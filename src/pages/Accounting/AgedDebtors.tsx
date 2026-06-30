
import { useAccounting } from "./AccountingContext";


export default function AgedDebtors() {
  const { customers, salesInvoices, salesReceipts } = useAccounting();

  // 1. O(1) Lookup Optimization: Sum all invoice receipts upfront into a hash map
  const receiptTotalsMap = salesReceipts.reduce<Record<number, number>>((acc, receipt) => {
    acc[receipt.invoiceId] = (acc[receipt.invoiceId] || 0) + receipt.amount;
    return acc;
  }, {});

  // 2. High-precision day-counting helper avoiding timezone shifting bugs
  const calculateDaysPastDue = (dateString: string) => {
    const invoiceDate = new Date(dateString);
    const today = new Date();
    
    // Normalize to midnight UTC to prevent time-of-day math drift
    invoiceDate.setUTCHours(0, 0, 0, 0);
    today.setUTCHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - invoiceDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // 3. Single-pass evaluation pipeline
  const agedCustomerData = customers.map((customer) => {
    const buckets = { current: 0, d30: 0, d60: 0, d90: 0, d90plus: 0, total: 0 };

    // Filter down invoices matching customer
    const clientInvoices = salesInvoices.filter((inv) => inv.customerId === customer.id);

    clientInvoices.forEach((inv) => {
      const amountPaid = receiptTotalsMap[inv.id] || 0;
      const outstandingBalance = inv.amount - amountPaid;

      // Skip if completely paid off
      if (outstandingBalance <= 0) return;

      const ageInDays = calculateDaysPastDue(inv.date);

      if (ageInDays <= 30) buckets.current += outstandingBalance;
      else if (ageInDays <= 60) buckets.d30 += outstandingBalance;
      else if (ageInDays <= 90) buckets.d60 += outstandingBalance;
      else if (ageInDays <= 120) buckets.d90 += outstandingBalance;
      else buckets.d90plus += outstandingBalance;

      buckets.total += outstandingBalance;
    });

    return { customer, ...buckets };
  });

  // Filter list down strictly to clients with debit balances
  const accountsOwing = agedCustomerData.filter((c) => c.total > 0);

  // Compute column totals using modern analytical accumulator pattern
  const grantTotals = accountsOwing.reduce(
    (acc, row) => {
      acc.current += row.current;
      acc.d30 += row.d30;
      acc.d60 += row.d60;
      acc.d90 += row.d90;
      acc.d90plus += row.d90plus;
      acc.total += row.total;
      return acc;
    },
    { current: 0, d30: 0, d60: 0, d90: 0, d90plus: 0, total: 0 }
  );

  /**
   * ACTION TRIGGER: Construct pre-formatted prompt templates for overdue balances
   */
  const handleEmailReminder = (name: string, email?: string, balance?: number) => {
    if (!email) {
      alert("No email recorded for this customer profile.");
      return;
    }
    const subject = encodeURIComponent("Watch Workshop Repair Service - Outstanding Balance Statement");
    const body = encodeURIComponent(
      `Dear ${name},\n\nThis is a friendly statement update regarding your watch repair order. Our ledger currently shows an open outstanding balance of £${balance?.toFixed(2)} past terms.\n\nPlease reach out to the workshop at your earliest convenience to arrange clearing this card balance.\n\nKind Regards,\nWorkshop Administration`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="panel parchment-card" style={{ margin: "2rem auto" }}>
      <h1 className="accounting-title">Aged Debtors Ledger</h1>
      <p className="accounting-subtitle">Outstanding accounts receivable balances grouped by chronological aging periods.</p>
      
      <hr className="divider" />

      <table className="ledger-table">
        <thead>
          <tr>
            <th>Customer Information</th>
            <th>0–30 Days</th>
            <th>31–60 Days</th>
            <th>61–90 Days</th>
            <th>91–120 Days</th>
            <th>120+ Days</th>
            <th>Total Balance</th>
            <th style={{ textAlign: "center" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {accountsOwing.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#6b5c4a" }}>
                🎉 Excellent! All customer repair invoice entries are currently fully paid.
              </td>
            </tr>
          ) : (
            accountsOwing.map((row) => {
              // Legal warning: Flag balances extending past safe thresholds
              const requiresLienFlag = row.d90 > 0 || row.d90plus > 0;

              return (
                <tr key={row.customer.id} style={requiresLienFlag ? { backgroundColor: "#fff5f5" } : {}}>
                  <td>
                    <div><strong>{row.customer.name}</strong></div>
                    {requiresLienFlag && (
                      <span style={{ fontSize: "0.75rem", color: "#7a1f1f", fontWeight: "bold" }}>
                        ⚠️ HOLD PIECE / LIEN NOTICE
                      </span>
                    )}
                  </td>
                  <td>£{row.current.toFixed(2)}</td>
                  <td>£{row.d30.toFixed(2)}</td>
                  <td>£{row.d60.toFixed(2)}</td>
                  <td>£{row.d90.toFixed(2)}</td>
                  <td style={row.d90plus > 0 ? { color: "#7a1f1f", fontWeight: "bold" } : {}}>
                    £{row.d90plus.toFixed(2)}
                  </td>
                  <td>
                    <strong style={{ color: "#4a3f35" }}>£{row.total.toFixed(2)}</strong>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="small-button"
                      onClick={() => handleEmailReminder(row.customer.name, row.customer.email, row.total)}
                      title={row.customer.email ? "Email direct client reminder" : "No email address linked"}
                      disabled={!row.customer.email}
                    >
                      ✉️ Remind
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>

        {accountsOwing.length > 0 && (
          <tfoot>
            <tr style={{ background: "#e9ddc7", fontWeight: "bold" }}>
              <th>Grand Ledger Totals</th>
              <th>£{grantTotals.current.toFixed(2)}</th>
              <th>£{grantTotals.d30.toFixed(2)}</th>
              <th>£{grantTotals.d60.toFixed(2)}</th>
              <th>£{grantTotals.d90.toFixed(2)}</th>
              <th style={{ color: "#7a1f1f" }}>£{grantTotals.d90plus.toFixed(2)}</th>
              <th>£{grantTotals.total.toFixed(2)}</th>
              <th></th>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
