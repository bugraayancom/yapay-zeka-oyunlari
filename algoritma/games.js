/* ===========================================================
   101 Algoritma Oyunu — oyun verisi + üreticiler
   Her oyun setup() ile rastgele ama çözülebilir bir bulmaca üretir.
   Arketipler: pick | order | grid | number | choice | tree
   =========================================================== */
(function () {
  "use strict";

  /* ---------- yardımcılar ---------- */
  const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i);[a[i], a[j]] = [a[j], a[i]]; } return a; };
  const distinct = (n, lo, hi) => { const s = new Set(); while (s.size < n) s.add(ri(lo, hi)); return [...s]; };
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const items = (arr) => arr.map((v) => ({ label: String(v), v }));
  const idxAsc = (arr) => arr.map((_, i) => i).sort((a, b) => arr[a] - arr[b]);
  const idxDesc = (arr) => arr.map((_, i) => i).sort((a, b) => arr[b] - arr[a]);

  // token görseli
  const T = (arr, hl) => '<div class="visual">' + arr.map((x, i) =>
    `<span class="tok ${hl && hl.includes(i) ? "hl" : ""}">${x}</span>`).join("") + "</div>";
  // ızgara görseli (salt görüntü)
  const G = (R, C, fn) => {
    let h = `<div class="grid2" style="display:inline-grid;grid-template-columns:repeat(${C},1fr)">`;
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const o = fn(r, c) || {};
      h += `<div class="gcell ${o.cls || ""}">${o.label != null ? o.label : ""}</div>`;
    }
    return h + "</div>";
  };

  /* ---------- ağaç yardımcıları ---------- */
  const ch = (i) => [2 * i + 1, 2 * i + 2];
  const exists = (n, i) => i < n.length && n[i] != null;
  function preorder(n, i, o) { if (!exists(n, i)) return; o.push(i); preorder(n, 2 * i + 1, o); preorder(n, 2 * i + 2, o); }
  function inorder(n, i, o) { if (!exists(n, i)) return; inorder(n, 2 * i + 1, o); o.push(i); inorder(n, 2 * i + 2, o); }
  const levelorder = (n) => n.map((v, i) => i).filter((i) => n[i] != null);
  const depth = (n, i) => (!exists(n, i) ? 0 : 1 + Math.max(depth(n, 2 * i + 1), depth(n, 2 * i + 2)));
  const nodeCount = (n) => n.filter((v) => v != null).length;
  const treeSum = (n) => n.filter((v) => v != null).reduce((a, b) => a + b, 0);
  const leafIdx = (n) => levelorder(n).filter((i) => !exists(n, 2 * i + 1) && !exists(n, 2 * i + 2));
  const lcaIdx = (a, b) => { while (a !== b) { if (a > b) a = (a - 1) >> 1; else b = (b - 1) >> 1; } return a; };
  const fullTree = () => distinct(7, 1, 40);            // 7 dolu düğüm
  function bst7() {                                     // geçerli BST
    const vals = distinct(7, 1, 30).sort((a, b) => a - b);
    const pos = [3, 1, 4, 0, 5, 2, 6]; const n = Array(7).fill(null);
    pos.forEach((p, k) => (n[p] = vals[k]));
    return { nodes: n, sorted: vals, pos };
  }

  /* ---------- ızgara/graf yardımcıları ---------- */
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function countIslands(g) {
    const R = g.length, C = g[0].length, seen = g.map((r) => r.map(() => false)); let cnt = 0;
    const fl = (r, c) => { if (r < 0 || c < 0 || r >= R || c >= C || seen[r][c] || g[r][c] !== 1) return; seen[r][c] = true; dirs.forEach(([dr, dc]) => fl(r + dr, c + dc)); };
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (g[r][c] === 1 && !seen[r][c]) { cnt++; fl(r, c); }
    return cnt;
  }
  function islandSizes(g) {
    const R = g.length, C = g[0].length, seen = g.map((r) => r.map(() => false)); let mx = 0;
    const sz = (r, c) => { if (r < 0 || c < 0 || r >= R || c >= C || seen[r][c] || g[r][c] !== 1) return 0; seen[r][c] = true; return 1 + dirs.reduce((s, [dr, dc]) => s + sz(r + dr, c + dc), 0); };
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (g[r][c] === 1 && !seen[r][c]) mx = Math.max(mx, sz(r, c));
    return mx;
  }
  function countRegions(g) {
    const R = g.length, C = g[0].length, seen = g.map((r) => r.map(() => false)); let cnt = 0;
    const fl = (r, c, val) => { if (r < 0 || c < 0 || r >= R || c >= C || seen[r][c] || g[r][c] !== val) return; seen[r][c] = true; dirs.forEach(([dr, dc]) => fl(r + dr, c + dc, val)); };
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (!seen[r][c]) { cnt++; fl(r, c, g[r][c]); }
    return cnt;
  }
  function region(g, sr, sc) {
    const R = g.length, C = g[0].length, val = g[sr][sc], out = new Set(), st = [[sr, sc]];
    while (st.length) { const [r, c] = st.pop(); const k = r + "," + c; if (r < 0 || c < 0 || r >= R || c >= C || out.has(k) || g[r][c] !== val) continue; out.add(k); dirs.forEach(([dr, dc]) => st.push([r + dr, c + dc])); }
    return out;
  }
  function bfsGrid(g, s, t) { // g: 1=duvar, 0=yol ; mesafe + yol
    const R = g.length, C = g[0].length, q = [s], prev = {}, seen = new Set([s.join(",")]);
    while (q.length) {
      const [r, c] = q.shift();
      if (r === t[0] && c === t[1]) break;
      for (const [dr, dc] of dirs) { const nr = r + dr, nc = c + dc, k = nr + "," + nc; if (nr >= 0 && nc >= 0 && nr < R && nc < C && g[nr][nc] === 0 && !seen.has(k)) { seen.add(k); prev[k] = r + "," + c; q.push([nr, nc]); } }
    }
    if (!seen.has(t.join(","))) return null;
    const path = []; let k = t.join(",");
    while (k) { path.push(k); k = prev[k]; }
    return { dist: path.length - 1, path: path.reverse() };
  }
  function makeMaze(R, C) {
    let g, sol;
    do { g = Array.from({ length: R }, () => Array.from({ length: C }, () => (Math.random() < 0.28 ? 1 : 0))); g[0][0] = 0; g[R - 1][C - 1] = 0; sol = bfsGrid(g, [0, 0], [R - 1, C - 1]); }
    while (!sol || sol.dist < Math.max(R, C));
    return { g, sol };
  }

  /* ---------- DP / hesap yardımcıları ---------- */
  const kadane = (a) => { let best = a[0], cur = a[0]; for (let i = 1; i < a.length; i++) { cur = Math.max(a[i], cur + a[i]); best = Math.max(best, cur); } return best; };
  const fib = (n) => { let a = 0, b = 1; for (let i = 0; i < n; i++)[a, b] = [b, a + b]; return a; };
  const climb = (n) => fib(n + 1);
  const rob = (a) => { let inc = 0, exc = 0; for (const x of a) { const ni = exc + x; exc = Math.max(inc, exc); inc = ni; } return Math.max(inc, exc); };
  function coinMin(co, amt) { const dp = Array(amt + 1).fill(Infinity); dp[0] = 0; for (let i = 1; i <= amt; i++) for (const c of co) if (c <= i) dp[i] = Math.min(dp[i], dp[i - c] + 1); return dp[amt]; }
  function coinWays(co, amt) { const dp = Array(amt + 1).fill(0); dp[0] = 1; for (const c of co) for (let i = c; i <= amt; i++) dp[i] += dp[i - c]; return dp[amt]; }
  function lis(a) { const d = a.map(() => 1); for (let i = 0; i < a.length; i++) for (let j = 0; j < i; j++) if (a[j] < a[i]) d[i] = Math.max(d[i], d[j] + 1); return Math.max(...d); }
  function knap(w, v, cap) { const dp = Array(cap + 1).fill(0); for (let i = 0; i < w.length; i++) for (let c = cap; c >= w[i]; c--) dp[c] = Math.max(dp[c], dp[c - w[i]] + v[i]); return dp[cap]; }
  const uniquePaths = (R, C) => { const dp = Array(C).fill(1); for (let r = 1; r < R; r++) for (let c = 1; c < C; c++) dp[c] += dp[c - 1]; return dp[C - 1]; };
  function minPath(g) { const R = g.length, C = g[0].length, dp = g.map((r) => r.slice()); for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { if (!r && !c) continue; const up = r ? dp[r - 1][c] : Infinity, le = c ? dp[r][c - 1] : Infinity; dp[r][c] += Math.min(up, le); } return dp[R - 1][C - 1]; }
  function edit(a, b) { const m = a.length, n = b.length, dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]); for (let j = 0; j <= n; j++) dp[0][j] = j; for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]); return dp[m][n]; }
  function lcs(a, b) { const m = a.length, n = b.length, dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0)); for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]); return dp[m][n]; }
  function subsetSum(a, t) { const dp = new Set([0]); for (const x of a) for (const s of [...dp]) dp.add(s + x); return dp.has(t); }
  function lps(s) { const n = s.length, dp = Array.from({ length: n }, () => Array(n).fill(0)); for (let i = n - 1; i >= 0; i--) { dp[i][i] = 1; for (let j = i + 1; j < n; j++) dp[i][j] = s[i] === s[j] ? dp[i + 1][j - 1] + 2 : Math.max(dp[i + 1][j], dp[i][j - 1]); } return dp[0][n - 1]; }
  function rodCut(p, n) { const dp = Array(n + 1).fill(0); for (let i = 1; i <= n; i++) for (let j = 1; j <= i; j++) dp[i] = Math.max(dp[i], p[j - 1] + dp[i - j]); return dp[n]; }
  function diceWays(d, f, target) { const dp = Array(target + 1).fill(0); dp[0] = 1; for (let i = 0; i < d; i++) { const nd = Array(target + 1).fill(0); for (let s = 0; s <= target; s++) if (dp[s]) for (let v = 1; v <= f; v++) if (s + v <= target) nd[s + v] += dp[s]; dp.splice(0, dp.length, ...nd); } return dp[target]; }
  function paintMin(c) { let a = c[0][0], b = c[0][1], cc = c[0][2]; for (let i = 1; i < c.length; i++) { const na = c[i][0] + Math.min(b, cc), nb = c[i][1] + Math.min(a, cc), nc = c[i][2] + Math.min(a, b); a = na; b = nb; cc = nc; } return Math.min(a, b, cc); }
  function maxProd(a) { let mx = a[0], mn = a[0], best = a[0]; for (let i = 1; i < a.length; i++) { const x = a[i]; if (x < 0)[mx, mn] = [mn, mx]; mx = Math.max(x, mx * x); mn = Math.min(x, mn * x); best = Math.max(best, mx); } return best; }
  const canPartition = (a) => { const s = sum(a); return s % 2 === 0 && subsetSum(a, s / 2); };
  function triMin(t) { const dp = t[t.length - 1].slice(); for (let r = t.length - 2; r >= 0; r--) for (let c = 0; c <= r; c++) dp[c] = t[r][c] + Math.min(dp[c], dp[c + 1]); return dp[0]; }

  const WORDS = ["KEDI", "ELMA", "OKUL", "KITAP", "BALIK", "GUNES", "DENIZ", "CICEK", "ARABA", "KALEM", "TOPRAK", "MARTI"];
  const word = () => WORDS[ri(0, WORDS.length - 1)];
  const isPalWord = (s) => s === s.split("").reverse().join("");

  /* ===========================================================
     KATEGORİLER
     =========================================================== */
  const CATEGORIES = [
    { key: "arrays", name: "Diziler", icon: "🎨", blurb: "Sayı dizileriyle düşünmeyi öğren" },
    { key: "matrix", name: "Matrisler", icon: "🔲", blurb: "Izgaralar ve tablolarla oyna" },
    { key: "strings", name: "Kelimeler", icon: "📝", blurb: "Harflerle ve metinlerle bulmacalar" },
    { key: "sorting", name: "Sıralama", icon: "🔢", blurb: "Sıralama algoritmalarını keşfet" },
    { key: "hashing", name: "Hashing", icon: "🗂️", blurb: "Hızlı arama ve sayma hileleri" },
    { key: "linked", name: "Bağlı Listeler", icon: "🔗", blurb: "Düğümleri zincir gibi bağla" },
    { key: "stack", name: "Yığın ve Kuyruk", icon: "📚", blurb: "Son giren ilk çıkar (ve tersi)" },
    { key: "heap", name: "Heap", icon: "⛰️", blurb: "En büyüğü/küçüğü hızlı bul" },
    { key: "trees", name: "Ağaç Oyunları", icon: "🌳", blurb: "Dallanan veri yapıları" },
    { key: "graphs", name: "Harita Oyunları", icon: "🗺️", blurb: "Yollar, bağlantılar ve aramalar" },
    { key: "dp", name: "Dynamic Programming", icon: "💎", blurb: "Küçük çözümlerden büyük sonuç" },
    { key: "bits", name: "Bit İşlemleri", icon: "💾", blurb: "Bilgisayarın 0 ve 1 dili" },
  ];

  /* ===========================================================
     OYUNLAR
     =========================================================== */
  const G_LIST = [];
  const add = (g) => G_LIST.push(g);

  /* ----------------- DİZİLER (9) ----------------- */
  add({ id: "arrays-1", cat: "arrays", title: "Çift Bulma", emoji: "🎯", diff: "easy",
    desc: "Toplamı hedefe eşit iki sayıyı bul.",
    ai: "Bu, Silikon Vadisi mülakatlarının en ünlü sorusu <b>Two Sum</b>! Hash tablosuyla tek geçişte (O(n)) çözülür.",
    setup() {
      const target = ri(8, 16); const a = ri(1, target - 1), b = target - a;
      let nums = [a, b]; while (nums.length < 6) nums.push(ri(1, 16));
      nums = shuffle(nums);
      return { kind: "pick", prompt: `Toplamı ${target} yapan İKİ sayıyı seç`, items: items(nums), multi: true, need: 2,
        check: (s, it) => s.length === 2 && it[s[0]].v + it[s[1]].v === target,
        solve: (it) => { for (let i = 0; i < it.length; i++) for (let j = i + 1; j < it.length; j++) if (it[i].v + it[j].v === target) return [i, j]; },
        explain: `Her sayı için "hedef - sayı" değerini bir notta (hash tablosu) ararsın.` };
    } });

  add({ id: "arrays-2", cat: "arrays", title: "En İyi Alış-Satış", emoji: "📈", diff: "medium",
    desc: "Önce ucuz al, sonra pahalı sat — en çok kârı yap.",
    ai: "Borsa sorusu <b>Best Time to Buy/Sell Stock</b>. En düşük fiyatı hatırlayarak tek geçişte çözülür.",
    setup() {
      let p, best, bi, bj, minI;
      do { p = Array.from({ length: 6 }, () => ri(2, 20)); best = 0; bi = 0; bj = 1; minI = 0; for (let j = 1; j < p.length; j++) { if (p[j] - p[minI] > best) { best = p[j] - p[minI]; bi = minI; bj = j; } if (p[j] < p[minI]) minI = j; } } while (best <= 0);
      return { kind: "pick", prompt: "ÖNCE alış gününe, SONRA satış gününe tıkla (en yüksek kâr)", items: items(p), multi: true, need: 2,
        check: (s, it) => s.length === 2 && s[1] > s[0] && it[s[1]].v - it[s[0]].v === best,
        solve: () => [bi, bj], explain: `En çok kâr = ${best}. Alış (gün ${bi + 1}) satıştan (gün ${bj + 1}) önce olmalı.` };
    } });

  add({ id: "arrays-3", cat: "arrays", title: "En Büyük Toplam", emoji: "🌟", diff: "medium",
    desc: "Arka arkaya gelen sayılardan en büyük toplamı bul.",
    ai: "Klasik <b>Maximum Subarray (Kadane)</b>. Negatife düşünce toplamı sıfırlamayı öğretir.",
    setup() {
      const a = Array.from({ length: 6 }, () => ri(-6, 8)); const ans = kadane(a);
      return { kind: "number", prompt: "Yan yana sayıların en büyük toplamı kaç?", visual: T(a), answer: ans,
        explain: `Kadane: topla, toplam negatife düşerse sıfırla, en büyüğü hatırla. Cevap: ${ans}.` };
    } });

  add({ id: "arrays-4", cat: "arrays", title: "En Büyük Çarpım", emoji: "✖️", diff: "easy",
    desc: "Çarpımı en büyük olan iki sayıyı seç.",
    ai: "Diziyi tarayıp en büyük iki değeri tutma fikri — mülakatta 'tek geçişte takip et' kalıbı.",
    setup() {
      const nums = shuffle(distinct(6, 2, 15)); const srt = idxDesc(nums.map((x) => x));
      const top = [...nums].sort((x, y) => y - x);
      return { kind: "pick", prompt: "Çarpımı EN BÜYÜK olan iki sayıyı seç", items: items(nums), multi: true, need: 2,
        check: (s, it) => s.length === 2 && it[s[0]].v * it[s[1]].v === top[0] * top[1],
        solve: (it) => { const arr = it.map((x, i) => [x.v, i]).sort((a, b) => b[0] - a[0]); return [arr[0][1], arr[1][1]]; },
        explain: `En büyük iki sayı en büyük çarpımı verir: ${top[0]}×${top[1]}.` };
    } });

  add({ id: "arrays-5", cat: "arrays", title: "Eksik Sayı", emoji: "🔍", diff: "easy",
    desc: "0'dan n'e kadar olan sayılardan hangisi kayıp?",
    ai: "<b>Missing Number</b>: toplam formülü ya da XOR ile O(n) çözülür.",
    setup() {
      const n = ri(5, 8); const miss = ri(1, n - 1);
      const arr = shuffle([...Array(n + 1).keys()].filter((x) => x !== miss));
      return { kind: "number", prompt: `0'dan ${n}'e kadar sayılardan hangisi eksik?`, visual: T(arr), answer: miss,
        explain: `0+1+...+${n} = ${n * (n + 1) / 2}. Var olanların toplamını çıkar → eksik: ${miss}.` };
    } });

  add({ id: "arrays-6", cat: "arrays", title: "Zirve Noktası", emoji: "⛰️", diff: "medium",
    desc: "Her iki komşusundan da büyük olan sayıyı bul.",
    ai: "<b>Find Peak Element</b>: ikili aramayla O(log n)'de bulunabilen sevilen bir soru.",
    setup() {
      const n = 6; let a; do { a = Array.from({ length: n }, () => ri(1, 20)); } while (!a.some((v, i) => (i === 0 || v > a[i - 1]) && (i === n - 1 || v > a[i + 1])));
      const peaks = a.map((v, i) => ((i === 0 || v > a[i - 1]) && (i === n - 1 || v > a[i + 1])) ? i : -1).filter((x) => x >= 0);
      return { kind: "pick", prompt: "Her iki komşusundan da BÜYÜK olan bir sayı seç", items: items(a), multi: false, need: 1,
        check: (s) => peaks.includes(s[0]), solve: () => [peaks[0]], explain: `Zirve, solundan ve sağından büyüktür.` };
    } });

  add({ id: "arrays-7", cat: "arrays", title: "Denge Noktası", emoji: "⚖️", diff: "medium",
    desc: "Solundaki toplam = sağındaki toplam olan noktayı bul.",
    ai: "<b>Pivot Index</b>: ön-toplamlar (prefix sum) tekniğinin güzel bir uygulaması.",
    setup() {
      let a, piv; do { a = Array.from({ length: 5 }, () => ri(1, 6)); piv = -1; for (let i = 0; i < a.length; i++) if (sum(a.slice(0, i)) === sum(a.slice(i + 1))) { piv = i; break; } } while (piv < 0);
      const all = a.map((_, i) => (sum(a.slice(0, i)) === sum(a.slice(i + 1)) ? i : -1)).filter((x) => x >= 0);
      return { kind: "pick", prompt: "Solundaki toplam = sağındaki toplam olan sayıyı seç", items: items(a), multi: false, need: 1,
        check: (s) => all.includes(s[0]), solve: () => [piv], explain: `Bu noktada sol ve sağ taraf dengededir.` };
    } });

  add({ id: "arrays-8", cat: "arrays", title: "Toplantı Çakışması", emoji: "📅", diff: "medium",
    desc: "İki toplantı zamanı çakışıyor mu?",
    ai: "<b>Meeting Rooms / Interval Overlap</b>: takvim ve rezervasyon sistemlerinin temeli.",
    setup() {
      const a1 = ri(1, 6), a2 = a1 + ri(1, 3); const overlap = Math.random() < 0.5;
      let b1, b2; if (overlap) { b1 = ri(a1, a2 - 1); b2 = b1 + ri(1, 3); } else { b1 = a2 + ri(1, 2); b2 = b1 + ri(1, 3); }
      const yes = a1 < b2 && b1 < a2;
      return { kind: "choice", prompt: `1. toplantı [${a1}-${a2}], 2. toplantı [${b1}-${b2}]. Çakışıyorlar mı?`,
        options: ["Evet, çakışıyor", "Hayır, çakışmıyor"], answer: yes ? 0 : 1,
        explain: `Çakışma kuralı: biri diğeri bitmeden başlıyorsa çakışırlar.` };
    } });

  add({ id: "arrays-9", cat: "arrays", title: "En Çok Su", emoji: "💧", diff: "hard",
    desc: "İki çubuk arasında en çok suyu hangi ikili tutar?",
    ai: "<b>Container With Most Water</b>: iki işaretçi (two pointers) tekniğinin sembolü.",
    setup() {
      const h = Array.from({ length: 6 }, () => ri(1, 8)); let best = 0, bi = 0, bj = 1;
      for (let i = 0; i < h.length; i++) for (let j = i + 1; j < h.length; j++) { const ar = (j - i) * Math.min(h[i], h[j]); if (ar > best) { best = ar; bi = i; bj = j; } }
      return { kind: "pick", prompt: "En çok suyu tutan İKİ çubuğu seç (genişlik × kısa olan)", items: items(h), multi: true, need: 2,
        check: (s) => { if (s.length !== 2) return false; const [i, j] = s; return Math.abs(j - i) * Math.min(h[i], h[j]) === best; },
        solve: () => [bi, bj], explain: `Su = aradaki mesafe × kısa çubuk. En büyüğü: ${best}.` };
    } });

  /* ----------------- MATRİSLER (3) ----------------- */
  add({ id: "matrix-1", cat: "matrix", title: "Spiral Okuma", emoji: "🌀", diff: "medium",
    desc: "Sayıları dıştan içe spiral sırayla tıkla.",
    ai: "<b>Spiral Matrix</b>: sınırları (üst/alt/sol/sağ) takip ederek dolaşma — robotik tarama mantığı.",
    setup() {
      const N = 3; const grid = []; let k = 1; for (let r = 0; r < N; r++) { grid.push([]); for (let c = 0; c < N; c++) grid[r].push(k++); }
      const order = []; let top = 0, bot = N - 1, left = 0, right = N - 1;
      while (top <= bot && left <= right) {
        for (let c = left; c <= right; c++) order.push(top + "," + c); top++;
        for (let r = top; r <= bot; r++) order.push(r + "," + right); right--;
        if (top <= bot) { for (let c = right; c >= left; c--) order.push(bot + "," + c); bot--; }
        if (left <= right) { for (let r = bot; r >= top; r--) order.push(r + "," + left); left--; }
      }
      return { kind: "grid", mode: "order", prompt: "Sol üstten başlayıp SPİRAL çizerek tüm sayılara tıkla", rows: N, cols: N,
        cellLabel: (r, c) => grid[r][c], correct: order, explain: "Dış çerçeveyi dolaş, içeri gir, tekrar dolaş." };
    } });

  add({ id: "matrix-2", cat: "matrix", title: "Kelime Arama", emoji: "🔍", diff: "medium",
    desc: "Gizli kelimenin harflerini sırayla tıkla.",
    ai: "<b>Word Search</b>: ızgarada DFS ile arama — bulmaca ve oyun motorlarının klasiği.",
    setup() {
      const N = 5; const pool = WORDS.filter((x) => x.length <= N); const w = pool[ri(0, pool.length - 1)];
      const grid = Array.from({ length: N }, () => Array.from({ length: N }, () => "ABCÇDEFGHIİJKLMNOPRSTUÜVYZ"[ri(0, 24)]));
      const horizontal = Math.random() < 0.5; const len = w.length;
      const order = [];
      if (horizontal) { const r = ri(0, N - 1), c0 = ri(0, N - len); for (let i = 0; i < len; i++) { grid[r][c0 + i] = w[i]; order.push(r + "," + (c0 + i)); } }
      else { const c = ri(0, N - 1), r0 = ri(0, N - len); for (let i = 0; i < len; i++) { grid[r0 + i][c] = w[i]; order.push((r0 + i) + "," + c); } }
      return { kind: "grid", mode: "order", prompt: `"${w}" kelimesinin harflerini SIRAYLA tıkla`, rows: N, cols: N,
        cellLabel: (r, c) => grid[r][c], correct: order, explain: `Kelime düz bir çizgide gizli. Harfleri sırayla takip et.` };
    } });

  add({ id: "matrix-3", cat: "matrix", title: "Köşegen Toplamı", emoji: "↘️", diff: "easy",
    desc: "Sol üstten sağ alta inen köşegendeki sayıları topla.",
    ai: "<b>Matrix Diagonal Sum</b>: i==j hücrelerini tek döngüde toplama — basit ama sevilen ısınma sorusu.",
    setup() {
      const N = 3; const grid = Array.from({ length: N }, () => Array.from({ length: N }, () => ri(1, 9)));
      let s = 0; for (let i = 0; i < N; i++) s += grid[i][i];
      return { kind: "number", prompt: "Köşegendeki (sol üst → sağ alt) sayıların toplamı?", visual: G(N, N, (r, c) => ({ label: grid[r][c], cls: r === c ? "sel" : "" })), answer: s,
        explain: `Sadece satır=sütun olan hücreleri topla. Toplam: ${s}.` };
    } });

  /* ----------------- KELİMELER (7) ----------------- */
  add({ id: "strings-1", cat: "strings", title: "Palindrom mu?", emoji: "🔁", diff: "easy",
    desc: "Kelime tersten de aynı okunuyor mu?",
    ai: "<b>Valid Palindrome</b>: iki uçtan ortaya doğru karşılaştırma (two pointers) sorusu.",
    setup() {
      const pal = ["KAYAK", "ELE", "ANA", "OTO", "RADAR", "SAMAS", "NEDEN"];
      const no = ["KEDI", "OKUL", "MASA", "KUTU"]; const yes = Math.random() < 0.5;
      const w = yes ? pal[ri(0, pal.length - 1)] : no[ri(0, no.length - 1)];
      const real = isPalWord(w);
      return { kind: "choice", prompt: `"${w}" tersten de aynı mı (palindrom)?`, options: ["Evet, palindrom", "Hayır, değil"], answer: real ? 0 : 1,
        explain: `Tersi: "${w.split("").reverse().join("")}". ${real ? "Aynı!" : "Farklı."}` };
    } });

  add({ id: "strings-2", cat: "strings", title: "Tekrarsız En Uzun", emoji: "🔤", diff: "medium",
    desc: "Harfleri tekrar etmeyen en uzun parça kaç harf?",
    ai: "<b>Longest Substring Without Repeating</b>: kayan pencere (sliding window) tekniğinin amiral gemisi.",
    setup() {
      const alpha = "ABCDE"; let s = ""; for (let i = 0; i < 7; i++) s += alpha[ri(0, 4)];
      let best = 0, l = 0; const last = {}; for (let r = 0; r < s.length; r++) { if (last[s[r]] >= l) l = last[s[r]] + 1; last[s[r]] = r; best = Math.max(best, r - l + 1); }
      return { kind: "number", prompt: "Harfleri tekrarsız en uzun parça kaç harf?", visual: T(s.split("")), answer: best,
        explain: `Pencereyi sağa kaydır, tekrar görünce soldan daralt. En uzun: ${best}.` };
    } });

  add({ id: "strings-3", cat: "strings", title: "Anagram mı?", emoji: "🔀", diff: "easy",
    desc: "İki kelime aynı harflerden mi oluşuyor?",
    ai: "<b>Valid Anagram</b>: harf sayımı (frequency count) ile O(n) — hashing'in giriş kapısı.",
    setup() {
      const base = word(); const anag = shuffle(base.split("")).join(""); const yes = Math.random() < 0.5;
      let other = anag; if (!yes) { const arr = base.split(""); arr[ri(0, arr.length - 1)] = "X"; other = shuffle(arr).join(""); }
      const real = base.split("").sort().join("") === other.split("").sort().join("");
      return { kind: "choice", prompt: `"${base}" ile "${other}" aynı harflerden mi oluşuyor (anagram)?`, options: ["Evet, anagram", "Hayır"], answer: real ? 0 : 1,
        explain: `Her harfin kaç kez geçtiğini say; ikisinde de aynıysa anagramdır.` };
    } });

  add({ id: "strings-4", cat: "strings", title: "En Çok Tekrar Eden Harf", emoji: "🏆", diff: "easy",
    desc: "Hangi harf en çok geçiyor?",
    ai: "<b>Most Frequent Character</b>: bir sayım sözlüğü (hash map) tutmanın en sade hali.",
    setup() {
      const alpha = "ABCD"; const arr = []; const star = alpha[ri(0, 3)]; for (let i = 0; i < 4; i++) arr.push(star); for (let i = 0; i < 4; i++) arr.push(alpha[ri(0, 3)]); const a = shuffle(arr);
      const cnt = {}; a.forEach((x) => (cnt[x] = (cnt[x] || 0) + 1)); const mx = Math.max(...Object.values(cnt));
      return { kind: "pick", prompt: "En çok tekrar eden harfi seç", items: items(a), multi: false, need: 1,
        check: (s) => cnt[a[s[0]]] === mx, solve: () => [a.findIndex((x) => cnt[x] === mx)], explain: `Her harfi say, en yükseği seç.` };
    } });

  add({ id: "strings-5", cat: "strings", title: "Ters Çevir", emoji: "↩️", diff: "easy",
    desc: "Harfleri sondan başa doğru sırayla tıkla.",
    ai: "<b>Reverse String</b>: iki uçtan takas — en temel iki-işaretçi alıştırması.",
    setup() {
      const w = word(); const order = w.split("").map((_, i) => w.length - 1 - i);
      return { kind: "order", prompt: `"${w}" kelimesini TERSTEN tıkla (sondan başa)`, items: items(w.split("")), correct: order,
        explain: `Son harften ilk harfe doğru ilerle.` };
    } });

  add({ id: "strings-6", cat: "strings", title: "Sesli Harf Say", emoji: "🅰️", diff: "easy",
    desc: "Kelimede kaç tane sesli harf var?",
    ai: "Tek geçişte koşula uyanı sayma — her mülakatın ısınma sorusu.",
    setup() {
      const w = word() + word().slice(0, 2); const ses = "AEIİOÖUÜ"; const n = w.split("").filter((c) => ses.includes(c)).length;
      return { kind: "number", prompt: "Kaç tane sesli harf var? (A E I İ O Ö U Ü)", visual: T(w.split("")), answer: n,
        explain: `Her harfe bak, sesliyse say. Toplam: ${n}.` };
    } });

  add({ id: "strings-7", cat: "strings", title: "Anagram Olmayan", emoji: "🧩", diff: "medium",
    desc: "Diğerlerinin karışığı OLMAYAN kelimeyi bul.",
    ai: "<b>Group Anagrams</b>: kelimeleri 'sıralı harf imzasına' göre gruplama fikri.",
    setup() {
      const base = word(); const sig = base.split("").sort().join("");
      const list = [base, shuffle(base.split("")).join(""), shuffle(base.split("")).join("")];
      const odd = word(); const oddFixed = odd === base ? "FARKLI" : odd; list.push(oddFixed);
      const arr = shuffle(list); const oddIdx = arr.findIndex((w) => w.split("").sort().join("") !== sig);
      return { kind: "pick", prompt: "Diğer üçünün harf karışığı OLMAYAN kelimeyi seç", items: arr.map((w) => ({ label: w, v: w })), multi: false, need: 1,
        check: (s) => arr[s[0]].split("").sort().join("") !== sig, solve: () => [oddIdx], explain: `Harflerini sırala; imzası farklı olan tek kelimeyi bul.` };
    } });

  /* ----------------- SIRALAMA (9) ----------------- */
  add({ id: "sorting-1", cat: "sorting", title: "Küçükten Büyüğe", emoji: "🫧", diff: "easy",
    desc: "Sayıları küçükten büyüğe doğru sırayla tıkla.",
    ai: "<b>Bubble Sort</b> sezgisi: en küçüğü öne taşı. Sıralama her algoritmanın temelidir.",
    setup() { const a = shuffle(distinct(6, 1, 30)); return { kind: "order", prompt: "Sayıları KÜÇÜKTEN BÜYÜĞE tıkla", items: items(a), correct: idxAsc(a), explain: "Her adımda kalanların en küçüğünü seç." }; } });

  add({ id: "sorting-2", cat: "sorting", title: "Büyükten Küçüğe", emoji: "🎯", diff: "easy",
    desc: "Sayıları büyükten küçüğe doğru sırayla tıkla.",
    ai: "<b>Selection Sort</b> sezgisi: her turda en büyüğü seç. Sıralama yönünü değiştirmek bir karşılaştırmadır.",
    setup() { const a = shuffle(distinct(6, 1, 30)); return { kind: "order", prompt: "Sayıları BÜYÜKTEN KÜÇÜĞE tıkla", items: items(a), correct: idxDesc(a), explain: "Her adımda kalanların en büyüğünü seç." }; } });

  add({ id: "sorting-3", cat: "sorting", title: "En Küçüğü Seç", emoji: "🔽", diff: "easy",
    desc: "Dizideki en küçük sayıyı bul.",
    ai: "<b>Selection Sort</b>'un tek adımı: minimumu bulmak. O(n) tarama.",
    setup() { const a = shuffle(distinct(6, 2, 40)); const mn = Math.min(...a); return { kind: "pick", prompt: "En KÜÇÜK sayıyı seç", items: items(a), multi: false, need: 1, check: (s) => a[s[0]] === mn, solve: () => [a.indexOf(mn)], explain: `Hepsini gez, en küçüğü hatırla: ${mn}.` }; } });

  add({ id: "sorting-4", cat: "sorting", title: "Doğru Yere Ekle", emoji: "📥", diff: "medium",
    desc: "Yeni sayı sıralı diziye nereye girmeli?",
    ai: "<b>Insertion Sort</b>'un kalbi: elemanı doğru yere kaydırarak yerleştirmek.",
    setup() {
      const arr = distinct(5, 1, 30).sort((x, y) => x - y); const x = ri(1, 31);
      let after = -1; for (let i = 0; i < arr.length; i++) if (arr[i] < x) after = i;
      const display = arr.map((v) => ({ label: v, v }));
      return { kind: "pick", prompt: `Sıralı dizi bu. ${x} sayısı HEMEN SONRASINA geleceği sayıyı seç (en başa gelecekse en küçüğü seç)`, items: display, multi: false, need: 1,
        check: (s) => s[0] === (after < 0 ? 0 : after), solve: () => [after < 0 ? 0 : after],
        explain: `${x}, kendinden küçük en büyük sayının hemen ardına yerleşir.` };
    } });

  add({ id: "sorting-5", cat: "sorting", title: "İki Listeyi Birleştir", emoji: "🔗", diff: "medium",
    desc: "İki sıralı listeden tek sıralı liste oluştur — sırayla tıkla.",
    ai: "<b>Merge</b> adımı: Merge Sort'un ve dış sıralamanın temel taşı.",
    setup() {
      const A = distinct(3, 1, 15).sort((x, y) => x - y), B = distinct(3, 1, 15).sort((x, y) => x - y);
      const all = A.concat(B); const labels = A.map((v) => "A:" + v).concat(B.map((v) => "B:" + v));
      const order = idxAsc(all);
      return { kind: "order", prompt: "İki listeyi birleştir: hepsini KÜÇÜKTEN BÜYÜĞE tıkla", items: labels.map((l, i) => ({ label: l, v: all[i] })), correct: order,
        explain: "İki listenin başına bak, küçük olanı al, ilerle." };
    } });

  add({ id: "sorting-6", cat: "sorting", title: "K'ıncı En Büyük", emoji: "🥉", diff: "medium",
    desc: "Baştan k'ıncı en büyük sayıyı bul.",
    ai: "<b>Kth Largest</b>: heap ya da quickselect ile çözülen çok popüler bir soru.",
    setup() { const a = shuffle(distinct(6, 1, 50)); const k = ri(2, 4); const srt = [...a].sort((x, y) => y - x); const target = srt[k - 1]; return { kind: "pick", prompt: `${k}. EN BÜYÜK sayıyı seç`, items: items(a), multi: false, need: 1, check: (s) => a[s[0]] === target, solve: () => [a.indexOf(target)], explain: `Büyükten küçüğe sırala, ${k}.'yı al: ${target}.` }; } });

  add({ id: "sorting-7", cat: "sorting", title: "Renk Sıralama", emoji: "🎨", diff: "medium",
    desc: "Topları sırayla diz: önce 🔴, sonra ⚪, sonra 🔵.",
    ai: "<b>Sort Colors (Dutch National Flag)</b>: üç gruplu tek geçiş sıralaması.",
    setup() {
      const map = ["🔴", "⚪", "🔵"]; const vals = []; for (let i = 0; i < 6; i++) vals.push(ri(0, 2)); const a = shuffle(vals);
      const order = a.map((_, i) => i).sort((x, y) => a[x] - a[y]);
      return { kind: "order", prompt: "Sırayla tıkla: önce tüm 🔴, sonra ⚪, sonra 🔵", items: a.map((v) => ({ label: map[v], v })), correct: order, explain: "Üç bölgeye ayır: kırmızılar, beyazlar, maviler." };
    } });

  add({ id: "sorting-8", cat: "sorting", title: "Medyan", emoji: "📊", diff: "medium",
    desc: "Sıraladığında tam ortada kalan sayıyı bul.",
    ai: "Medyan, istatistik ve sıralama-tabanlı seçim (selection) sorularının kalbidir.",
    setup() { const a = shuffle(distinct(5, 1, 40)); const srt = [...a].sort((x, y) => x - y); const med = srt[2]; return { kind: "pick", prompt: "Sıralandığında TAM ORTADA kalan sayıyı seç", items: items(a), multi: false, need: 1, check: (s) => a[s[0]] === med, solve: () => [a.indexOf(med)], explain: `Sırala, ortadakini al: ${med}.` }; } });

  add({ id: "sorting-9", cat: "sorting", title: "Pivottan Küçükler", emoji: "⚡", diff: "medium",
    desc: "Seçili pivottan KÜÇÜK olan tüm sayıları seç.",
    ai: "<b>Quick Sort</b>'un bölme (partition) adımı: pivota göre ikiye ayır.",
    setup() {
      const a = shuffle(distinct(6, 1, 30)); const pivIdx = ri(0, 5); const piv = a[pivIdx];
      const small = a.map((v, i) => (i !== pivIdx && v < piv ? i : -1)).filter((x) => x >= 0);
      return { kind: "pick", prompt: `Pivot = ${piv} (sarı). Ondan KÜÇÜK tüm sayıları seç`, items: items(a).map((it, i) => (i === pivIdx ? { ...it, fixed: "hl" } : it)), multi: true, need: small.length,
        check: (s) => s.length === small.length && s.every((i) => i !== pivIdx && a[i] < piv), solve: () => small, explain: `Pivottan küçükler sola, büyükler sağa gider.` };
    } });

  /* ----------------- HASHING (5) ----------------- */
  add({ id: "hashing-1", cat: "hashing", title: "Tamamlayıcıyı Bul", emoji: "🧩", diff: "easy",
    desc: "Sarı sayıyla toplanınca hedefi veren sayıyı bul.",
    ai: "Hash tablosunun süper gücü: 'aradığım sayı sette var mı?' sorusunu O(1)'de yanıtlar.",
    setup() {
      const target = ri(10, 18); const arr = distinct(6, 1, 9); const hi = ri(0, 5); const need = target - arr[hi];
      const compIdx = (hi + 1) % 6; arr[compIdx] = need;
      return { kind: "pick", prompt: `Hedef ${target}. Sarı sayıyla TOPLANINCA ${target} eden sayıyı seç`, items: items(arr).map((it, i) => (i === hi ? { ...it, fixed: "hl" } : it)), multi: false, need: 1,
        check: (s) => s[0] !== hi && arr[s[0]] + arr[hi] === target, solve: () => [compIdx], explain: `Tamamlayıcı = hedef − sarı sayı.` };
    } });

  add({ id: "hashing-2", cat: "hashing", title: "İlk Tekrar Eden", emoji: "🔂", diff: "easy",
    desc: "Soldan giderken ilk kez 'bunu görmüştüm' dediğin sayı.",
    ai: "<b>First Duplicate</b>: gördüklerini bir sete atıp tekrarı yakalama — hashing klasiği.",
    setup() {
      const base = distinct(4, 1, 9); const dup = base[ri(0, 3)]; const arr = shuffle(base.slice()); const pos = ri(2, arr.length); arr.splice(pos, 0, dup);
      const seen = new Set(); let firstDup = -1; for (let i = 0; i < arr.length; i++) { if (seen.has(arr[i])) { firstDup = i; break; } seen.add(arr[i]); }
      return { kind: "pick", prompt: "Soldan giderken İLK tekrar eden sayıya (ikinci görülüşüne) tıkla", items: items(arr), multi: false, need: 1,
        check: (s) => s[0] === firstDup, solve: () => [firstDup], explain: `Gördüğün her sayıyı bir sete at; sette olanı bulunca dur.` };
    } });

  add({ id: "hashing-3", cat: "hashing", title: "En Çok Tekrar", emoji: "🏆", diff: "easy",
    desc: "En sık geçen sayıyı bul.",
    ai: "<b>Majority / Mode</b>: sayım sözlüğü (hash map) tutmanın doğrudan uygulaması.",
    setup() {
      const star = ri(1, 5); const arr = [star, star, star]; for (let i = 0; i < 4; i++) arr.push(ri(1, 5)); const a = shuffle(arr);
      const cnt = {}; a.forEach((x) => (cnt[x] = (cnt[x] || 0) + 1)); const mx = Math.max(...Object.values(cnt));
      return { kind: "pick", prompt: "EN ÇOK tekrar eden sayıyı seç", items: items(a), multi: false, need: 1, check: (s) => cnt[a[s[0]]] === mx, solve: () => [a.findIndex((x) => cnt[x] === mx)], explain: `Her sayıyı say, en yükseği seç.` };
    } });

  add({ id: "hashing-4", cat: "hashing", title: "Eşi Olmayan", emoji: "1️⃣", diff: "medium",
    desc: "Herkesin bir çifti var, birinin yok. Onu bul.",
    ai: "<b>Single Number</b>: hash sayımıyla (veya XOR ile) tek kalanı bulma.",
    setup() {
      const pairs = distinct(2, 1, 9); const single = distinct(1, 10, 20)[0]; const arr = shuffle([...pairs, ...pairs, single]);
      const cnt = {}; arr.forEach((x) => (cnt[x] = (cnt[x] || 0) + 1)); const sIdx = arr.findIndex((x) => cnt[x] === 1);
      return { kind: "pick", prompt: "Çifti OLMAYAN tek sayıyı seç", items: items(arr), multi: false, need: 1, check: (s) => cnt[arr[s[0]]] === 1, solve: () => [sIdx], explain: `Her sayıyı say; sadece 1 kez geçen tek sayıdır.` };
    } });

  add({ id: "hashing-5", cat: "hashing", title: "Ortak Eleman", emoji: "🤝", diff: "medium",
    desc: "İki grupta da bulunan sayıları seç.",
    ai: "<b>Intersection of Arrays</b>: bir grubu sete atıp diğerini sorgulama.",
    setup() {
      const common = distinct(2, 1, 9); const A = shuffle([...common, ...distinct(2, 10, 15)]); const B = shuffle([...common, ...distinct(2, 16, 22)]);
      const setB = new Set(B); const labels = A.map((v) => "A:" + v).concat(B.map((v) => "B:" + v)); const vals = A.concat(B);
      const inter = new Set(common); const correct = vals.map((v, i) => (inter.has(v) ? i : -1)).filter((x) => x >= 0);
      return { kind: "pick", prompt: "Hem A hem B grubunda olan TÜM sayıları seç", items: labels.map((l, i) => ({ label: l, v: vals[i] })), multi: true, need: correct.length,
        check: (s) => s.length === correct.length && s.every((i) => inter.has(vals[i])), solve: () => correct, explain: `A'yı sete at, B'dekileri sorgula.` };
    } });

  /* ----------------- BAĞLI LİSTELER (8) ----------------- */
  add({ id: "linked-1", cat: "linked", title: "Listeyi Ters Çevir", emoji: "🔄", diff: "easy",
    desc: "Zinciri sondan başa doğru sırayla tıkla.",
    ai: "<b>Reverse Linked List</b>: işaretçi yönlerini çevirme — en çok sorulan liste sorusu.",
    setup() { const a = distinct(5, 1, 20); const order = a.map((_, i) => a.length - 1 - i); return { kind: "order", prompt: "Zinciri SONDAN BAŞA tıkla", items: items(a), correct: order, explain: "Her okun yönünü tersine çevir." }; } });

  add({ id: "linked-2", cat: "linked", title: "Orta Düğüm", emoji: "🎯", diff: "easy",
    desc: "Listenin tam ortasındaki düğümü bul.",
    ai: "<b>Middle of Linked List</b>: yavaş/hızlı işaretçi (tortoise & hare) tekniği.",
    setup() { const n = ri(5, 7); const a = distinct(n, 1, 20); const mid = Math.floor(n / 2); return { kind: "pick", prompt: "Listenin ORTASINDAKİ düğümü seç", items: items(a), multi: false, need: 1, check: (s) => s[0] === mid, solve: () => [mid], explain: "Biri 1, diğeri 2 adım gider; hızlı bitince yavaş ortadadır." }; } });

  add({ id: "linked-3", cat: "linked", title: "İki Listeyi Birleştir", emoji: "➕", diff: "medium",
    desc: "İki sıralı zinciri tek sıralı zincir yap.",
    ai: "<b>Merge Two Sorted Lists</b>: özyineleme veya işaretçi yürütmenin klasik sorusu.",
    setup() {
      const A = distinct(3, 1, 12).sort((x, y) => x - y), B = distinct(3, 1, 12).sort((x, y) => x - y); const all = A.concat(B);
      return { kind: "order", prompt: "İki sıralı listeyi birleştir: KÜÇÜKTEN BÜYÜĞE tıkla", items: A.map((v) => ({ label: "A:" + v, v })).concat(B.map((v) => ({ label: "B:" + v, v }))), correct: idxAsc(all), explain: "İki başı karşılaştır, küçüğü ekle." };
    } });

  add({ id: "linked-4", cat: "linked", title: "Sondan N'inci", emoji: "🔢", diff: "medium",
    desc: "Sondan sayınca n'inci olan düğümü bul.",
    ai: "<b>Nth Node From End</b>: iki işaretçi arasına n aralık koyma hilesi.",
    setup() { const len = ri(5, 7); const a = distinct(len, 1, 20); const n = ri(1, len); const idx = len - n; return { kind: "pick", prompt: `SONDAN ${n}. düğümü seç`, items: items(a), multi: false, need: 1, check: (s) => s[0] === idx, solve: () => [idx], explain: `Önde giden işaretçiyi ${n} adım ilerlet, sonra ikisini birlikte yürüt.` }; } });

  add({ id: "linked-5", cat: "linked", title: "Döngü Var mı?", emoji: "🔁", diff: "medium",
    desc: "Zincirin sonu başka bir düğüme geri dönüyor mu?",
    ai: "<b>Linked List Cycle (Floyd)</b>: yavaş/hızlı işaretçiler bir noktada çakışırsa döngü vardır.",
    setup() {
      const a = distinct(5, 1, 20); const hasCycle = Math.random() < 0.5; const back = ri(1, 3);
      const txt = a.join(" → ") + (hasCycle ? ` → (tekrar ${a[a.length - back]}'e döner)` : " → SON");
      return { kind: "choice", prompt: "Bu zincirde döngü (sonsuz tur) var mı?", visual: `<div class="visual">${txt}</div>`, options: ["Evet, döngü var", "Hayır, düz biter"], answer: hasCycle ? 0 : 1, explain: "Son düğüm öncekilerden birine işaret ediyorsa döngü oluşur." };
    } });

  add({ id: "linked-6", cat: "linked", title: "Liste Palindrom mu?", emoji: "🪞", diff: "medium",
    desc: "Zincir baştan ve sondan aynı mı?",
    ai: "<b>Palindrome Linked List</b>: ortayı bul, ikinci yarıyı ters çevir, karşılaştır.",
    setup() {
      const half = [ri(1, 5), ri(1, 5)]; const pal = Math.random() < 0.5; let a;
      if (pal) a = [...half, ri(1, 5), ...half.slice().reverse()]; else { a = [...half, ri(1, 5), ri(1, 5), ri(1, 5)]; }
      const real = a.join() === a.slice().reverse().join();
      return { kind: "choice", prompt: "Bu zincir baştan ve sondan aynı mı (palindrom)?", visual: T(a), options: ["Evet, palindrom", "Hayır"], answer: real ? 0 : 1, explain: `Tersi: ${a.slice().reverse().join(" ")}.` };
    } });

  add({ id: "linked-7", cat: "linked", title: "Tekrarları Sil", emoji: "🧹", diff: "medium",
    desc: "Sıralı listede tekrarlanan (silinecek) düğümleri seç.",
    ai: "<b>Remove Duplicates from Sorted List</b>: komşuları karşılaştırarak tekrarı atlama.",
    setup() {
      const base = distinct(4, 1, 9).sort((x, y) => x - y); const arr = []; base.forEach((v) => { arr.push(v); if (Math.random() < 0.5) arr.push(v); });
      const remove = []; for (let i = 1; i < arr.length; i++) if (arr[i] === arr[i - 1]) remove.push(i);
      if (!remove.length) { arr.splice(1, 0, arr[0]); remove.push(1); }
      return { kind: "pick", prompt: "Tekrar eden (silinecek) düğümleri seç — her sayıdan biri kalsın", items: items(arr), multi: true, need: remove.length,
        check: (s) => s.length === remove.length && s.every((i) => i > 0 && arr[i] === arr[i - 1]), solve: () => remove, explain: "Sıralı listede aynı değer arka arkaya gelir; ikincisini sil." };
    } });

  add({ id: "linked-8", cat: "linked", title: "İki Sayıyı Topla", emoji: "🧮", diff: "medium",
    desc: "Her liste bir sayının basamakları; ikisini topla.",
    ai: "<b>Add Two Numbers</b>: basamak basamak toplama ve elde (carry) taşıma sorusu.",
    setup() { const x = ri(20, 99), y = ri(20, 99); const ax = String(x).split(""), ay = String(y).split(""); return { kind: "number", prompt: `İki sayıyı topla`, visual: `<div class="visual">A: ${ax.map((d) => `<span class='tok'>${d}</span>`).join("")}<br>B: ${ay.map((d) => `<span class='tok'>${d}</span>`).join("")}</div>`, answer: x + y, explain: `${x} + ${y} = ${x + y}. Basamaklardan toplarken eldeyi unutma!` }; } });

  /* ----------------- YIĞIN VE KUYRUK (9) ----------------- */
  add({ id: "stack-1", cat: "stack", title: "Parantez Dengesi", emoji: "🔤", diff: "easy",
    desc: "Parantezler doğru kapanıyor mu?",
    ai: "<b>Valid Parentheses</b>: yığının (stack) ders kitabı örneği. Editör ve derleyiciler bunu kullanır.",
    setup() {
      const ok = Math.random() < 0.5; const seqs = ["()", "()()", "(())", "(()())", "((()))"]; const bad = ["(()", "())", ")(", "(()))", "(()("];
      const s = ok ? seqs[ri(0, seqs.length - 1)] : bad[ri(0, bad.length - 1)];
      let bal = 0, valid = true; for (const ch2 of s) { if (ch2 === "(") bal++; else bal--; if (bal < 0) valid = false; } if (bal !== 0) valid = false;
      return { kind: "choice", prompt: `"${s}" parantezleri doğru kapanıyor mu?`, options: ["Evet, dengeli", "Hayır, hatalı"], answer: valid ? 0 : 1, explain: "Açılışları yığına koy, kapanışta üstten eşleştir; sonda yığın boşsa dengelidir." };
    } });

  add({ id: "stack-2", cat: "stack", title: "Sonraki Büyük", emoji: "📈", diff: "medium",
    desc: "Sarı sayının sağında karşılaştığı ilk daha büyük sayı.",
    ai: "<b>Next Greater Element</b>: monoton yığın (monotonic stack) tekniğinin sembolü.",
    setup() {
      const a = Array.from({ length: 6 }, () => ri(1, 20)); let hi = ri(0, 3); let ng = -1; for (let i = hi + 1; i < a.length; i++) if (a[i] > a[hi]) { ng = i; break; }
      if (ng < 0) { a[hi + 1] = a[hi] + ri(1, 5); ng = hi + 1; }
      return { kind: "pick", prompt: "Sarı sayının SAĞINDAKİ ilk DAHA BÜYÜK sayıyı seç", items: items(a).map((it, i) => (i === hi ? { ...it, fixed: "hl" } : it)), multi: false, need: 1, check: (s) => s[0] === ng, solve: () => [ng], explain: "Sağa doğru git, ilk büyüğü bulunca dur." };
    } });

  add({ id: "stack-3", cat: "stack", title: "RPN Hesap Makinesi", emoji: "🧮", diff: "medium",
    desc: "Sondan eklemeli (postfix) ifadeyi hesapla.",
    ai: "<b>Evaluate Reverse Polish Notation</b>: hesap makineleri ve yorumlayıcılar yığınla çalışır.",
    setup() {
      const a = ri(2, 9), b = ri(2, 9), c = ri(2, 9); const op1 = ["+", "-", "*"][ri(0, 2)]; const op2 = ["+", "-", "*"][ri(0, 2)];
      const f = (x, y, o) => (o === "+" ? x + y : o === "-" ? x - y : x * y); const ans = f(f(a, b, op1), c, op2);
      return { kind: "number", prompt: `Postfix ifadeyi hesapla: önce ${a} ${b} ${op1}, sonra sonuç ${c} ${op2}`, visual: `<div class="visual"><span class='tok'>${a}</span><span class='tok'>${b}</span><span class='tok hl'>${op1}</span><span class='tok'>${c}</span><span class='tok hl'>${op2}</span></div>`, answer: ans, explain: `Sayıları yığına it, operatör görünce üstteki ikisini işle. Sonuç: ${ans}.` };
    } });

  add({ id: "stack-4", cat: "stack", title: "Yığın Çıkış Sırası", emoji: "📚", diff: "easy",
    desc: "Son giren ilk çıkar (LIFO) — çıkış sırasıyla tıkla.",
    ai: "Yığın (Stack) tanımı: <b>LIFO</b>. Geri-al (undo), tarayıcı geçmişi hep yığındır.",
    setup() { const a = distinct(5, 1, 20); const order = a.map((_, i) => a.length - 1 - i); return { kind: "order", prompt: "Bu sırayla yığına atıldılar. ÇIKIŞ sırasıyla tıkla (son giren ilk çıkar)", items: items(a), correct: order, explain: "Yığında en son konan en üsttedir, ilk o çıkar." }; } });

  add({ id: "stack-5", cat: "stack", title: "Kuyruk Çıkış Sırası", emoji: "🎟️", diff: "easy",
    desc: "İlk giren ilk çıkar (FIFO) — çıkış sırasıyla tıkla.",
    ai: "Kuyruk (Queue) tanımı: <b>FIFO</b>. Yazıcı sırası, market kasası hep kuyruktur.",
    setup() { const a = distinct(5, 1, 20); const order = a.map((_, i) => i); return { kind: "order", prompt: "Bu sırayla kuyruğa girdiler. ÇIKIŞ sırasıyla tıkla (ilk giren ilk çıkar)", items: items(a), correct: order, explain: "Kuyrukta ilk gelen ilk hizmet alır." }; } });

  add({ id: "stack-6", cat: "stack", title: "Min Yığın", emoji: "🔻", diff: "medium",
    desc: "Yığındaki en küçük elemanı bul.",
    ai: "<b>Min Stack</b>: her an minimumu O(1) verebilen veri yapısı tasarım sorusu.",
    setup() { const a = distinct(6, 1, 40); const mn = Math.min(...a); return { kind: "pick", prompt: "Yığındaki EN KÜÇÜK elemanı seç", items: items(a), multi: false, need: 1, check: (s) => a[s[0]] === mn, solve: () => [a.indexOf(mn)], explain: `Yan bir yığında o ana dek görülen min'i tutarsın: ${mn}.` }; } });

  add({ id: "stack-7", cat: "stack", title: "Sıcaklık Bekleyişi", emoji: "🌡️", diff: "medium",
    desc: "Sarı günden kaç gün sonra hava ısınır?",
    ai: "<b>Daily Temperatures</b>: monoton yığınla 'sonraki büyük' uzaklığını bulma.",
    setup() {
      const a = Array.from({ length: 6 }, () => ri(10, 30)); let hi = ri(0, 3); let wait = 0; for (let i = hi + 1; i < a.length; i++) { if (a[i] > a[hi]) { wait = i - hi; break; } }
      if (wait === 0) { a[hi + 1] = a[hi] + ri(1, 5); wait = 1; }
      return { kind: "number", prompt: "Sarı günden kaç GÜN sonra daha sıcak bir gün gelir?", visual: T(a, [hi]), answer: wait, explain: `Daha sıcak ilk günü bul, aradaki gün farkı: ${wait}.` };
    } });

  add({ id: "stack-8", cat: "stack", title: "Geçerli Çıkış mı?", emoji: "✅", diff: "hard",
    desc: "Verilen çıkış sırası bu yığınla mümkün mü?",
    ai: "<b>Validate Stack Sequences</b>: itme/çekme simülasyonu yapan akıllı bir soru.",
    setup() {
      const push = distinct(4, 1, 9); let pop;
      if (Math.random() < 0.5) { // geçerli: simüle et
        pop = []; const st = []; let i = 0; const order = shuffle(push.slice());
        // basit geçerli üretim: rastgele it/çek
        const seq = []; let pi = 0; while (pi < push.length || st.length) { if (pi < push.length && (st.length === 0 || Math.random() < 0.5)) { st.push(push[pi++]); } else { seq.push(st.pop()); } } pop = seq;
      } else { pop = shuffle(push.slice()); }
      // doğrula
      const st = []; let pi = 0, ok = true; for (const x of pop) { while ((st.length === 0 || st[st.length - 1] !== x) && pi < push.length) st.push(push[pi++]); if (st[st.length - 1] === x) st.pop(); else { ok = false; break; } }
      return { kind: "choice", prompt: `Yığına şu sırayla [${push.join(", ")}] itiliyor. Çıkış sırası [${pop.join(", ")}] mümkün mü?`, options: ["Evet, mümkün", "Hayır, imkânsız"], answer: ok ? 0 : 1, explain: "İtme/çekme simülasyonu yap; her çıkışta üstteki eşleşmeli." };
    } });

  add({ id: "stack-9", cat: "stack", title: "Tarayıcı Geri Tuşu", emoji: "↩️", diff: "easy",
    desc: "Birkaç sayfa gezip 'geri'ye basınca hangi sayfadasın?",
    ai: "Tarayıcı geçmişi iki yığınla (geri/ileri) tutulur — gerçek bir yığın uygulaması.",
    setup() {
      const pages = ["🏠", "📰", "🎵", "🎮", "📚"].slice(0, ri(4, 5)); const back = ri(1, pages.length - 1); const cur = pages.length - 1 - back;
      return { kind: "pick", prompt: `Sırayla bu sayfaları açtın, sonra ${back} kez GERİ'ye bastın. Şu an hangisindesin?`, items: pages.map((p, i) => ({ label: p, v: i })), multi: false, need: 1, check: (s) => s[0] === cur, solve: () => [cur], explain: `Açılan sayfalar yığına eklenir; her geri bir çıkıştır.` };
    } });

  /* ----------------- HEAP (4) ----------------- */
  add({ id: "heap-1", cat: "heap", title: "En Büyük 3", emoji: "🔝", diff: "medium",
    desc: "En büyük üç sayıyı seç.",
    ai: "<b>Top K Elements</b>: boyutu K olan bir heap ile devasa veride bile O(n log k).",
    setup() { const a = shuffle(distinct(7, 1, 60)); const top = [...a].sort((x, y) => y - x).slice(0, 3); const set = new Set(top); const correct = a.map((v, i) => (set.has(v) ? i : -1)).filter((x) => x >= 0); return { kind: "pick", prompt: "EN BÜYÜK 3 sayıyı seç", items: items(a), multi: true, need: 3, check: (s) => s.length === 3 && s.every((i) => set.has(a[i])), solve: () => correct, explain: `Küçük bir 'en büyük 3' heap'i tutarsın.` }; } });

  add({ id: "heap-2", cat: "heap", title: "En Küçük 3", emoji: "🔽", diff: "medium",
    desc: "En küçük üç sayıyı seç.",
    ai: "Min-heap ile en küçük K'yı çekmek — öncelik kuyruklarının (priority queue) işi.",
    setup() { const a = shuffle(distinct(7, 1, 60)); const bot = [...a].sort((x, y) => x - y).slice(0, 3); const set = new Set(bot); const correct = a.map((v, i) => (set.has(v) ? i : -1)).filter((x) => x >= 0); return { kind: "pick", prompt: "EN KÜÇÜK 3 sayıyı seç", items: items(a), multi: true, need: 3, check: (s) => s.length === 3 && s.every((i) => set.has(a[i])), solve: () => correct, explain: `Min-heap köke en küçüğü taşır.` }; } });

  add({ id: "heap-3", cat: "heap", title: "Akış Medyanı", emoji: "🎯", diff: "hard",
    desc: "Bu sayıların ortancasını (medyan) bul.",
    ai: "<b>Find Median from Data Stream</b>: iki heap (max+min) ile akan veride medyan.",
    setup() { const a = shuffle(distinct(5, 1, 40)); const med = [...a].sort((x, y) => x - y)[2]; return { kind: "pick", prompt: "Bu sayıların MEDYANINI (ortancasını) seç", items: items(a), multi: false, need: 1, check: (s) => a[s[0]] === med, solve: () => [a.indexOf(med)], explain: `Küçük yarı bir max-heap, büyük yarı bir min-heap; tepe ortancayı verir. Medyan: ${med}.` }; } });

  add({ id: "heap-4", cat: "heap", title: "K'ıncı En Büyük", emoji: "🏅", diff: "medium",
    desc: "Boyutu K olan heap ile k'ıncı en büyüğü bul.",
    ai: "<b>Kth Largest in Stream</b>: K boyutlu min-heap'in kökü cevabı verir.",
    setup() { const a = shuffle(distinct(6, 1, 50)); const k = ri(2, 4); const t = [...a].sort((x, y) => y - x)[k - 1]; return { kind: "pick", prompt: `${k}. EN BÜYÜK sayıyı seç`, items: items(a), multi: false, need: 1, check: (s) => a[s[0]] === t, solve: () => [a.indexOf(t)], explain: `K boyutlu min-heap tut; kökü ${k}. en büyüktür: ${t}.` }; } });

  /* ----------------- AĞAÇ OYUNLARI (12) ----------------- */
  add({ id: "tree-1", cat: "trees", title: "Maksimum Derinlik", emoji: "📏", diff: "easy",
    desc: "Ağacın kaç katı (derinliği) var?",
    ai: "<b>Maximum Depth of Binary Tree</b>: en temel ağaç özyinelemesi.",
    setup() { const n = fullTree(); return { kind: "tree", display: true, nodes: n, prompt: "Bu ağaç kaç KAT (seviye) derinliğinde?", numAnswer: depth(n, 0), explain: `Kök 1. kat; her aşağı iniş +1. Cevap: ${depth(n, 0)}.` }; } });

  add({ id: "tree-2", cat: "trees", title: "Düğüm Say", emoji: "🔢", diff: "easy",
    desc: "Ağaçta toplam kaç düğüm var?",
    ai: "Ağaçtaki tüm düğümleri saymak — gezinmenin (traversal) sayma uygulaması.",
    setup() { let n; do { n = [ri(1, 9), ri(1, 9), ri(1, 9), null, ri(1, 9), null, ri(1, 9)]; } while (nodeCount(n) < 4); return { kind: "tree", display: true, nodes: n, prompt: "Ağaçta toplam kaç düğüm var?", numAnswer: nodeCount(n), explain: `Boş (null) yerleri sayma. Cevap: ${nodeCount(n)}.` }; } });

  add({ id: "tree-3", cat: "trees", title: "Yaprak Say", emoji: "🍃", diff: "easy",
    desc: "Çocuğu olmayan (yaprak) düğümleri say.",
    ai: "<b>Count Leaves</b>: alt düğümü olmayanları sayan basit özyineleme.",
    setup() { const n = fullTree(); return { kind: "tree", display: true, nodes: n, prompt: "Kaç YAPRAK (çocuğu olmayan düğüm) var?", numAnswer: leafIdx(n).length, explain: `Altında düğüm olmayanlar yapraktır. Cevap: ${leafIdx(n).length}.` }; } });

  add({ id: "tree-4", cat: "trees", title: "Tüm Düğümlerin Toplamı", emoji: "➕", diff: "easy",
    desc: "Ağaçtaki tüm sayıları topla.",
    ai: "Ağaç toplamı: her düğümü bir kez ziyaret eden gezinmenin (DFS) uygulaması.",
    setup() { const n = fullTree(); return { kind: "tree", display: true, nodes: n, prompt: "Tüm düğümlerdeki sayıların TOPLAMI?", numAnswer: treeSum(n), explain: `Her düğümü gez ve topla. Cevap: ${treeSum(n)}.` }; } });

  add({ id: "tree-5", cat: "trees", title: "En Büyük Düğüm", emoji: "👑", diff: "easy",
    desc: "Ağaçtaki en büyük değerli düğümü tıkla.",
    ai: "Maksimumu bulmak için tüm düğümleri gezme — temel arama.",
    setup() { const n = fullTree(); const mx = Math.max(...n.filter((x) => x != null)); return { kind: "tree", mode: "pick", nodes: n, prompt: "EN BÜYÜK sayıya sahip düğüme tıkla", need: 1, check: (s) => n[s[0]] === mx, solve: () => [n.indexOf(mx)], explain: `Tüm düğümleri gez, en büyüğü seç: ${mx}.` }; } });

  add({ id: "tree-6", cat: "trees", title: "En Küçük Düğüm", emoji: "🐣", diff: "easy",
    desc: "Ağaçtaki en küçük değerli düğümü tıkla.",
    ai: "Minimumu bulmak için gezinme — BST'de en sola inmek de aynı fikrin özel halidir.",
    setup() { const n = fullTree(); const mn = Math.min(...n.filter((x) => x != null)); return { kind: "tree", mode: "pick", nodes: n, prompt: "EN KÜÇÜK sayıya sahip düğüme tıkla", need: 1, check: (s) => n[s[0]] === mn, solve: () => [n.indexOf(mn)], explain: `En küçük: ${mn}.` }; } });

  add({ id: "tree-7", cat: "trees", title: "Seviye Sıralı Gezinti", emoji: "📊", diff: "medium",
    desc: "Düğümlere kat kat, soldan sağa tıkla.",
    ai: "<b>Level Order Traversal (BFS)</b>: ağaçta kuyruk kullanan genişlik öncelikli gezinme.",
    setup() { const n = fullTree(); return { kind: "tree", mode: "order", nodes: n, prompt: "Yukarıdan aşağıya, her katı SOLDAN SAĞA tıkla", correct: levelorder(n), explain: "Bir kuyruk kullan: kökü ekle, çıkarırken çocuklarını sona ekle." }; } });

  add({ id: "tree-8", cat: "trees", title: "İçten Gezinti (Inorder)", emoji: "🔄", diff: "medium",
    desc: "Sol → kök → sağ sırasıyla tıkla.",
    ai: "<b>Inorder Traversal</b>: BST'de bu sıra sayıları küçükten büyüğe verir!",
    setup() { const n = fullTree(); const o = []; inorder(n, 0, o); return { kind: "tree", mode: "order", nodes: n, prompt: "SOL → KÖK → SAĞ sırasıyla tıkla (inorder)", correct: o, explain: "Önce tüm sol alt ağaç, sonra düğüm, sonra sağ alt ağaç." }; } });

  add({ id: "tree-9", cat: "trees", title: "Önden Gezinti (Preorder)", emoji: "🔝", diff: "medium",
    desc: "Kök → sol → sağ sırasıyla tıkla.",
    ai: "<b>Preorder Traversal</b>: ağacı kopyalamak/serileştirmek için kullanılır.",
    setup() { const n = fullTree(); const o = []; preorder(n, 0, o); return { kind: "tree", mode: "order", nodes: n, prompt: "KÖK → SOL → SAĞ sırasıyla tıkla (preorder)", correct: o, explain: "Önce düğümü ziyaret et, sonra sol, sonra sağ alt ağaç." }; } });

  add({ id: "tree-10", cat: "trees", title: "BST: K'ıncı En Küçük", emoji: "🔎", diff: "medium",
    desc: "Arama ağacında k'ıncı en küçük değeri tıkla.",
    ai: "<b>Kth Smallest in BST</b>: inorder gezinme sıralı verdiği için doğrudan k'ıncıyı verir.",
    setup() { const { nodes, sorted, pos } = bst7(); const k = ri(2, 5); const idx = pos[k - 1]; return { kind: "tree", mode: "pick", nodes, prompt: `Bu bir arama ağacı (BST). ${k}. EN KÜÇÜK değere tıkla`, need: 1, check: (s) => s[0] === idx, solve: () => [idx], explain: `İçten gezinti küçükten büyüğe sayar; ${k}.'yı al: ${sorted[k - 1]}.` }; } });

  add({ id: "tree-11", cat: "trees", title: "En Yakın Ortak Ata", emoji: "👥", diff: "hard",
    desc: "İki kırmızı düğümün en yakın ortak atasını tıkla.",
    ai: "<b>Lowest Common Ancestor</b>: dosya sistemleri ve soy ağaçlarında kullanılır.",
    setup() { const n = fullTree(); const leaves = leafIdx(n); const a = leaves[0], b = leaves[leaves.length - 1]; const lca = lcaIdx(a, b); return { kind: "tree", mode: "pick", nodes: n, highlight: [a, b], prompt: "İki KIRMIZI düğümün EN YAKIN ortak atasına tıkla", need: 1, check: (s) => s[0] === lca, solve: () => [lca], explain: "İki düğümden yukarı çıkıp ilk birleştikleri düğüm ortak atadır." }; } });

  add({ id: "tree-12", cat: "trees", title: "BST Geçerli mi?", emoji: "✔️", diff: "medium",
    desc: "Bu ağaç bir arama ağacı kuralına uyuyor mu?",
    ai: "<b>Validate BST</b>: sol < kök < sağ kuralının her düğümde geçerli olması gerekir.",
    setup() {
      const { nodes } = bst7(); const valid = Math.random() < 0.5; let n = nodes.slice();
      if (!valid) { const i = ri(0, 2); const j = ri(3, 6); [n[i], n[j]] = [n[j], n[i]]; }
      // gerçek geçerlilik
      const ok = (i, lo, hi) => { if (!exists(n, i)) return true; if (n[i] <= lo || n[i] >= hi) return false; return ok(2 * i + 1, lo, n[i]) && ok(2 * i + 2, n[i], hi); };
      const real = ok(0, -Infinity, Infinity);
      return { kind: "tree", display: true, nodes: n, prompt: "Bu ağaç geçerli bir BST mi? (her düğümde sol<kök<sağ)", choiceOptions: ["Evet, geçerli BST", "Hayır, kural bozuk"], choiceAnswer: real ? 0 : 1, explain: "Her düğüm için soldaki tüm değerler küçük, sağdakiler büyük olmalı." };
    } });

  /* ----------------- HARİTA OYUNLARI (12) ----------------- */
  add({ id: "graphs-1", cat: "graphs", title: "Adaları Say", emoji: "🏝️", diff: "medium",
    desc: "Denizdeki kara parçası (ada) sayısını bul.",
    ai: "<b>Number of Islands</b>: ızgarada DFS/BFS'in en sevilen sorusu.",
    setup() { let g; do { g = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => (Math.random() < 0.45 ? 1 : 0))); } while (countIslands(g) < 2 || countIslands(g) > 4); const ans = countIslands(g); return { kind: "number", prompt: "Kaç ayrı ada (🟩 kara grubu) var?", visual: G(4, 4, (r, c) => ({ cls: g[r][c] ? "land" : "water" })), answer: ans, explain: `Bir karaya bas, komşu karaları boya; her yeni boyama bir adadır. Cevap: ${ans}.` }; } });

  add({ id: "graphs-2", cat: "graphs", title: "En Büyük Ada", emoji: "🗺️", diff: "medium",
    desc: "En büyük kara parçası kaç hücre?",
    ai: "<b>Max Area of Island</b>: bağlı bileşenin boyutunu döndüren DFS.",
    setup() { let g; do { g = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => (Math.random() < 0.5 ? 1 : 0))); } while (islandSizes(g) < 3); const ans = islandSizes(g); return { kind: "number", prompt: "EN BÜYÜK adada kaç kara hücre var?", visual: G(4, 4, (r, c) => ({ cls: g[r][c] ? "land" : "water" })), answer: ans, explain: `Her adanın büyüklüğünü say, en büyüğü al: ${ans}.` }; } });

  add({ id: "graphs-3", cat: "graphs", title: "En Kısa Yol", emoji: "🎯", diff: "medium",
    desc: "Başlangıçtan hedefe en az kaç adımda gidilir?",
    ai: "<b>BFS Shortest Path</b>: GPS ve navigasyonun temeli. BFS adım adım dalga gibi yayılır.",
    setup() { const { g, sol } = makeMaze(4, 4); return { kind: "number", prompt: "🟢 sol üstten 🟪 sağ alta EN AZ kaç adımda gidilir? (gri = duvar)", visual: G(4, 4, (r, c) => { let cls = g[r][c] ? "wall" : ""; let label = ""; if (r === 0 && c === 0) { cls = "ok"; label = "🟢"; } if (r === 3 && c === 3) { cls = "sel"; label = "🟪"; } return { cls, label }; }), answer: sol.dist, explain: `BFS dalga dalga yayılır; hedefe ilk varış en kısadır: ${sol.dist} adım.` }; } });

  add({ id: "graphs-4", cat: "graphs", title: "Çürüyen Portakallar", emoji: "🍊", diff: "hard",
    desc: "Tüm portakallar kaç dakikada çürür?",
    ai: "<b>Rotting Oranges</b>: çok kaynaklı (multi-source) BFS — salgın yayılımı modeli.",
    setup() {
      let g, minutes; const R = 3, C = 3;
      const calc = (gr) => { const q = []; let fresh = 0; for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { if (gr[r][c] === 2) q.push([r, c, 0]); if (gr[r][c] === 1) fresh++; } let t = 0; const seen = gr.map((row) => row.slice()); while (q.length) { const [r, c, d] = q.shift(); for (const [dr, dc] of dirs) { const nr = r + dr, nc = c + dc; if (nr >= 0 && nc >= 0 && nr < R && nc < C && seen[nr][nc] === 1) { seen[nr][nc] = 2; fresh--; t = Math.max(t, d + 1); q.push([nr, nc, d + 1]); } } } return fresh === 0 ? t : -1; };
      do { g = Array.from({ length: R }, () => Array.from({ length: C }, () => { const x = Math.random(); return x < 0.55 ? 1 : 0; })); const rr = ri(0, R - 1), rc = ri(0, C - 1); g[rr][rc] = 2; minutes = calc(g); } while (minutes < 1);
      const emo = ["⬛", "🍊", "🤢"];
      return { kind: "number", prompt: "🤢 çürük portakal her dakika komşularını çürütür. KAÇ dakikada hepsi çürür?", visual: G(R, C, (r, c) => ({ label: emo[g[r][c]] })), answer: minutes, explain: `Çürükler aynı anda yayılır (çok kaynaklı BFS). Süre: ${minutes} dakika.` };
    } });

  add({ id: "graphs-5", cat: "graphs", title: "Boya Taşması", emoji: "🪣", diff: "medium",
    desc: "Sarı hücreden başlayıp aynı renk komşuları boya.",
    ai: "<b>Flood Fill</b>: boyama programlarındaki kova aracı — DFS/BFS.",
    setup() {
      const R = 4, C = 4; const colors = [0, 1, 2]; const g = Array.from({ length: R }, () => Array.from({ length: C }, () => colors[ri(0, 2)]));
      const sr = ri(0, R - 1), sc = ri(0, C - 1); const reg = region(g, sr, sc);
      const palette = ["water", "land", ""]; // 0 mavi,1 yeşil,2 beyaz
      return { kind: "grid", mode: "select", prompt: "Sarı hücreyle AYNI renkte ve ona BAĞLI tüm hücreleri seç", rows: R, cols: C,
        cellClass: (r, c) => (r === sr && c === sc ? "sel" : palette[g[r][c]]), cellLabel: () => "",
        check: (set) => set.size === reg.size && [...reg].every((k) => set.has(k)), solve: () => [...reg],
        startCell: sr + "," + sc, explain: "Başlangıç rengini yay; farklı renkte durursun." };
    } });

  add({ id: "graphs-6", cat: "graphs", title: "Komşu Say", emoji: "🧭", diff: "easy",
    desc: "Sarı hücrenin kaç kara komşusu var?",
    ai: "Bir düğümün derecesi (degree) — graf teorisinin en temel ölçüsü.",
    setup() {
      const R = 3, C = 3; const g = Array.from({ length: R }, () => Array.from({ length: C }, () => (Math.random() < 0.5 ? 1 : 0)));
      const sr = ri(0, R - 1), sc = ri(0, C - 1); g[sr][sc] = 1; let cnt = 0; for (const [dr, dc] of dirs) { const nr = sr + dr, nc = sc + dc; if (nr >= 0 && nc >= 0 && nr < R && nc < C && g[nr][nc] === 1) cnt++; }
      return { kind: "number", prompt: "Sarı karanın kaç KARA komşusu var? (yukarı/aşağı/sağ/sol)", visual: G(R, C, (r, c) => ({ cls: r === sr && c === sc ? "sel" : g[r][c] ? "land" : "water" })), answer: cnt, explain: `Sadece 4 yönlü komşulara bak. Cevap: ${cnt}.` };
    } });

  add({ id: "graphs-7", cat: "graphs", title: "Renk Bölgeleri", emoji: "🧩", diff: "medium",
    desc: "Aynı renkten oluşan kaç ayrı bölge var?",
    ai: "<b>Connected Components</b>: birbirine bağlı düğüm kümelerini sayma.",
    setup() { const R = 3, C = 3; let g; do { g = Array.from({ length: R }, () => Array.from({ length: C }, () => ri(0, 1))); } while (countRegions(g) < 3); const ans = countRegions(g); const pal = ["water", "land"]; return { kind: "number", prompt: "Aynı renkten oluşan kaç ayrı bölge var?", visual: G(R, C, (r, c) => ({ cls: pal[g[r][c]] })), answer: ans, explain: `Her bağlı renk grubu bir bileşendir. Cevap: ${ans}.` }; } });

  add({ id: "graphs-8", cat: "graphs", title: "Yolu Çiz", emoji: "🛤️", diff: "hard",
    desc: "Başlangıçtan hedefe en kısa yolun hücrelerine sırayla tıkla.",
    ai: "BFS sadece mesafeyi değil, geriye iz sürerek <b>yolun kendisini</b> de verir.",
    setup() { const { g, sol } = makeMaze(4, 4); return { kind: "grid", mode: "order", prompt: "🟢'dan 🟪'ya EN KISA yolun hücrelerine SIRAYLA tıkla", rows: 4, cols: 4, cellClass: (r, c) => { if (g[r][c]) return "wall"; if (r === 0 && c === 0) return "ok"; if (r === 3 && c === 3) return "sel"; return ""; }, cellLabel: (r, c) => (r === 0 && c === 0 ? "🟢" : r === 3 && c === 3 ? "🟪" : ""), correct: sol.path, explain: "BFS'in bulduğu ebeveyn izini takip et." }; } });

  add({ id: "graphs-9", cat: "graphs", title: "Ulaşılabilir mi?", emoji: "🚧", diff: "medium",
    desc: "Hedefe hiç ulaşılabiliyor mu, yoksa duvarlar mı kapatmış?",
    ai: "<b>Path Exists in Graph</b>: bağlantılılık kontrolü — DFS/BFS ile.",
    setup() {
      const R = 4, C = 4; let g, reach; do { g = Array.from({ length: R }, () => Array.from({ length: C }, () => (Math.random() < 0.4 ? 1 : 0))); g[0][0] = 0; g[R - 1][C - 1] = 0; reach = bfsGrid(g, [0, 0], [R - 1, C - 1]); } while (false);
      const ok = !!reach;
      return { kind: "choice", prompt: "🟢 sol üstten 🟪 sağ alta gidilebiliyor mu? (gri=duvar)", visual: G(R, C, (r, c) => { let cls = g[r][c] ? "wall" : ""; let label = ""; if (r === 0 && c === 0) { cls = "ok"; label = "🟢"; } if (r === R - 1 && c === C - 1) { cls = "sel"; label = "🟪"; } return { cls, label }; }), options: ["Evet, ulaşılabilir", "Hayır, yol yok"], answer: ok ? 0 : 1, explain: "Başlangıçtan yayıl; hedef boyandıysa ulaşılabilir." };
    } });

  add({ id: "graphs-10", cat: "graphs", title: "Dersleri Bitirebilir mi?", emoji: "📚", diff: "hard",
    desc: "Önkoşullarda kısır döngü var mı?",
    ai: "<b>Course Schedule</b>: yönlü grafта döngü tespiti = topolojik sıralama.",
    setup() {
      const cyc = Math.random() < 0.5; let edges;
      if (cyc) edges = [["A", "B"], ["B", "C"], ["C", "A"]]; else edges = [["A", "B"], ["A", "C"], ["B", "D"]];
      const txt = edges.map(([a, b]) => `${a} → ${b}`).join(" , ");
      return { kind: "choice", prompt: `"X → Y" = X dersini Y'den önce almalısın. Tüm dersler bitirilebilir mi?`, visual: `<div class="visual">${txt}</div>`, options: ["Evet, sıralanabilir", "Hayır, kısır döngü var"], answer: cyc ? 1 : 0, explain: "Bir ders dolaylı olarak kendini beklerse (döngü) asla başlanamaz." };
    } });

  add({ id: "graphs-11", cat: "graphs", title: "İki Takıma Bölünür mü?", emoji: "🔵🔴", diff: "hard",
    desc: "Herkesi, rakipleri farklı takımda olacak şekilde ikiye bölebilir misin?",
    ai: "<b>Bipartite Check</b>: grafı 2 renge boyama — çift renkli BFS.",
    setup() {
      const ok = Math.random() < 0.5; let edges;
      if (ok) edges = [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"]]; else edges = [["A", "B"], ["B", "C"], ["C", "A"]];
      const txt = edges.map(([a, b]) => `${a} — ${b}`).join(" , ");
      return { kind: "choice", prompt: "Çizgiyle bağlı olanlar rakip. Herkesi 2 takıma (rakipler ayrı) bölebilir misin?", visual: `<div class="visual">${txt}</div>`, options: ["Evet, bölünebilir", "Hayır, mümkün değil"], answer: ok ? 0 : 1, explain: "Tek sayıda kişiyle kapanan bir halka varsa 2 renge boyanamaz." };
    } });

  add({ id: "graphs-12", cat: "graphs", title: "Harita Boyama", emoji: "🖍️", diff: "medium",
    desc: "Komşularıyla aynı olmayan bir renk seç.",
    ai: "<b>Graph Coloring</b>: dört renk teoremi ve frekans atama (telefon baz istasyonu) sorunu.",
    setup() {
      const palette = ["🔴", "🟢", "🔵"]; const used = shuffle([0, 1, 2]).slice(0, 2); const free = [0, 1, 2].find((c) => !used.includes(c));
      return { kind: "choice", prompt: `Ortadaki bölgenin komşuları şu renkte: ${used.map((i) => palette[i]).join(" ")}. Hangi rengi seçmelisin?`, options: palette, answer: free, explain: "Komşularda kullanılmayan rengi seç." };
    } });

  /* ----------------- DYNAMIC PROGRAMMING (20) ----------------- */
  add({ id: "dp-1", cat: "dp", title: "Merdiven Çıkma", emoji: "🪜", diff: "easy",
    desc: "1 veya 2 basamak atlayarak kaç farklı yol var?",
    ai: "<b>Climbing Stairs</b>: DP'nin giriş kapısı — cevap Fibonacci'dir!",
    setup() { const n = ri(4, 7); return { kind: "number", prompt: `${n} basamaklı merdiveni 1 veya 2'şer çıkarak KAÇ farklı yolla çıkarsın?`, answer: climb(n), explain: `Bir basamağa ya 1 alttan ya 2 alttan gelirsin: yol(n)=yol(n-1)+yol(n-2). Cevap: ${climb(n)}.` }; } });

  add({ id: "dp-2", cat: "dp", title: "Fibonacci", emoji: "🐚", diff: "easy",
    desc: "Her sayı önceki ikisinin toplamı. Sıradaki?",
    ai: "<b>Fibonacci</b>: ezberlemenin (memoization) gücünü gösteren klasik DP.",
    setup() { const n = ri(6, 9); const seq = []; for (let i = 1; i <= n; i++) seq.push(fib(i)); return { kind: "number", prompt: "Sıradaki Fibonacci sayısı kaç?", visual: T(seq.concat(["?"]), [seq.length]), answer: fib(n + 1), explain: `Son iki sayıyı topla: ${seq[seq.length - 2]} + ${seq[seq.length - 1]} = ${fib(n + 1)}.` }; } });

  add({ id: "dp-3", cat: "dp", title: "Ev Soyguncusu", emoji: "🏠", diff: "medium",
    desc: "Yan yana iki evi soyamazsın. En çok ne kadar?",
    ai: "<b>House Robber</b>: 'al ya da atla' kararı veren temel DP.",
    setup() { const a = Array.from({ length: 5 }, () => ri(1, 12)); return { kind: "number", prompt: "Yan yana iki evi soyamazsın. EN ÇOK ne kadar toplarsın?", visual: T(a), answer: rob(a), explain: `Her ev için: ya al (+ 2 önceki) ya atla. En iyisi: ${rob(a)}.` }; } });

  add({ id: "dp-4", cat: "dp", title: "En Az Bozuk Para", emoji: "💰", diff: "medium",
    desc: "Hedef tutarı en az kaç parayla yaparsın?",
    ai: "<b>Coin Change</b>: açgözlü çözmeyen, DP gerektiren ünlü soru.",
    setup() { const coins = [1, 3, 5]; const amt = ri(7, 15); return { kind: "number", prompt: `${coins.join(", ")} liralık paralarla ${amt} lirayı EN AZ kaç parayla yaparsın?`, answer: coinMin(coins, amt), explain: `dp[tutar] = 1 + en iyi dp[tutar - para]. Cevap: ${coinMin(coins, amt)}.` }; } });

  add({ id: "dp-5", cat: "dp", title: "Para Üstü Yolları", emoji: "🪙", diff: "medium",
    desc: "Hedef tutarı kaç FARKLI şekilde yapabilirsin?",
    ai: "<b>Coin Change II</b>: kombinasyon sayma DP'si.",
    setup() { const coins = [1, 2, 5]; const amt = ri(5, 9); return { kind: "number", prompt: `${coins.join(", ")} liralık paralarla ${amt} lirayı KAÇ farklı şekilde yaparsın?`, answer: coinWays(coins, amt), explain: `Her parayı sırayla ekleyerek yolları topla. Cevap: ${coinWays(coins, amt)}.` }; } });

  add({ id: "dp-6", cat: "dp", title: "En Uzun Artan Dizi", emoji: "📈", diff: "medium",
    desc: "Soldan sağa artan en uzun alt dizi kaç sayı?",
    ai: "<b>Longest Increasing Subsequence</b>: klasik O(n²) (ve O(n log n)) DP.",
    setup() { const a = shuffle(distinct(7, 1, 20)); return { kind: "number", prompt: "Soldan sağa giderek (atlayabilirsin) ARTAN en uzun dizi kaç sayı?", visual: T(a), answer: lis(a), explain: `Her eleman için 'benimle biten en uzun artan dizi' uzunluğunu tut. Cevap: ${lis(a)}.` }; } });

  add({ id: "dp-7", cat: "dp", title: "Sırt Çantası", emoji: "🎒", diff: "hard",
    desc: "Ağırlık sınırını aşmadan en değerli yükü seç.",
    ai: "<b>0/1 Knapsack</b>: kaynak optimizasyonunun ders kitabı sorusu.",
    setup() { const w = [2, 3, 4, 5], v = [3, 4, 5, 6], cap = ri(6, 9); return { kind: "number", prompt: `Çanta ${cap} kg taşır. Ağırlık[${w.join(",")}], Değer[${v.join(",")}]. EN YÜKSEK değer?`, answer: knap(w, v, cap), explain: `Her eşya için 'al' ya da 'alma'; dp[kapasite] güncellenir. En iyi: ${knap(w, v, cap)}.` }; } });

  add({ id: "dp-8", cat: "dp", title: "Izgara Yolları", emoji: "🗺️", diff: "medium",
    desc: "Sadece sağ/aşağı giderek kaç farklı yol var?",
    ai: "<b>Unique Paths</b>: her hücreye yol sayısı = üst + sol.",
    setup() { const R = ri(2, 4), C = ri(2, 4); return { kind: "number", prompt: `${R}×${C} ızgarada sol üstten sağ alta, sadece SAĞ ve AŞAĞI giderek kaç farklı yol var?`, visual: G(R, C, () => ({ cls: "water" })), answer: uniquePaths(R, C), explain: `Bir hücreye yol = üstten + soldan gelen yollar. Cevap: ${uniquePaths(R, C)}.` }; } });

  add({ id: "dp-9", cat: "dp", title: "En Ucuz Yol", emoji: "⬇️", diff: "medium",
    desc: "Sağ/aşağı giderek en küçük toplamla in.",
    ai: "<b>Minimum Path Sum</b>: ızgara DP'sinin maliyet sürümü.",
    setup() { const R = 3, C = 3; const g = Array.from({ length: R }, () => Array.from({ length: C }, () => ri(1, 9))); return { kind: "number", prompt: "Sol üstten sağ alta (sağ/aşağı) EN KÜÇÜK toplamla in. Toplam kaç?", visual: G(R, C, (r, c) => ({ label: g[r][c] })), answer: minPath(g), explain: `Her hücre = kendi değeri + üst/sol minimumu. En ucuz: ${minPath(g)}.` }; } });

  add({ id: "dp-10", cat: "dp", title: "Düzenleme Mesafesi", emoji: "✏️", diff: "hard",
    desc: "Bir kelimeyi diğerine kaç adımda çevirirsin?",
    ai: "<b>Edit Distance</b>: yazım denetimi ve DNA hizalamanın temeli.",
    setup() { const pairs = [["KEDI", "KEDU"], ["EL", "BEL"], ["KAR", "KARA"], ["SU", "SUS"], ["AT", "TAT"]]; const [a, b] = pairs[ri(0, pairs.length - 1)]; return { kind: "number", prompt: `"${a}" kelimesini "${b}" yapmak için EN AZ kaç işlem? (harf ekle/sil/değiştir)`, answer: edit(a, b), explain: `dp tablosu üç komşunun en küçüğü +1 ile dolar. Cevap: ${edit(a, b)}.` }; } });

  add({ id: "dp-11", cat: "dp", title: "Ortak Alt Dizi", emoji: "🔗", diff: "hard",
    desc: "İki kelimede ortak (sıralı) en uzun harf dizisi.",
    ai: "<b>Longest Common Subsequence</b>: 'diff' araçları ve versiyon kontrolünün kalbi.",
    setup() { const a = word(), b = word(); return { kind: "number", prompt: `"${a}" ve "${b}" kelimelerinde SIRAYI bozmadan ortak en uzun harf dizisi kaç harf?`, answer: lcs(a, b), explain: `Harfler eşleşirse köşegen+1, değilse komşuların en büyüğü. Cevap: ${lcs(a, b)}.` }; } });

  add({ id: "dp-12", cat: "dp", title: "Hedefe Ulaş", emoji: "🎯", diff: "medium",
    desc: "Bazı sayıları seçerek tam hedefe ulaşabilir misin?",
    ai: "<b>Subset Sum / Target Sum</b>: ulaşılabilir toplamları takip eden DP.",
    setup() { const a = distinct(4, 1, 9); const reach = Math.random() < 0.6; let t; if (reach) { const sub = shuffle(a).slice(0, ri(1, 3)); t = sum(sub); } else { t = sum(a) + ri(1, 3); } const real = subsetSum(a, t); return { kind: "choice", prompt: `[${a.join(", ")}] içinden bazılarını seçerek tam ${t} yapabilir misin?`, options: ["Evet, yapılabilir", "Hayır, imkânsız"], answer: real ? 0 : 1, explain: "Ulaşılabilen toplamlar kümesini büyüterek hedefi ararsın." }; } });

  add({ id: "dp-13", cat: "dp", title: "Kelime Bölme", emoji: "🧱", diff: "hard",
    desc: "Harf dizisi, sözlükteki kelimelere bölünebilir mi?",
    ai: "<b>Word Break</b>: arama motorları ve doğal dil işlemede kullanılır.",
    setup() { const dict = ["EL", "MA", "SU", "KAR", "OT"]; const ok = Math.random() < 0.6; let s; if (ok) { s = ""; const k = ri(2, 3); for (let i = 0; i < k; i++) s += dict[ri(0, dict.length - 1)]; } else { s = "ELXMA"; } const f = (str) => { if (!str) return true; for (const w of dict) if (str.startsWith(w) && f(str.slice(w.length))) return true; return false; }; const real = f(s); return { kind: "choice", prompt: `"${s}" dizisi şu sözlüğe bölünebilir mi? {${dict.join(", ")}}`, options: ["Evet, bölünür", "Hayır"], answer: real ? 0 : 1, explain: "Baştan sözlük kelimeleriyle eşleştirip kalanı aynı şekilde dene." }; } });

  add({ id: "dp-14", cat: "dp", title: "Palindrom Alt Dizi", emoji: "🔁", diff: "hard",
    desc: "Harfleri atlayarak elde edilebilecek en uzun palindrom.",
    ai: "<b>Longest Palindromic Subsequence</b>: aralık DP'sinin (interval DP) örneği.",
    setup() { const alpha = "ABC"; let s = ""; for (let i = 0; i < 6; i++) s += alpha[ri(0, 2)]; return { kind: "number", prompt: "Harf atlayarak (sıra bozmadan) elde edilebilecek en uzun PALİNDROM kaç harf?", visual: T(s.split("")), answer: lps(s), explain: `Uçlar eşitse içeriden +2, değilse birini at. Cevap: ${lps(s)}.` }; } });

  add({ id: "dp-15", cat: "dp", title: "Çubuk Kesme", emoji: "📏", diff: "hard",
    desc: "Çubuğu parçalara ayırarak en çok parayı kazan.",
    ai: "<b>Rod Cutting</b>: knapsack ailesinden klasik optimizasyon DP'si.",
    setup() { const prices = [1, 5, 8, 9]; const n = ri(3, 4); return { kind: "number", prompt: `Çubuk uzunluğu ${n}. 1,2,3,4 boy parçaların fiyatı [${prices.join(",")}]. EN ÇOK kaç para?`, answer: rodCut(prices, n), explain: `İlk kesimi dene, kalanı aynı şekilde çöz. En iyi: ${rodCut(prices, n)}.` }; } });

  add({ id: "dp-16", cat: "dp", title: "Zar Toplamı Yolları", emoji: "🎲", diff: "medium",
    desc: "Zarları atıp hedef toplama kaç yolla ulaşırsın?",
    ai: "<b>Number of Dice Rolls</b>: katman katman ilerleyen sayma DP'si.",
    setup() { const d = 2, f = 6; const target = ri(4, 10); return { kind: "number", prompt: `${d} zar (1-${f}) atıyorsun. Toplamı ${target} yapan KAÇ farklı sonuç var?`, answer: diceWays(d, f, target), explain: `Her zarı ekleyerek ulaşılabilir toplamların yol sayısını biriktir. Cevap: ${diceWays(d, f, target)}.` }; } });

  add({ id: "dp-17", cat: "dp", title: "Ev Boyama", emoji: "🏡", diff: "medium",
    desc: "Komşu evler farklı renk olacak — en ucuz boyama.",
    ai: "<b>Paint House</b>: 'bir önceki seçimi hatırla' kalıbıyla durum DP'si.",
    setup() { const n = 3; const c = Array.from({ length: n }, () => [ri(1, 9), ri(1, 9), ri(1, 9)]); return { kind: "number", prompt: "Komşu evler farklı renk olacak. Satırlar ev, sütunlar 🔴🟢🔵 maliyeti. EN UCUZ toplam?", visual: G(n, 3, (r, cc) => ({ label: c[r][cc] })), answer: paintMin(c), explain: `Her ev için: kendi maliyeti + komşusunun farklı renk minimumu. En ucuz: ${paintMin(c)}.` }; } });

  add({ id: "dp-18", cat: "dp", title: "En Büyük Çarpım Dizisi", emoji: "✖️", diff: "hard",
    desc: "Yan yana sayıların en büyük çarpımı (eksi sayılara dikkat!).",
    ai: "<b>Maximum Product Subarray</b>: negatifler yüzünden hem max hem min'i takip eden DP.",
    setup() { let a; do { a = Array.from({ length: 5 }, () => ri(-3, 4)).filter((x) => x !== 0); } while (a.length < 4); a = a.slice(0, 4); return { kind: "number", prompt: "Yan yana sayıların EN BÜYÜK çarpımı kaç? (eksiye dikkat!)", visual: T(a), answer: maxProd(a), explain: `İki eksi artı yapar; bu yüzden en küçük çarpımı da saklarsın. Cevap: ${maxProd(a)}.` }; } });

  add({ id: "dp-19", cat: "dp", title: "Eşit İkiye Böl", emoji: "⚖️", diff: "hard",
    desc: "Sayıları toplamları eşit iki gruba bölebilir misin?",
    ai: "<b>Partition Equal Subset Sum</b>: subset-sum DP'sinin şık uygulaması.",
    setup() { let a; do { a = distinct(4, 1, 8); } while (false); const real = canPartition(a); return { kind: "choice", prompt: `[${a.join(", ")}] sayılarını TOPLAMLARI EŞİT iki gruba bölebilir misin?`, options: ["Evet, bölünür", "Hayır"], answer: real ? 0 : 1, explain: "Toplam tek ise imkânsız; çift ise yarısına ulaşılabiliyor mu diye bak." }; } });

  add({ id: "dp-20", cat: "dp", title: "Üçgen Yolu", emoji: "🔺", diff: "hard",
    desc: "Sayı üçgeninde tepeden tabana en küçük toplam.",
    ai: "<b>Triangle Minimum Path</b>: alttan yukarı (bottom-up) DP'nin güzel örneği.",
    setup() { const tri = [[ri(1, 9)], [ri(1, 9), ri(1, 9)], [ri(1, 9), ri(1, 9), ri(1, 9)]]; const vis = tri.map((row) => row.map((x) => `<span class='tok'>${x}</span>`).join(" ")).join("<br>"); return { kind: "number", prompt: "Tepeden tabana (her adım alt-komşuya) EN KÜÇÜK toplam kaç?", visual: `<div class="visual">${vis}</div>`, answer: triMin(tri), explain: `Alttan başla, her hücreye altındaki iki komşunun küçüğünü ekle. Cevap: ${triMin(tri)}.` }; } });

  /* ----------------- BİT İŞLEMLERİ (3) ----------------- */
  add({ id: "bits-1", cat: "bits", title: "Tek Olan Sayı", emoji: "1️⃣", diff: "easy",
    desc: "Herkesin çifti var, birinin yok. XOR'la bul.",
    ai: "<b>Single Number</b>: tüm sayıları XOR'larsan çiftler yok olur, tek kalan görünür!",
    setup() { const pairs = distinct(2, 1, 9); const single = distinct(1, 10, 20)[0]; const arr = shuffle([...pairs, ...pairs, single]); const cnt = {}; arr.forEach((x) => (cnt[x] = (cnt[x] || 0) + 1)); const idx = arr.findIndex((x) => cnt[x] === 1); return { kind: "pick", prompt: "Çifti olmayan TEK sayıyı seç", items: items(arr), multi: false, need: 1, check: (s) => cnt[arr[s[0]]] === 1, solve: () => [idx], explain: "a XOR a = 0 olduğu için çiftler birbirini götürür." }; } });

  add({ id: "bits-2", cat: "bits", title: "1'leri Say", emoji: "🔢", diff: "easy",
    desc: "Sayının ikili (binary) halinde kaç tane 1 var?",
    ai: "<b>Number of 1 Bits (popcount)</b>: bit maskeleri ve sıkıştırmanın temeli.",
    setup() { const n = ri(5, 60); const bin = n.toString(2); const ones = bin.split("").filter((b) => b === "1").length; return { kind: "number", prompt: `${n} sayısının ikili halinde kaç tane 1 var?`, visual: `<div class="visual">${n} = <span class='tok hl'>${bin}</span> (ikili)</div>`, answer: ones, explain: `İkili: ${bin}. İçindeki 1'leri say: ${ones}.` }; } });

  add({ id: "bits-3", cat: "bits", title: "İkinin Kuvveti mi?", emoji: "⚡", diff: "medium",
    desc: "Sayı 2'nin bir kuvveti mi? (2,4,8,16...)",
    ai: "<b>Power of Two</b>: ikili gösterimde tam tek bir 1 vardır — n & (n-1) == 0 hilesi.",
    setup() { const pow = Math.random() < 0.5; const n = pow ? 2 ** ri(1, 6) : (() => { let x; do { x = ri(3, 60); } while ((x & (x - 1)) === 0); return x; })(); const real = (n & (n - 1)) === 0; return { kind: "choice", prompt: `${n} sayısı 2'nin bir kuvveti mi? (2, 4, 8, 16, 32...)`, visual: `<div class="visual">${n} = <span class='tok hl'>${n.toString(2)}</span> (ikili)</div>`, options: ["Evet", "Hayır"], answer: real ? 0 : 1, explain: `2'nin kuvvetlerinin ikili halinde tek bir '1' bulunur.` }; } });

  /* ---------- dışa aç ---------- */
  window.AZ = { CATEGORIES, GAMES: G_LIST };
})();
