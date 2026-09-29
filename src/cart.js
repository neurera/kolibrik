// Košík – biznis logika. Obsahuje jednu zámerne zasadenú chybu (pozri README, sekcia "Zasadená chyba").
const CATALOG = { 1: { name: 'Testovanie softvéru', price: 10.0 }, 2: { name: 'Playwright v praxi', price: 25.0 } };
const CODES = { STUDENT: 0.10, VIP: 0.20 };
const state = { lines: {}, code: null };

function computeDiscount(lines, code) {
  const rate = CODES[code] || 0;
  let discount = 0;
  for (const id in lines) {
    // BUG: zľava sa počíta z jednotkovej ceny, nie z ceny × množstvo
    discount += CATALOG[id].price * rate;
  }
  return Math.round(discount * 100) / 100;
}
function subtotal(lines) { let s = 0; for (const id in lines) s += CATALOG[id].price * lines[id]; return s; }
function fmt(n) { return n.toFixed(2).replace('.', ',') + ' €'; }

function render() {
  const tb = document.querySelector('#cart tbody'); tb.innerHTML = '';
  for (const id in state.lines) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${CATALOG[id].name}</td><td>${fmt(CATALOG[id].price)}</td><td><span data-testid="qty-${id}">${state.lines[id]}</span></td><td><button data-remove="${id}">✕</button></td>`;
    tb.appendChild(tr);
  }
  const sub = subtotal(state.lines), disc = computeDiscount(state.lines, state.code);
  document.getElementById('subtotal').textContent = fmt(sub);
  document.getElementById('discount').textContent = fmt(disc);
  document.getElementById('total').textContent = fmt(sub - disc);
}
if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-id]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.id; state.lines[id] = (state.lines[id] || 0) + 1; render(); }));
  document.getElementById('cart').addEventListener('click', e => { const id = e.target.dataset.remove; if (id) { delete state.lines[id]; render(); } });
  document.getElementById('apply').addEventListener('click', () => {
    const v = document.getElementById('code').value.trim().toUpperCase(); const m = document.getElementById('code-msg');
    if (CODES[v]) { state.code = v; m.textContent = `Kód ${v} použitý`; m.className = 'msg'; }
    else { state.code = null; m.textContent = 'Neplatný kód'; m.className = 'err'; }
    render();
  });
}
if (typeof module !== 'undefined') module.exports = { computeDiscount, subtotal, CATALOG };
