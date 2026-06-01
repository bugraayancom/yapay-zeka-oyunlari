/* Bağlı Listeler — zincir görseliyle */
(function () {
  "use strict";
  const K = window.AZK; if (!K) return;
  const { ri, shuffle, distinct, el, runRounds, chain, cards, pill } = K;
  const R = {};

  /* 1) Ters çevir — sondan başa */
  R["linked-1"] = (host, api) => {
    api.prompt("Bağlı listeyi ters çevir: düğümleri <b>sondan başa</b> sırayla tıkla (okların yönünü çevir).");
    runRounds(host, api, [4, 5, 6], (slot, n, solved) => {
      const v = distinct(n, 1, 20); const correct = v.map((_, i) => n - 1 - i); let step = 0, done = false;
      const info = pill(slot, "Son düğümden başla.");
      const ns = chain(slot, v, { tail: "∅", onClick: (i) => {
        if (done) return;
        if (i === correct[step]) { ns[i].classList.add("good"); ns[i].appendChild(el("span", "order-tag", step + 1)); step++; if (step === n) { done = true; info.innerHTML = "Liste ters çevrildi ✓"; info.classList.add("hit"); solved(); } }
        else { ns[i].classList.add("bad"); api.penalty(); info.innerHTML = "Sıra yanlış! Sondan başa."; setTimeout(() => { ns.forEach((x) => { x.classList.remove("good", "bad"); const t = x.querySelector(".order-tag"); if (t) t.remove(); }); step = 0; }, 500); }
      } });
      return { hint: () => { info.innerHTML = `İpucu: önce son düğüm (${v[n - 1]}).`; } };
    });
  };

  /* 2) Orta düğüm */
  R["linked-2"] = (host, api) => {
    api.prompt("Listenin <b>tam ortasındaki</b> düğümü bul (yavaş/hızlı işaretçi).");
    runRounds(host, api, [5, 6, 7], (slot, n, solved) => {
      const v = distinct(n, 1, 20); const mid = Math.floor(n / 2); let done = false;
      const info = pill(slot, "Ortadaki düğüme tıkla.");
      const ns = chain(slot, v, { tail: "∅", onClick: (i) => { if (done) return; if (i === mid) { done = true; ns[i].classList.add("good"); info.innerHTML = `Orta düğüm: ${v[mid]} ✓`; info.classList.add("hit"); solved(); } else { ns[i].classList.add("bad"); api.penalty(); setTimeout(() => ns[i].classList.remove("bad"), 450); } } });
      return { hint: () => { ns[mid].classList.add("sel"); info.innerHTML = "İpucu: biri 1, biri 2 adım gider; hızlı bitince yavaş ortadadır."; } };
    });
  };

  /* 3) İki listeyi birleştir */
  R["linked-3"] = (host, api) => {
    api.prompt("İki sıralı listenin başlarını karşılaştır; <b>küçük olanı</b> tıkla, birleşik listeye eklensin.");
    runRounds(host, api, [3, 4, 4], (slot, n, solved) => {
      const A = distinct(n, 1, 14).sort((a, b) => a - b), B = distinct(n, 1, 14).sort((a, b) => a - b);
      let ai = 0, bi = 0, done = false; const res = [];
      const out = pill(slot, "Birleşik: —");
      slot.insertBefore(el("div", null, "<div style='text-align:center'><b>Liste A</b></div>"), out); const rowA = el("div"); slot.insertBefore(rowA, out);
      slot.insertBefore(el("div", null, "<div style='text-align:center'><b>Liste B</b></div>"), out); const rowB = el("div"); slot.insertBefore(rowB, out);
      const info = el("div", "sumread", "Küçük başı seç."); slot.appendChild(info);
      let nA, nB;
      function draw() {
        rowA.innerHTML = ""; rowB.innerHTML = "";
        nA = chain(rowA, A, { tail: "∅", onClick: (i) => pick("A", i) }); nB = chain(rowB, B, { tail: "∅", onClick: (i) => pick("B", i) });
        A.forEach((_, i) => { if (i < ai) nA[i].classList.add("dim"); }); B.forEach((_, i) => { if (i < bi) nB[i].classList.add("dim"); });
        if (ai < A.length) nA[ai].classList.add("sel"); if (bi < B.length) nB[bi].classList.add("sel");
        out.innerHTML = "Birleşik: " + (res.length ? res.join(" → ") : "—");
      }
      function pick(w, i) {
        if (done) return; const fromA = bi >= B.length || (ai < A.length && A[ai] <= B[bi]);
        const ok = (w === "A" && i === ai && fromA) || (w === "B" && i === bi && !fromA);
        if (!ok) { (w === "A" ? nA[i] : nB[i]).classList.add("bad"); api.penalty(); info.innerHTML = "Diğer listenin başı daha küçük!"; setTimeout(draw, 450); return; }
        if (w === "A") { res.push(A[ai]); ai++; } else { res.push(B[bi]); bi++; }
        if (ai >= A.length && bi >= B.length) { done = true; draw(); out.classList.add("hit"); info.innerHTML = "Birleştirildi ✓"; solved(); } else draw();
      }
      draw();
      return { hint: () => { const fromA = bi >= B.length || (ai < A.length && A[ai] <= B[bi]); info.innerHTML = fromA ? `İpucu: A başı ${A[ai]} küçük/eşit.` : `İpucu: B başı ${B[bi]} küçük.`; } };
    });
  };

  /* 4) Sondan n'inci */
  R["linked-4"] = (host, api) => {
    api.prompt("<b>Sondan</b> sayınca n'inci düğümü bul (iki işaretçi arası n boşluk).");
    runRounds(host, api, [5, 6, 7], (slot, n, solved) => {
      const v = distinct(n, 1, 20); const k = ri(1, n); const idx = n - k; let done = false;
      pill(slot, `Sondan <b>${k}.</b> düğüm`);
      const info = pill(slot, "Seç.");
      const ns = chain(slot, v, { tail: "∅", onClick: (i) => { if (done) return; if (i === idx) { done = true; ns[i].classList.add("good"); info.innerHTML = `Sondan ${k}.: ${v[idx]} ✓`; info.classList.add("hit"); solved(); } else { ns[i].classList.add("bad"); api.penalty(); setTimeout(() => ns[i].classList.remove("bad"), 450); } } });
      return { hint: () => { ns[idx].classList.add("sel"); info.innerHTML = `İpucu: baştan ${idx + 1}. düğüm = sondan ${k}.`; } };
    });
  };

  /* 5) Döngü var mı */
  R["linked-5"] = (host, api) => {
    api.prompt("Son düğüm bir öncekine geri dönüyorsa <b>döngü</b> vardır. Var mı?");
    runRounds(host, api, [0, 1, 2], (slot, lvl, solved) => {
      const v = distinct(5, 1, 20); const cyc = Math.random() < 0.5; const back = ri(1, 3);
      const ns = chain(slot, v, { tail: cyc ? "↩" : "∅" });
      const info = pill(slot, cyc ? `Son düğüm → ${v[v.length - back]}'e geri dönüyor` : "Son düğüm → ∅ (boş)");
      if (cyc) ns[v.length - back].classList.add("sel");
      let done = false; const ch = el("div", "choices"); ch.style.maxWidth = "340px";
      ["✅ Döngü var", "❌ Düz biter"].forEach((t, idx) => { const c = el("div", "choice", t); c.onclick = () => { if (done) return; if ((idx === 0) === cyc) { done = true; c.classList.add("ok"); solved(); } else { c.classList.add("bad"); api.penalty(); } }; ch.appendChild(c); });
      slot.appendChild(ch);
      return { hint: () => { info.innerHTML = cyc ? "İpucu: ok geriye dönüyor → döngü." : "İpucu: ∅ ile bitiyor → döngü yok."; } };
    });
  };

  /* 6) Palindrom mu */
  R["linked-6"] = (host, api) => {
    api.prompt("Liste baştan ve sondan aynı mı (palindrom)?");
    runRounds(host, api, [0, 1, 2], (slot, lvl, solved) => {
      const half = [ri(1, 5), ri(1, 5)]; const pal = Math.random() < 0.5;
      const v = pal ? [...half, ri(1, 5), ...half.slice().reverse()] : [...half, ri(1, 5), ri(1, 5), ri(1, 5)];
      const real = v.join() === v.slice().reverse().join();
      chain(slot, v, { tail: "∅" });
      const info = pill(slot, `Tersi: ${v.slice().reverse().join(" → ")}`);
      let done = false; const ch = el("div", "choices"); ch.style.maxWidth = "340px";
      ["✅ Palindrom", "❌ Değil"].forEach((t, idx) => { const c = el("div", "choice", t); c.onclick = () => { if (done) return; if ((idx === 0) === real) { done = true; c.classList.add("ok"); solved(); } else { c.classList.add("bad"); api.penalty(); } }; ch.appendChild(c); });
      slot.appendChild(ch);
      return { hint: () => { info.innerHTML = real ? "İpucu: baştan ve sondan aynı." : "İpucu: baştan ve sondan farklı."; } };
    });
  };

  /* 7) Tekrarları sil */
  R["linked-7"] = (host, api) => {
    api.prompt("Sıralı listede aynı değer arka arkaya gelir. <b>Silinecek</b> (ikinci/üçüncü) düğümleri seç.");
    runRounds(host, api, [0, 1, 2], (slot, lvl, solved) => {
      const base = distinct(4, 1, 9).sort((a, b) => a - b); const v = []; base.forEach((x) => { v.push(x); if (Math.random() < 0.5) v.push(x); });
      const remove = []; for (let i = 1; i < v.length; i++) if (v[i] === v[i - 1]) remove.push(i);
      if (!remove.length) { v.splice(1, 0, v[0]); remove.push(1); }
      const got = new Set(); let done = false; const info = pill(slot, "Tekrarları seç (her sayıdan biri kalsın).");
      const ns = chain(slot, v, { tail: "∅", onClick: (i) => { if (done) return; if (got.has(i)) { got.delete(i); ns[i].classList.remove("sel"); } else { got.add(i); ns[i].classList.add("sel"); } } });
      api.button("✅ Kontrol Et", "go", () => { if (done) return; const ok = got.size === remove.length && [...got].every((i) => i > 0 && v[i] === v[i - 1]); if (ok) { done = true; remove.forEach((i) => { ns[i].classList.remove("sel"); ns[i].classList.add("good"); }); info.innerHTML = "Tekrarlar silindi ✓"; info.classList.add("hit"); solved(); } else { api.penalty(); info.innerHTML = "Tam değil — komşusuyla aynı olanları seç."; } });
      return { hint: () => { ns.forEach((x, i) => x.classList.toggle("sel", remove.includes(i))); got.clear(); remove.forEach((i) => got.add(i)); info.innerHTML = "İpucu: silinecekler işaretlendi."; } };
    });
  };

  /* 8) İki sayıyı topla */
  R["linked-8"] = (host, api) => {
    api.prompt("Her liste bir sayının basamakları. İkisini topla (eldeyi unutma!).");
    runRounds(host, api, [0, 1, 2], (slot, lvl, solved) => {
      const x = ri(20, 99), y = ri(20, 99);
      slot.appendChild(el("div", null, "<div style='text-align:center'><b>A</b></div>")); chain(slot, String(x).split(""), { tail: "∅" });
      slot.appendChild(el("div", null, "<div style='text-align:center'><b>B</b></div>")); chain(slot, String(y).split(""), { tail: "∅" });
      const info = pill(slot, `${x} + ${y} = ?`);
      const inp = el("input", "num-input"); inp.type = "number"; inp.placeholder = "?"; slot.appendChild(inp);
      let done = false;
      const check = () => { if (done || inp.value === "") return; if (+inp.value === x + y) { done = true; info.innerHTML = `${x} + ${y} = ${x + y} ✓`; info.classList.add("hit"); solved(); } else api.penalty(); };
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); });
      api.button("✅ Kontrol Et", "go", check);
      return { hint: () => { info.innerHTML = `İpucu: ${x} + ${y} = ${x + y}.`; } };
    });
  };

  K.override(R);
})();
