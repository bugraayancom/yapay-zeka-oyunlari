/* ===========================================================
   Zengin oyun kiti — paylaşılan yardımcılar + bileşenler
   window.AZK olarak dışa açılır; kategori modülleri bunu kullanır.
   =========================================================== */
(function () {
  "use strict";
  const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i);[a[i], a[j]] = [a[j], a[i]]; } return a; };
  const distinct = (n, lo, hi) => { const s = new Set(); while (s.size < n) s.add(ri(lo, hi)); return [...s]; };
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const range = (n) => [...Array(n).keys()];
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };

  /* --- tur yöneticisi --- */
  function runRounds(host, api, levels, build) {
    let r = 0, cur = null;
    const b1 = api.button("💡 İpucu / Çözüm", "", () => { if (cur && cur.hint) cur.hint(); });
    api.button("🔀 Yeni Oyun", "sec", () => api.newGame());
    const controls = b1.parentNode, baseBtns = controls.children.length;
    const dots = el("div", "dots"); host.appendChild(dots);
    const slot = el("div"); slot.style.width = "100%"; host.appendChild(slot);
    const drawDots = () => (dots.innerHTML = levels.map((_, i) => `<span class="dot ${i < r ? "on" : ""}">${i < r ? "★" : "☆"}</span>`).join(""));
    const lvlName = (i) => (i === 0 ? "kolay" : i === levels.length - 1 ? "zor" : "orta");
    function next() {
      while (controls.children.length > baseBtns) controls.lastChild.remove();
      drawDots(); slot.innerHTML = "";
      if (r >= levels.length) return;
      api.status(`Tur ${r + 1} / ${levels.length} — ${lvlName(r)}`, "info");
      cur = build(slot, levels[r], () => {
        r++; drawDots();
        if (r >= levels.length) api.win("🏆 Üç turu da geçtin — bu algoritmayı kaptın!");
        else { api.reward(10); api.status("✅ Doğru! Sıradaki tur...", "win"); setTimeout(next, 950); }
      });
    }
    next();
  }

  /* --- bileşenler --- */
  function cards(slot, vals, opts) {
    opts = opts || {}; const wrap = el("div", "ncards"); const cs = [];
    vals.forEach((v, i) => { const fx = opts.fixed && opts.fixed.includes(i); const c = el("div", "ncard" + (fx ? " fixed" : ""), String(v)); if (opts.onClick && !fx) c.onclick = () => opts.onClick(i); wrap.appendChild(c); cs.push(c); });
    slot.appendChild(wrap); return cs;
  }
  function bars(slot, vals, opts) {
    opts = opts || {}; const wrap = el("div", "bars"); const maxV = Math.max(...vals.map((v) => Math.abs(v)), 1);
    const cols = [], bs = [];
    vals.forEach((v, i) => {
      const col = el("div", "bcol"); const bar = el("div", "bar" + (v < 0 ? " neg" : ""));
      bar.style.height = Math.max(16, (Math.abs(v) / maxV) * 175) + "px"; bar.style.width = (opts.width || 44) + "px";
      bar.innerHTML = `<span class="cap">${opts.cap === false ? "" : v}</span>`;
      col.appendChild(bar); col.appendChild(el("div", "lab", opts.labels ? opts.labels[i] : "#" + (i + 1)));
      if (opts.onClick) col.onclick = () => opts.onClick(i);
      if (opts.onHover) { col.onmouseenter = () => opts.onHover(i); col.onmouseleave = () => opts.onHover(-1); }
      wrap.appendChild(col); cols.push(col); bs.push(bar);
    });
    slot.appendChild(wrap); return { cols, bars: bs, wrap };
  }
  const pill = (slot, txt) => { const p = el("div", "sumread", txt); slot.appendChild(p); return p; };
  function chips(slot, vals, opts) {
    opts = opts || {}; const wrap = el("div", "chips"); const cs = [];
    vals.forEach((v, i) => { const c = el("div", "chip2", String(v)); if (opts.onClick) c.onclick = () => opts.onClick(i); wrap.appendChild(c); cs.push(c); });
    slot.appendChild(wrap); return cs;
  }
  function chain(slot, vals, opts) {
    opts = opts || {}; const wrap = el("div", "chain"); const ns = [];
    vals.forEach((v, i) => {
      const n = el("div", "node", String(v)); if (opts.onClick) n.onclick = () => opts.onClick(i);
      wrap.appendChild(n); ns.push(n);
      if (i < vals.length - 1) wrap.appendChild(el("span", "arrow", "→"));
    });
    if (opts.tail) wrap.appendChild(el("span", "arrow", opts.tail));
    slot.appendChild(wrap); return ns;
  }
  function tokens(slot, arr, hl) {
    const v = el("div", "visual", arr.map((x, i) => `<span class="tok ${hl && hl.includes(i) ? "hl" : ""}">${x}</span>`).join(""));
    slot.appendChild(v); return v;
  }
  function btiles(slot, bits, opts) {
    opts = opts || {}; const wrap = el("div", "bin-tiles"); const ts = [];
    bits.forEach((b, i) => { const t = el("div", "btile" + (b ? " on" : ""), String(b)); if (opts.onClick) t.onclick = () => opts.onClick(i); wrap.appendChild(t); ts.push(t); });
    slot.appendChild(wrap); return ts;
  }

  /* --- ızgara --- */
  function grid(slot, Rn, Cn, opts) {
    opts = opts || {}; const g = el("div", "grid2"); g.style.display = "inline-grid"; g.style.gridTemplateColumns = `repeat(${Cn},1fr)`; g.style.margin = "0 auto";
    const cells = {};
    for (let r = 0; r < Rn; r++) for (let c = 0; c < Cn; c++) {
      const cell = el("div", "gcell " + (opts.cellClass ? opts.cellClass(r, c) : ""), opts.cellLabel ? opts.cellLabel(r, c) : "");
      cell.dataset.k = r + "," + c; cells[r + "," + c] = cell;
      if (opts.onClick) cell.onclick = () => opts.onClick(r, c, cell);
      g.appendChild(cell);
    }
    slot.appendChild(g); return cells;
  }

  /* --- ağaç (SVG) --- */
  const tch = (n, i) => [2 * i + 1, 2 * i + 2];
  const texists = (n, i) => i < n.length && n[i] != null;
  function preorder(n, i, o) { if (!texists(n, i)) return; o.push(i); preorder(n, 2 * i + 1, o); preorder(n, 2 * i + 2, o); }
  function inorder(n, i, o) { if (!texists(n, i)) return; inorder(n, 2 * i + 1, o); o.push(i); inorder(n, 2 * i + 2, o); }
  const levelorder = (n) => n.map((v, i) => i).filter((i) => n[i] != null);
  const tdepth = (n, i) => (!texists(n, i) ? 0 : 1 + Math.max(tdepth(n, 2 * i + 1), tdepth(n, 2 * i + 2)));
  const leaves = (n) => levelorder(n).filter((i) => !texists(n, 2 * i + 1) && !texists(n, 2 * i + 2));
  const tsum = (n) => n.filter((v) => v != null).reduce((a, b) => a + b, 0);
  const tcount = (n) => n.filter((v) => v != null).length;
  const lcaIdx = (a, b) => { while (a !== b) { if (a > b) a = (a - 1) >> 1; else b = (b - 1) >> 1; } return a; };
  function bst7() { const vals = distinct(7, 1, 30).sort((a, b) => a - b); const pos = [3, 1, 4, 0, 5, 2, 6]; const n = Array(7).fill(null); pos.forEach((p, k) => (n[p] = vals[k])); return { nodes: n, sorted: vals, pos }; }
  const fullTree = () => distinct(7, 1, 40);

  function treeSVG(slot, nodes, opts) {
    opts = opts || {}; const hl = opts.highlight || [];
    const present = nodes.map((v, i) => (v != null ? i : -1)).filter((i) => i >= 0);
    let maxD = 0; present.forEach((i) => (maxD = Math.max(maxD, Math.floor(Math.log2(i + 1)))));
    const W = 520, gap = 84, pad = 32, H = maxD * gap + pad * 2;
    const pos = (i) => { const d = Math.floor(Math.log2(i + 1)); const tot = 2 ** d; const p = i - (tot - 1); return { x: ((p + 0.5) / tot) * W, y: pad + d * gap }; };
    let s = `<svg class="tree-wrap" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="height:auto"><defs><linearGradient id="ng" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>`;
    present.forEach((i) => { [2 * i + 1, 2 * i + 2].forEach((c) => { if (texists(nodes, c)) { const a = pos(i), b = pos(c); s += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#cbd5e0" stroke-width="3"/>`; } }); });
    present.forEach((i) => { const p = pos(i); s += `<g class="tnode${hl.includes(i) ? " hl" : ""}" data-i="${i}"><circle cx="${p.x}" cy="${p.y}" r="22"/><text x="${p.x}" y="${p.y + 5}" text-anchor="middle">${nodes[i]}</text></g>`; });
    s += "</svg>";
    const svg = el("div", null, s).firstChild; const map = nodes.map(() => null);
    svg.querySelectorAll(".tnode").forEach((g) => { const i = +g.dataset.i; map[i] = g; if (opts.onClick) g.onclick = () => opts.onClick(i, g); });
    slot.appendChild(svg); return map;
  }

  /* --- override --- */
  function override(map) {
    Object.keys(map).forEach((id) => { const g = window.AZ && window.AZ.GAMES.find((x) => x.id === id); if (g) { const render = map[id]; g.setup = () => ({ kind: "custom", render }); } });
  }

  window.AZK = {
    ri, shuffle, distinct, sum, range, el, runRounds, cards, bars, pill, chips, chain, tokens, btiles, grid, treeSVG, override,
    preorder, inorder, levelorder, tdepth, leaves, tsum, tcount, lcaIdx, bst7, fullTree,
  };
})();
