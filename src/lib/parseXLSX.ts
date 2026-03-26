import ExcelJS from "exceljs";

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
    headers[colNumber - 1] = String(cell.value ?? "").trim();
  });

  const data: Record<string, string>[] = [];
  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const obj: Record<string, string> = {};
    let hasValue = false;
    headers.forEach((header, idx) => {
      const cell = row.getCell(idx + 1);
      const val = cell.value;
      const str = val != null ? String(val).trim() : "";
      if (str) hasValue = true;
      obj[header] = str;
    });
    if (hasValue) data.push(obj);
  }

  return { headers, data };
}
