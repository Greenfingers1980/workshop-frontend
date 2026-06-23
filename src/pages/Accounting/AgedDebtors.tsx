import { useAccounting } from "./AccountingContext";
import "./Accounting.css";

export default function AgedDebtors() {
  const { customers, salesInvoices, salesReceipts } = useAccounting();

  // Days between helper
  const daysBetween = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Sum receipts for an invoice
  const totalPaidForInvoice = (invoiceId: number) =>
    salesReceipts
      .filter((r) => r.invoiceId === invoiceId)
      .reduce((sum, r) => sum + r.amount, 0);

  // Determine if invoice is unpaid
  const isUnpaid = (invoiceId: number, invoiceAmount: number) => {
    const paid = totalPaidForInvoice(invoiceId);
    return paid < invoiceAmount;
  };

  // Build ageing per customer
  const aged = customers.map((customer) => {
    const invoices = salesInvoices.filter(
      (inv) => inv.customerId === customer.id && isUnpaid(inv.id, inv.amount)
    );

    const buckets = {
      current: 0,
      d30: 0,
      d60: 0,
      d90: 0,
      d90plus: 0,
      total: 0,
    };

    invoices.forEach((inv) => {
      const age = daysBetween(inv.date);
      const amount = inv.amount - totalPaidForInvoice(inv.id); // outstanding balance

      if (age <= 30) buckets.current += amount;
      else if (age <= 60) buckets.d30 += amount;
      else if (age <= 90) buckets.d60 += amount;
      else if (age <= 120) buckets.d90 += amount;
      else buckets.d90plus += amount;

      buckets.total += amount;
    });

    return { customer, ...buckets };
  });

  // Only show customers who owe money
  const owing = aged.filter((c) => c.total > 0);

  // Grand totals
  const totals = owing.reduce(
    (acc, c) => {
      acc.current += c.current;
      acc.d30 += c.d30;
      acc.d60 += c.d60;
      acc.d90 += c.d90;
      acc.d90plus += c.d90plus;
      acc.total += c.total;
      return acc;
    },
    { current: 0, d30: 0, d60: 0, d90: 0, d90plus: 0, total: 0 }
  );

  return (
    <div className="panel">
      <h1>Aged Debtors</h1>
      <p className="muted">Outstanding customer balances grouped by ageing period.</p>

      <table className="ledger-table" style={{ marginTop: "1.5rem" }}>
        <thead>
          <tr>
            <th>Customer</th>
            <th>0–30 days</th>
            <th>31–60 days</th>
            <th>61–90 days</th>
            <th>91–120 days</th>
            <th>120+ days</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {owing.map((row) => (
            <tr key={row.customer.id}>
              <td>{row.customer.name}</td>
              <td>£{row.current.toFixed(2)}</td>
              <td>£{row.d30.toFixed(2)}</td>
              <td>£{row.d60.toFixed(2)}</td>
              <td>£{row.d90.toFixed(2)}</td>
              <td>£{row.d90plus.toFixed(2)}</td>
              <td><strong>£{row.total.toFixed(2)}</strong></td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <th>Total</th>
            <th>£{totals.current.toFixed(2)}</th>
            <th>£{totals.d30.toFixed(2)}</th>
            <th>£{totals.d60.toFixed(2)}</th>
            <th>£{totals.d90.toFixed(2)}</th>
            <th>£{totals.d90plus.toFixed(2)}</th>
            <th>£{totals.total.toFixed(2)}</th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
