/* Harita Oyunları — ızgara tabanlı BFS/DFS bulmacaları */
(function () {
  "use strict";
  const K = window.AZK; if (!K) return;
  const { ri, el, runRounds, grid, pill } = K;
  const D = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const R = {};

  function countIslands(g) { const Rn = g.length, Cn = g[0].length, sn = g.map((r) => r.map(() => 0)); let c = 0; const fl = (r, cc) => { if (r < 0 || cc < 0 || r >= Rn || cc >= Cn || sn[r][cc] || g[r][cc] !== 1) return; sn[r][cc] = 1; D.forEach(([a, b]) => fl(r + a, cc + b)); }; for (let r = 0; r < Rn; r++) for (let cc = 0; cc < Cn; cc++) if (g[r][cc] === 1 && !sn[r][cc]) { c++; fl(r, cc); } return c; }
  function islandMax(g) { const Rn = g.length, Cn = g[0].length, sn = g.map((r) => r.map(() => 0)); let m = 0; const sz = (r, cc) => { if (r < 0 || cc < 0 || r >= Rn || cc >= Cn || sn[r][cc] || g[r][cc] !== 1) return 0; sn[r][cc] = 1; return 1 + D.reduce((s, [a, b]) => s + sz(r + a, cc + b), 0); }; for (let r = 0; r < Rn; r++) for (let cc = 0; cc < Cn; cc++) if (g[r][cc] === 1 && !sn[r][cc]) m = Math.max(m, sz(r, cc)); return m; }
  function regions(g) { const Rn = g.length, Cn = g[0].length, sn = g.map((r) => r.map(() => 0)); let c = 0; const fl = (r, cc, v) => { if (r < 0 || cc < 0 || r >= Rn || cc >= Cn || sn[r][cc] || g[r][cc] !== v) return; sn[r][cc] = 1; D.forEach(([a, b]) => fl(r + a, cc + b, v)); }; for (let r = 0; r < Rn; r++) for (let cc = 0; cc < Cn; cc++) if (!sn[r][cc]) { c++; fl(r, cc, g[r][cc]); } return c; }
  function regionOf(g, sr, sc) { const Rn = g.length, Cn = g[0].length, v = g[sr][sc], out = new Set(), st = [[sr, sc]]; while (st.length) { const [r, cc] = st.pop(), k = r + "," + cc; if (r < 0 || cc < 0 || r >= Rn || cc >= Cn || out.has(k) || g[r][cc] !== v) continue; out.add(k); D.forEach(([a, b]) => st.push([r + a, cc + b])); } return out; }
  function bfs(g, s, t) { const Rn = g.length, Cn = g[0].length, q = [s], prev = {}, seen = new Set([s.join()]); while (q.length) { const [r, cc] = q.shift(); if (r === t[0] && cc === t[1]) break; for (const [a, b] of D) { const nr = r + a, nc = cc + b, k = nr + "," + nc; if (nr >= 0 && nc >= 0 && nr < Rn && nc < Cn && g[nr][nc] === 0 && !seen.has(k)) { seen.add(k); prev[k] = r + "," + cc; q.push([nr, nc]); } } } if (!seen.has(t.join())) return null; const path = []; let k = t.join(); while (k) { path.push(k); k = prev[k]; } return { dist: path.length - 1, path: path.reverse() }; }
  function maze(Rn, Cn) { let g, sol; do { g = Array.from({ length: Rn }, () => Array.from({ length: Cn }, () => (Math.random() < 0.28 ? 1 : 0))); g[0][0] = 0; g[Rn - 1][Cn - 1] = 0; sol = bfs(g, [0, 0], [Rn - 1, Cn - 1]); } while (!sol || sol.dist < Math.max(Rn, Cn)); return { g, sol }; }
  function rott(g) { const Rn = g.length, Cn = g[0].length, q = []; let fresh = 0; const s = g.map((r) => r.slice()); for (let r = 0; r < Rn; r++) for (let cc = 0; cc < Cn; cc++) { if (s[r][cc] === 2) q.push([r, cc, 0]); if (s[r][cc] === 1) fresh++; } let t = 0; while (q.length) { const [r, cc, dd] = q.shift(); for (const [a, b] of D) { const nr = r + a, nc = cc + b; if (nr >= 0 && nc >= 0 && nr < Rn && nc < Cn && s[nr][nc] === 1) { s[nr][nc] = 2; fresh--; t = Math.max(t, dd + 1); q.push([nr, nc, dd + 1]); } } } return fresh === 0 ? t : -1; }

  function numGrid(slot, Rn, Cn, cellClass, cellLabel, ans, prompt, hint, api, solved) {
    grid(slot, Rn, Cn, { cellClass, cellLabel });
    const info = pill(slot, prompt);
    const inp = el("input", "num-input"); inp.type = "number"; inp.placeholder = "?"; slot.appendChild(inp);
    let done = false; const check = () => { if (done || inp.value === "") return; if (+inp.value === ans) { done = true; info.innerHTML = "Doğru ✓"; info.classList.add("hit"); solved(); } else api.penalty(); };
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); }); api.button("✅ Kontrol Et", "go", check);
    return { hint: () => { inp.value = ans; info.innerHTML = hint; } };
  }
  function choiceGame(slot, vis, opts, ans, hint, api, solved) {
    if (vis) slot.appendChild(el("div", null, vis));
    let done = false; const ch = el("div", "choices"); ch.style.maxWidth = "360px";
    opts.forEach((t, idx) => { const c = el("div", "choice", t); c.onclick = () => { if (done) return; if (idx === ans) { done = true; c.classList.add("ok"); solved(); } else { c.classList.add("bad"); api.penalty(); } }; ch.appendChild(c); });
    slot.appendChild(ch);
    return { hint: () => api.status(hint, "info") };
  }

  R["graphs-1"] = (h, api) => { api.prompt("Denizdeki kara grupları = <b>adalar</b>. Kaç ada var? (komşu karaları boya — DFS)"); runRounds(h, api, [0, 1, 2], (s, l, d) => { let g; do { g = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => (Math.random() < 0.45 ? 1 : 0))); } while (countIslands(g) < 2 || countIslands(g) > 4); const a = countIslands(g); return numGrid(s, 4, 4, (r, c) => (g[r][c] ? "land" : "water"), () => "", a, "Kaç ada?", `İpucu: ${a} ada.`, api, d); }); };
  R["graphs-2"] = (h, api) => { api.prompt("<b>En büyük</b> ada kaç kara hücre? (bağlı bileşenin boyutu)"); runRounds(h, api, [0, 1, 2], (s, l, d) => { let g; do { g = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => (Math.random() < 0.5 ? 1 : 0))); } while (islandMax(g) < 3); const a = islandMax(g); return numGrid(s, 4, 4, (r, c) => (g[r][c] ? "land" : "water"), () => "", a, "En büyük ada?", `İpucu: ${a} hücre.`, api, d); }); };
  R["graphs-3"] = (h, api) => { api.prompt("🟢'dan 🟪'ya <b>en az kaç adımda</b> gidilir? (BFS — GPS mantığı, gri=duvar)"); runRounds(h, api, [0, 1, 2], (s, l, d) => { const { g, sol } = maze(4, 4); return numGrid(s, 4, 4, (r, c) => { if (r === 0 && c === 0) return "ok"; if (r === 3 && c === 3) return "sel"; return g[r][c] ? "wall" : ""; }, (r, c) => (r === 0 && c === 0 ? "🟢" : r === 3 && c === 3 ? "🟪" : ""), sol.dist, "En az adım?", `İpucu: ${sol.dist} adım.`, api, d); }); };
  R["graphs-4"] = (h, api) => { api.prompt("🤢 çürük her dakika komşu 🍊'ı çürütür. Kaç <b>dakikada</b> hepsi çürür? (çok kaynaklı BFS)"); runRounds(h, api, [0, 1, 2], (s, l, d) => { let g, m; do { g = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => (Math.random() < 0.55 ? 1 : 0))); g[ri(0, 2)][ri(0, 2)] = 2; m = rott(g); } while (m < 1); const emo = ["⬛", "🍊", "🤢"]; return numGrid(s, 3, 3, () => "", (r, c) => emo[g[r][c]], m, "Kaç dakika?", `İpucu: ${m} dakika.`, api, d); }); };
  R["graphs-5"] = (h, api) => {
    api.prompt("Boya kovası! Sarı hücreyle <b>aynı renkte ve bağlı</b> tüm hücreleri seç (Flood Fill).");
    runRounds(h, api, [0, 1, 2], (s, lvl, solved) => {
      const g = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => ri(0, 2))); const sr = ri(0, 3), sc = ri(0, 3); const reg = regionOf(g, sr, sc); const pal = ["water", "land", ""];
      const got = new Set(); let done = false; const start = sr + "," + sc;
      const cells = grid(s, 4, 4, { cellClass: (r, c) => (r === sr && c === sc ? "sel" : pal[g[r][c]]), onClick: (r, c, cell) => { if (done) return; const k = r + "," + c; if (k === start) return; if (got.has(k)) { got.delete(k); cell.className = "gcell " + pal[g[r][c]]; } else { got.add(k); cell.classList.add("sel"); } } });
      const info = pill(s, "Bağlı aynı renkleri seç, sonra Kontrol Et.");
      api.button("✅ Kontrol Et", "go", () => { if (done) return; const full = new Set(got); full.add(start); const ok = full.size === reg.size && [...reg].every((k) => full.has(k)); if (ok) { done = true; reg.forEach((k) => cells[k].classList.add("ok")); info.innerHTML = "Doğru bölge ✓"; info.classList.add("hit"); solved(); } else { api.penalty(); info.innerHTML = "Tam değil — sadece bağlı aynı renkler."; } });
      return { hint: () => { reg.forEach((k) => { if (k !== start) cells[k].classList.add("sel"); got.add(k); }); got.delete(start); info.innerHTML = "İpucu: bölge işaretlendi."; } };
    });
  };
  R["graphs-6"] = (h, api) => { api.prompt("Sarı karanın kaç <b>kara komşusu</b> var? (yukarı/aşağı/sağ/sol = düğüm derecesi)"); runRounds(h, api, [0, 1, 2], (s, l, d) => { const g = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => (Math.random() < 0.5 ? 1 : 0))); const sr = ri(0, 2), sc = ri(0, 2); g[sr][sc] = 1; let c = 0; for (const [a, b] of D) { const nr = sr + a, nc = sc + b; if (nr >= 0 && nc >= 0 && nr < 3 && nc < 3 && g[nr][nc] === 1) c++; } return numGrid(s, 3, 3, (r, cc) => (r === sr && cc === sc ? "sel" : g[r][cc] ? "land" : "water"), () => "", c, "Kaç kara komşu?", `İpucu: ${c} komşu.`, api, d); }); };
  R["graphs-7"] = (h, api) => { api.prompt("Aynı renkten oluşan kaç <b>ayrı bölge</b> var? (bağlı bileşenler)"); runRounds(h, api, [0, 1, 2], (s, l, d) => { let g; do { g = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => ri(0, 1))); } while (regions(g) < 3); const a = regions(g); const pal = ["water", "land"]; return numGrid(s, 3, 3, (r, c) => pal[g[r][c]], () => "", a, "Kaç bölge?", `İpucu: ${a} bölge.`, api, d); }); };
  R["graphs-8"] = (h, api) => {
    api.prompt("🟢'dan 🟪'ya <b>en kısa yolun</b> hücrelerine SIRAYLA tıkla (BFS izini takip et).");
    runRounds(h, api, [0, 1, 2], (s, lvl, solved) => {
      const { g, sol } = maze(4, 4); let step = 0, done = false;
      const info = pill(s, "Sırayla yolu çiz.");
      const cells = grid(s, 4, 4, { cellClass: (r, c) => { if (r === 0 && c === 0) return "ok"; if (r === 3 && c === 3) return "sel"; return g[r][c] ? "wall" : ""; }, cellLabel: (r, c) => (r === 0 && c === 0 ? "🟢" : r === 3 && c === 3 ? "🟪" : ""), onClick: (r, c, cell) => {
        if (done) return; const k = r + "," + c;
        if (k === sol.path[step]) { cell.style.outline = "3px solid #16a34a"; step++; if (step === sol.path.length) { done = true; info.innerHTML = "Yol doğru ✓"; info.classList.add("hit"); solved(); } }
        else if (g[r][c] !== 1) { cell.classList.add("bad"); api.penalty(); info.innerHTML = "Yol yanlış! Baştan."; setTimeout(() => { Object.values(cells).forEach((c2) => { c2.style.outline = ""; c2.classList.remove("bad"); }); step = 0; }, 500); }
      } });
      return { hint: () => { Object.values(cells).forEach((c2) => (c2.style.outline = "")); sol.path.forEach((k) => (cells[k].style.outline = "3px solid #16a34a")); info.innerHTML = `İpucu: ${sol.dist} adımlık yol.`; step = 0; } };
    });
  };
  R["graphs-9"] = (h, api) => { api.prompt("🟢'dan 🟪'ya gidilebiliyor mu, yoksa duvarlar mı kapatmış? (bağlantı)"); runRounds(h, api, [0, 1, 2], (s, l, d) => { const g = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => (Math.random() < 0.42 ? 1 : 0))); g[0][0] = 0; g[3][3] = 0; const ok = !!bfs(g, [0, 0], [3, 3]); const cells = grid(s, 4, 4, { cellClass: (r, c) => { if (r === 0 && c === 0) return "ok"; if (r === 3 && c === 3) return "sel"; return g[r][c] ? "wall" : ""; }, cellLabel: (r, c) => (r === 0 && c === 0 ? "🟢" : r === 3 && c === 3 ? "🟪" : "") }); return choiceGame(s, "", ["✅ Ulaşılabilir", "❌ Yol yok"], ok ? 0 : 1, ok ? "İpucu: yayılınca hedef boyanıyor → ulaşılır." : "İpucu: duvarlar yolu kesmiş.", api, d); }); };
  R["graphs-10"] = (h, api) => { api.prompt("'X→Y' = X'i Y'den önce almalısın. Tüm dersler bitirilebilir mi? (döngü tespiti)"); runRounds(h, api, [0, 1, 2], (s, l, d) => { const cyc = Math.random() < 0.5; const edges = cyc ? [["A", "B"], ["B", "C"], ["C", "A"]] : [["A", "B"], ["A", "C"], ["B", "D"]]; return choiceGame(s, `<div class="visual">${edges.map(([a, b]) => a + " → " + b).join(" , ")}</div>`, ["✅ Bitirilebilir", "❌ Kısır döngü var"], cyc ? 1 : 0, cyc ? "İpucu: bir ders dolaylı kendini bekliyor (döngü)." : "İpucu: döngü yok, sıralanabilir.", api, d); }); };
  R["graphs-11"] = (h, api) => { api.prompt("Çizgiyle bağlı olanlar rakip. Herkesi 2 takıma (rakipler ayrı) bölebilir misin? (iki renkli boyama)"); runRounds(h, api, [0, 1, 2], (s, l, d) => { const ok = Math.random() < 0.5; const edges = ok ? [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"]] : [["A", "B"], ["B", "C"], ["C", "A"]]; return choiceGame(s, `<div class="visual">${edges.map(([a, b]) => a + " — " + b).join(" , ")}</div>`, ["✅ Bölünebilir", "❌ Mümkün değil"], ok ? 0 : 1, ok ? "İpucu: çift uzunlukta halka → 2 renge boyanır." : "İpucu: tek uzunlukta halka var → boyanamaz.", api, d); }); };
  R["graphs-12"] = (h, api) => { api.prompt("Ortadaki bölgeye, komşularında <b>kullanılmayan</b> bir renk seç (harita boyama)."); runRounds(h, api, [0, 1, 2], (s, lvl, solved) => { const pal = ["🔴", "🟢", "🔵"]; const used = K.shuffle([0, 1, 2]).slice(0, 2); const free = [0, 1, 2].find((c) => !used.includes(c)); return choiceGame(s, `<div class="visual">Komşu renkler: ${used.map((i) => pal[i]).join(" ")}</div>`, pal, free, "İpucu: komşularda olmayan rengi seç.", api, solved); }); };

  K.override(R);
})();
