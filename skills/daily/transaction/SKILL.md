---
name: transaction
description: Build a reusable Google Sheets transaction tracker from zero, or preview and add expense, income, and transfer entries to an existing tracker. Use when the user wants a personal finance sheet, transaction entry, categories, duplicate protection, or a simple spending summary.
---

# Transaction

Use one of two modes: `setup` creates the tracker structure; `entry` previews and records transactions.

## Setup

Optional fast path: copy [transaction-tracker-template.xlsx](assets/transaction-tracker-template.xlsx). It contains no transaction history or account metadata and can be opened locally or imported into a spreadsheet service. Let the user choose and configure their own spreadsheet environment. Use the builder below when the user prefers to construct a Google Sheets workbook from zero.

Read [references/build-google-sheet.md](references/build-google-sheet.md). The bundled [Apps Script builder](assets/google-apps-script/Code.gs) creates or repairs these tabs without deleting compatible transaction rows:

- `Mobile Entry` for date, type, category, amount, note, and an Add Row checkbox;
- `All Transactions` for the append-only ledger;
- `Lists` for editable expense, income, and transfer categories;
- `Summary` for totals and expense-by-category reporting.

Show the user what the builder will create before asking them to run it. Creating a spreadsheet or running Apps Script is a write action and requires their approval.

## Entry

1. Parse one or more transactions. Support `Expense`, `Income`, and `Transfer`; default to `Expense` when omitted. Require category and nonzero amount. Treat note as optional.
2. Use the spreadsheet's timezone and locale. Accept `today`, `yesterday`, or `YYYY-MM-DD`, then show the resolved date explicitly.
3. Match categories against `Lists`; do not invent a category. For transfers, positive means deposit and negative means withdrawal.
4. Check `All Transactions` for an exact Date + Type + Category + Amount + Note duplicate.
5. Show every parsed transaction as Date, Type, Category, Amount, and Note. End the turn without writing until the user confirms the exact preview.
6. After confirmation, write only those entries through the visible `Mobile Entry` workflow or a connected Google Sheets tool. Verify each new ledger row independently.

An exact duplicate requires explicit duplicate approval; ordinary confirmation is insufficient. Never retry a failed write automatically. Report whether the entry form was left populated for review.

## Boundaries

- Keep spreadsheet IDs, account state, personal categories, balances, and reports outside Git.
- Do not add debt, shared-account, reminder, payment, or message behavior unless the user separately defines it.
- Stop on login, account mismatch, permission failure, changed sheet structure, or ambiguous date/amount.
- Never claim a transaction was added until the matching row is visible after refresh.
