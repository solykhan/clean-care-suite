import ExcelJS from "exceljs";

function cellToString(val: any): string {
  if (val == null) return "";

  // ExcelJS returns Date objects for date-formatted cells
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // RichText objects (e.g. { richText: [{text: "..."}] })
  if (typeof val === "object" && Array.isArray(val.richText)) {
    return val.richText.map((rt: any) => rt.text ?? "").join("").trim();
  }

  // Numbers: strip unnecessary decimals (1234.0 → "1234")
  if (typeof val === "number") {
    return Number.isInteger(val) ? String(val) : String(val);
  }

  return String(val).trim();
}

export async function parseXLSX(file: File): Promise<{ headers: string[]; data: Record<string, string>[] }> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet || sheet.rowCount === 0) {
    return { headers: [], data: [] };
  }

  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber - 1] = cellToString(cell.value);
  });

  const data: Record<string, string>[] = [];
  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const obj: Record<string, string> = {};
    let hasValue = false;
    headers.forEach((header, idx) => {
      const cell = row.getCell(idx + 1);
      const str = cellToString(cell.value);
      if (str) hasValue = true;
      obj[header] = str;
    });
    if (hasValue) data.push(obj);
  }

  return { headers, data };
}
