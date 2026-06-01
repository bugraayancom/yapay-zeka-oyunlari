/* Ağaç Oyunları — SVG ağaç + tıklanabilir düğümler */
(function () {
  "use strict";
  const K = window.AZK; if (!K) return;
  const { ri, distinct, el, runRounds, treeSVG, pill, preorder, inorder, levelorder, tdepth, leaves, tsum, tcount, lcaIdx, bst7, fullTree } = K;
  const R = {};

  function makeTree() {
    const n = [ri(1, 9), ri(1, 9), ri(1, 9), null, null, null, null];
    [1, 2].forEach((p) => { if (Math.random() < 0.85) n[2 * p + 1] = ri(1, 9); if (Math.random() < 0.85) n[2 * p + 2] = ri(1, 9); });
    return n;
  }
  function numTree(slot, nodes, ans, prompt, hint, api, solved, hl) {
    let info; treeSVG(slot, nodes, { highlight: hl });
    info = pill(slot, prompt);
    const inp = el("input", "num-input"); inp.type = "number"; inp.placeholder = "?"; slot.appendChild(inp);
    let done = false; const check = () => { if (done || inp.value === "") return; if (+inp.value === ans) { done = true; info.innerHTML = "Doğru ✓"; info.classList.add("hit"); solved(); } else api.penalty(); };
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); }); api.button("✅ Kontrol Et", "go", check);
    return { hint: () => { inp.value = ans; info.innerHTML = hint; } };
  }
  function pickTree(slot, nodes, ok, hintIdx, hint, api, solved, hl) {
    let done = false, info;
    const map = treeSVG(slot, nodes, { highlight: hl, onClick: (i, g) => { if (done) return; if (ok(i)) { done = true; g.classList.add("ok"); info.innerHTML = "Doğru ✓"; info.classList.add("hit"); solved(); } else { g.classList.add("bad"); api.penalty(); setTimeout(() => g.classList.remove("bad"), 450); } } });
    info = pill(slot, "Bir düğüme tıkla.");
    return { hint: () => { if (map[hintIdx]) map[hintIdx].classList.add("sel"); info.innerHTML = hint; } };
  }
  function orderTree(slot, nodes, correct, hint, api, solved) {
    let step = 0, done = false, info;
    const map = treeSVG(slot, nodes, { onClick: (i, g) => {
      if (done) return;
      if (i === correct[step]) { g.classList.add("ok"); step++; if (step === correct.length) { done = true; info.innerHTML = "Sıra doğru ✓"; info.classList.add("hit"); solved(); } }
      else { g.classList.add("bad"); api.penalty(); info.innerHTML = "Sıra yanlış! Baştan."; setTimeout(() => { correct.forEach((j) => map[j] && map[j].classList.remove("ok", "bad")); map[i].classList.remove("bad"); step = 0; }, 500); }
    } });
    info = pill(slot, "Sırayla düğümlere tıkla.");
    return { hint: () => { info.innerHTML = hint; } };
  }

  R["tree-1"] = (h, api) => { api.prompt("Ağaç kaç <b>kat</b> (derinlik)? Kök 1. kat, her iniş +1."); runRounds(h, api, [0, 1, 2], (s, l, d) => { const n = makeTree(); return numTree(s, n, tdepth(n, 0), "Kaç kat derin?", `İpucu: en uzun dal ${tdepth(n, 0)} kat.`, api, d); }); };
  R["tree-2"] = (h, api) => { api.prompt("Ağaçta toplam kaç <b>düğüm</b> var?"); runRounds(h, api, [0, 1, 2], (s, l, d) => { const n = makeTree(); return numTree(s, n, tcount(n), "Kaç düğüm?", `İpucu: toplam ${tcount(n)} düğüm.`, api, d); }); };
  R["tree-3"] = (h, api) => { api.prompt("Çocuğu olmayan (<b>yaprak</b>) düğümleri say."); runRounds(h, api, [0, 1, 2], (s, l, d) => { const n = makeTree(); return numTree(s, n, leaves(n).length, "Kaç yaprak?", `İpucu: ${leaves(n).length} yaprak.`, api, d, leaves(n)); }); };
  R["tree-4"] = (h, api) => { api.prompt("Tüm düğümlerdeki sayıların <b>toplamı</b> kaç?"); runRounds(h, api, [0, 1, 2], (s, l, d) => { const n = makeTree(); return numTree(s, n, tsum(n), "Toplam?", `İpucu: hepsini topla = ${tsum(n)}.`, api, d); }); };
  R["tree-5"] = (h, api) => { api.prompt("<b>En büyük</b> değerli düğüme tıkla."); runRounds(h, api, [0, 1, 2], (s, l, d) => { const n = fullTree(); const mx = Math.max(...n); return pickTree(s, n, (i) => n[i] === mx, n.indexOf(mx), `İpucu: en büyük ${mx}.`, api, d); }); };
  R["tree-6"] = (h, api) => { api.prompt("<b>En küçük</b> değerli düğüme tıkla."); runRounds(h, api, [0, 1, 2], (s, l, d) => { const n = fullTree(); const mn = Math.min(...n); return pickTree(s, n, (i) => n[i] === mn, n.indexOf(mn), `İpucu: en küçük ${mn}.`, api, d); }); };
  R["tree-7"] = (h, api) => { api.prompt("<b>Seviye sıralı</b> gezinti (BFS): yukarıdan aşağı, her katı soldan sağa tıkla."); runRounds(h, api, [0, 1, 2], (s, l, d) => { const n = fullTree(); return orderTree(s, n, levelorder(n), "İpucu: kuyruk kullan — kökten başla, çocukları sona ekle.", api, d); }); };
  R["tree-8"] = (h, api) => { api.prompt("<b>İçten gezinti</b> (inorder): SOL → KÖK → SAĞ."); runRounds(h, api, [0, 1, 2], (s, l, d) => { const n = fullTree(); const o = []; inorder(n, 0, o); return orderTree(s, n, o, "İpucu: önce tüm sol, sonra düğüm, sonra sağ.", api, d); }); };
  R["tree-9"] = (h, api) => { api.prompt("<b>Önden gezinti</b> (preorder): KÖK → SOL → SAĞ."); runRounds(h, api, [0, 1, 2], (s, l, d) => { const n = fullTree(); const o = []; preorder(n, 0, o); return orderTree(s, n, o, "İpucu: önce düğüm, sonra sol, sonra sağ alt ağaç.", api, d); }); };
  R["tree-10"] = (h, api) => { api.prompt("Bu bir arama ağacı (BST). <b>K'ıncı en küçük</b> değere tıkla."); runRounds(h, api, [0, 1, 2], (s, l, d) => { const { nodes, sorted, pos } = bst7(); const k = ri(2, 5); const idx = pos[k - 1]; api.status(`${k}. en küçük`, "info"); return pickTree(s, nodes, (i) => i === idx, idx, `İpucu: içten gezinti sıralı verir; ${k}. = ${sorted[k - 1]}.`, api, d); }); };
  R["tree-11"] = (h, api) => { api.prompt("İki <b>turuncu</b> düğümün <b>en yakın ortak atasına</b> tıkla."); runRounds(h, api, [0, 1, 2], (s, l, d) => { const n = fullTree(); const lv = leaves(n); const a = lv[0], b = lv[lv.length - 1]; const lca = lcaIdx(a, b); return pickTree(s, n, (i) => i === lca, lca, "İpucu: iki düğümden yukarı çık, ilk birleştikleri düğüm.", api, d, [a, b]); }); };
  R["tree-12"] = (h, api) => {
    api.prompt("Geçerli BST mi? Her düğümde <b>sol < kök < sağ</b> olmalı.");
    runRounds(h, api, [0, 1, 2], (s, lvl, solved) => {
      const { nodes } = bst7(); const valid = Math.random() < 0.5; const n = nodes.slice();
      if (!valid) { const i = ri(0, 2), j = ri(3, 6);[n[i], n[j]] = [n[j], n[i]]; }
      const ok = (i, lo, hi) => { if (i >= n.length || n[i] == null) return true; if (n[i] <= lo || n[i] >= hi) return false; return ok(2 * i + 1, lo, n[i]) && ok(2 * i + 2, n[i], hi); };
      const real = ok(0, -Infinity, Infinity);
      treeSVG(s, n); let done = false; const ch = el("div", "choices"); ch.style.maxWidth = "340px";
      ["✅ Geçerli BST", "❌ Kural bozuk"].forEach((t, idx) => { const c = el("div", "choice", t); c.onclick = () => { if (done) return; if ((idx === 0) === real) { done = true; c.classList.add("ok"); solved(); } else { c.classList.add("bad"); api.penalty(); } }; ch.appendChild(c); });
      s.appendChild(ch);
      return { hint: () => api.status(real ? "İpucu: her düğümde sol küçük, sağ büyük → geçerli." : "İpucu: bir düğümde kural bozuk → geçersiz.", "info") };
    });
  };

  K.override(R);
})();
