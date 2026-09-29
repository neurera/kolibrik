const assert = require('node:assert');
const { computeDiscount } = require('../src/cart.js');
const cases = [
  ['TC-03 1 ks STUDENT', computeDiscount({1:1}, 'STUDENT'), 1.00],
  ['TC-05 neplatný kód', computeDiscount({2:1}, 'BLABLA'), 0],
  ['TC-07 2 ks STUDENT', computeDiscount({1:2}, 'STUDENT'), 2.00],
];
let fails = 0;
for (const [name, got, exp] of cases) {
  const ok = got === exp; if (!ok) fails++;
  console.log(`${ok ? '✓' : '✘'} ${name}  očakávané ${exp.toFixed(2)}  skutočné ${got.toFixed(2)}`);
}
process.exit(fails ? 1 : 0);
