import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useJobs } from "../../hooks/useJobs";
import { useAccounting } from "../Accounting/AccountingContext";
import CustomerSelect from "../../components/CustomerSelect";
import type { Job } from "../../hooks/useJobs";
import { Wrench, UserPlus, FileText, ShieldCheck, AlertCircle } from "lucide-react";

export default function NewJob() {
  const navigate = useNavigate();
  const { addJob } = useJobs();
  const { addCustomer, customers, loading: accountingLoading } = useAccounting();

  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");

  const [clockMake, setClockMake] = useState("");
  const [clockModel, setClockModel] = useState("");
  const [clockSerial, setClockSerial] = useState("");
  const [clockAge, setClockAge] = useState("");

  const [conditionNotes, setConditionNotes] = useState("");
  const [serviceRequested, setServiceRequested] = useState("");
  const [assignedTechnician, setAssignedTechnician] = useState("");

  const [conditionPhotos, setConditionPhotos] = useState<File[]>([]);
  const [movementPhotos, setMovementPhotos] = useState<File[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const customerNameMap = useMemo(() => {
    return new Map<number, string>(customers.map(c => [c.id, c.name]));
  }, [customers]);

  const handleCreateCustomer = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) {
      alert("Please specify a valid customer profile name.");
      return;
    }

    try {
      const newCustomerPayload = {
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim() || undefined,
        email: newCustomerEmail.trim() || undefined,
        address: newCustomerAddress.trim() || undefined,
        accountId: 2
      };

      const customerId: number = await addCustomer(newCustomerPayload);
      
      setSelectedCustomerId(customerId);
      setShowNewCustomer(false);
      setNewCustomerName("");
      setNewCustomerPhone("");
      setNewCustomerEmail("");
      setNewCustomerAddress("");
    } catch (err) {
      console.error("Failed to commit fast client instantiation row:", err);
    }
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedCustomerId) {
      setFormError("Validation Exception: A workshop job ticket must be explicitly linked to a customer record.");
      return;
    }

    setIsSubmitting(true);

    try {
      const placeholderConditionUrls = conditionPhotos.map(file => URL.createObjectURL(file));
      const placeholderMovementUrls = movementPhotos.map(file => URL.createObjectURL(file));
      const matchedCustomerName = customerNameMap.get(selectedCustomerId) || "Walk-In Client";

      // Fixed: Mapped state variables to the specific interface keys (watch_make/watch_model)
      const comprehensiveJobTicket: any = {
        id: Date.now(),
        customerId: selectedCustomerId,
        customerName: matchedCustomerName,
        description: serviceRequested ? `Service Level Required: ${serviceRequested}. ${conditionNotes}`.trim() : conditionNotes,
        watch_make: clockMake.trim(),    // Changed from clockMake
        watch_model: clockModel.trim(),  // Changed from clockModel
        clockSerial: clockSerial.trim(),
        clockAge: clockAge.trim(),
        conditionNotes: conditionNotes.trim(),
        serviceRequested: serviceRequested,
        status: "In Progress",
        assignedTechnician: assignedTechnician || "Unassigned",
        technicianNotes: "",
        conditionPhotos: placeholderConditionUrls,
        movementPhotos: placeholderMovementUrls,
        partsUsed: [],
        timeSpent: [],
        createdAt: new Date().toISOString()
      };

      await addJob(comprehensiveJobTicket);
      navigate("/jobs");
    } catch (err) {
      console.error("Critical ticket save crash exception:", err);
      setFormError("Database failure: Could not record current repair tracking parameters.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-sans antialiased text-slate-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-sky-400" /> Intake New Repair Ticket
          </h1>
          <p className="text-xs text-slate-400 mt-1">Register incoming clocks, attach diagnostics, and allocate horologists.</p>
        </div>
      </div>

      {formError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSaveJob} className="space-y-6">
        {/* --- SECTION 1: CUSTOMER RECOGNITION --- */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> 1. Client Assignment Link
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Select Registered Customer Ledger</label>
              <CustomerSelect
                value={selectedCustomerId}
                onChange={(id: any) => setSelectedCustomerId(id ? Number(id) : null)}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowNewCustomer(!showNewCustomer)}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 hover:text-slate-100 transition duration-150 h-10"
            >
              <UserPlus className="w-4 h-4" />
              {showNewCustomer ? "Dismiss Fast Entry" : "Fast Register Client"}
            </button>
          </div>

          {showNewCustomer && (
            <div className="bg-slate-950 border border-dashed border-slate-800 rounded-xl p-4 mt-2 space-y-3">
              <div className="text-xs font-bold text-slate-300">📝 Fast Inscribe Customer Record</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="text" placeholder="Full Name" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200" />
                <input type="email" placeholder="Email" value={newCustomerEmail} onChange={e => setNewCustomerEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200" />
                <input type="text" placeholder="Phone" value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200" />
              </div>
              <input type="text" placeholder="Address" value={newCustomerAddress} onChange={e => setNewCustomerAddress(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200" />
              <div className="flex justify-end">
                <button type="button" onClick={handleCreateCustomer} disabled={accountingLoading} className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs rounded-lg">
                  ⚡ Instantly Bind Profile
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- SECTION 2: TIMEPIECE ATTRIBUTES --- */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Wrench className="w-3.5 h-3.5" /> 2. Timepiece Structural Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Manufacturer Make" value={clockMake} onChange={e => setClockMake(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs" />
            <input type="text" placeholder="Model Name" value={clockModel} onChange={e => setClockModel(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs" />
          </div>
        </div>

        {/* --- SECTION 3: DIAGNOSTICS & TEAMS --- */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" /> 3. Diagnostics
          </h2>
          <textarea placeholder="Condition notes..." value={conditionNotes} onChange={e => setConditionNotes(e.target.value)} rows={3} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs" />
        </div>

        {/* --- SECTION 4: ACTIONS --- */}
        <div className="flex justify-end pt-4 border-t border-slate-900">
          <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-sky-600 rounded-xl font-bold text-xs text-white">
            {isSubmitting ? "Saving Ticket..." : "⚡ Save Repair Intake Voucher"}
          </button>
        </div>
      </form>
    </div>
  );
}