import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAccounting } from "./AccountingContext";

// Add this Job type
type Job = {
  id: number;
  customerId: number;
  description?: string;
  technician?: string;
  salesPrice?: number;
};

export default function NewSalesInvoice() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  // Load jobs the same way ViewJob does
  const savedJobs = localStorage.getItem("jobs");
  const jobs: Job[] = savedJobs ? JSON.parse(savedJobs) : [];
  const initialJob = jobs.find((j) => j.id === Number(jobId));

  const { addSalesInvoice, customers } = useAccounting();

  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    if (initialJob) {
      setAmount(initialJob.salesPrice || 0);
    }
  }, [initialJob]);

  if (!initialJob) {
    return (
      <div style={{ padding: "1rem" }}>
        <h2>Sales Invoice</h2>
        <p>No job found. Cannot create invoice.</p>
      </div>
    );
  }

  const customer = customers.find(c => c.id === initialJob.customerId);

  const handlePostInvoice = () => {
    if (!customer) return;

    addSalesInvoice(customer.id, initialJob.id, amount);

    navigate("/accounting/sales-ledger");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "1rem" }}>Create Sales Invoice</h2>

      <div
        style={{
          background: "#faf6ef",
          padding: "1rem",
          border: "1px solid #d2c4a8",
          borderRadius: "6px",
          marginBottom: "1rem"
        }}
      >
        <h3 style={{ marginTop: 0 }}>Job Details</h3>
        <p><strong>Job ID:</strong> {initialJob.id}</p>
        <p><strong>Description:</strong> {initialJob.description || "No description"}</p>
        <p><strong>Technician:</strong> {initialJob.technician || "N/A"}</p>
      </div>

      <div
        style={{
          background: "#faf6ef",
          padding: "1rem",
          border: "1px solid #d2c4a8",
          borderRadius: "6px",
          marginBottom: "1rem"
        }}
      >
        <h3 style={{ marginTop: 0 }}>Customer</h3>
        {customer ? (
          <>
            <p><strong>Name:</strong> {customer.name}</p>
          </>
        ) : (
          <p>No customer found.</p>
        )}
      </div>

      <div
        style={{
          background: "#faf6ef",
          padding: "1rem",
          border: "1px solid #d2c4a8",
          borderRadius: "6px",
          marginBottom: "1rem"
        }}
      >
        <h3 style={{ marginTop: 0 }}>Invoice Amount</h3>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Amount (£)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "1px solid #b8a98a",
            borderRadius: "4px"
          }}
        />
      </div>

      <button
        onClick={handlePostInvoice}
        style={{
          background: "#5a4632",
          color: "white",
          padding: "0.75rem 1.5rem",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          width: "100%",
          fontSize: "1rem"
        }}
      >
        Post Invoice
      </button>
    </div>
  );
}
