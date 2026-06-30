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
// GETTERS (Note the 'export' keyword)
// ---------------------------------------------
export function getStock(): StockItem[] {
  return load("stock", []);
}

export function getCategories(): StockCategory[] {
  return load("stock-categories", []);
}

// ---------------------------------------------
// SAVE / MANIPULATE STOCK (Note the 'export' keyword)
// ---------------------------------------------
export function saveStock(items: StockItem[]) {
  save("stock", items);
}

export function addStockItem(item: Omit<StockItem, "id">) {
  const stock = getStock();
  const newItem: StockItem = {
    ...item,
    id: Date.now()
  };
  stock.push(newItem);
  saveStock(stock);
}

export function updateStockItem(updated: StockItem) {
  const stock = getStock().map((s) => (s.id === updated.id ? updated : s));
  saveStock(stock);
}

export function adjustStock(id: number, qty: number, note?: string) {
  const stock = getStock();
  const item = stock.find((s) => s.id === id);
  if (!item) return;
  item.quantity += qty;
  saveStock(stock);
}

// ---------------------------------------------
// SKU / BARCODE GENERATORS
// ---------------------------------------------
export function generateSKU(name: string): string {
  const base = name.replace(/[^A-Za-z0-9]/g, "").substring(0, 4).toUpperCase();
  return `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function generateBarcode(): string {
  return String(Date.now()).slice(-12);
}