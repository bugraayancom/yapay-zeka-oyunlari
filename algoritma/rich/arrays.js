/* ===========================================================
   Diziler — zengin, zekasal oyunlar (base games.js'i geçersiz kılar)
   Her oyun 3 artan zorlukta tur içerir; algoritmanın mantığını
   adım adım yaptırır ve canlı geri bildirim verir.
   =========================================================== */
(function () {
  "use strict";
  if (!window.AZ) return;
  const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i);[a[i], a[j]] = [a[j], a[i]]; } return a; };
  const distinct = (n, lo, hi) => { const s = new Set(); while (s.size < n) s.add(ri(lo, hi)); return [...s]; };
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const kadane = (a) => { let best = a[0], cur = a[0]; for (let i = 1; i < a.length; i++) { cur = Math.max(a[i], cur + a[i]); best = Math.max(best, cur); } return best; };

  /* tur yöneticisi: artan zorlukta seviyeler, yıldız göstergesi, ipucu/yeni oyun düğmeleri */
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
        else { api.reward(10); api.status("✅ Doğru! Sıradaki tur geliyor...", "win"); setTimeout(next, 950); }
      });
    }
    next();
  }

  /* ortak görsel bileşenler */
  function cards(slot, vals, opts) {
    opts = opts || {}; const wrap = el("div", "ncards"); const cs = [];
    vals.forEach((v, i) => { const fixed = opts.fixed && opts.fixed.includes(i); const c = el("div", "ncard" + (fixed ? " fixed" : ""), String(v)); if (opts.onClick && !fixed) c.onclick = () => opts.onClick(i); wrap.appendChild(c); cs.push(c); });
    slot.appendChild(wrap); return cs;
  }
  function bars(slot, vals, opts) {
    opts = opts || {}; const wrap = el("div", "bars"); const maxV = Math.max(...vals.map((v) => Math.abs(v)), 1);
    const cols = [], bs = [];
    vals.forEach((v, i) => {
      const col = el("div", "bcol"); const bar = el("div", "bar" + (v < 0 ? " neg" : ""));
      bar.style.height = Math.max(16, (Math.abs(v) / maxV) * 175) + "px"; bar.style.width = (opts.width || 44) + "px";
      bar.innerHTML = `<span class="cap">${v}</span>`;
      col.appendChild(bar); col.appendChild(el("div", "lab", opts.labels ? opts.labels[i] : "#" + (i + 1)));
      if (opts.onClick) col.onclick = () => opts.onClick(i);
      if (opts.onHover) { col.onmouseenter = () => opts.onHover(i); col.onmouseleave = () => opts.onHover(-1); }
      wrap.appendChild(col); cols.push(col); bs.push(bar);
    });
    slot.appendChild(wrap); return { cols, bars: bs };
  }
  const pill = (slot, txt) => { const p = el("div", "sumread", txt); slot.appendChild(p); return p; };

  /* ====================== OYUNLAR ====================== */
  const R = {};

  /* 1) Çift Bulma — tamamlayıcı (complement) düşünme */
  R["arrays-1"] = (host, api) => {
    api.prompt("İki sayının toplamı hedefe eşit olmalı. Önce birini seç, sana <b>hangi eşi</b> aradığını söyleyeyim!");
    runRounds(host, api, [6, 7, 8], (slot, n, solved) => {
      const target = ri(9, 17); const a = ri(1, target - 1); let nums = [a, target - a];
      while (nums.length < n) nums.push(ri(1, 17)); nums = shuffle(nums);
      pill(slot, `🎯 Hedef toplam: <b>${target}</b>`);
      let sel = [], done = false, cs;
      const info = pill(slot, "Bir sayı seç…");
      const update = () => {
        if (sel.length === 0) { info.innerHTML = "Bir sayı seç; hangi eşi aradığını göstereyim."; info.classList.remove("hit"); return; }
        if (sel.length === 1) { const v = nums[sel[0]]; info.innerHTML = `Seçtin <b>${v}</b> → şimdi <b>${target} − ${v} = ${target - v}</b> sayısını ara!`; return; }
        const s = nums[sel[0]] + nums[sel[1]];
        if (s === target) { done = true; sel.forEach((i) => cs[i].classList.add("good")); info.innerHTML = `${nums[sel[0]]} + ${nums[sel[1]]} = <b>${s}</b> ✓`; info.classList.add("hit"); solved(); }
        else { info.innerHTML = `${nums[sel[0]]} + ${nums[sel[1]]} = <b>${s}</b>, hedef değil. Tekrar!`; api.penalty(); const bad = sel.slice(); sel = []; bad.forEach((i) => { cs[i].classList.remove("sel"); cs[i].classList.add("bad"); setTimeout(() => cs[i].classList.remove("bad"), 450); }); }
      };
      cs = cards(slot, nums, { onClick: (i) => { if (done) return; const p = sel.indexOf(i); if (p >= 0) { sel.splice(p, 1); cs[i].classList.remove("sel"); } else { if (sel.length >= 2) return; sel.push(i); cs[i].classList.add("sel"); } update(); } });
      slot.appendChild(info);
      return { hint: () => { for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) if (nums[i] + nums[j] === target) { info.innerHTML = `İpucu: <b>${nums[i]}</b> + <b>${nums[j]}</b> = ${target} (çünkü ${target}−${nums[i]}=${nums[j]})`; return; } } };
    });
  };

  /* 2) En İyi Alış-Satış — alış satıştan önce, en yüksek kâr */
  R["arrays-2"] = (host, api) => {
    api.prompt("Önce <b>ucuz</b> bir günde AL, sonra <b>pahalı</b> bir günde SAT. En yüksek kârı yakala! (alış, satıştan önce olmalı)");
    runRounds(host, api, [6, 7, 8], (slot, n, solved) => {
      let p, best, bi, bj, mi;
      do { p = Array.from({ length: n }, () => ri(2, 20)); best = 0; bi = 0; bj = 1; mi = 0; for (let j = 1; j < n; j++) { if (p[j] - p[mi] > best) { best = p[j] - p[mi]; bi = mi; bj = j; } if (p[j] < p[mi]) mi = j; } } while (best <= 0);
      let buy = -1, done = false;
      const info = el("div", "sumread", "Bir günde AL (yeşil), sonra ileride SAT.");
      const B = bars(slot, p, { labels: p.map((_, i) => "G" + (i + 1)), onClick: (i) => {
        if (done) return;
        if (buy < 0) { buy = i; B.bars.forEach((b) => b.classList.remove("sel", "good", "bad")); B.bars[i].classList.add("good"); info.innerHTML = `Gün ${i + 1}'de aldın (₺${p[i]}). Şimdi sat!`; return; }
        if (i <= buy) { info.innerHTML = "❗ Satış, alıştan SONRA olmalı. Tekrar al."; buy = -1; B.bars.forEach((b) => b.classList.remove("good")); return; }
        const profit = p[i] - p[buy];
        if (profit === best) { done = true; B.bars[buy].classList.add("good"); B.bars[i].classList.add("good"); info.innerHTML = `Kâr = ₺${p[i]} − ₺${p[buy]} = <b>₺${profit}</b> ✓ (en yüksek!)`; info.classList.add("hit"); solved(); }
        else { info.innerHTML = `Kâr = ₺${profit}. Daha iyisi var! En düşük günde alıp sonra zirvede sat.`; api.penalty(); B.bars[i].classList.add("bad"); setTimeout(() => { B.bars[i].classList.remove("bad"); }, 450); buy = -1; B.bars.forEach((b) => b.classList.remove("good")); }
      } });
      slot.appendChild(info);
      return { hint: () => { B.bars.forEach((b) => b.classList.remove("good", "sel")); B.bars[bi].classList.add("good"); B.bars[bj].classList.add("good"); info.innerHTML = `İpucu: Gün ${bi + 1}'de al (₺${p[bi]}), Gün ${bj + 1}'de sat (₺${p[bj]}) → kâr ₺${best}.`; } };
    });
  };

  /* 3) Maksimum Toplam — Kadane: bitişik aralık + negatifte sıfırla */
  R["arrays-3"] = (host, api) => {
    api.prompt("Yan yana (bitişik) barlardan bir aralık seç. Toplamı en büyük olan aralığı bul! <b>Kırmızı = eksi değer.</b>");
    runRounds(host, api, [5, 6, 7], (slot, n, solved) => {
      let v, best; do { v = Array.from({ length: n }, () => ri(-6, 8)); best = kadane(v); } while (best < 4);
      let s = -1, e = -1, done = false;
      const info = el("div", "sumread", "Başlangıç barını seç.");
      const B = bars(slot, v, { onClick: (i) => {
        if (done) return;
        if (s < 0 || e >= 0) { s = i; e = -1; } else { e = i; if (e < s) { const t = s; s = e; e = t; } }
        draw();
      } });
      slot.appendChild(info);
      function draw() {
        B.bars.forEach((b) => b.classList.remove("sel", "good"));
        if (s >= 0 && e < 0) { B.bars[s].classList.add("sel"); info.innerHTML = "Şimdi bitiş barını seç (sağda)."; return; }
        if (s >= 0 && e >= 0) {
          let t = 0; for (let k = s; k <= e; k++) { B.bars[k].classList.add("sel"); t += v[k]; }
          if (t === best) { done = true; for (let k = s; k <= e; k++) { B.bars[k].classList.remove("sel"); B.bars[k].classList.add("good"); } info.innerHTML = `Aralık toplamı = <b>${t}</b> ✓ (en büyük!)`; info.classList.add("hit"); solved(); }
          else { info.innerHTML = `Aralık toplamı = <b>${t}</b>. En iyi ${best}. (Negatif başlangıç toplamı düşürür!)`; }
        }
      }
      return { hint: () => { let bs = v[0], cur = v[0], tl = 0, bl = 0, br = 0; for (let i = 1; i < v.length; i++) { if (cur < 0) { cur = v[i]; tl = i; } else cur += v[i]; if (cur > bs) { bs = cur; bl = tl; br = i; } } B.bars.forEach((b) => b.classList.remove("sel", "good")); for (let k = bl; k <= br; k++) B.bars[k].classList.add("good"); info.innerHTML = `En iyi aralık: ${bl + 1}–${br + 1}, toplam ${bs}. Negatife düşünce baştan başla!`; s = -1; e = -1; } };
    });
  };

  /* 4) En Büyük Çarpım — canlı çarpım */
  R["arrays-4"] = (host, api) => {
    api.prompt("Çarpımı en büyük olan İKİ sayıyı seç. Seçtikçe çarpımı canlı göstereceğim.");
    runRounds(host, api, [6, 6, 7], (slot, n, solved) => {
      const nums = shuffle(distinct(n, 2, 15)); const top = [...nums].sort((a, b) => b - a); const bestP = top[0] * top[1];
      let sel = [], done = false, cs;
      const info = pill(slot, "İki sayı seç…");
      const update = () => {
        if (sel.length < 2) { info.innerHTML = sel.length === 1 ? `Seçtin <b>${nums[sel[0]]}</b>. Bir tane daha!` : "İki sayı seç…"; info.classList.remove("hit"); return; }
        const pr = nums[sel[0]] * nums[sel[1]];
        if (pr === bestP) { done = true; sel.forEach((i) => cs[i].classList.add("good")); info.innerHTML = `${nums[sel[0]]} × ${nums[sel[1]]} = <b>${pr}</b> ✓`; info.classList.add("hit"); solved(); }
        else { info.innerHTML = `${nums[sel[0]]} × ${nums[sel[1]]} = <b>${pr}</b>. Daha büyüğü var! (en büyük iki sayı)`; api.penalty(); const b = sel.slice(); sel = []; b.forEach((i) => { cs[i].classList.remove("sel"); cs[i].classList.add("bad"); setTimeout(() => cs[i].classList.remove("bad"), 450); }); }
      };
      cs = cards(slot, nums, { onClick: (i) => { if (done) return; const p = sel.indexOf(i); if (p >= 0) { sel.splice(p, 1); cs[i].classList.remove("sel"); } else { if (sel.length >= 2) return; sel.push(i); cs[i].classList.add("sel"); } update(); } });
      slot.appendChild(info);
      return { hint: () => { const idx = nums.map((x, i) => [x, i]).sort((a, b) => b[0] - a[0]); cs.forEach((c) => c.classList.remove("sel", "good")); cs[idx[0][1]].classList.add("good"); cs[idx[1][1]].classList.add("good"); info.innerHTML = `İpucu: en büyük iki sayı ${idx[0][0]} ve ${idx[1][0]} → ${bestP}.`; } };
    });
  };

  /* 5) Eksik Sayı — toplam hilesi */
  R["arrays-5"] = (host, api) => {
    api.prompt("0'dan n'e kadar sayılardan biri kayıp! <b>Toplam hilesi</b> ile bul: beklenen toplam − var olan toplam = eksik.");
    runRounds(host, api, [6, 7, 8], (slot, n, solved) => {
      const miss = ri(1, n - 1); const present = shuffle([...Array(n + 1).keys()].filter((x) => x !== miss));
      const expected = (n * (n + 1)) / 2, got = sum(present);
      cards(slot, present);
      const info = pill(slot, `Beklenen toplam (0..${n}) = ${expected}. Buradakilerin toplamı = ${got}.`);
      let done = false; const row = el("div", "chips");
      for (let k = 0; k <= n; k++) { const ch = el("div", "chip2", String(k)); ch.onclick = () => { if (done) return; if (k === miss) { done = true; ch.classList.add("good"); info.innerHTML = `Eksik = ${expected} − ${got} = <b>${miss}</b> ✓`; info.classList.add("hit"); solved(); } else { ch.classList.add("bad"); api.penalty(); setTimeout(() => ch.classList.remove("bad"), 450); } }; row.appendChild(ch); }
      slot.appendChild(row);
      return { hint: () => { info.innerHTML = `İpucu: ${expected} − ${got} = <b>${expected - got}</b> → işte eksik sayı!`; } };
    });
  };

  /* 6) Zirve Noktası — komşularla kıyas */
  R["arrays-6"] = (host, api) => {
    api.prompt("Her İKİ komşusundan da BÜYÜK olan bir barı bul (zirve). Üzerine gelince komşuları belireceğim.");
    runRounds(host, api, [6, 7, 8], (slot, n, solved) => {
      const v = Array.from({ length: n }, () => ri(1, 20));
      const isPeak = (i) => (i === 0 || v[i] > v[i - 1]) && (i === n - 1 || v[i] > v[i + 1]);
      let done = false;
      const info = el("div", "sumread", "Bir zirve seç.");
      const B = bars(slot, v, {
        onHover: (i) => { B.bars.forEach((b) => b.classList.remove("dim")); if (i < 0) return; B.bars.forEach((b, k) => { if (k !== i && k !== i - 1 && k !== i + 1) b.classList.add("dim"); }); },
        onClick: (i) => { if (done) return; if (isPeak(i)) { done = true; B.bars.forEach((b) => b.classList.remove("dim")); B.bars[i].classList.add("good"); info.innerHTML = `${v[i]} her iki komşusundan büyük → zirve ✓`; info.classList.add("hit"); solved(); } else { const big = (i > 0 && v[i - 1] >= v[i]) ? i - 1 : i + 1; B.bars[i].classList.add("bad"); B.bars[big].classList.add("sel"); api.penalty(); info.innerHTML = `${v[i]} zirve değil — komşu ${v[big]} daha büyük.`; setTimeout(() => { B.bars[i].classList.remove("bad"); B.bars[big].classList.remove("sel"); }, 700); } },
      });
      slot.appendChild(info);
      return { hint: () => { for (let i = 0; i < n; i++) if (isPeak(i)) { B.bars.forEach((b) => b.classList.remove("dim", "sel")); B.bars[i].classList.add("good"); info.innerHTML = `İpucu: ${v[i]} bir zirve (komşuları daha küçük).`; return; } } };
    });
  };

  /* 7) Denge Noktası — ön-toplam (prefix sum) */
  R["arrays-7"] = (host, api) => {
    api.prompt("Öyle bir bar bul ki <b>solundaki toplam = sağındaki toplam</b> olsun. Üzerine gelince iki tarafı tartacağım.");
    runRounds(host, api, [5, 5, 6], (slot, n, solved) => {
      let v, piv; do { v = Array.from({ length: n }, () => ri(1, 6)); piv = -1; for (let i = 0; i < n; i++) if (sum(v.slice(0, i)) === sum(v.slice(i + 1))) { piv = i; break; } } while (piv < 0);
      let done = false;
      const scale = el("div", "scale-read", `<span class="L">Sol: ?</span><span>⚖️</span><span class="R">Sağ: ?</span>`); slot.appendChild(scale);
      const info = el("div", "sumread", "Bir bar seç.");
      const setScale = (i) => { if (i < 0) { scale.innerHTML = `<span class="L">Sol: ?</span><span>⚖️</span><span class="R">Sağ: ?</span>`; return; } const L = sum(v.slice(0, i)), Rr = sum(v.slice(i + 1)); scale.innerHTML = `<span class="L">Sol: ${L}</span><span>${L === Rr ? "⚖️✓" : L > Rr ? "⬅️" : "➡️"}</span><span class="R">Sağ: ${Rr}</span>`; };
      const B = bars(slot, v, {
        onHover: setScale,
        onClick: (i) => { if (done) return; const L = sum(v.slice(0, i)), Rr = sum(v.slice(i + 1)); if (L === Rr) { done = true; B.bars[i].classList.add("good"); setScale(i); info.innerHTML = `Sol ${L} = Sağ ${Rr} → denge ✓`; info.classList.add("hit"); solved(); } else { B.bars[i].classList.add("bad"); api.penalty(); info.innerHTML = `Sol ${L} ≠ Sağ ${Rr}. Dengeyi ara.`; setTimeout(() => B.bars[i].classList.remove("bad"), 450); } },
      });
      slot.appendChild(info);
      return { hint: () => { B.bars.forEach((b) => b.classList.remove("good")); B.bars[piv].classList.add("good"); setScale(piv); info.innerHTML = `İpucu: ${piv + 1}. bar dengede (sol toplam = sağ toplam).`; } };
    });
  };

  /* 8) Toplantı Çakışması — aralık çakışma kuralı */
  R["arrays-8"] = (host, api) => {
    api.prompt("İki toplantı zaman çizgisinde. <b>Çakışıyorlar mı?</b> Kural: biri bitmeden diğeri başlıyorsa çakışırlar.");
    runRounds(host, api, [0, 1, 2], (slot, lvl, solved) => {
      const MAX = 12; const a1 = ri(0, 5), a2 = a1 + ri(2, 4); const ov = Math.random() < 0.5;
      let b1, b2; if (ov) { b1 = ri(a1, a2 - 1); b2 = Math.min(MAX, b1 + ri(2, 4)); } else { b1 = a2 + ri(1, 2); b2 = Math.min(MAX, b1 + ri(1, 3)); }
      const yes = a1 < b2 && b1 < a2; let done = false;
      const tl = el("div", "tl");
      const mk = (s, e, top, color, label) => { const b = el("div", "tl-bar", label); b.style.left = (s / MAX * 100) + "%"; b.style.width = ((e - s) / MAX * 100) + "%"; b.style.top = top + "px"; b.style.background = color; tl.appendChild(b); };
      mk(a1, a2, 22, "linear-gradient(135deg,#0ea5e9,#0284c7)", "Toplantı 1");
      mk(b1, b2, 62, "linear-gradient(135deg,#ec4899,#db2777)", "Toplantı 2");
      for (let t = 0; t <= MAX; t += 2) { const tk = el("div", "tl-tick", t); tk.style.left = (t / MAX * 100) + "%"; tl.appendChild(tk); }
      slot.appendChild(tl);
      const info = el("div", "sumread", `T1 [${a1}–${a2}] , T2 [${b1}–${b2}]`); slot.appendChild(info);
      const showOverlap = () => { if (!yes) return; const os = Math.max(a1, b1), oe = Math.min(a2, b2); const ovd = el("div", "tl-overlap"); ovd.style.left = (os / MAX * 100) + "%"; ovd.style.width = ((oe - os) / MAX * 100) + "%"; tl.appendChild(ovd); };
      const ch = el("div", "choices"); ch.style.maxWidth = "360px";
      const opts = ["✅ Evet, çakışıyor", "❌ Hayır, çakışmıyor"].map((t, idx) => { const c = el("div", "choice", t); c.onclick = () => { if (done) return; const correct = (idx === 0) === yes; if (correct) { done = true; c.classList.add("ok"); showOverlap(); info.innerHTML = yes ? `Çakışıyor: ${a1}<${b2} ve ${b1}<${a2} ✓` : `Çakışmıyor: biri tamamen diğerinden önce ✓`; solved(); } else { c.classList.add("bad"); api.penalty(); showOverlap(); info.innerHTML = "Tekrar bak — taralı bölge çakışmayı gösterir."; } }; ch.appendChild(c); return c; });
      slot.appendChild(ch);
      return { hint: () => { showOverlap(); info.innerHTML = yes ? `İpucu: ${a1}<${b2} ve ${b1}<${a2} doğru → çakışır.` : `İpucu: T1, T2 başlamadan bitiyor → çakışmaz.`; } };
    });
  };

  /* 9) En Çok Su — genişlik × kısa çubuk */
  R["arrays-9"] = (host, api) => {
    api.prompt("İki çubuk seç; arasındaki su = <b>uzaklık × kısa çubuk</b>. En çok suyu tutan ikiliyi bul!");
    runRounds(host, api, [5, 6, 7], (slot, n, solved) => {
      const h = Array.from({ length: n }, () => ri(1, 9)); let best = 0, bi = 0, bj = 1;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const ar = (j - i) * Math.min(h[i], h[j]); if (ar > best) { best = ar; bi = i; bj = j; } }
      const maxH = Math.max(...h); const water = el("div", "water");
      const sticks = h.map((v, i) => { const s = el("div", "stick"); s.style.height = (v / maxH * 195 + 12) + "px"; s.innerHTML = `<span class="cap">${v}</span>`; s.onclick = () => pick(i); water.appendChild(s); return s; });
      const fill = el("div", "fill"); fill.style.width = "0"; water.appendChild(fill);
      slot.appendChild(water);
      const info = pill(slot, "İki çubuk seç…");
      let sel = [], done = false;
      function pick(i) { if (done) return; const p = sel.indexOf(i); if (p >= 0) { sel.splice(p, 1); sticks[i].classList.remove("sel"); } else { if (sel.length >= 2) { sel.forEach((k) => sticks[k].classList.remove("sel")); sel = []; fill.style.width = "0"; } sel.push(i); sticks[i].classList.add("sel"); } update(); }
      function update() {
        if (sel.length < 2) { info.innerHTML = sel.length === 1 ? "Bir çubuk daha seç." : "İki çubuk seç…"; fill.style.width = "0"; return; }
        const [i, j] = sel.slice().sort((a, b) => a - b); const lvl = Math.min(h[i], h[j]); const area = (j - i) * lvl;
        const left = sticks[i].offsetLeft, right = sticks[j].offsetLeft + sticks[j].offsetWidth;
        fill.style.left = left + "px"; fill.style.width = (right - left) + "px"; fill.style.height = (lvl / maxH * 195) + "px";
        if (area === best) { done = true; sticks[i].classList.add("sel"); sticks[j].classList.add("sel"); info.innerHTML = `Su = ${j - i} × ${lvl} = <b>${area}</b> ✓ (en çok!)`; info.classList.add("hit"); solved(); }
        else { info.innerHTML = `Su = ${j - i} × ${lvl} = <b>${area}</b>. Daha fazlası mümkün!`; }
      }
      return { hint: () => { sel = [bi, bj]; sticks.forEach((s) => s.classList.remove("sel")); update(); info.innerHTML = `İpucu: ${bi + 1}. ve ${bj + 1}. çubuk → su ${best}.`; } };
    });
  };

  /* base oyunları geçersiz kıl (metadata korunur, sadece setup değişir) */
  Object.keys(R).forEach((id) => { const g = window.AZ.GAMES.find((x) => x.id === id); if (g) { const render = R[id]; g.setup = () => ({ kind: "custom", render }); } });
})();
