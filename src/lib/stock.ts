// ---------------------------------------------
// TYPES
// ---------------------------------------------
export type StockHistoryEntry = {
  id: number;
  qty: number;
  date: string;
  type: "add" | "deduct" | "reverse" | "edit";
  note?: string;
  jobId?: number;
};

export type StockItem = {
  id: number;
  name: string;
  sku: string;
  barcode?: string;
  categoryId?: number;
  quantity: number;
  minStock: number;
  costPrice: number;

  // Extended workshop fields
  supplier?: string;
  supplierContact?: string;
  location?: string;
  purchaseDate?: string;
  expiryDate?: string;
  notes?: string;

  history?: StockHistoryEntry[];
};

export type StockCategory = {
  id: number;
  name: string;
  parent?: number;
};

// ---------------------------------------------
// STORAGE HELPERS
// ---------------------------------------------
function load<T>(key: string, fallback: T): T {
  return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------------------------------------------
// INITIALISE SYSTEM
// ---------------------------------------------
export function initStockSystem() {
  if (!localStorage.getItem("stock")) save("stock", []);
  if (!localStorage.getItem("stock-categories")) save("stock-categories", []);
}

// ---------------------------------------------
// GETTERS
// ---------------------------------------------
export function getStock(): StockItem[] {
  return load("stock", []);
}

export function getCategories(): StockCategory[] {
  return load("stock-categories", []);
}

// ---------------------------------------------
// SAVE STOCK
// ---------------------------------------------
export function saveStock(items: StockItem[]) {
  save("stock", items);
}

// ---------------------------------------------
// ADD ITEM
// ---------------------------------------------
export function addStockItem(item: Omit<StockItem, "id">) {
  const stock = getStock();
  const newItem: StockItem = {
    ...item,
    id: Date.now()
  };
  stock.push(newItem);
  saveStock(stock);
}

// ---------------------------------------------
// UPDATE ITEM
// ---------------------------------------------
export function updateStockItem(updated: StockItem) {
  const stock = getStock().map((s) => (s.id === updated.id ? updated : s));
  saveStock(stock);
}

// ---------------------------------------------
// ADJUST STOCK
// ---------------------------------------------
export function adjustStock(id: number, qty: number, note?: string) {
  const stock = getStock();
  const item = stock.find((s) => s.id === id);
  if (!item) return;

  const before = item.quantity;
  const after = before + qty;

  item.quantity = after;

  item.history = item.history || [];
  item.history.push({
    id: Date.now(),
    qty,
    date: new Date().toISOString(),
    type: qty > 0 ? "add" : "deduct",
    note
  });

  saveStock(stock);
}

// ---------------------------------------------
// REVERSE DEDUCTION
// ---------------------------------------------
export function reverseDeduction(stockId: number, qty: number, jobId: number) {
  const stock = getStock();
  const item = stock.find((s) => s.id === stockId);
  if (!item) return;

  item.quantity += qty;

  item.history = item.history || [];
  item.history.push({
    id: Date.now(),
    qty,
    jobId,
    date: new Date().toISOString(),
    type: "reverse"
  });

  saveStock(stock);
}

// ---------------------------------------------
// SKU / BARCODE GENERATORS
// ---------------------------------------------
export function generateSKU(name: string): string {
  const base = name
    .replace(/[^A-Za-z0-9]/g, "")
    .substring(0, 4)
    .toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${rand}`;
}

export function generateBarcode(): string {
  // Simple 12-digit pseudo barcode
  return String(Date.now()).slice(-12);
}
