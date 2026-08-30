const TRACKER = Object.freeze({
  mobile: 'Mobile Entry',
  ledger: 'All Transactions',
  lists: 'Lists',
  summary: 'Summary',
  headers: ['Date', 'Type', 'Category', 'Amount', 'Note', 'Source', 'Check', 'Bill URL'],
  types: ['Expense', 'Income', 'Transfer'],
});

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Transaction Tracker')
    .addItem('Set up or repair tracker', 'setupTransactionTracker')
    .addToUi();
}

function setupTransactionTracker() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const mobile = getOrCreateSheet_(spreadsheet, TRACKER.mobile);
  const ledger = getOrCreateSheet_(spreadsheet, TRACKER.ledger);
  const lists = getOrCreateSheet_(spreadsheet, TRACKER.lists);
  const summary = getOrCreateSheet_(spreadsheet, TRACKER.summary);

  setupLists_(lists);
  setupMobile_(mobile, lists);
  setupLedger_(ledger);
  setupSummary_(summary);
  spreadsheet.setActiveSheet(mobile);
  spreadsheet.toast('Tracker is ready.', 'Transaction Tracker', 5);
}

function onEdit(event) {
  if (!event || !event.range) return;
  const sheet = event.range.getSheet();
  if (sheet.getName() !== TRACKER.mobile) return;

  if (event.range.getA1Notation() === 'B4') {
    applyCategoryValidation_(sheet, SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TRACKER.lists));
    return;
  }
  if (event.range.getA1Notation() === 'B13' && event.value === 'TRUE') {
    submitEntry_(SpreadsheetApp.getActiveSpreadsheet());
  }
}

function getOrCreateSheet_(spreadsheet, name) {
  return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
}

function setupLists_(sheet) {
  const headers = ['Expense Categories', 'Income Categories', 'Transfer Accounts'];
  sheet.getRange('A1:C1').setValues([headers]).setFontWeight('bold').setBackground('#f3f3f3');

  const defaults = [
    ['Food', 'Salary', 'Checking'],
    ['Transport', 'Gift', 'Savings'],
    ['Housing', 'Refund', 'Investment'],
    ['Health', 'Other', 'Cash'],
    ['Shopping', '', ''],
    ['Other', '', ''],
  ];
  const existing = sheet.getRange(2, 1, defaults.length, 3).getDisplayValues();
  if (existing.flat().every(value => value === '')) {
    sheet.getRange(2, 1, defaults.length, 3).setValues(defaults);
  }
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 3);
}

function setupMobile_(sheet, lists) {
  sheet.getRange('A1:B1').merge().setValue('Mobile Entry').setFontSize(16).setFontWeight('bold').setBackground('#f3f3f3');
  sheet.getRange('A3:A8').setValues([['Date'], ['Type'], ['Category'], ['Amount'], ['Note'], ['Bill URL']]).setFontWeight('bold');
  sheet.getRange('A13').setValue('Add Row').setFontWeight('bold');

  const dateCell = sheet.getRange('B3');
  if (dateCell.isBlank()) dateCell.setValue(new Date());
  dateCell.setNumberFormat('dd/mm/yyyy');

  const typeCell = sheet.getRange('B4');
  typeCell.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(TRACKER.types, true).setAllowInvalid(false).build());
  if (typeCell.isBlank()) typeCell.setValue('Expense');

  sheet.getRange('B6').setNumberFormat('#,##0.00;[Red](#,##0.00)').setDataValidation(
    SpreadsheetApp.newDataValidation().requireNumberNotEqualTo(0).setAllowInvalid(false).build()
  );
  sheet.getRange('B13').insertCheckboxes().setValue(false);
  applyCategoryValidation_(sheet, lists);
  sheet.setColumnWidth(1, 130);
  sheet.setColumnWidth(2, 260);
}

function setupLedger_(sheet) {
  const current = sheet.getRange(1, 1, 1, TRACKER.headers.length).getDisplayValues()[0];
  const hasHeader = current.some(value => value !== '');
  if (hasHeader && current.join('|') !== TRACKER.headers.join('|')) {
    throw new Error('All Transactions has an incompatible header; setup stopped without overwriting it.');
  }

  sheet.getRange(1, 1, 1, TRACKER.headers.length)
    .setValues([TRACKER.headers])
    .setFontWeight('bold')
    .setBackground('#f3f3f3')
    .setBorder(true, true, true, true, true, true);
  sheet.setFrozenRows(1);
  sheet.getRange('A2:A').setNumberFormat('dd/mm/yyyy');
  sheet.getRange('D2:D').setNumberFormat('#,##0.00;[Red](#,##0.00)');

  const range = sheet.getRange('A2:H');
  sheet.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$B2="Income"').setBackground('#d9ead3').setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$B2="Expense"').setBackground('#f4cccc').setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$B2="Transfer"').setBackground('#d9d2e9').setRanges([range]).build(),
  ]);
  sheet.autoResizeColumns(1, TRACKER.headers.length);
}

function setupSummary_(sheet) {
  sheet.getRange('A1:B1').setValues([['Type', 'Total']]).setFontWeight('bold').setBackground('#f3f3f3');
  sheet.getRange('A2:A4').setValues([['Income'], ['Expense'], ['Transfer']]);
  sheet.getRange('B2').setFormula("=SUMIF('All Transactions'!B:B,A2,'All Transactions'!D:D)");
  sheet.getRange('B2:B4').fillDown().setNumberFormat('#,##0.00;[Red](#,##0.00)');
  sheet.getRange('D1').setValue('Expense by category').setFontWeight('bold').setBackground('#f3f3f3');
  sheet.getRange('D2').setFormula("=QUERY('All Transactions'!B:D,\"select C,sum(D) where B='Expense' and C is not null group by C label C 'Category',sum(D) 'Total'\",1)");
  sheet.autoResizeColumns(1, 5);
}

function applyCategoryValidation_(mobile, lists) {
  const type = String(mobile.getRange('B4').getValue() || 'Expense');
  const column = {Expense: 1, Income: 2, Transfer: 3}[type];
  const lastRow = Math.max(lists.getLastRow(), 2);
  const source = lists.getRange(2, column || 1, lastRow - 1, 1);
  mobile.getRange('B5').clearContent().setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInRange(source, true).setAllowInvalid(false).build()
  );
}

function submitEntry_(spreadsheet) {
  const mobile = spreadsheet.getSheetByName(TRACKER.mobile);
  const ledger = spreadsheet.getSheetByName(TRACKER.ledger);
  const values = mobile.getRange('B3:B8').getValues().flat();
  const [dateValue, typeValue, categoryValue, amountValue, noteValue, billUrlValue] = values;
  const type = String(typeValue || '').trim();
  const category = String(categoryValue || '').trim();
  const amount = Number(amountValue);
  const note = String(noteValue || '').trim().replace(/\s+/g, ' ');
  const billUrl = String(billUrlValue || '').trim();

  if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) return rejectEntry_(spreadsheet, mobile, 'Enter a valid date.');
  if (!TRACKER.types.includes(type)) return rejectEntry_(spreadsheet, mobile, 'Choose a valid transaction type.');
  if (!category) return rejectEntry_(spreadsheet, mobile, 'Choose a category.');
  if (!Number.isFinite(amount) || amount === 0) return rejectEntry_(spreadsheet, mobile, 'Amount must be a nonzero number.');
  if (type !== 'Transfer' && amount < 0) return rejectEntry_(spreadsheet, mobile, 'Expense and Income amounts must be positive.');

  if (isDuplicate_(ledger, dateValue, type, category, amount, note)) {
    return rejectEntry_(spreadsheet, mobile, 'Exact duplicate rejected.');
  }

  ledger.appendRow([dateValue, type, category, amount, note, 'Mobile Entry', 'Added', billUrl]);
  const row = ledger.getLastRow();
  ledger.getRange(row, 1).setNumberFormat('dd/mm/yyyy');
  ledger.getRange(row, 4).setNumberFormat('#,##0.00;[Red](#,##0.00)');
  mobile.getRange('B5:B8').clearContent();
  mobile.getRange('B13').setValue(false);
  applyCategoryValidation_(mobile, spreadsheet.getSheetByName(TRACKER.lists));
  spreadsheet.toast('Transaction added and verified in the ledger.', 'Transaction Tracker', 5);
}

function isDuplicate_(ledger, dateValue, type, category, amount, note) {
  const lastRow = ledger.getLastRow();
  if (lastRow < 2) return false;
  const targetDay = dateValue.getFullYear() + '-' + dateValue.getMonth() + '-' + dateValue.getDate();
  return ledger.getRange(2, 1, lastRow - 1, 5).getValues().some(row => {
    const rowDate = row[0];
    const rowDay = rowDate instanceof Date ? rowDate.getFullYear() + '-' + rowDate.getMonth() + '-' + rowDate.getDate() : '';
    return rowDay === targetDay && String(row[1]) === type && String(row[2]) === category && Number(row[3]) === amount && String(row[4] || '').trim().replace(/\s+/g, ' ') === note;
  });
}

function rejectEntry_(spreadsheet, mobile, message) {
  mobile.getRange('B13').setValue(false);
  spreadsheet.toast(message, 'Transaction not added', 7);
}
