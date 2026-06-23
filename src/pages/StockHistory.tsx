import { useEffect, useState } from "react";
import { getStock } from "../lib/stock";
import type { StockHistoryEntry, StockItem } from "../lib/stock";

export default function StockHistory() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [entries, setEntries] = useState<(StockHistoryEntry & { itemId: number; itemName: string })[]>([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [itemFilter, setItemFilter] = useState<number | "all">("all");

  useEffect(() => {
    const s = getStock();
    setStock(s);

    const allEntries: (StockHistoryEntry & { itemId: number; itemName: string })[] = [];

    s.forEach((item) => {
      if (!item.history) return; // ⭐ Prevent undefined errors

      item.history.forEach((h) =>
        allEntries.push({
          ...h,
          itemId: item.id,
          itemName: item.name
        })
      );
    });

    allEntries.sort((a, b) => (a.date < b.date ? 1 : -1));
    setEntries(allEntries);
  }, []);

  const filtered = entries.filter((e) => {
    const matchesSearch =
      e.itemName.toLowerCase().includes(search.toLowerCase()) ||
      (e.note || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.jobId && String(e.jobId).includes(search));

    const matchesAction =
      actionFilter === "all" || e.type === actionFilter;

    const matchesItem =
      itemFilter === "all" || e.itemId === itemFilter;

    return matchesSearch && matchesAction && matchesItem;
  });

  const actionLabels: Record<string, string> = {
    add: "Added",
    deduct: "Used",
    reverse: "Reversed",
    edit: "Edited"
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Stock History</h1>

      {/* FILTER BAR */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap"
        }}
      >
        <input
          type="text"
          placeholder="Search item, note, job ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 2,
            padding: "0.6rem",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          style={{
            flex: 1,
            padding: "0.6rem",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        >
          <option value="all">All Actions</option>
          <option value="add">Added</option>
          <option value="deduct">Used</option>
          <option value="reverse">Reversed</option>
          <option value="edit">Edited</option>
        </select>

        <select
          value={itemFilter}
          onChange={(e) =>
            setItemFilter(
              e.target.value === "all" ? "all" : Number(e.target.value)
            )
          }
          style={{
            flex: 1,
            padding: "0.6rem",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        >
          <option value="all">All Items</option>
          {stock.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {/* HISTORY TABLE */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "1rem"
        }}
      >
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Date</th>
            <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Item</th>
            <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Action</th>
            <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Qty</th>
            <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Job</th>
            <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Note</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((e, i) => (
            <tr key={i}>
              <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                {new Date(e.date).toLocaleString()}
              </td>
              <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                {e.itemName}
              </td>
              <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                {actionLabels[e.type] || e.type}
              </td>
              <td
                style={{
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  color: e.qty < 0 ? "red" : "green",
                  fontWeight: "bold"
                }}
              >
                {e.qty > 0 ? "+" : ""}
                {e.qty}
              </td>
              <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                {e.jobId ? `#${e.jobId}` : "-"}
              </td>
              <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                {e.note || "-"}
              </td>
            </tr>
          ))}

          {filtered.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: "1rem", textAlign: "center", color: "#777" }}>
                No history entries found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
