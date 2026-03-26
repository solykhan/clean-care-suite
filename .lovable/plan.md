
## Plan: Invoices Table — New Page with Entry, Import & Delete

### What we're building
A new **Invoices** page with:
- A database table `invoices` with 4 fields: `inv_id`, `entry_date`, `particulars`, `user_date`
- A full-page data table listing all invoice records
- An **Add Invoice** dialog form for manual entry
- A **Delete** button per row with confirmation
- A **CSV/XLSX import** dialog (matching the existing import pattern)
- Admin-only access; linked in the sidebar

---

### Fields
| Column | Type | Notes |
|---|---|---|
| `inv_id` | text | Invoice ID — user-entered |
| `entry_date` | date | Date record was entered |
| `particulars` | text | Description/details |
| `user_date` | date | User-specified date |

---

### Steps

**1. Database migration**
Create `invoices` table with the 4 fields plus standard `id` (uuid PK), `created_at`, `updated_at`. Add RLS policies — admin full access (CRUD), technicians no access.

**2. New page: `src/pages/Invoices.tsx`**
- Fetches all invoices via React Query
- Search/filter bar
- Data table: `invID | entry_date | particulars | user_date | Actions`
- Delete button per row with confirmation alert dialog
- "Add Invoice" button → opens entry dialog
- "Import" button → opens import dialog

**3. Add Invoice dialog: `src/components/AddInvoiceDialog.tsx`**
- Form fields: inv_id (text), entry_date (date picker), particulars (textarea), user_date (date picker)
- Submit inserts to `invoices` table, invalidates query, shows toast

**4. Import dialog: `src/components/InvoiceImportDialog.tsx`**
- CSV/XLSX upload → column mapping step (same pattern as CustomerImportDialog)
- Bulk insert into `invoices` table

**5. Route & Sidebar**
- Add `/invoices` route in `src/App.tsx` (AdminRoute)
- Add "Invoices" nav link in `src/components/AppSidebar.tsx` under admin navigation
