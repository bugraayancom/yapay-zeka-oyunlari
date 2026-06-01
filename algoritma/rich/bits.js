/* Bit İşlemleri — ikili gösterim ile */
(function () {
  "use strict";
  const K = window.AZK; if (!K) return;
  const { ri, shuffle, distinct, el, runRounds, cards, btiles, pill } = K;
  const R = {};

  /* 1) Tek olan sayı (XOR) */
  R["bits-1"] = (host, api) => {
    api.prompt("Hepsini XOR'larsan çiftler yok olur, <b>tek kalan</b> görünür! Çiftsiz sayıyı bul.");
    runRounds(host, api, [5, 7, 7], (slot, n, solved) => {
      const pairs = distinct((n - 1) / 2 | 0, 1, 9); const single = distinct(1, 10, 20)[0]; const a = shuffle([...pairs, ...pairs, single]);
      const cnt = {}; a.forEach((x) => (cnt[x] = (cnt[x] || 0) + 1)); let done = false; const info = pill(slot, "Tek kalanı bul.");
      const cs = cards(slot, a, { onClick: (i) => { if (done) return; if (cnt[a[i]] === 1) { done = true; cs[i].classList.add("good"); info.innerHTML = `${a[i]} çiftsiz ✓ (a XOR a = 0)`; info.classList.add("hit"); solved(); } else { cs[i].classList.add("bad"); api.penalty(); setTimeout(() => cs[i].classList.remove("bad"), 450); } } });
      return { hint: () => { cs[a.findIndex((x) => cnt[x] === 1)].classList.add("sel"); info.innerHTML = "İpucu: sadece 1 kez geçen sayı."; } };
    });
  };

  /* 2) 1'leri say — ikili tıkla */
  R["bits-2"] = (host, api) => {
    api.prompt("Sayının ikili (binary) halindeki <b>1</b>'leri say. Doğru kutuları (1 olanları) seç!");
    runRounds(host, api, [0, 1, 2], (slot, lvl, solved) => {
      const num = ri(5, 60); const bin = num.toString(2).split("").map(Number); const ones = bin.filter((b) => b).length;
      pill(slot, `${num} = ikili gösterim:`);
      const got = new Set(); let done = false;
      const ts = btiles(slot, bin, { onClick: (i) => { if (done) return; if (got.has(i)) { got.delete(i); ts[i].classList.toggle("on", bin[i] === 1); } else { got.add(i); ts[i].classList.add("on"); } } });
      ts.forEach((t, i) => { t.classList.remove("on"); }); // başta hepsi gizli görünüm
      const info = pill(slot, `İçinde kaç tane 1 var? Onları seç.`);
      api.button("✅ Kontrol Et", "go", () => { if (done) return; const ok = got.size === ones && [...got].every((i) => bin[i] === 1); if (ok) { done = true; bin.forEach((b, i) => { if (b) ts[i].classList.add("on"); }); info.innerHTML = `${ones} tane 1 var ✓`; info.classList.add("hit"); solved(); } else { api.penalty(); info.innerHTML = "Tam değil — 1 olan kutuları seç."; } });
      return { hint: () => { bin.forEach((b, i) => ts[i].classList.toggle("on", b === 1)); got.clear(); bin.forEach((b, i) => { if (b) got.add(i); }); info.innerHTML = `İpucu: ${num} = ${num.toString(2)} → ${ones} tane 1.`; } };
    });
  };

  /* 3) İkinin kuvveti mi */
  R["bits-3"] = (host, api) => {
    api.prompt("2'nin kuvvetlerinin ikili halinde <b>tek bir 1</b> bulunur. Bu sayı 2'nin kuvveti mi?");
    runRounds(host, api, [0, 1, 2], (slot, lvl, solved) => {
      const pow = Math.random() < 0.5; const num = pow ? 2 ** ri(1, 6) : (() => { let x; do { x = ri(3, 60); } while ((x & (x - 1)) === 0); return x; })();
      const real = (num & (num - 1)) === 0;
      slot.appendChild(el("div", "visual", `${num} = <span class="tok hl">${num.toString(2)}</span> (ikili)`));
      let done = false; const ch = el("div", "choices"); ch.style.maxWidth = "340px";
      ["✅ Evet", "❌ Hayır"].forEach((t, idx) => { const c = el("div", "choice", t); c.onclick = () => { if (done) return; if ((idx === 0) === real) { done = true; c.classList.add("ok"); solved(); } else { c.classList.add("bad"); api.penalty(); } }; ch.appendChild(c); });
      slot.appendChild(ch);
      return { hint: () => { api.status(real ? "İpucu: ikili halinde tek bir 1 → 2'nin kuvveti." : "İpucu: birden fazla 1 var → 2'nin kuvveti değil.", "info"); } };
    });
  };

  K.override(R);
})();
