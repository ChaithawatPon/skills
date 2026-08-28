# Build the Google Sheet from zero

Use this branch when the user has no tracker yet or wants to understand the workbook design.

## Fast setup

1. Create a blank Google Sheet.
2. Open **Extensions → Apps Script**.
3. Replace the default editor contents with `assets/google-apps-script/Code.gs`.
4. Save, select `setupTransactionTracker`, and click **Run**.
5. Review the requested Google Sheets permission, return to the spreadsheet, and reload it.

The script adds a **Transaction Tracker** menu and creates four tabs. It preserves rows in a compatible `All Transactions` sheet. If that sheet has a different header, setup stops instead of overwriting it.

## Workbook contract

### Mobile Entry

| Cell | Field | Rule |
|---|---|---|
| `B3` | Date | Required date; initialized to today. |
| `B4` | Type | `Expense`, `Income`, or `Transfer`. |
| `B5` | Category | Dropdown switches with Type. |
| `B6` | Amount | Nonzero number. Expense/Income are positive; Transfer may be positive or negative. |
| `B7` | Note | Optional text. |
| `B12` | Add Row | Checkbox; submission trigger. |

### All Transactions

Columns are `Date`, `Type`, `Category`, `Amount`, `Note`, `Source`, and `Check`. The Apps Script appends one row, applies date/currency formats, rejects exact duplicates, and colors the row by Type.

### Lists

The three columns contain editable Expense Categories, Income Categories, and Transfer Accounts. Edit these values in the sheet; do not hardcode personal categories into the public skill.

### Summary

The first table totals each transaction type. The second groups expenses by category. Users can extend this tab with date filters, pivot tables, or charts after the core ledger is working.

## Manual reconstruction

If Apps Script is unavailable, create the four tabs and fields above manually. Add dropdown validation to Type and Category, a checkbox at `B12`, and conditional formatting on `All Transactions!A2:G` using custom formulas:

- `=$B2="Income"` → light green;
- `=$B2="Expense"` → light red;
- `=$B2="Transfer"` → light purple.

Without Apps Script, the checkbox cannot append safely by itself. Copy the confirmed input into the next empty ledger row, verify the row, then clear only the entry fields.

## Verification

1. Add a small synthetic expense such as `2026-01-01 / Expense / Food / 1 / setup test`.
2. Confirm exactly one matching row appears in `All Transactions`.
3. Try the same entry again and confirm the duplicate is rejected.
4. Change Type to `Transfer` and confirm the category dropdown switches to Transfer Accounts.
5. Delete the synthetic row after verification if the user approves that deletion.
