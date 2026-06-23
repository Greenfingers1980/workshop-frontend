import { useMemo, useState, useEffect } from "react";
import "./Tools.css";

type Department = "Watch Studio" | "Clock Workshop";
type Condition = "Excellent" | "Good" | "Service Due" | "Out of Service";

interface ServiceEntry {
  id: number;
  date: string;
  note: string;
}

type ToolType = string;

interface Tool {
  id: number;
  name: string;
  idNumber: string;
  department: Department;
  condition: Condition;
  type: ToolType;
  location: string;
  cost: number;
  notes?: string;
  serviceHistory: ServiceEntry[];
}

const STORAGE_KEY = "workshop-tools";
const TYPE_KEY = "workshop-tool-types";
const ALL_DEPARTMENTS = "All";

export default function Tools() {
  // Load tools from localStorage
  const [tools, setTools] = useState<Tool[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Load tool types from localStorage
  const [toolTypes, setToolTypes] = useState<ToolType[]>(() => {
    const saved = localStorage.getItem(TYPE_KEY);
    return saved
      ? JSON.parse(saved)
      : ["Lathe", "Hand tool", "Milling machine", "Computer hardware"];
  });

  // Save tools to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
  }, [tools]);

  // Save tool types to localStorage
  useEffect(() => {
    localStorage.setItem(TYPE_KEY, JSON.stringify(toolTypes));
  }, [toolTypes]);

  const [activeDepartment, setActiveDepartment] =
    useState<typeof ALL_DEPARTMENTS | Department>(ALL_DEPARTMENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [conditionFilter, setConditionFilter] = useState<Condition | "All">("All");
  const [typeFilter, setTypeFilter] = useState<ToolType | "All">("All");

  const [editingTool, setEditingTool] = useState<Tool | null>(null);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formIdNumber, setFormIdNumber] = useState("");
  const [formDepartment, setFormDepartment] = useState<Department>("Watch Studio");
  const [formCondition, setFormCondition] = useState<Condition>("Good");
  const [formType, setFormType] = useState<ToolType>("Lathe");
  const [formLocation, setFormLocation] = useState("");
  const [formCost, setFormCost] = useState<string>("");
  const [formNotes, setFormNotes] = useState("");

  // Add tool type
  const [newToolType, setNewToolType] = useState("");

  // Service history inline form
  const [serviceNoteByTool, setServiceNoteByTool] = useState<Record<number, string>>({});
  const [serviceDateByTool, setServiceDateByTool] = useState<Record<number, string>>({});

  const resetForm = () => {
    setEditingTool(null);
    setFormName("");
    setFormIdNumber("");
    setFormDepartment("Watch Studio");
    setFormCondition("Good");
    setFormType(toolTypes[0] ?? "Lathe");
    setFormLocation("");
    setFormCost("");
    setFormNotes("");
  };

  const startEdit = (tool: Tool) => {
    setEditingTool(tool);
    setFormName(tool.name);
    setFormIdNumber(tool.idNumber);
    setFormDepartment(tool.department);
    setFormCondition(tool.condition);
    setFormType(tool.type);
    setFormLocation(tool.location);
    setFormCost(tool.cost.toString());
    setFormNotes(tool.notes ?? "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const parsedCost = parseFloat(formCost || "0") || 0;

    if (editingTool) {
      setTools(prev =>
        prev.map(t =>
          t.id === editingTool.id
            ? {
                ...t,
                name: formName.trim(),
                idNumber: formIdNumber.trim(),
                department: formDepartment,
                condition: formCondition,
                type: formType,
                location: formLocation.trim(),
                cost: parsedCost,
                notes: formNotes.trim() || undefined
              }
            : t
        )
      );
    } else {
      const newTool: Tool = {
        id: Date.now(),
        name: formName.trim(),
        idNumber: formIdNumber.trim(),
        department: formDepartment,
        condition: formCondition,
        type: formType,
        location: formLocation.trim(),
        cost: parsedCost,
        notes: formNotes.trim() || undefined,
        serviceHistory: []
      };
      setTools(prev => [...prev, newTool]);
    }

    resetForm();
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this tool?")) return;
    setTools(prev => prev.filter(t => t.id !== id));
  };

  const handleAddToolType = () => {
    const trimmed = newToolType.trim();
    if (!trimmed) return;
    if (!toolTypes.includes(trimmed)) {
      setToolTypes(prev => [...prev, trimmed]);
    }
    setNewToolType("");
  };

  const handleAddServiceEntry = (toolId: number) => {
    const note = (serviceNoteByTool[toolId] || "").trim();
    const date = (serviceDateByTool[toolId] || "").trim();
    if (!note && !date) return;

    const entry: ServiceEntry = {
      id: Date.now(),
      date: date || new Date().toISOString().slice(0, 10),
      note: note || "Service entry"
    };

    setTools(prev =>
      prev.map(t =>
        t.id === toolId ? { ...t, serviceHistory: [...t.serviceHistory, entry] } : t
      )
    );

    setServiceNoteByTool(prev => ({ ...prev, [toolId]: "" }));
    setServiceDateByTool(prev => ({ ...prev, [toolId]: "" }));
  };

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      if (activeDepartment !== ALL_DEPARTMENTS && tool.department !== activeDepartment)
        return false;
      if (conditionFilter !== "All" && tool.condition !== conditionFilter) return false;
      if (typeFilter !== "All" && tool.type !== typeFilter) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const haystack = [
          tool.name,
          tool.idNumber,
          tool.location,
          tool.type,
          tool.notes ?? ""
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }

      return true;
    });
  }, [tools, activeDepartment, conditionFilter, typeFilter, searchTerm]);

  const serviceReminders = tools.filter(
    t => t.condition === "Service Due" || t.condition === "Out of Service"
  );

  const getConditionClass = (condition: Condition) => {
    switch (condition) {
      case "Excellent":
        return "condition-badge excellent";
      case "Good":
        return "condition-badge good";
      case "Service Due":
        return "condition-badge service-due";
      case "Out of Service":
        return "condition-badge out-of-service";
    }
  };

  return (
    <div className="tools-container">
      <div className="parchment-card">
        <h1 className="tools-title">Tools</h1>
        <p className="tools-subtitle">
          Fully persistent workshop tool management with service history.
        </p>

        <hr className="divider" />

        {/* Department tabs */}
        <div className="tabs-row">
          <button
            className={`tab-button ${activeDepartment === ALL_DEPARTMENTS ? "active" : ""}`}
            onClick={() => setActiveDepartment(ALL_DEPARTMENTS)}
          >
            All
          </button>
          <button
            className={`tab-button ${activeDepartment === "Watch Studio" ? "active" : ""}`}
            onClick={() => setActiveDepartment("Watch Studio")}
          >
            Watch Studio
          </button>
          <button
            className={`tab-button ${activeDepartment === "Clock Workshop" ? "active" : ""}`}
            onClick={() => setActiveDepartment("Clock Workshop")}
          >
            Clock Workshop
          </button>
        </div>

        {/* Search & filters */}
        <div className="filters-row">
          <input
            type="text"
            placeholder="Search name, ID, location, type, notes…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={conditionFilter}
            onChange={e => setConditionFilter(e.target.value as Condition | "All")}
            className="select-input"
          >
            <option value="All">All conditions</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Service Due">Service Due</option>
            <option value="Out of Service">Out of Service</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as ToolType | "All")}
            className="select-input"
          >
            <option value="All">All types</option>
            {toolTypes.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Service reminders */}
        {serviceReminders.length > 0 && (
          <div className="reminders-panel">
            <h2 className="section-title">Service reminders</h2>
            <ul className="reminders-list">
              {serviceReminders.map(tool => (
                <li key={tool.id}>
                  <strong>{tool.name}</strong> — {tool.department} ({tool.condition})
                </li>
              ))}
            </ul>
          </div>
        )}

        <hr className="divider" />

        {/* Tools list */}
        <h2 className="section-title">Tools list</h2>
        <ul className="tools-list">
          {filteredTools.map(tool => (
            <li key={tool.id} className="tool-item">
              <div className="tool-main">
                <span className="tool-name">
                  {tool.name} <span className="tool-id">({tool.idNumber || "No ID"})</span>
                </span>
                <span className="tool-department">{tool.department}</span>
                <span className="tool-location">Location: {tool.location || "Unknown"}</span>
                <span className="tool-type">Type: {tool.type}</span>
                <span className="tool-cost">
                  Cost: {tool.cost ? `£${tool.cost.toFixed(2)}` : "Not set"}
                </span>
              </div>

              <div className="tool-meta">
                <span className={getConditionClass(tool.condition)}>{tool.condition}</span>
                {tool.notes && <span className="tool-notes">“{tool.notes}”</span>}

                <div className="service-history">
                  <div className="service-history-header">Service history:</div>
                  {tool.serviceHistory.length === 0 && (
                    <div className="service-history-empty">No entries yet.</div>
                  )}
                  {tool.serviceHistory.map(entry => (
                    <div key={entry.id} className="service-history-entry">
                      <span className="service-date">{entry.date}</span>
                      <span className="service-note">{entry.note}</span>
                    </div>
                  ))}

                  <div className="service-history-form">
                    <input
                      type="date"
                      value={serviceDateByTool[tool.id] || ""}
                      onChange={e =>
                        setServiceDateByTool(prev => ({
                          ...prev,
                          [tool.id]: e.target.value
                        }))
                      }
                    />
                    <input
                      type="text"
                      placeholder="Service note…"
                      value={serviceNoteByTool[tool.id] || ""}
                      onChange={e =>
                        setServiceNoteByTool(prev => ({
                          ...prev,
                          [tool.id]: e.target.value
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="small-button"
                      onClick={() => handleAddServiceEntry(tool.id)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="tool-actions">
                <button className="small-button" onClick={() => startEdit(tool)}>
                  Edit
                </button>
                <button className="small-button danger" onClick={() => handleDelete(tool.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}

          {filteredTools.length === 0 && (
            <li className="tool-empty">No tools match your filters.</li>
          )}
        </ul>

        <hr className="divider" />

        {/* Add / edit form */}
        <h2 className="section-title">{editingTool ? "Edit tool" : "Add tool"}</h2>

        <form className="tool-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Name
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                required
              />
            </label>

            <label>
              ID number
              <input
                type="text"
                value={formIdNumber}
                onChange={e => setFormIdNumber(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Department
              <select
                value={formDepartment}
                onChange={e => setFormDepartment(e.target.value as Department)}
              >
                <option value="Watch Studio">Watch Studio</option>
                <option value="Clock Workshop">Clock Workshop</option>
              </select>
            </label>

            <label>
              Condition
              <select
                value={formCondition}
                onChange={e => setFormCondition(e.target.value as Condition)}
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Service Due">Service Due</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </label>

            <label>
              Type
              <select
                value={formType}
                onChange={e => setFormType(e.target.value as ToolType)}
              >
                {toolTypes.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Location
              <input
                type="text"
                value={formLocation}
                onChange={e => setFormLocation(e.target.value)}
              />
            </label>

            <label>
              Cost (£)
              <input
                type="number"
                step="0.01"
                value={formCost}
                onChange={e => setFormCost(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label className="notes-label">
              Notes
              <textarea
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                rows={2}
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="ledger-button">
              {editingTool ? "Save changes" : "Add tool"}
            </button>
            {editingTool && (
              <button
                type="button"
                className="ledger-button secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <hr className="divider" />

        {/* Add new tool type */}
        <h2 className="section-title">Tool types</h2>
        <div className="tool-types-row">
          <div className="tool-types-list">
            {toolTypes.map(t => (
              <span key={t} className="tool-type-pill">
                {t}
              </span>
            ))}
          </div>
          <div className="tool-types-add">
            <input
              type="text"
              placeholder="New tool type…"
              value={newToolType}
              onChange={e => setNewToolType(e.target.value)}
            />
            <button type="button" className="small-button" onClick={handleAddToolType}>
              Add type
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
