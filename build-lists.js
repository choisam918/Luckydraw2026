const fs = require('fs');
const path = __dirname;

function parseFile(file) {
  return fs
    .readFileSync(`${path}/${file}`, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\t/);
      if (parts.length >= 2) {
        const cls = parts[0].trim();
        const name = parts[1].replace(/\s+/g, '');
        return `${cls} ${name}`;
      }
      return line;
    });
}

const listA = parseFile('六年級1-3班名單.txt');
const listB = parseFile('六年級4-6班名單.txt');

const js = `const LIST_FILE_A = '六年級1-3班名單.txt';
const LIST_FILE_B = '六年級4-6班名單.txt';
const REQUIRED_COUNT_A = ${listA.length};
const REQUIRED_COUNT_B = ${listB.length};
const EMBEDDED_LIST_A = ${JSON.stringify(listA, null, 2)};
const EMBEDDED_LIST_B = ${JSON.stringify(listB, null, 2)};
`;

fs.writeFileSync(`${path}/lists-data.js`, js, 'utf8');
console.log(`Generated lists-data.js: A=${listA.length}, B=${listB.length}`);
