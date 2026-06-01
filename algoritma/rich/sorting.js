/* Sıralama — animasyonlu, etkileşimli sıralama oyunları */
(function () {
  "use strict";
  const K = window.AZK; if (!K) return;
  const { ri, shuffle, distinct, el, runRounds, bars, cards, pill } = K;
  const sortedAsc = (a) => a.every((v, i) => i === 0 || a[i - 1] <= v);
  const R = {};

  /* 1) Bubble — komşu takası */
  R["sorting-1"] = (host, api) => {
    api.prompt("Yan yana iki komşuyu tıklayarak <b>takasla</b>. Diziyi küçükten büyüğe sırala! (Bubble Sort böyle çalışır)");
    runRounds(host, api, [4, 5, 6], (slot, n, solved) => {
      let v = shuffle(distinct(n, 1, 30)); let sel = -1, done = false, swaps = 0;
      const wrap = el("div"); slot.appendChild(wrap);
      const info = pill(slot, "Sıralı değil. Komşuları takasla.");
      function draw() {
        wrap.innerHTML = "";
        const B = bars(wrap, v, { onClick: (i) => {
          if (done) return;
          if (sel < 0) { sel = i; B.bars[i].classList.add("sel"); }
          else if (sel === i) { sel = -1; B.bars[i].classList.remove("sel"); }
          else if (Math.abs(sel - i) === 1) { [v[sel], v[i]] = [v[i], v[sel]]; swaps++; sel = -1; if (sortedAsc(v)) { done = true; draw(); markDone(); } else draw(); }
          else { B.bars.forEach((b) => b.classList.remove("sel")); sel = i; B.bars[i].classList.add("sel"); }
        } });
        if (done) B.bars.forEach((b) => b.classList.add("good"));
      }
      function markDone() { info.innerHTML = `Sıralandı! ${swaps} takasta ✓`; info.classList.add("hit"); solved(); }
      draw();
      return { hint: () => { for (let i = 0; i < v.length - 1; i++) if (v[i] > v[i + 1]) { info.innerHTML = `İpucu: ${v[i]} > ${v[i + 1]} → bu komşuları takasla.`; return; } } };
    });
  };

  /* 2) Selection — en büyüğü seç, sona kilitle */
  R["sorting-2"] = (host, api) => {
    api.prompt("Her turda <b>kalanların en büyüğünü</b> seç; o sona kilitlenir. (Selection Sort)");
    runRounds(host, api, [5, 6, 7], (slot, n, solved) => {
      const v = shuffle(distinct(n, 1, 40)); const locked = new Set(); let done = false;
      const info = pill(slot, "Kalanların en büyüğüne tıkla.");
      const B = bars(slot, v, { onClick: (i) => {
        if (done || locked.has(i)) return;
        let mx = -Infinity; for (let k = 0; k < n; k++) if (!locked.has(k)) mx = Math.max(mx, v[k]);
        if (v[i] === mx) { locked.add(i); B.bars[i].classList.add("good"); if (locked.size === n) { done = true; info.innerHTML = "Hepsi sıralı ✓"; info.classList.add("hit"); solved(); } else info.innerHTML = `${v[i]} yerleşti. Sıradaki en büyüğü bul.`; }
        else { B.bars[i].classList.add("bad"); api.penalty(); info.innerHTML = `${v[i]} en büyük değil — daha büyüğü duruyor.`; setTimeout(() => B.bars[i].classList.remove("bad"), 450); }
      } });
      return { hint: () => { let mi = -1, mx = -Infinity; for (let k = 0; k < n; k++) if (!locked.has(k) && v[k] > mx) { mx = v[k]; mi = k; } if (mi >= 0) { B.bars[mi].classList.add("sel"); info.innerHTML = `İpucu: kalanların en büyüğü ${mx}.`; setTimeout(() => B.bars[mi].classList.remove("sel"), 900); } } };
    });
  };

  /* 3) En küçüğü seç */
  R["sorting-3"] = (host, api) => {
    api.prompt("Dizideki <b>en küçük</b> elemanı bul (Selection Sort'un tek adımı).");
    runRounds(host, api, [6, 7, 8], (slot, n, solved) => {
      const v = shuffle(distinct(n, 2, 50)); const mn = Math.min(...v); let done = false;
      const info = pill(slot, "En küçüğü seç.");
      const B = bars(slot, v, { onClick: (i) => { if (done) return; if (v[i] === mn) { done = true; B.bars[i].classList.add("good"); info.innerHTML = `${mn} en küçük ✓`; info.classList.add("hit"); solved(); } else { B.bars[i].classList.add("bad"); api.penalty(); setTimeout(() => B.bars[i].classList.remove("bad"), 450); } } });
      return { hint: () => { B.bars[v.indexOf(mn)].classList.add("sel"); info.innerHTML = `İpucu: en küçük ${mn}.`; } };
    });
  };

  /* 4) Insertion — doğru yere ekle */
  R["sorting-4"] = (host, api) => {
    api.prompt("Sıralı diziye yeni sayı geldi. <b>Hangi sayıdan hemen sonra</b> yerleşir? (en başa gelecekse 'BAŞA')");
    runRounds(host, api, [5, 6, 7], (slot, n, solved) => {
      const arr = distinct(n, 1, 30).sort((a, b) => a - b); const x = ri(1, 31);
      let after = -1; for (let i = 0; i < n; i++) if (arr[i] < x) after = i;
      pill(slot, `Yeni sayı: <b>${x}</b>`);
      let done = false;
      const wrap = el("div", "ncards");
      const head = el("div", "ncard fixed", "BAŞA"); head.style.fontSize = "1rem";
      head.onclick = () => pick(-1); wrap.appendChild(head);
      const cs = arr.map((val, i) => { const c = el("div", "ncard", String(val)); c.onclick = () => pick(i); wrap.appendChild(c); return c; });
      slot.appendChild(wrap);
      const info = pill(slot, "Yerini seç.");
      function pick(i) { if (done) return; if (i === after) { done = true; (i < 0 ? head : cs[i]).classList.add("good"); info.innerHTML = `${x} buraya kayar ✓`; info.classList.add("hit"); solved(); } else { (i < 0 ? head : cs[i]).classList.add("bad"); api.penalty(); setTimeout(() => (i < 0 ? head : cs[i]).classList.remove("bad"), 450); } }
      return { hint: () => { (after < 0 ? head : cs[after]).classList.add("sel"); info.innerHTML = after < 0 ? `İpucu: en küçük, başa.` : `İpucu: ${arr[after]}'dan sonra (kendinden küçük en büyük sayı).`; } };
    });
  };

  /* 5) Merge — iki sıralı listeyi birleştir */
  R["sorting-5"] = (host, api) => {
    api.prompt("İki sıralı listenin <b>başlarını</b> karşılaştır; <b>küçük olanı</b> tıkla, sonuca eklensin. (Merge adımı)");
    runRounds(host, api, [3, 4, 4], (slot, n, solved) => {
      const A = distinct(n, 1, 15).sort((a, b) => a - b), B = distinct(n, 1, 15).sort((a, b) => a - b);
      let ai = 0, bi = 0, done = false; const res = [];
      const rowA = el("div"), rowB = el("div"), out = pill(slot, "Sonuç: —");
      slot.insertBefore(el("div", null, "<b>A listesi</b>"), out); slot.insertBefore(rowA, out);
      slot.insertBefore(el("div", null, "<b>B listesi</b>"), out); slot.insertBefore(rowB, out);
      const info = el("div", "sumread", "Küçük başı seç."); slot.appendChild(info);
      let csA, csB;
      function draw() {
        rowA.innerHTML = ""; rowB.innerHTML = "";
        csA = cards(rowA, A, { onClick: (i) => pick("A", i) }); csB = cards(rowB, B, { onClick: (i) => pick("B", i) });
        A.forEach((_, i) => { if (i < ai) csA[i].classList.add("dim"); }); B.forEach((_, i) => { if (i < bi) csB[i].classList.add("dim"); });
        if (ai < A.length) csA[ai].classList.add("sel"); if (bi < B.length) csB[bi].classList.add("sel");
        out.innerHTML = "Sonuç: " + (res.length ? res.join(" ") : "—");
      }
      function pick(which, i) {
        if (done) return;
        const expectFromA = bi >= B.length || (ai < A.length && A[ai] <= B[bi]);
        const ok = (which === "A" && i === ai && expectFromA) || (which === "B" && i === bi && !expectFromA);
        if (!ok) { (which === "A" ? csA[i] : csB[i]).classList.add("bad"); api.penalty(); info.innerHTML = "Daha küçük baş diğer listede!"; setTimeout(draw, 450); return; }
        if (which === "A") { res.push(A[ai]); ai++; } else { res.push(B[bi]); bi++; }
        if (ai >= A.length && bi >= B.length) { done = true; draw(); out.classList.add("hit"); info.innerHTML = "Birleştirildi ✓"; solved(); } else draw();
      }
      draw();
      return { hint: () => { const fromA = bi >= B.length || (ai < A.length && A[ai] <= B[bi]); info.innerHTML = fromA ? `İpucu: A'nın başı (${A[ai]}) daha küçük/eşit.` : `İpucu: B'nin başı (${B[bi]}) daha küçük.`; } };
    });
  };

  /* 6) K'ıncı en büyük */
  R["sorting-6"] = (host, api) => {
    api.prompt("Baştan <b>k'ıncı en büyük</b> sayıyı bul.");
    runRounds(host, api, [6, 7, 8], (slot, n, solved) => {
      const v = shuffle(distinct(n, 1, 50)); const k = ri(2, 4); const t = [...v].sort((a, b) => b - a)[k - 1]; let done = false;
      pill(slot, `🎯 <b>${k}.</b> en büyüğü bul`);
      const info = pill(slot, "Seç.");
      const B = bars(slot, v, { onClick: (i) => { if (done) return; if (v[i] === t) { done = true; B.bars[i].classList.add("good"); info.innerHTML = `${t} → ${k}. en büyük ✓`; info.classList.add("hit"); solved(); } else { B.bars[i].classList.add("bad"); api.penalty(); setTimeout(() => B.bars[i].classList.remove("bad"), 450); } } });
      return { hint: () => { B.bars[v.indexOf(t)].classList.add("sel"); info.innerHTML = `İpucu: ${k}. en büyük = ${t}.`; } };
    });
  };

  /* 7) Renk sıralama (Dutch flag) */
  R["sorting-7"] = (host, api) => {
    api.prompt("Topları sırayla tıkla: önce TÜM 🔴, sonra ⚪, sonra 🔵. (Dutch Flag — 3 gruplu sıralama)");
    runRounds(host, api, [6, 7, 8], (slot, n, solved) => {
      const emo = ["🔴", "⚪", "🔵"]; const v = Array.from({ length: n }, () => ri(0, 2)); let stage = 0, done = 0, total = n;
      const counts = [0, 1, 2].map((g) => v.filter((x) => x === g).length);
      const info = pill(slot, "Önce tüm kırmızıları tıkla.");
      const cs = cards(slot, v.map((x) => emo[x]), { onClick: (i) => {
        if (cs[i].classList.contains("good")) return;
        if (v[i] === stage) { cs[i].classList.add("good"); done++; if (done === total) { info.innerHTML = "Kırmızı→Beyaz→Mavi sıralandı ✓"; info.classList.add("hit"); solved(); return; } while (stage < 2 && cs.filter((c, k) => v[k] === stage && c.classList.contains("good")).length === counts[stage]) { stage++; } info.innerHTML = `Şimdi: ${emo[stage]}`; }
        else { cs[i].classList.add("bad"); api.penalty(); info.innerHTML = `Önce ${emo[stage]} bitir!`; setTimeout(() => cs[i].classList.remove("bad"), 450); }
      } });
      return { hint: () => { const i = v.findIndex((x, k) => x === stage && !cs[k].classList.contains("good")); if (i >= 0) { cs[i].classList.add("sel"); setTimeout(() => cs[i].classList.remove("sel"), 800); } info.innerHTML = `İpucu: sıradaki grup ${emo[stage]}.`; } };
    });
  };

  /* 8) Medyan */
  R["sorting-8"] = (host, api) => {
    api.prompt("Sıralandığında <b>tam ortada</b> kalan sayıyı bul (medyan).");
    runRounds(host, api, [5, 7, 7], (slot, n, solved) => {
      const v = shuffle(distinct(n, 1, 40)); const med = [...v].sort((a, b) => a - b)[(n - 1) / 2 | 0]; let done = false;
      const info = pill(slot, "Ortancayı seç.");
      const B = bars(slot, v, { onClick: (i) => { if (done) return; if (v[i] === med) { done = true; B.bars[i].classList.add("good"); info.innerHTML = `${med} ortanca ✓`; info.classList.add("hit"); solved(); } else { B.bars[i].classList.add("bad"); api.penalty(); setTimeout(() => B.bars[i].classList.remove("bad"), 450); } } });
      return { hint: () => { B.bars[v.indexOf(med)].classList.add("sel"); info.innerHTML = `İpucu: sırala, ortadaki ${med}.`; } };
    });
  };

  /* 9) Pivot bölme (quicksort partition) */
  R["sorting-9"] = (host, api) => {
    api.prompt("Pivot (sarı) seçildi. Ondan <b>KÜÇÜK</b> olan TÜM sayıları seç — onlar sola gider. (Quick Sort bölme)");
    runRounds(host, api, [6, 7, 8], (slot, n, solved) => {
      const v = shuffle(distinct(n, 1, 30)); const pi = ri(0, n - 1); const piv = v[pi];
      const small = v.map((x, i) => (i !== pi && x < piv ? i : -1)).filter((x) => x >= 0);
      const got = new Set(); let done = false;
      const info = pill(slot, `Pivot = ${piv}. Küçükleri seç.`);
      const B = bars(slot, v, { onClick: (i) => {
        if (done || i === pi) return;
        if (got.has(i)) { got.delete(i); B.bars[i].classList.remove("sel"); } else { got.add(i); B.bars[i].classList.add("sel"); }
      } });
      B.bars[pi].classList.add("hl"); B.bars[pi].style.background = "linear-gradient(180deg,#fb923c,#ea580c)";
      api.button("✅ Kontrol Et", "go", () => {
        if (done) return;
        const ok = got.size === small.length && [...got].every((i) => v[i] < piv);
        if (ok) { done = true; small.forEach((i) => { B.bars[i].classList.remove("sel"); B.bars[i].classList.add("good"); }); info.innerHTML = "Küçükler doğru ayrıldı ✓"; info.classList.add("hit"); solved(); }
        else { api.penalty(); info.innerHTML = "Tam değil — pivottan küçük olan herkesi seç."; }
      });
      return { hint: () => { B.bars.forEach((b, i) => b.classList.toggle("sel", small.includes(i))); got.clear(); small.forEach((i) => got.add(i)); info.innerHTML = `İpucu: ${piv}'dan küçükler işaretlendi.`; } };
    });
  };

  K.override(R);
})();
