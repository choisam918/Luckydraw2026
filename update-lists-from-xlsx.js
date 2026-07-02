const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const XLSX_FILE = '2025 小六學生名單_畢業聚餐.xlsx';
const OUT_A = '六年級1-3班名單.txt';
const OUT_B = '六年級4-6班名單.txt';

function studentsFromClassSheet(rows, classLabel) {
  const out = [];
  for (const row of rows) {
    const num = row[0];
    const name = String(row[2] || '').trim();
    if (typeof num === 'number' && name) {
      out.push(`${classLabel}\t${name}`);
    }
  }
  return out;
}

function readFromClassSheets(wb) {
  const listA = [
    ...studentsFromClassSheet(XLSX.utils.sheet_to_json(wb.Sheets['六1'], { header: 1, defval: '' }), '六1班'),
    ...studentsFromClassSheet(XLSX.utils.sheet_to_json(wb.Sheets['六2'], { header: 1, defval: '' }), '六2班'),
    ...studentsFromClassSheet(XLSX.utils.sheet_to_json(wb.Sheets['六3'], { header: 1, defval: '' }), '六3班'),
  ];
  const listB = [
    ...studentsFromClassSheet(XLSX.utils.sheet_to_json(wb.Sheets['六4'], { header: 1, defval: '' }), '六4班'),
    ...studentsFromClassSheet(XLSX.utils.sheet_to_json(wb.Sheets['六5'], { header: 1, defval: '' }), '六5班'),
    ...studentsFromClassSheet(XLSX.utils.sheet_to_json(wb.Sheets['六6'], { header: 1, defval: '' }), '六6班'),
  ];
  return { listA, listB };
}

function readFromCombinedSheet(wb) {
  const sheetName = wb.SheetNames.find((n) => n.includes('工作表')) || wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: '' });
  const listA = [];
  const listB = [];
  for (const row of rows) {
    const c1 = String(row[0] || '').trim();
    const n1 = String(row[1] || '').trim();
    const c4 = String(row[3] || '').trim();
    const n4 = String(row[4] || '').trim();
    if (c1 && n1) listA.push(`${c1}\t${n1}`);
    if (c4 && n4) listB.push(`${c4}\t${n4}`);
  }
  return { listA, listB };
}

function main() {
  const xlsxPath = path.join(__dirname, XLSX_FILE);
  if (!fs.existsSync(xlsxPath)) {
    console.error(`找不到 ${XLSX_FILE}`);
    process.exit(1);
  }

  const wb = XLSX.readFile(xlsxPath);
  const fromClass = readFromClassSheets(wb);
  const fromCombined = readFromCombinedSheet(wb);

  const useClassSheets =
    fromClass.listA.length > 0 &&
    fromClass.listB.length > 0 &&
    (fromClass.listA.length !== fromCombined.listA.length ||
      fromClass.listB.length !== fromCombined.listB.length ||
      fromClass.listA.join('\n') !== fromCombined.listA.join('\n') ||
      fromClass.listB.join('\n') !== fromCombined.listB.join('\n'));

  const { listA, listB } = useClassSheets ? fromClass : fromCombined;
  const source = useClassSheets ? '各班工作表' : '合併工作表';

  if (!listA.length || !listB.length) {
    console.error('名單為空，請檢查 Excel 格式。');
    process.exit(1);
  }

  fs.writeFileSync(path.join(__dirname, OUT_A), `${listA.join('\n')}\n`, 'utf8');
  fs.writeFileSync(path.join(__dirname, OUT_B), `${listB.join('\n')}\n`, 'utf8');

  console.log(`已從 ${XLSX_FILE}（${source}）更新名單：`);
  console.log(`  ${OUT_A}: ${listA.length} 人`);
  console.log(`  ${OUT_B}: ${listB.length} 人`);
  console.log(`  合計: ${listA.length + listB.length} 人`);

  require('./build-lists.js');
}

main();
