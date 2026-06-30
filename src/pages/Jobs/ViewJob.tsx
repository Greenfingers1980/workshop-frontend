// src/pages/Jobs/ViewJob.tsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useAccounting } from "../Accounting/AccountingContext"; 
import { useJobs } from "../../hooks/useJobs";


interface PartUsed {
  name: string;
  qty: number;
  costPrice?: number;
  stockId?: string | number;
}

interface TimeSpent {
  minutes: number;
  note: string;
}

interface Job {
  id: number | string;
  customerId?: number | null;
  customerPhone?: string;
  customerAddress?: string;
  clockMake?: string;
  clockModel?: string;
  clockSerial?: string;
  clockAge?: string;
  status: string;
  salesPrice?: string | number;
  paymentStatus?: "PAID" | "UNPAID";
  partsUsed?: PartUsed[];
  timeSpent?: TimeSpent[];
  technicianNotes?: string;
  photos?: string[];
  dropoffSignature?: string;
  collectionSignature?: string;
}

export default function ViewJob() {
  const { id } = useParams<{ id: string }>();
  const { postJobToLedger, customers } = useAccounting();
  const { jobs, updateJobInDatabase } = useJobs() as any; 

  const [isDrawing, setIsDrawing] = useState(false);
  const dropoffCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const collectionCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Memoize Job Retrieval to optimize render cycle calculations
  const initialJob = useMemo<Job | null>(() => {
    if (!id || !jobs) return null;
    return jobs.find((j: any) => String(j.id) === String(id)) || null;
  }, [jobs, id]);

  const [jobState, setJobState] = useState<Job | null>(null);

  // Sync component state with underlying database data updates
  useEffect(() => {
    if (initialJob) {
      setJobState(initialJob);
    }
  }, [initialJob]);

  // Map out customer metadata properties
  const customer = useMemo(() => {
    if (!jobState || !customers) return null;
    return customers.find(c => c.id === jobState.customerId) || null;
  }, [customers, jobState?.customerId]);

  // Aggregate current replacement parts costs natively
  const totalPartsCost = useMemo(() => {
    if (!jobState?.partsUsed) return 0;
    return jobState.partsUsed.reduce((sum, p) => sum + (p.costPrice ?? 0) * (p.qty ?? 0), 0);
  }, [jobState?.partsUsed]);

  // Standardized dynamic target API generator for routing validation
  const qrURL = useMemo(() => {
    if (!jobState) return "";
    const domainOrigin = window.location.origin;
    return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${domainOrigin}/jobs/view/${jobState.id}`)}`;
  }, [jobState?.id]);

  if (!jobState) {
    return (
      <div className="accounting-container">
        <div className="parchment-card" style={{ textAlign: "center", padding: "3rem" }}>
          <h2>Awaiting Service Record...</h2>
          <p style={{ margin: "1rem 0" }}>Pulling active ticket data from the database.</p>
        </div>
      </div>
    );
  }

  /**
   * MUTATOR: Real-time update push out to backend layer
   */
  const handleUpdateField = async (fieldsPatch: Partial<Job>) => {
    const freshState = { ...jobState, ...fieldsPatch };
    setJobState(freshState); 

    try {
      await updateJobInDatabase(jobState.id, fieldsPatch);
    } catch (err) {
      console.error("Supabase synchronization exception:", err);
    }
  };

  /**
   * CANVAS SIGNATURE UTILITY CONTROL OPERATIONS
   */
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, ref: React.RefObject<HTMLCanvasElement | null>) => {
    const canvas = ref.current;
    if (!canvas) return;
    e.preventDefault();
    setIsDrawing(true);
    
    const ctx = canvas.getContext("2d");
    const coords = getCoordinates(e, canvas);
    if (!ctx || !coords) return;

    ctx.strokeStyle = "#2c3e50";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const drawMovementLine = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, ref: React.RefObject<HTMLCanvasElement | null>) => {
    if (!isDrawing) return;
    const canvas = ref.current;
    if (!canvas) return;
    e.preventDefault();

    const ctx = canvas.getContext("2d");
    const coords = getCoordinates(e, canvas);
    if (!ctx || !coords) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const saveSignatureCanvas = async (type: "dropoff" | "collection", ref: React.RefObject<HTMLCanvasElement | null>) => {
    const canvas = ref.current;
    if (!canvas) return;
    
    const signatureDataUrl = canvas.toDataURL("image/png");
    const fieldName = type === "dropoff" ? "dropoffSignature" : "collectionSignature";
    
    await handleUpdateField({ [fieldName]: signatureDataUrl });
    alert(`✓ ${type === "dropoff" ? "Intake" : "Release"} signature locked successfully.`);
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        
        {/* --- HEADER BLOCK CONTAINER --- */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "#9b8b6f", fontWeight: "bold" }}>BENCH CONTROL INTERFACE</span>
            <h1 className="accounting-title" style={{ fontSize: "2.25rem", margin: 0 }}>Job Record #{jobState.id}</h1>
            <p className="accounting-subtitle" style={{ marginTop: "0.2rem" }}>
              {jobState.clockMake} — {jobState.clockModel} (Serial Link: <code>{jobState.clockSerial || "N/A"}</code>)
            </p>
          </div>

          {qrURL && (
            <div style={{ textAlign: "center", background: "#ffffff", padding: "0.5rem", borderRadius: "6px", border: "1px solid #d2c4a8" }}>
              <img src={qrURL} alt="Routing Code Sticker" style={{ display: "block", width: "100px", height: "100px" }} />
              <span style={{ fontSize: "0.65rem", color: "#9b8b6f", fontWeight: "bold", letterSpacing: "0.05em" }}>SCAN BARCODE KEY</span>
            </div>
          )}
        </div>

        <hr className="divider" />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "2.5rem", marginTop: "1rem" }}>
          
          {/* LEFT PANEL COLUMN: ACTIONS AND NOTES META */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            {/* WORKSHOP TASK PHASE TOGGLES */}
            <div style={{ background: "#fdfbf7", padding: "1.25rem", border: "1px solid #d2c4a8", borderRadius: "6px" }}>
              <h3 className="section-title" style={{ marginTop: 0 }}>⚙️ Workbench Phase Control</h3>
              
              <div className="form-row" style={{ marginTop: "0.7rem" }}>
                <label style={{ display: "block", width: "100%" }}>Operational Workflow Status
                  <select value={jobState.status} onChange={e => handleUpdateField({ status: e.target.value })} style={{ marginTop: "0.25rem", width: "100%" }}>
                    <option value="In Progress">🔧 Active Repair on Bench</option>
                    <option value="Awaiting Parts">📦 Delayed: Parts on Order</option>
                    <option value="Quality Control">🔬 Time-Grapher QC Sync</option>
                    <option value="Completed">Ready for Collection</option>
                  </select>
                </label>
              </div>

              <div className="form-row" style={{ marginTop: "0.75rem", display: "flex", gap: "1rem" }}>
                <label style={{ flex: 1 }}>Billed Sales Price (£)
                  <input type="number" step="0.01" value={jobState.salesPrice || ""} onChange={e => handleUpdateField({ salesPrice: e.target.value })} style={{ marginTop: "0.25rem", width: "100%" }} />
                </label>
                <label style={{ flex: 1 }}>Accounting Balance Status
                  <select value={jobState.paymentStatus || "UNPAID"} onChange={e => handleUpdateField({ paymentStatus: e.target.value as any })} style={{ marginTop: "0.25rem", width: "100%" }}>
                    <option value="UNPAID">🔴 Open Outstanding Debt</option>
                    <option value="PAID">🟢 Account Balanced (Settled)</option>
                  </select>
                </label>
              </div>
            </div>

            {/* ASSIGNED CLIENT LEDGER DETAILS SUMMARY */}
            <div style={{ background: "#fdfbf7", padding: "1.25rem", border: "1px solid #d2c4a8", borderRadius: "6px" }}>
              <h3 className="section-title" style={{ marginTop: 0 }}>👤 Consignment Owner Profile</h3>
              {customer ? (
                <div style={{ fontSize: "0.9rem", marginTop: "0.5rem", lineHeight: "1.4" }}>
                  <div><strong>Full Name:</strong> {customer.name}</div>
                  <div><strong>Phone:</strong> {jobState.customerPhone || "Linked via Profile"}</div>
                  <div style={{ color: "#6b5c4a", fontSize: "0.8rem", marginTop: "0.25rem" }}>📍 Courier Address: {customer.address || "No address log"}</div>
                </div>
              ) : (
                <p style={{ color: "#9b8b6f", fontStyle: "italic", fontSize: "0.85rem", margin: 0 }}>
                  No customer bound. Map owner inside administrator portal settings.
                </p>
              )}
            </div>

            {/* HOROLOGIST LOG DIARY FIELD */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label className="notes-label" style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                🔬 Bench Horologist Service Diary Memo
              </label>
              <textarea
                rows={5}
                style={{ background: "#fdfbf7", padding: "0.5rem", border: "1px solid #d2c4a8", borderRadius: "6px" }}
                value={jobState.technicianNotes || ""}
                onChange={e => handleUpdateField({ technicianNotes: e.target.value })}
                placeholder="Log granular service records: e.g., Replaced mainspring barrel, adjusted pallet fork engagement, loaded Moebius 9010 on balance pivots..."
              />
            </div>
          </div>

          {/* RIGHT PANEL COLUMN: REPLACEMENT INVENTORY MATRIX & SIGNATURE DRAW PANELS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* MATERIAL PIECES TABLE INDEX */}
            <div style={{ background: "#fdfbf7", padding: "1.25rem", border: "1px solid #d2c4a8", borderRadius: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 className="section-title" style={{ margin: 0 }}>📦 Pre-Allocated Movement Parts</h3>
                <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#6b5c4a" }}>
                  Materials Valuation: £{totalPartsCost.toFixed(2)}
                </span>
              </div>

              <table className="ledger-table" style={{ marginTop: "0.75rem", background: "#ffffff", width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f5f2eb" }}>
                    <th style={{ textAlign: "left", padding: "0.4rem" }}>Component Part Name</th>
                    <th style={{ width: "15%", textAlign: "center", padding: "0.4rem" }}>Qty</th>
                    <th style={{ width: "20%", textAlign: "right", padding: "0.4rem" }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {!jobState.partsUsed || jobState.partsUsed.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ fontStyle: "italic", color: "#9b8b6f", fontSize: "0.8rem", padding: "0.5rem", textAlign: "center" }}>
                        No inventory parts linked to this ticket sequence.
                      </td>
                    </tr>
                  ) : (
                    jobState.partsUsed.map((p, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "0.4rem" }}>{p.name || "Custom Materials Allocation"}</td>
                        <td style={{ textAlign: "center", padding: "0.4rem" }}>{p.qty}</td>
                        <td style={{ textAlign: "right", padding: "0.4rem" }}>£{((p.costPrice || 0) * (p.qty || 0)).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* DUAL WORKSHOP CAPTURE SIGNATURE REGION */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              
              {/* INTERFACE PANEL A: INTAKE EXECUTION */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.8rem", color: "#6b5c4a", fontWeight: "bold" }}>A. Customer Intake Consent</span>
                {jobState.dropoffSignature ? (
                  <div style={{ background: "#fdfbf7", border: "1px dashed #c8b79a", padding: "0.25rem", borderRadius: "4px", marginTop: "0.3rem" }}>
                    <img src={jobState.dropoffSignature} alt="Intake verified" style={{ width: "100%", height: "95px", objectFit: "contain" }} />
                  </div>
                ) : (
                  <div style={{ marginTop: "0.3rem" }}>
                    <canvas
                      ref={dropoffCanvasRef}
                      width={220}
                      height={95}
                      style={{ background: "#ffffff", border: "1px solid #c8b79a", borderRadius: "4px", touchAction: "none", width: "100%" }}
                      onMouseDown={e => startDrawing(e, dropoffCanvasRef)}
                      onMouseMove={e => drawMovementLine(e, dropoffCanvasRef)}
                      onMouseUp={() => setIsDrawing(false)}
                      onTouchStart={e => startDrawing(e, dropoffCanvasRef)}
                      onTouchMove={e => drawMovementLine(e, dropoffCanvasRef)}
                      onTouchEnd={() => setIsDrawing(false)}
                    />
                    <button type="button" className="small-button" style={{ width: "100%", marginTop: "0.25rem", fontSize: "0.75rem" }} onClick={() => saveSignatureCanvas("dropoff", dropoffCanvasRef)}>
                      🔒 Lock Intake Line
                    </button>
                  </div>
                )}
              </div>

              {/* INTERFACE PANEL B: HANDOVER COMPLETION */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.8rem", color: "#6b5c4a", fontWeight: "bold" }}>B. Handover Release Signature</span>
                {jobState.collectionSignature ? (
                  <div style={{ background: "#fdfbf7", border: "1px dashed #c8b79a", padding: "0.25rem", borderRadius: "4px", marginTop: "0.3rem" }}>
                    <img src={jobState.collectionSignature} alt="Release verified" style={{ width: "100%", height: "95px", objectFit: "contain" }} />
                  </div>
                ) : (
                  <div style={{ marginTop: "0.3rem" }}>
                    <canvas
                      ref={collectionCanvasRef}
                      width={220}
                      height={95}
                      style={{ background: "#ffffff", border: "1px solid #c8b79a", borderRadius: "4px", touchAction: "none", width: "100%" }}
                      onMouseDown={e => startDrawing(e, collectionCanvasRef)}
                      onMouseMove={e => drawMovementLine(e, collectionCanvasRef)}
                      onMouseUp={() => setIsDrawing(false)}
                      onTouchStart={e => startDrawing(e, collectionCanvasRef)}
                      onTouchMove={e => drawMovementLine(e, collectionCanvasRef)}
                      onTouchEnd={() => setIsDrawing(false)}
                    />
                    <button type="button" className="small-button" style={{ width: "100%", marginTop: "0.25rem", fontSize: "0.75rem" }} onClick={() => saveSignatureCanvas("collection", collectionCanvasRef)}>
                      🔒 Lock Handover Line
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}