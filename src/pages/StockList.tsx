import { useEffect, useState } from "react";
import { getStock, getCategories, initStockSystem } from "../lib/stock";
import type { StockItem } from "../lib/stock";

export default function StockList() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [barcodeInput, setBarcodeInput] = useState("");

  // ---------------------------------------------
  // INITIALISE + LOAD STOCK
  // ---------------------------------------------
  useEffect(() => {
    initStockSystem();
    refresh();
  }, []);

  function refresh() {
    setStock(getStock());
    setCategories(getCategories());
  }

  // ---------------------------------------------
  // FILTERED STOCK LIST
  // ---------------------------------------------
  const filtered = stock.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      (item.barcode && item.barcode.includes(search));

    const matchesCategory =
      categoryFilter === "all" || item.categoryId === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // ---------------------------------------------
  // CATEGORY NAME LOOKUP
  // ---------------------------------------------
  function categoryName(id: number) {
    if (id === -1) return "Uncategorised";
    const cat = categories.find((c) => c.id === id);
    return cat ? cat.name : "Uncategorised";
  }

  // ---------------------------------------------
  // BARCODE SCAN HANDLER
  // ---------------------------------------------
  function handleBarcodeScan(e: any) {
    if (e.key === "Enter") {
      const code = barcodeInput.trim();
      const found = stock.find((i) => i.barcode === code);

      if (found) {
        alert(`Item found: ${found.name} (SKU: ${found.sku})`);
      } else {
        alert("No item with that barcode");
      }

      setBarcodeInput("");
    }
  }

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  return (
    <div style={{ padding: "1rem" }}>
      <h1>Stock</h1>

      {/* TOP BAR: SEARCH + CATEGORY */}
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
          placeholder="Search name, SKU, barcode..."
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
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(
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
          <option value="all">All Categories</option>
          {categories
            .filter((c) => !c.parent)
            .map((cat) => (
              <optgroup key={cat.id} label={cat.name}>
                {categories
                  .filter((c) => c.parent === cat.id)
                  .map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
              </optgroup>
            ))}
        </select>
      </div>

      {/* BARCODE SCAN INPUT */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Scan barcode..."
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          onKeyDown={handleBarcodeScan}
          style={{
            width: "250px",
            padding: "0.6rem",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />
      </div>

      {/* ADD STOCK BUTTON */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => alert("Open Add Stock modal (Section 3)")}
          style={{
            background: "#4a6fa5",
            color: "white",
            padding: "0.6rem 1rem",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer"
          }}
        >
          + Add Stock Item
        </button>
      </div>

      {/* STOCK TABLE */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "1rem"
        }}
      >
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
              Name
            </th>
            <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
              SKU
            </th>
            <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
              Category
            </th>
            <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
              Qty
            </th>
            <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
              Min
            </th>
            <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
              Cost (£)
            </th>
            <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((item) => {
            const low = item.quantity <= item.minStock;
            const out = item.quantity <= 0;

            return (
              <tr
                key={item.id}
                style={{
                  background: out
                    ? "#ffdddd"
                    : low
                    ? "#fff4d6"
                    : "transparent"
                }}
              >
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                  {item.name}
                </td>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                  {item.sku}
                </td>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                  {categoryName(item.categoryId ?? -1)}
                </td>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                  {item.quantity}
                </td>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                  {item.minStock}
                </td>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                  £{item.costPrice.toFixed(2)}
                </td>

                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                  <button
                    onClick={() => alert("Open Edit modal (Section 3)")}
                    style={{
                      marginRight: "0.3rem",
                      padding: "0.3rem 0.6rem",
                      borderRadius: "4px",
                      border: "none",
                      background: "#4a6fa5",
                      color: "white",
                      cursor: "pointer"
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => alert("Open Adjust modal (Section 4)")}
                    style={{
                      marginRight: "0.3rem",
                      padding: "0.3rem 0.6rem",
                      borderRadius: "4px",
                      border: "none",
                      background: "#8a6f3d",
                      color: "white",
                      cursor: "pointer"
                    }}
                  >
                    Adjust
                  </button>

                  <button
                    onClick={() => alert("Open History (Section 5)")}
                    style={{
                      padding: "0.3rem 0.6rem",
                      borderRadius: "4px",
                      border: "none",
                      background: "#555",
                      color: "white",
                      cursor: "pointer"
                    }}
                  >
                    History
                  </button>
                </td>
              </tr>
            );
          })}

          {filtered.length === 0 && (
            <tr>
              <td
                colSpan={7}
                style={{
                  padding: "1rem",
                  textAlign: "center",
                  color: "#777"
                }}
              >
                No stock items found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
