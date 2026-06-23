import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { getStock, reverseDeduction, adjustStock } from "../../lib/stock";
import type { StockItem } from "../../lib/stock";
import { useAccounting } from "../Accounting/AccountingContext";


type Job = {
  id: number;

  customerId?: number | null;   // ⭐ ADD THIS

  customerPhone?: string;
  customerAddress?: string;

  clockMake?: string;
  clockModel?: string;
  clockSerial?: string;
  clockAge?: string;

  status?: string;
  salesPrice?: string;
  paymentStatus?: "PAID" | "UNPAID";

  partsUsed?: {
    name: string;
    qty: number;
    costPrice?: number;
    stockId?: number;
  }[];

  timeSpent?: {
    minutes: number;
    note: string;
  }[];

  technicianNotes?: string;
  photos?: string[];
  dropoffSignature?: string;
  collectionSignature?: string;
};

export default function ViewJob() {
  const { id } = useParams();
  const { postJobToLedger, customers } = useAccounting();

  // Load jobs from localStorage
  const savedJobs = localStorage.getItem("jobs");
  const jobs: Job[] = savedJobs ? JSON.parse(savedJobs) : [];

  // Find the specific job
  const initialJob = jobs.find((j) => j.id === Number(id));

  if (!initialJob) {
    return (
      <div style={{ padding: "1rem", fontFamily: "system-ui, sans-serif" }}>
        Job not found.
      </div>
    );
  }

  // ⭐ Customer lookup MUST be here
  const customer = customers.find(c => c.id === initialJob.customerId);

  // ⭐ ALL HOOKS MUST COME AFTER THE COMPONENT STARTS
  const [jobState, setJobState] = useState<Job>(initialJob);
  const [partsUsed, setPartsUsed] = useState<Job["partsUsed"]>(
    initialJob.partsUsed || []
  );
  const [timeSpent, setTimeSpent] = useState<Job["timeSpent"]>(
    initialJob.timeSpent || []
  );
  const [photos, setPhotos] = useState<string[]>(initialJob.photos || []);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [showStockPicker, setShowStockPicker] = useState(false);

  // ⭐ Admin modal state
  const [showAssignCustomer, setShowAssignCustomer] = useState(false);

  const [isDrawing, setIsDrawing] = useState(false);
  const dropoffCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const collectionCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setStockItems(getStock());
  }, []);


function generateQR(text: string, size = 120) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    text
  )}`;
}

const qrURL = generateQR(`/jobs/${jobState.id}`, 120);

function updateJobField<K extends keyof Job>(field: K, value: Job[K]) {
  const updatedJob = { ...jobState, [field]: value } as Job;
  const updatedJobs = jobs.map((j) =>
    j.id === jobState.id ? updatedJob : j
  );
  localStorage.setItem("jobs", JSON.stringify(updatedJobs));
  setJobState(updatedJob);
}

function updateSalesPrice(value: string) {
  updateJobField("salesPrice", value);
}

function updatePaymentStatus(status: "PAID" | "UNPAID") {
  updateJobField("paymentStatus", status);
}

function updateStatus(newStatus: string) {
  updateJobField("status", newStatus);
}

function saveParts(parts: Job["partsUsed"]) {
  const updatedJob = { ...jobState, partsUsed: parts } as Job;
  const updatedJobs = jobs.map((j) =>
    j.id === jobState.id ? updatedJob : j
  );
  localStorage.setItem("jobs", JSON.stringify(updatedJobs));
  setJobState(updatedJob);
  setPartsUsed(parts);
}

function addPart() {
  const newPart = { name: "", qty: 1, costPrice: 0 };
  saveParts([...(partsUsed || []), newPart]);
}

function updatePart(
  index: number,
  field: keyof NonNullable<Job["partsUsed"]>[number],
  value: unknown
) {
  const updated = [...(partsUsed || [])];
  updated[index] = {
    ...updated[index],
    [field]: value,
  } as (typeof updated)[number];

  saveParts(updated);
}

function removePart(index: number) {
  const part = partsUsed?.[index];
  if (part?.stockId) {
    reverseDeduction(part.stockId, part.qty, jobState.id);
  }
  const updated = (partsUsed || []).filter((_, i) => i !== index);
  saveParts(updated);
}

function handleSelectStockItem(stockItem: StockItem) {
  setShowStockPicker(false);

  const qty = Number(prompt("Quantity to add?"));
  if (!qty || qty <= 0) return;

  const deduct = window.confirm(
    `Deduct ${qty} from stock?\n\nItem: ${stockItem.name}\nCurrent Qty: ${stockItem.quantity}`
  );

  const newPart = {
    name: stockItem.name,
    qty,
    costPrice: stockItem.costPrice,
    stockId: stockItem.id,
  };

  const updated = [...(partsUsed || []), newPart];
  saveParts(updated);

  if (deduct) {
    adjustStock(stockItem.id, -qty, `Used on job ${jobState.id}`);
  }
}

const totalPartsCost =
  (partsUsed || []).reduce((sum, p) => {
    const cost = p.costPrice ?? 0;
    const qty = p.qty ?? 0;
    return sum + cost * qty;
  }, 0) || 0;

function saveTime(entries: NonNullable<Job["timeSpent"]>) {
  const updatedJob = { ...jobState, timeSpent: entries } as Job;
  const updatedJobs = jobs.map((j) =>
    j.id === jobState.id ? updatedJob : j
  );
  localStorage.setItem("jobs", JSON.stringify(updatedJobs));
  setJobState(updatedJob);
  setTimeSpent(entries);
}

function addTimeEntry() {
  const newEntry = { minutes: 0, note: "" };
  saveTime([...(timeSpent || []), newEntry]);
}

function updateTimeEntry(
  index: number,
  field: keyof NonNullable<Job["timeSpent"]>[number],
  value: unknown
) {
  const updated = [...(timeSpent || [])];
  updated[index] = {
    ...updated[index],
    [field]: value,
  } as (typeof updated)[number];
  saveTime(updated);
}

function removeTimeEntry(index: number) {
  const updated = (timeSpent || []).filter((_, i) => i !== index);
  saveTime(updated);
}

function updateTechnicianNotes(notes: string) {
  updateJobField("technicianNotes", notes);
}

function savePhotos(newPhotos: string[]) {
  const updatedJob = { ...jobState, photos: newPhotos } as Job;
  const updatedJobs = jobs.map((j) =>
    j.id === jobState.id ? updatedJob : j
  );
  localStorage.setItem("jobs", JSON.stringify(updatedJobs));
  setJobState(updatedJob);
  setPhotos(newPhotos);
}

function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const existing = [...photos];
  const readers: Promise<string>[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    readers.push(
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      })
    );
  }

  Promise.all(readers).then((results) => {
    savePhotos([...existing, ...results]);
  });
}

function removePhoto(index: number) {
  savePhotos(photos.filter((_, i) => i !== index));
}

function getCanvas(type: "dropoff" | "collection") {
  return type === "dropoff"
    ? dropoffCanvasRef.current
    : collectionCanvasRef.current;
}

function startDraw(
  e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  type: "dropoff" | "collection"
) {
  const canvas = getCanvas(type);
  if (!canvas) return;
  setIsDrawing(true);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  const rect = canvas.getBoundingClientRect();
  const x =
    "touches" in e
      ? e.touches[0].clientX - rect.left
      : (e as React.MouseEvent<HTMLCanvasElement>).clientX - rect.left;
  const y =
    "touches" in e
      ? e.touches[0].clientY - rect.top
      : (e as React.MouseEvent<HTMLCanvasElement>).clientY - rect.top;
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function draw(
  e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  type: "dropoff" | "collection"
) {
  if (!isDrawing) return;
  const canvas = getCanvas(type);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const rect = canvas.getBoundingClientRect();
  const x =
    "touches" in e
      ? e.touches[0].clientX - rect.left
      : (e as React.MouseEvent<HTMLCanvasElement>).clientX - rect.left;
  const y =
    "touches" in e
      ? e.touches[0].clientY - rect.top
      : (e as React.MouseEvent<HTMLCanvasElement>).clientY - rect.top;
  ctx.lineTo(x, y);
  ctx.stroke();
}

function endDraw() {
  setIsDrawing(false);
}

function saveSignature(type: "dropoff" | "collection") {
  const canvas = getCanvas(type);
  if (!canvas) return;
  const data = canvas.toDataURL("image/png");
  if (type === "dropoff") {
    updateJobField("dropoffSignature", data);
  } else {
    updateJobField("collectionSignature", data);
  }
}

function clearSignature(type: "dropoff" | "collection") {
  const canvas = getCanvas(type);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (type === "dropoff") {
    updateJobField("dropoffSignature", "");
  } else {
    updateJobField("collectionSignature", "");
  }
}

function printJobSheet() {
  window.print();
}

function printReceipt() {
  window.print();
}

function handlePostToLedger() {
  const confirmPost = window.confirm(
    "Post this job to the ledger? This cannot be undone."
  );
  if (!confirmPost) return;

  postJobToLedger(jobState.id);
  alert("Job posted to ledger.");
}


  return (
    <div
      style={{
        padding: "1.5rem",
        fontFamily: "system-ui, sans-serif",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <div
        className="no-print"
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={printJobSheet}
          style={{
            background: "#b89b5e",
            color: "white",
            padding: "0.6rem 1rem",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Print Job Sheet
        </button>

        <button
          onClick={printReceipt}
          style={{
            background: "#4a6fa5",
            color: "white",
            padding: "0.6rem 1rem",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Print Customer Receipt
        </button>
        <button
  onClick={() => setShowAssignCustomer(true)}
  className="ledger-button"
  style={{ background: "#5a4632", marginBottom: "1rem" }}
>
  Admin: Link Customer Account
</button>

        <button
          onClick={handlePostToLedger}
          style={{
            background: "#2c3e50",
            color: "white",
            padding: "0.6rem 1rem",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Post to Ledger
        </button>
      </div>

      <h1 style={{ marginBottom: "0.5rem" }}>Job #{jobState.id}</h1>

      <div
        style={{
          border: "1px solid #000",
          padding: "1rem",
          width: "260px",
          float: "right",
          marginLeft: "1rem",
          textAlign: "center",
          background: "#fafafa",
        }}
      >
        <img
          src={qrURL}
          alt="QR Code"
          style={{ width: "120px", height: "120px", marginBottom: "0.5rem" }}
        />
        <div style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
          Scan for job details
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <strong>Sales Price (�):</strong>
          <input
            type="number"
            value={jobState.salesPrice || ""}
            onChange={(e) => updateSalesPrice(e.target.value)}
            className="no-print"
            style={{
              width: "100%",
              padding: "0.4rem",
              marginTop: "0.3rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <div className="print-only" style={{ display: "none" }}>
            �{jobState.salesPrice || "0.00"}
          </div>
        </div>

        <div>
          <strong>Payment:</strong>
          <div className="no-print" style={{ marginTop: "0.3rem" }}>
            <button
              onClick={() => updatePaymentStatus("PAID")}
              style={{
                background: "#2ecc71",
                color: "white",
                padding: "0.3rem 0.6rem",
                border: "none",
                borderRadius: "4px",
                marginRight: "0.3rem",
                cursor: "pointer",
              }}
            >
              Mark Paid
            </button>
            <button
              onClick={() => updatePaymentStatus("UNPAID")}
              style={{
                background: "#e74c3c",
                color: "white",
                padding: "0.3rem 0.6rem",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Mark Unpaid
            </button>
          </div>

          <div
            className="print-only"
            style={{
              display: "none",
              marginTop: "0.5rem",
              fontWeight: "bold",
              color: jobState.paymentStatus === "PAID" ? "green" : "red",
            }}
          >
            ? {jobState.paymentStatus || "UNPAID"}
          </div>
        </div>
      </div>
      <div
  style={{
    background: "#fffdf8",
    border: "1px solid #d2c4a8",
    padding: "1.2rem",
    borderRadius: "8px",
    marginBottom: "1.5rem",
  }}
>
  <h2 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Customer</h2>

  {!customer && (
    <p style={{ color: "#a33" }}>
      No customer assigned to this job.
    </p>
  )}

  {customer && (
    <div style={{ lineHeight: "1.6" }}>
      <p>
        <strong>{customer.name}</strong><br />
        Account No: <strong>{customer.id}</strong>
      </p>

      {customer.phone && <p>📞 {customer.phone}</p>}
      {customer.email && <p>✉️ {customer.email}</p>}
      {customer.address && (
        <p style={{ whiteSpace: "pre-line" }}>
          📍 {customer.address}
        </p>
      )}
    </div>
  )}
</div>

      <h2>Status</h2>
      <select
        value={jobState.status || "In Progress"}
        onChange={(e) => updateStatus(e.target.value)}
        className="no-print"
        style={{
          padding: "0.5rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
          marginBottom: "1.5rem",
        }}
      >
        <option value="In Progress">In Progress</option>
        <option value="Awaiting Parts">Awaiting Parts</option>
        <option value="Completed">Completed</option>
      </select>

      <h2>Customer Details</h2>
   <p>
        <strong>Phone:</strong> {jobState.customerPhone || ""}
      </p>
      <p>
        <strong>Address:</strong> {jobState.customerAddress || ""}
      </p>

      <h2>Clock Details</h2>
      <p>
        <strong>Make:</strong> {jobState.clockMake || ""}
      </p>
      <p>
        <strong>Model:</strong> {jobState.clockModel || ""}
      </p>
      <p>
        <strong>Serial:</strong> {jobState.clockSerial || ""}
      </p>
      <p>
        <strong>Age:</strong> {jobState.clockAge || ""}
      </p>

      <h2>Parts Used</h2>
      {(partsUsed || []).map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            marginBottom: "0.3rem",
          }}
        >
          <input
            type="text"
            value={p.name}
            onChange={(e) => updatePart(i, "name", e.target.value)}
            placeholder="Part name"
            style={{
              flex: 2,
              padding: "0.3rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="number"
            value={p.qty}
            onChange={(e) => updatePart(i, "qty", Number(e.target.value))}
            style={{
              width: "60px",
              padding: "0.3rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="number"
            value={p.costPrice ?? 0}
            onChange={(e) => updatePart(i, "costPrice", Number(e.target.value))}
            style={{
              width: "80px",
              padding: "0.3rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={() => removePart(i)}
            style={{
              padding: "0.3rem 0.6rem",
              borderRadius: "4px",
              border: "none",
              background: "#e74c3c",
              color: "white",
              cursor: "pointer",
            }}
          >
            X
          </button>
        </div>
      ))}
        return (
    <div style={{ padding: "1rem" }}>

      {/* ⭐ JOB ACTIONS */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          onClick={() => postJobToLedger(jobState.id)}
          className="ledger-button"
        >
          Post to Ledger
        </button>

        <Link
          to={`/accounting/sales-invoice/new/${jobState.id}`}
          className="ledger-button"
        >
          Create Sales Invoice
        </Link>

        {/* ⭐ ADMIN BUTTON GOES HERE */}
        <button
          onClick={() => setShowAssignCustomer(true)}
          className="ledger-button"
          style={{ background: "#5a4632" }}
        >
          Admin: Link Customer
        </button>
      </div>

      {/* ⭐ REST OF YOUR JOB UI BELOW THIS */}
      {/* (customer panel, parts, time, photos, signatures, etc.) */}


      {/* ⭐ ADMIN MODAL GOES AT THE BOTTOM OF RETURN */}
      {showAssignCustomer && (
        <div style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999
        }}>
          <div style={{
            background: "white",
            padding: "2rem",
            borderRadius: "8px",
            width: "400px"
          }}>
            <h2>Assign Customer</h2>

            <select
              defaultValue={initialJob.customerId || ""}
              onChange={(e) => {
                const newCustomerId = Number(e.target.value);

                const updatedJobs = jobs.map(j =>
                  j.id === initialJob.id ? { ...j, customerId: newCustomerId } : j
                );

                localStorage.setItem("jobs", JSON.stringify(updatedJobs));
                window.location.reload();
              }}
            >
              <option value="">Select a customer…</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button onClick={() => setShowAssignCustomer(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );


      <div
  className="job-actions"
  style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}
>
  <button
    onClick={() => postJobToLedger(initialJob.id)}
    className="ledger-button"
  >
    Post to Ledger
  </button>

  <Link
   to={`/accounting/sales-invoice/new/${initialJob.id}`}
    className="ledger-button"
  >
    Create Sales Invoice
  </Link>
</div>

      <div style={{ marginTop: "0.5rem" }}>
        <button
          onClick={addPart}
          className="no-print"
          style={{
            marginRight: "0.5rem",
            padding: "0.4rem 0.8rem",
            borderRadius: "6px",
            border: "none",
            background: "#4a6fa5",
            color: "white",
            cursor: "pointer",
          }}
        >
          + Add Part
        </button>
        <button
          onClick={() => setShowStockPicker(true)}
          className="no-print"
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: "6px",
            border: "none",
            background: "#4a6fa5",
            color: "white",
            cursor: "pointer",
          }}
        >
          + Add From Stock
        </button>
      </div>

      <div style={{ marginTop: "1rem", fontWeight: "bold" }}>
        Total Parts Cost: �{totalPartsCost.toFixed(2)}
      </div>

      <h2 style={{ marginTop: "2rem" }}>Time Spent</h2>
      {(timeSpent || []).map((t, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            marginBottom: "0.3rem",
          }}
        >
          <input
            type="number"
            value={t.minutes}
            onChange={(e) => updateTimeEntry(i, "minutes", Number(e.target.value))}
            style={{
              width: "80px",
              padding: "0.3rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="text"
            value={t.note}
            onChange={(e) => updateTimeEntry(i, "note", e.target.value)}
            placeholder="Note"
            style={{
              flex: 2,
              padding: "0.3rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={() => removeTimeEntry(i)}
            style={{
              padding: "0.3rem 0.6rem",
              borderRadius: "4px",
              border: "none",
              background: "#e74c3c",
              color: "white",
              cursor: "pointer",
            }}
          >
            X
          </button>
        </div>
      ))}

      <button
        onClick={addTimeEntry}
        className="no-print"
        style={{
          marginTop: "0.5rem",
          padding: "0.4rem 0.8rem",
          borderRadius: "6px",
          border: "none",
          background: "#4a6fa5",
          color: "white",
          cursor: "pointer",
        }}
      >
        + Add Time Entry
      </button>

      <h2 style={{ marginTop: "2rem" }}>Technician Notes</h2>
      <textarea
        value={jobState.technicianNotes || ""}
        onChange={(e) => updateTechnicianNotes(e.target.value)}
        className="no-print"
        style={{
          width: "100%",
          minHeight: "120px",
          padding: "0.5rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      <h2 style={{ marginTop: "2rem" }}>Photos</h2>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handlePhotoUpload}
        className="no-print"
        style={{ marginBottom: "0.5rem" }}
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginTop: "0.5rem",
        }}
      >
        {photos.map((src, i) => (
          <div key={i} style={{ position: "relative" }}>
            <img
              src={src}
              alt={`Photo ${i + 1}`}
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
            <button
              className="no-print"
              onClick={() => removePhoto(i)}
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                padding: "0.2rem 0.4rem",
                borderRadius: "4px",
                border: "none",
                background: "#e74c3c",
                color: "white",
                cursor: "pointer",
                fontSize: "0.7rem",
              }}
            >
              X
            </button>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: "2rem" }}>Signatures</h2>
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div>
          <h3>Drop-off Signature</h3>
          <canvas
            ref={dropoffCanvasRef}
            width={300}
            height={120}
            style={{
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "crosshair",
              borderRadius: "4px",
            }}
            onMouseDown={(e) => startDraw(e, "dropoff")}
            onMouseMove={(e) => draw(e, "dropoff")}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={(e) => startDraw(e, "dropoff")}
            onTouchMove={(e) => draw(e, "dropoff")}
            onTouchEnd={endDraw}
          />
          <div className="no-print" style={{ marginTop: "0.5rem" }}>
            <button
              onClick={() => saveSignature("dropoff")}
              style={{
                marginRight: "0.5rem",
                padding: "0.3rem 0.6rem",
                borderRadius: "4px",
                border: "none",
                background: "#4a6fa5",
                color: "white",
                cursor: "pointer",
              }}
            >
              Save
            </button>
            <button
              onClick={() => clearSignature("dropoff")}
              style={{
                padding: "0.3rem 0.6rem",
                borderRadius: "4px",
                border: "none",
                background: "#e74c3c",
                color: "white",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
          {jobState.dropoffSignature && (
            <div className="print-only" style={{ display: "none" }}>
              <img
                src={jobState.dropoffSignature}
                alt="Drop-off Signature"
                style={{ width: "300px", height: "120px" }}
              />
            </div>
          )}
        </div>

        <div>
          <h3>Collection Signature</h3>
          <canvas
            ref={collectionCanvasRef}
            width={300}
            height={120}
            style={{
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "crosshair",
              borderRadius: "4px",
            }}
            onMouseDown={(e) => startDraw(e, "collection")}
            onMouseMove={(e) => draw(e, "collection")}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={(e) => startDraw(e, "collection")}
            onTouchMove={(e) => draw(e, "collection")}
            onTouchEnd={endDraw}
          />
          <div className="no-print" style={{ marginTop: "0.5rem" }}>
            <button
              onClick={() => saveSignature("collection")}
              style={{
                marginRight: "0.5rem",
                padding: "0.3rem 0.6rem",
                borderRadius: "4px",
                border: "none",
                background: "#4a6fa5",
                color: "white",
                cursor: "pointer",
              }}
            >
              Save
            </button>
            <button
              onClick={() => clearSignature("collection")}
              style={{
                padding: "0.3rem 0.6rem",
                borderRadius: "4px",
                border: "none",
                background: "#e74c3c",
                color: "white",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
          {jobState.collectionSignature && (
            <div className="print-only" style={{ display: "none" }}>
              <img
                src={jobState.collectionSignature}
                alt="Collection Signature"
                style={{ width: "300px", height: "120px" }}
              />
            </div>
          )}
        </div>
      </div>

      {showStockPicker && (
        <div
          className="no-print"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "1rem",
              borderRadius: "8px",
              width: "500px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h3>Select Stock Item</h3>
            {stockItems.map((s) => (
              <div
                key={s.id}
                style={{
                  padding: "0.5rem",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                }}
                onClick={() => handleSelectStockItem(s)}
              >
                <strong>{s.name}</strong> � Qty: {s.quantity}
                <br />
                <span style={{ fontSize: "0.9rem", color: "#555" }}>
                  SKU: {s.sku}
                </span>
              </div>
            ))}
            <button
              onClick={() => setShowStockPicker(false)}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                border: "none",
                background: "#ccc",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
