import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJobs } from "../../hooks/useJobs";
import type { CSSProperties } from "react";
import CustomerSelect from "../../components/CustomerSelect";
import type { Job } from "../../hooks/useJobs";
import { useAccounting } from "../Accounting/AccountingContext";

export default function NewJob() {
  const navigate = useNavigate();
  const { addJob } = useJobs();
  const { addCustomer, customers } = useAccounting();

  // Modal state
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  // New customer fields
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");

  // Clock details
  const [clockMake, setClockMake] = useState("");
  const [clockModel, setClockModel] = useState("");
  const [clockSerial, setClockSerial] = useState("");
  const [clockAge, setClockAge] = useState("");

  // Condition & service
  const [conditionNotes, setConditionNotes] = useState("");
  const [serviceRequested, setServiceRequested] = useState("");

  // Technician assignment
  const [assignedTechnician, setAssignedTechnician] = useState("");

  // Photos
  const [conditionPhotos, setConditionPhotos] = useState<File[]>([]);
  const [movementPhotos, setMovementPhotos] = useState<File[]>([]);

  // Job state
  const [job, setJob] = useState<Job>({
  id: Date.now(),
  customerId: null,
  customerName: "",
  description: "",

  clockMake: "",
  clockModel: "",
  clockSerial: "",
  clockAge: "",

  conditionNotes: "",
  serviceRequested: "",

  status: "New",
  technicianNotes: "",

  partsUsed: [],
  timeSpent: [],

  createdAt: new Date().toISOString(),
});

  // -------------------------------------------------------
  // SAVE JOB
  // -------------------------------------------------------
  function saveJob(e: React.FormEvent) {
    e.preventDefault();

    const newJob: Job = {
      
      id: Date.now(),
      customerId: job.customerId,
        customerName: job.customerName || "",   // ← REQUIRED
  description: job.description || "",     

      clockMake,
      clockModel,
      clockSerial,
      clockAge,

      conditionNotes,
      serviceRequested,

      status: "In Progress",
      assignedTechnician: assignedTechnician || "",

      technicianNotes: "",

      conditionPhotos: conditionPhotos.map(file =>
        URL.createObjectURL(file)
      ),
      movementPhotos: movementPhotos.map(file =>
        URL.createObjectURL(file)
      ),

      partsUsed: [],
      timeSpent: [],

      createdAt: new Date().toISOString(),
    };

    addJob(newJob);
    window.location.href = "/jobs";
  }

  // -------------------------------------------------------
  // CREATE NEW CUSTOMER
  // -------------------------------------------------------
  function handleCreateCustomer() {
    navigate(`/jobs/${job.id}`);
    const newCustomer = {
      name: newCustomerName,
      phone: newCustomerPhone,
      email: newCustomerEmail,
      address: newCustomerAddress,
      accountId: 2, // Trade Debtors
    };

    const id = addCustomer(newCustomer); // ⭐ MUST return ID
    setJob({ ...job, customerId: id });

    setShowNewCustomer(false);

    // Reset modal fields
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewCustomerEmail("");
    setNewCustomerAddress("");
  }

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <div>
      <h1>Create New Job</h1>
      <p>Fill in the details to create a new workshop job.</p>

      <form
        onSubmit={saveJob}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginTop: "2rem",
          maxWidth: "600px",
        }}
      >
        {/* CUSTOMER */}
        <h2>Customer</h2>

        <CustomerSelect
          value={job.customerId}
          onChange={(id) => setJob({ ...job, customerId: id })}
        />

        <button
          type="button"
          onClick={() => setShowNewCustomer(true)}
          style={{
            marginTop: "0.5rem",
            padding: "0.4rem 0.8rem",
            background: "#5a4632",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          + Create New Customer
        </button>

        {/* CLOCK DETAILS */}
        <h2>Clock Details</h2>

        <div>
          <label>Make</label>
          <input
            type="text"
            value={clockMake}
            onChange={(e) => setClockMake(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Model</label>
          <input
            type="text"
            value={clockModel}
            onChange={(e) => setClockModel(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Serial Number</label>
          <input
            type="text"
            value={clockSerial}
            onChange={(e) => setClockSerial(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Approximate Age</label>
          <input
            type="text"
            value={clockAge}
            onChange={(e) => setClockAge(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* CONDITION & SERVICE */}
        <h2>Condition & Service</h2>

        <div>
          <label>Condition Notes</label>
          <textarea
            value={conditionNotes}
            onChange={(e) => setConditionNotes(e.target.value)}
            rows={4}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Service Requested</label>
          <select
            value={serviceRequested}
            onChange={(e) => setServiceRequested(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select service…</option>
            <option value="battery">Battery Replacement</option>
            <option value="overhaul">Movement Overhaul</option>
            <option value="clean">Cleaning & Lubrication</option>
            <option value="cosmetic">Cosmetic Restoration</option>
            <option value="diagnostic">Diagnostic Only</option>
          </select>
        </div>

        {/* TECHNICIAN */}
        <h2>Assign Technician</h2>

        <div>
          <label>Technician</label>
          <select
            value={assignedTechnician}
            onChange={(e) => setAssignedTechnician(e.target.value)}
            style={inputStyle}
          >
            <option value="">Unassigned</option>
            <option value="Matthew">Matthew</option>
            <option value="Technician A">Technician A</option>
            <option value="Technician B">Technician B</option>
          </select>
        </div>

        {/* PHOTOS */}
        <h2>Photos</h2>

        <div>
          <label>Condition Photos</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                setConditionPhotos(Array.from(e.target.files));
              }
            }}
            style={inputStyle}
          />

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            {conditionPhotos.map((file, index) => (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                alt="Condition"
                style={thumbStyle}
              />
            ))}
          </div>
        </div>

        <div>
          <label>Movement Photos</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                setMovementPhotos(Array.from(e.target.files));
              }
            }}
            style={inputStyle}
          />

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            {movementPhotos.map((file, index) => (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                alt="Movement"
                style={thumbStyle}
              />
            ))}
          </div>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          style={{
            background: "#b89b5e",
            color: "white",
            padding: "0.7rem 1.2rem",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "1rem",
          }}
        >
          Save Job
        </button>
      </form>

      {/* -------------------------------------------------------
          NEW CUSTOMER MODAL
      -------------------------------------------------------- */}
      {showNewCustomer && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "8px",
              width: "400px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <h2>Create New Customer</h2>

            <label>Name</label>
            <input
              type="text"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              style={inputStyle}
            />

            <label>Phone</label>
            <input
              type="text"
              value={newCustomerPhone}
              onChange={(e) => setNewCustomerPhone(e.target.value)}
              style={inputStyle}
            />

            <label>Email</label>
            <input
              type="email"
              value={newCustomerEmail}
              onChange={(e) => setNewCustomerEmail(e.target.value)}
              style={inputStyle}
            />

            <label>Address</label>
            <textarea
              value={newCustomerAddress}
              onChange={(e) => setNewCustomerAddress(e.target.value)}
              style={inputStyle}
            />

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={() => setShowNewCustomer(false)}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  background: "#ccc",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateCustomer}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  background: "#5a4632",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.5rem",
  borderRadius: "6px",
  border: "1px solid #d2c4a8",
  background: "#fffdf8",
};

const thumbStyle: CSSProperties = {
  width: "100px",
  height: "100px",
  objectFit: "cover",
  borderRadius: "6px",
  border: "1px solid #d2c4a8",
};
