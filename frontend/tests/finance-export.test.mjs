import assert from "node:assert/strict";
import test from "node:test";
import { escapeSpreadsheetCell } from "../src/features/finance/utils/spreadsheet-sanitize.ts";

test("escapeSpreadsheetCell neutralizes leading formula trigger characters", () => {
  assert.equal(escapeSpreadsheetCell("=1+1"), "'=1+1");
  assert.equal(escapeSpreadsheetCell("+cmd|' /C calc'!A0"), "'+cmd|' /C calc'!A0");
  assert.equal(escapeSpreadsheetCell("-2+3"), "'-2+3");
  assert.equal(escapeSpreadsheetCell("@SUM(1,2)"), "'@SUM(1,2)");
  assert.equal(escapeSpreadsheetCell("\t=1+1"), "'\t=1+1");
  assert.equal(escapeSpreadsheetCell("\r=1+1"), "'\r=1+1");
  assert.equal(escapeSpreadsheetCell("  =1+1"), "'  =1+1");
  assert.equal(escapeSpreadsheetCell("Delano Kupang"), "Delano Kupang");
  assert.equal(escapeSpreadsheetCell("Toyota Avanza"), "Toyota Avanza");
});

