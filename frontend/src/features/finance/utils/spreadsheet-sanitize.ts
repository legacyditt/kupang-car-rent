const FORMULA_TRIGGER_REGEX = /^[\s]*[=+\-@\t\r]/;

/** Neutralizes spreadsheet formula injection by prefixing trigger strings with a single quote. */
export function escapeSpreadsheetCell(value: string): string {
  if (value.length > 0 && (FORMULA_TRIGGER_REGEX.test(value) || value[0] === "\t" || value[0] === "\r")) {
    return `'${value}`;
  }
  return value;
}

