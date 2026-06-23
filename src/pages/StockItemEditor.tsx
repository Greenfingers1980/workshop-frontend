import { useEffect, useState } from "react";
import {
  getCategories,
  getStock,
  addStockItem,
  updateStockItem,
  generateSKU,
  generateBarcode
} from "../lib/stock";
import type { StockItem } from "../lib/stock";

type Props = {
  itemId?: number; // undefined = new item
  onClose: () => void;
};

export default function StockItemEditor({ itemId, onClose }: Props) {
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<Partial<StockItem>>({
    quantity: 0,
    minStock: 0,
    costPrice: 0
  });

  useEffect(() => {
    setCategories(getCategories());

    if (itemId) {
      const stock = getStock();
      const found = stock.find((s) => s.id === itemId);
      if (found) setForm(found);
    }
  }, [itemId]);

  function updateField<K extends keyof StockItem>(key: K, value: StockItem[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));
  }

  function handleGenerateSKU() {
    const name = form.name ?? "";
    if (!name.trim()) {
      alert("Enter a name first to generate SKU");
      return;
    }
    updateField("sku", generateSKU(name));
  }

  function handleGenerateBarcode() {
    updateField("barcode", generateBarcode());
  }

  function handleSave() {
    const name = form.name ?? "";
    const sku = form.sku ?? "";

    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    if (!sku.trim()) {
      alert("SKU is required");
      return;
    }

    const base: Omit<StockItem, "id"> = {
      name,
      sku,
      barcode: form.barcode ?? "",
      categoryId: form.categoryId,
      quantity: form.quantity ?? 0,
      minStock: form.minStock ?? 0,
      costPrice: form.costPrice ?? 0,
      supplier: form.supplier ?? "",
      supplierContact: form.supplierContact ?? "",
      location: form.location ?? "",
      purchaseDate: form.purchaseDate ?? "",
      expiryDate: form.expiryDate ?? "",
      notes: form.notes ?? "",
      history: form.history ?? []
    };

    if (itemId) {
      const updated: StockItem = {
        ...base,
        id: itemId
      };
      updateStockItem(updated);
      alert("Stock item updated");
    } else {
      addStockItem(base);
      alert("Stock item added");
    }

    onClose();
  }

  return (
    <div style={{ padding: "1rem", background: "white" }}>
      <h2>{itemId ? "Edit Stock Item" : "Add Stock Item"}</h2>

      {/* BASIC INFO */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Name
          <input
            type="text"
            value={form.name ?? ""}
            onChange={(e) => updateField("name", e.target.value)}
            style={{ width: "100%", padding: "0.4rem" }}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <label style={{ flex: 1 }}>
          SKU
          <input
            type="text"
            value={form.sku ?? ""}
            onChange={(e) => updateField("sku", e.target.value)}
            style={{ width: "100%", padding: "0.4rem" }}
          />
        </label>
        <button onClick={handleGenerateSKU}>Generate SKU</button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <label style={{ flex: 1 }}>
          Barcode
          <input
            type="text"
            value={form.barcode ?? ""}
            onChange={(e) => updateField("barcode", e.target.value)}
            style={{ width: "100%", padding: "0.4rem" }}
          />
        </label>
        <button onClick={handleGenerateBarcode}>Generate Barcode</button>
      </div>

      {/* CATEGORY */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Category
          <select
            value={form.categoryId ?? ""}
            onChange={(e) =>
              updateField(
                "categoryId",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            style={{ width: "100%", padding: "0.4rem" }}
          >
            <option value="">Uncategorised</option>
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
        </label>
      </div>

      {/* QUANTITY / MIN / COST */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <label style={{ flex: 1 }}>
          Quantity
          <input
            type="number"
            value={form.quantity ?? 0}
            onChange={(e) => updateField("quantity", Number(e.target.value))}
            style={{ width: "100%", padding: "0.4rem" }}
          />
        </label>

        <label style={{ flex: 1 }}>
          Min Stock
          <input
            type="number"
            value={form.minStock ?? 0}
            onChange={(e) => updateField("minStock", Number(e.target.value))}
            style={{ width: "100%", padding: "0.4rem" }}
          />
        </label>

        <label style={{ flex: 1 }}>
          Cost (£)
          <input
            type="number"
            step="0.01"
            value={form.costPrice ?? 0}
            onChange={(e) =>
              updateField("costPrice", Number(e.target.value))
            }
            style={{ width: "100%", padding: "0.4rem" }}
          />
        </label>
      </div>

      {/* SUPPLIER INFO */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Supplier
          <input
            type="text"
            value={form.supplier ?? ""}
            onChange={(e) => updateField("supplier", e.target.value)}
            style={{ width: "100%", padding: "0.4rem" }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Supplier Contact
          <input
            type="text"
            value={form.supplierContact ?? ""}
            onChange={(e) => updateField("supplierContact", e.target.value)}
            style={{ width: "100%", padding: "0.4rem" }}
          />
        </label>
      </div>

      {/* LOCATION */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Location
          <input
            type="text"
            value={form.location ?? ""}
            onChange={(e) => updateField("location", e.target.value)}
            style={{ width: "100%", padding: "0.4rem" }}
          />
        </label>
      </div>

      {/* DATES */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <label style={{ flex: 1 }}>
          Purchase Date
          <input
            type="date"
            value={form.purchaseDate ?? ""}
            onChange={(e) => updateField("purchaseDate", e.target.value)}
            style={{ width: "100%", padding: "0.4rem" }}
          />
        </label>

        <label style={{ flex: 1 }}>
          Expiry Date
          <input
            type="date"
            value={form.expiryDate ?? ""}
            onChange={(e) => updateField("expiryDate", e.target.value)}
            style={{ width: "100%", padding: "0.4rem" }}
          />
        </label>
      </div>

      {/* NOTES */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Notes
          <textarea
            value={form.notes ?? ""}
            onChange={(e) => updateField("notes", e.target.value)}
            style={{ width: "100%", padding: "0.4rem", minHeight: "80px" }}
          />
        </label>
      </div>

      {/* ACTIONS */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
        <button onClick={onClose}>Cancel</button>
        <button
          onClick={handleSave}
          style={{ background: "#4a6fa5", color: "white", padding: "0.4rem 0.8rem" }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
