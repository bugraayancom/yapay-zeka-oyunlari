/* Heap — en büyük/küçük K, medyan */
(function () {
  "use strict";
  const K = window.AZK; if (!K) return;
  const { ri, shuffle, distinct, el, runRounds, bars, pill } = K;
  const R = {};

  function topK(host, api, biggest) {
    runRounds(host, api, [6, 7, 8], (slot, n, solved) => {
      const v = shuffle(distinct(n, 1, 60)); const k = 3;
      const sorted = [...v].sort((a, b) => (biggest ? b - a : a - b)); const target = new Set(sorted.slice(0, k));
      const got = new Set(); let done = false;
      const info = pill(slot, `${k} tane seç.`);
      const B = bars(slot, v, { onClick: (i) => { if (done) return; if (got.has(i)) { got.delete(i); B.bars[i].classList.remove("sel"); } else { if (got.size >= k) return; got.add(i); B.bars[i].classList.add("sel"); } } });
      api.button("✅ Kontrol Et", "go", () => { if (done) return; const ok = got.size === k && [...got].every((i) => target.has(v[i])); if (ok) { done = true; [...got].forEach((i) => { B.bars[i].classList.remove("sel"); B.bars[i].classList.add("good"); }); info.innerHTML = "Doğru ✓"; info.classList.add("hit"); solved(); } else { api.penalty(); info.innerHTML = `En ${biggest ? "büyük" : "küçük"} 3'ü seç.`; } });
      return { hint: () => { B.bars.forEach((b, i) => b.classList.toggle("sel", target.has(v[i]))); got.clear(); v.forEach((x, i) => { if (target.has(x)) got.add(i); }); info.innerHTML = `İpucu: heap köke en ${biggest ? "büyüğü" : "küçüğü"} taşır.`; } };
    });
  }
  R["heap-1"] = (host, api) => { api.prompt("Boyutu K olan bir heap ile <b>en büyük 3</b> sayıyı seç (Top K)."); topK(host, api, true); };
  R["heap-2"] = (host, api) => { api.prompt("Min-heap ile <b>en küçük 3</b> sayıyı seç."); topK(host, api, false); };

  R["heap-3"] = (host, api) => {
    api.prompt("İki heap (büyük/küçük yarı) ile <b>medyanı</b> bul.");
    runRounds(host, api, [5, 7, 7], (slot, n, solved) => {
      const v = shuffle(distinct(n, 1, 40)); const med = [...v].sort((a, b) => a - b)[(n - 1) / 2 | 0]; let done = false;
      const info = pill(slot, "Ortancayı seç.");
      const B = bars(slot, v, { onClick: (i) => { if (done) return; if (v[i] === med) { done = true; B.bars[i].classList.add("good"); info.innerHTML = `${med} medyan ✓`; info.classList.add("hit"); solved(); } else { B.bars[i].classList.add("bad"); api.penalty(); setTimeout(() => B.bars[i].classList.remove("bad"), 450); } } });
      return { hint: () => { B.bars[v.indexOf(med)].classList.add("sel"); info.innerHTML = `İpucu: sırala, ortadaki ${med}.`; } };
    });
  };

  R["heap-4"] = (host, api) => {
    api.prompt("K boyutlu min-heap'in kökü <b>k'ıncı en büyüğü</b> verir.");
    runRounds(host, api, [6, 7, 8], (slot, n, solved) => {
      const v = shuffle(distinct(n, 1, 50)); const k = ri(2, 4); const t = [...v].sort((a, b) => b - a)[k - 1]; let done = false;
      pill(slot, `🎯 <b>${k}.</b> en büyük`); const info = pill(slot, "Seç.");
      const B = bars(slot, v, { onClick: (i) => { if (done) return; if (v[i] === t) { done = true; B.bars[i].classList.add("good"); info.innerHTML = `${t} → ${k}. en büyük ✓`; info.classList.add("hit"); solved(); } else { B.bars[i].classList.add("bad"); api.penalty(); setTimeout(() => B.bars[i].classList.remove("bad"), 450); } } });
      return { hint: () => { B.bars[v.indexOf(t)].classList.add("sel"); info.innerHTML = `İpucu: ${k}. en büyük = ${t}.`; } };
    });
  };

  K.override(R);
})();
