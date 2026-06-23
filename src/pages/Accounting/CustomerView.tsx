import { useParams } from "react-router-dom";
import { useAccounting } from "./AccountingContext";
import { useJobs } from "../../hooks/useJobs";

export default function CustomerView() {
  const { id } = useParams();
  const { customers, salesInvoices, salesReceipts } = useAccounting();
  const { jobs } = useJobs();

  const customer = customers.find(c => c.id === Number(id));

  if (!customer) {
    return <div style={{ padding: "1rem" }}>Customer not found.</div>;
  }

  // Invoices for this customer
  const customerInvoices = salesInvoices.filter(inv => inv.customerId === customer.id);

  // Payments for this customer
  const customerPayments = salesReceipts.filter(pay => pay.customerId === customer.id);

  // Jobs for this customer
  const customerJobs = jobs.filter(job => job.customerId === customer.id);

  // Account summary
  const totalInvoiced = customerInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = customerPayments.reduce((sum, pay) => sum + pay.amount, 0);
  const outstanding = totalInvoiced - totalPaid;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>{customer.name}</h1>

      <p><strong>Phone:</strong> {customer.phone}</p>
      <p><strong>Email:</strong> {customer.email}</p>
      <p><strong>Address:</strong> {customer.address}</p>

      <hr />

      {/* ACCOUNT SUMMARY */}
      <h2>Account Summary</h2>
      <p><strong>Total Invoiced:</strong> £{totalInvoiced.toFixed(2)}</p>
      <p><strong>Total Paid:</strong> £{totalPaid.toFixed(2)}</p>
      <p><strong>Outstanding Balance:</strong> £{outstanding.toFixed(2)}</p>

      <hr />

      {/* INVOICES */}
      <h2>Invoices</h2>
      {customerInvoices.length === 0 && <p>No invoices yet.</p>}
      {customerInvoices.map(inv => (
        <div key={inv.id}>
          Invoice #{inv.id} — £{inv.amount} —{" "}
          <span
            style={{
              color:
                inv.status === "Paid"
                  ? "green"
                  : inv.status === "Part Paid"
                  ? "orange"
                  : "red",
            }}
          >
            {inv.status}
          </span>
        </div>
      ))}

      <hr />

      {/* PAYMENTS */}
      <h2>Payments</h2>
      {customerPayments.length === 0 && <p>No payments recorded.</p>}
      {customerPayments.map(pay => (
        <div key={pay.id}>
          Payment £{pay.amount} on {pay.date} (Invoice #{pay.invoiceId})
        </div>
      ))}

      <hr />

      {/* JOBS */}
      <h2>Jobs</h2>
      {customerJobs.length === 0 && <p>No jobs for this customer.</p>}
      {customerJobs.map(job => (
        <div key={job.id}>
          Job #{job.id} — {job.clockMake} {job.clockModel} — {job.status}
        </div>
      ))}
    </div>
  );
}
