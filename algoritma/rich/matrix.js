/* Matrisler — spiral, kelime arama, köşegen */
(function () {
  "use strict";
  const K = window.AZK; if (!K) return;
  const { ri, el, runRounds, grid, pill } = K;
  const WORDS = ["KEDI", "ELMA", "OKUL", "GUNES", "DENIZ", "KALEM", "ARABA", "MARTI", "BALIK"];
  const R = {};

  function gridOrder(slot, Rn, Cn, label, correct, hint, api, solved, prompt) {
    let step = 0, done = false; const info = pill(slot, prompt || "Sırayla tıkla.");
    const cells = grid(slot, Rn, Cn, { cellLabel: label, onClick: (r, c, cell) => {
      if (done) return; const k = r + "," + c;
      if (k === correct[step]) { cell.classList.add("ok"); cell.appendChild(el("span", "order-tag", step + 1)); step++; if (step === correct.length) { done = true; info.innerHTML = "Sıra doğru ✓"; info.classList.add("hit"); solved(); } }
      else { cell.classList.add("bad"); api.penalty(); info.innerHTML = "Sıra yanlış! Baştan."; setTimeout(() => { Object.values(cells).forEach((c2) => { c2.classList.remove("ok", "bad"); const t = c2.querySelector(".order-tag"); if (t) t.remove(); }); step = 0; }, 500); }
    } });
    return { hint: () => { info.innerHTML = hint; } };
  }

  /* 1) Spiral okuma */
  R["matrix-1"] = (host, api) => {
    api.prompt("Sayıları <b>dıştan içe spiral</b> çizerek (sol üstten başla) sırayla tıkla.");
    runRounds(host, api, [0, 1, 2], (s, lvl, solved) => {
      const N = 3; const g = []; let k = 1; for (let r = 0; r < N; r++) { g.push([]); for (let c = 0; c < N; c++) g[r].push(k++); }
      const order = []; let top = 0, bot = N - 1, left = 0, right = N - 1;
      while (top <= bot && left <= right) {
        for (let c = left; c <= right; c++) order.push(top + "," + c); top++;
        for (let r = top; r <= bot; r++) order.push(r + "," + right); right--;
        if (top <= bot) { for (let c = right; c >= left; c--) order.push(bot + "," + c); bot--; }
        if (left <= right) { for (let r = bot; r >= top; r--) order.push(r + "," + left); left--; }
      }
      return gridOrder(s, N, N, (r, c) => g[r][c], order, "İpucu: dış çerçeveyi dolaş, içeri gir.", api, solved, "Spiral sırayla tıkla.");
    });
  };

  /* 2) Kelime arama */
  R["matrix-2"] = (host, api) => {
    api.prompt("Gizli kelimenin harflerini <b>sırayla</b> tıkla (düz bir çizgide gizli).");
    runRounds(host, api, [0, 1, 2], (s, lvl, solved) => {
      const N = 5; const pool = WORDS.filter((w) => w.length <= N); const w = pool[ri(0, pool.length - 1)];
      const g = Array.from({ length: N }, () => Array.from({ length: N }, () => "ABCÇDEFGHIİJKLMNOPRSTUÜVYZ"[ri(0, 24)]));
      const horiz = Math.random() < 0.5; const order = [];
      if (horiz) { const r = ri(0, N - 1), c0 = ri(0, N - w.length); for (let i = 0; i < w.length; i++) { g[r][c0 + i] = w[i]; order.push(r + "," + (c0 + i)); } }
      else { const c = ri(0, N - 1), r0 = ri(0, N - w.length); for (let i = 0; i < w.length; i++) { g[r0 + i][c] = w[i]; order.push((r0 + i) + "," + c); } }
      return gridOrder(s, N, N, (r, c) => g[r][c], order, `İpucu: "${w}" ${horiz ? "yatay" : "dikey"} gizli.`, api, solved, `"${w}" kelimesini sırayla tıkla.`);
    });
  };

  /* 3) Köşegen toplamı */
  R["matrix-3"] = (host, api) => {
    api.prompt("Sol üstten sağ alta inen <b>köşegendeki</b> sayıları topla.");
    runRounds(host, api, [0, 1, 2], (s, lvl, solved) => {
      const N = 3; const g = Array.from({ length: N }, () => Array.from({ length: N }, () => ri(1, 9))); let total = 0; for (let i = 0; i < N; i++) total += g[i][i];
      grid(s, N, N, { cellClass: (r, c) => (r === c ? "sel" : ""), cellLabel: (r, c) => g[r][c] });
      const info = pill(s, "Köşegen (sarı) toplamı?");
      const inp = el("input", "num-input"); inp.type = "number"; inp.placeholder = "?"; s.appendChild(inp);
      let done = false; const check = () => { if (done || inp.value === "") return; if (+inp.value === total) { done = true; info.innerHTML = `Köşegen toplamı ${total} ✓`; info.classList.add("hit"); solved(); } else api.penalty(); };
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); }); api.button("✅ Kontrol Et", "go", check);
      return { hint: () => { inp.value = total; info.innerHTML = `İpucu: satır=sütun hücreleri → ${total}.`; } };
    });
  };

  K.override(R);
})();
