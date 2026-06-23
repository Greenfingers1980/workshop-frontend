# Automatic Job-to-Ledger Posting Workflow

When a technician clicks **"Post to Ledger"** on a completed job, the system automatically creates a comprehensive double-entry accounting transaction.

## 📋 What Gets Posted Automatically

### 1. **Customer Invoice** (DEBIT)
- **Account**: Trade Debtors (Account 1100)
- **Amount**: Full sales price (including VAT)
- **Department**: Watch Studio
- **Link**: Customer ID from job
- **Purpose**: Records the amount owed by customer

### 2. **Labour Revenue** (CREDIT)
- **Account**: Sales Revenue (Account 4000)
- **Amount**: Labour cost portion (calculated from time spent × £25/hour)
- **Department**: Watch Studio
- **Link**: Job ID
- **Purpose**: Records labour income earned

### 3. **Parts Cost (COGS)** (DEBIT)
- **Account**: Cost of Goods Sold (Account 5100)
- **Amount**: Sum of all parts used (qty × cost price)
- **Department**: Watch Studio
- **Link**: Job ID
- **Purpose**: Records direct cost of materials sold

### 4. **Stock Reduction** (CREDIT)
- **Account**: Stock/Inventory Asset (Account 1200)
- **Amount**: Parts cost (mirrors COGS debit)
- **Department**: Watch Studio
- **Purpose**: Reduces inventory asset

### 5. **VAT Liability** (CREDIT)
- **Account**: VAT Payable (Account 2200)
- **Amount**: 20% of sales price
- **Department**: Admin
- **Purpose**: Records VAT owed to tax authority

### 6. **Technician Time** (DEBIT)
- **Account**: Labour/Wages Expense (Account 5050)
- **Amount**: Total minutes ÷ 60 × £25/hour
- **Department**: Watch Studio
- **Purpose**: Records labour cost expensed

### 7. **Labour Revenue Offset** (CREDIT)
- **Account**: Sales Revenue (Account 4000)
- **Amount**: Labour cost portion
- **Department**: Watch Studio
- **Link**: Job ID
- **Purpose**: Balances labour expense against labour revenue

---

## 📊 Journal Entry Example

**Job #1: Clock Repair**
- Parts used: 3 × £15 = £45
- Time spent: 120 minutes (2 hours) = £50 labour
- Sales price: £100 (gross including VAT)
- VAT (20%): £16.67
- Net sales: £83.33

### Generated Journal Entry

| Line | Account | Description | Debit | Credit | Department | Link |
|------|---------|-------------|-------|--------|------------|------|
| 1 | 1100 | Trade Debtors (Customer Invoice) | £100.00 | | Watch Studio | Cust#123 |
| 2 | 4000 | Sales Revenue (Labour) | | £50.00 | Watch Studio | Job#1 |
| 3 | 5100 | COGS (Parts) | £45.00 | | Watch Studio | Job#1 |
| 4 | 1200 | Stock Reduction | | £45.00 | Watch Studio | |
| 5 | 2200 | VAT Payable | | £16.67 | Admin | |
| 6 | 5050 | Labour Expense | £50.00 | | Watch Studio | |
| 7 | 4000 | Labour Revenue Offset | | £50.00 | Watch Studio | Job#1 |
| **TOTALS** | | | **£195.00** | **£195.00** | | |

---

## 🔄 Department Allocation

All entries are allocated to:
- **"Watch Studio"** - For parts, labour, and revenue (cost center tracking)
- **"Admin"** - For VAT (corporate allocation)

This allows filtering reports by department to analyze profitability per cost center.

---

## ✅ Automatic Validations

✓ Trial Balance updates immediately with all postings  
✓ Balance Sheet reflects asset/liability changes  
✓ Stock valuation updates  
✓ VAT liability tracks for tax returns  
✓ Customer invoice tracked in Sales Ledger  
✓ Labour costs allocated to correct expense account  
✓ Job marked as "posted" to prevent duplicate posting  

---

## 🧮 Accounting Equation Maintained

For every job posting:
```
Assets = Liabilities + Equity

Change in Trade Debtors (↑)
+ Change in Stock (↓)
= Change in VAT Payable (↑)
+ Change in Retained Earnings via Revenue/Expense (↑)
```

The system always maintains the fundamental accounting equation: **Debits = Credits**
