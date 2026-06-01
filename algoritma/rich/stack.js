/* Yığın ve Kuyruk — LIFO/FIFO, parantez, monoton yığın */
(function () {
  "use strict";
  const K = window.AZK; if (!K) return;
  const { ri, shuffle, distinct, el, runRounds, cards, bars, pill } = K;
  const R = {};

  /* 1) Parantez dengesi — görsel yığın */
  R["stack-1"] = (host, api) => {
    api.prompt("Açılışı yığına koy, kapanışta üstten çıkar. Sonda yığın boşsa <b>dengeli</b>. Dengeli mi?");
    runRounds(host, api, [0, 1, 2], (slot, lvl, solved) => {
      const good = ["()", "(())", "()()", "(()())", "((()))"]; const bad = ["(()", "())", ")(", "(()))", "(()("];
      const ok = Math.random() < 0.5; const s = (ok ? good : bad)[ri(0, 4)];
      let bal = 0, valid = true; for (const c of s) { if (c === "(") bal++; else bal--; if (bal < 0) valid = false; } if (bal !== 0) valid = false;
      cards(slot, s.split(""));
      const sv = el("div", "stackview"); slot.appendChild(el("div", "sumread", "Yığın (animasyonu görmek için İpucu'na bas):")); slot.appendChild(sv);
      const info = pill(slot, "Karar ver.");
      const animate = () => { sv.innerHTML = ""; let i = 0, st = []; const tick = () => { if (i >= s.length) { info.innerHTML = st.length === 0 ? "Yığın boş → dengeli" : "Yığın boş değil → dengesiz"; return; } if (s[i] === "(") st.push("("); else st.pop(); sv.innerHTML = st.map(() => `<div class="sb">(</div>`).join(""); i++; setTimeout(tick, 450); }; tick(); };
      let done = false; const ch = el("div", "choices"); ch.style.maxWidth = "340px";
      ["✅ Dengeli", "❌ Hatalı"].forEach((t, idx) => { const c = el("div", "choice", t); c.onclick = () => { if (done) return; if ((idx === 0) === valid) { done = true; c.classList.add("ok"); animate(); solved(); } else { c.classList.add("bad"); api.penalty(); animate(); } }; ch.appendChild(c); });
      slot.appendChild(ch);
      return { hint: animate };
    });
  };

  /* 2) Sonraki büyük — monoton yığın */
  R["stack-2"] = (host, api) => {
    api.prompt("Sarı barın <b>sağındaki ilk daha büyük</b> barı bul (Next Greater Element).");
    runRounds(host, api, [6, 7, 8], (slot, n, solved) => {
      const v = Array.from({ length: n }, () => ri(1, 20)); let hi = ri(0, n - 3); let ng = -1; for (let i = hi + 1; i < n; i++) if (v[i] > v[hi]) { ng = i; break; }
      if (ng < 0) { v[hi + 1] = v[hi] + ri(1, 5); ng = hi + 1; } let done = false;
      const info = pill(slot, "Sağdaki ilk büyüğü seç.");
      const B = bars(slot, v, { onClick: (i) => { if (done) return; if (i === ng) { done = true; B.bars[i].classList.add("good"); info.innerHTML = `${v[ng]} → sağdaki ilk büyük ✓`; info.classList.add("hit"); solved(); } else { B.bars[i].classList.add("bad"); api.penalty(); setTimeout(() => B.bars[i].classList.remove("bad"), 450); } } });
      B.bars[hi].classList.add("hl"); B.bars[hi].style.background = "linear-gradient(180deg,#fb923c,#ea580c)";
      return { hint: () => { B.bars[ng].classList.add("sel"); info.innerHTML = "İpucu: sağa git, ilk büyüğü bul."; } };
    });
  };

  /* 3) RPN hesap makinesi */
  R["stack-3"] = (host, api) => {
    api.prompt("Postfix: sayıları yığına it, operatör görünce üstteki ikisini işle. Sonuç kaç?");
    runRounds(host, api, [0, 1, 2], (slot, lvl, solved) => {
      const a = ri(2, 9), b = ri(2, 9), c = ri(2, 9); const o1 = ["+", "-", "*"][ri(0, 2)], o2 = ["+", "-", "*"][ri(0, 2)];
      const f = (x, y, o) => (o === "+" ? x + y : o === "-" ? x - y : x * y); const ans = f(f(a, b, o1), c, o2);
      slot.appendChild(el("div", "visual", `<span class="tok">${a}</span><span class="tok">${b}</span><span class="tok hl">${o1}</span><span class="tok">${c}</span><span class="tok hl">${o2}</span>`));
      const info = pill(slot, `Önce ${a} ${o1} ${b}, sonra sonuç ${o2} ${c}`);
      const inp = el("input", "num-input"); inp.type = "number"; inp.placeholder = "?"; slot.appendChild(inp); let done = false;
      const check = () => { if (done || inp.value === "") return; if (+inp.value === ans) { done = true; info.innerHTML = `Sonuç ${ans} ✓`; info.classList.add("hit"); solved(); } else api.penalty(); };
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); }); api.button("✅ Kontrol Et", "go", check);
      return { hint: () => { info.innerHTML = `İpucu: (${a} ${o1} ${b}) = ${f(a, b, o1)}, sonra ${o2} ${c} = ${ans}.`; } };
    });
  };

  /* 4) Yığın LIFO çıkış */
  R["stack-4"] = (host, api) => {
    api.prompt("Bu sırayla yığına atıldılar. <b>Çıkış</b> sırasıyla tıkla — son giren ilk çıkar (LIFO).");
    runRounds(host, api, [4, 5, 6], (slot, n, solved) => {
      const v = distinct(n, 1, 20); const correct = v.map((_, i) => n - 1 - i); let step = 0, done = false;
      const info = pill(slot, "Son giren ilk çıkar.");
      const cs = cards(slot, v, { onClick: (i) => clickOrder(i, cs, correct, () => step, (s) => (step = s), () => done, () => (done = true), info, solved, api) });
      return { hint: () => { info.innerHTML = `İpucu: en son atılan (${v[n - 1]}) önce çıkar.`; } };
    });
  };

  /* 5) Kuyruk FIFO çıkış */
  R["stack-5"] = (host, api) => {
    api.prompt("Bu sırayla kuyruğa girdiler. <b>Çıkış</b> sırasıyla tıkla — ilk giren ilk çıkar (FIFO).");
    runRounds(host, api, [4, 5, 6], (slot, n, solved) => {
      const v = distinct(n, 1, 20); const correct = v.map((_, i) => i); let step = 0, done = false;
      const info = pill(slot, "İlk giren ilk çıkar.");
      const cs = cards(slot, v, { onClick: (i) => clickOrder(i, cs, correct, () => step, (s) => (step = s), () => done, () => (done = true), info, solved, api) });
      return { hint: () => { info.innerHTML = `İpucu: ilk giren (${v[0]}) önce çıkar.`; } };
    });
  };

  /* 6) Min yığın */
  R["stack-6"] = (host, api) => {
    api.prompt("Yığındaki <b>en küçük</b> elemanı bul (Min Stack her an minimumu bilir).");
    runRounds(host, api, [6, 7, 8], (slot, n, solved) => {
      const v = shuffle(distinct(n, 1, 40)); const mn = Math.min(...v); let done = false; const info = pill(slot, "En küçüğü seç.");
      const cs = cards(slot, v, { onClick: (i) => { if (done) return; if (v[i] === mn) { done = true; cs[i].classList.add("good"); info.innerHTML = `${mn} en küçük ✓`; info.classList.add("hit"); solved(); } else { cs[i].classList.add("bad"); api.penalty(); setTimeout(() => cs[i].classList.remove("bad"), 450); } } });
      return { hint: () => { cs[v.indexOf(mn)].classList.add("sel"); info.innerHTML = `İpucu: en küçük ${mn}.`; } };
    });
  };

  /* 7) Sıcaklık bekleyişi */
  R["stack-7"] = (host, api) => {
    api.prompt("Sarı günden kaç <b>gün sonra</b> daha sıcak bir gün gelir? (Daily Temperatures)");
    runRounds(host, api, [0, 1, 2], (slot, lvl, solved) => {
      const v = Array.from({ length: 6 }, () => ri(10, 30)); let hi = ri(0, 3); let wait = 0; for (let i = hi + 1; i < 6; i++) if (v[i] > v[hi]) { wait = i - hi; break; }
      if (wait === 0) { v[hi + 1] = v[hi] + ri(1, 5); wait = 1; }
      const B = bars(slot, v, { labels: v.map((_, i) => "G" + (i + 1)) }); B.bars[hi].classList.add("hl"); B.bars[hi].style.background = "linear-gradient(180deg,#fb923c,#ea580c)";
      const info = pill(slot, `Sarı: Gün ${hi + 1} (${v[hi]}°)`);
      const inp = el("input", "num-input"); inp.type = "number"; inp.placeholder = "?"; slot.appendChild(inp); let done = false;
      const check = () => { if (done || inp.value === "") return; if (+inp.value === wait) { done = true; B.bars[hi + wait].classList.add("good"); info.innerHTML = `${wait} gün sonra daha sıcak ✓`; info.classList.add("hit"); solved(); } else api.penalty(); };
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); }); api.button("✅ Kontrol Et", "go", check);
      return { hint: () => { B.bars[hi + wait].classList.add("sel"); info.innerHTML = `İpucu: Gün ${hi + wait + 1} daha sıcak → ${wait} gün.`; } };
    });
  };

  /* 8) Geçerli çıkış mı */
  R["stack-8"] = (host, api) => {
    api.prompt("Bu itme sırasıyla, verilen çıkış sırası yığınla <b>mümkün mü</b>?");
    runRounds(host, api, [0, 1, 2], (slot, lvl, solved) => {
      const push = distinct(4, 1, 9); let pop;
      if (Math.random() < 0.5) { const st = []; pop = []; let pi = 0; while (pi < push.length || st.length) { if (pi < push.length && (st.length === 0 || Math.random() < 0.5)) st.push(push[pi++]); else pop.push(st.pop()); } }
      else pop = shuffle(push.slice());
      const st = []; let pi = 0, ok = true; for (const x of pop) { while ((st.length === 0 || st[st.length - 1] !== x) && pi < push.length) st.push(push[pi++]); if (st[st.length - 1] === x) st.pop(); else { ok = false; break; } }
      slot.appendChild(el("div", "sumread", `İtme: [${push.join(", ")}]`)); slot.appendChild(el("div", "sumread", `Çıkış: [${pop.join(", ")}]`));
      let done = false; const ch = el("div", "choices"); ch.style.maxWidth = "340px";
      ["✅ Mümkün", "❌ İmkânsız"].forEach((t, idx) => { const c = el("div", "choice", t); c.onclick = () => { if (done) return; if ((idx === 0) === ok) { done = true; c.classList.add("ok"); solved(); } else { c.classList.add("bad"); api.penalty(); } }; ch.appendChild(c); });
      slot.appendChild(ch);
      return { hint: () => { ch.previousSibling; api.status(ok ? "İpucu: itme/çekme simülasyonu tutuyor → mümkün." : "İpucu: bir noktada yanlış eleman üstte kalıyor → imkânsız.", "info"); } };
    });
  };

  /* 9) Tarayıcı geri tuşu */
  R["stack-9"] = (host, api) => {
    api.prompt("Sayfaları sırayla açtın, sonra birkaç kez <b>GERİ</b>'ye bastın. Şu an hangisindesin?");
    runRounds(host, api, [4, 5, 5], (slot, n, solved) => {
      const pages = ["🏠", "📰", "🎵", "🎮", "📚"].slice(0, n); const back = ri(1, n - 1); const cur = n - 1 - back;
      pill(slot, `${back} kez GERİ'ye bastın`); let done = false; const info = pill(slot, "Şu anki sayfayı seç.");
      const cs = cards(slot, pages, { onClick: (i) => { if (done) return; if (i === cur) { done = true; cs[i].classList.add("good"); info.innerHTML = "Doğru sayfa ✓"; info.classList.add("hit"); solved(); } else { cs[i].classList.add("bad"); api.penalty(); setTimeout(() => cs[i].classList.remove("bad"), 450); } } });
      cs.forEach((c) => (c.style.fontSize = "2rem"));
      return { hint: () => { cs[cur].classList.add("sel"); info.innerHTML = `İpucu: ${n} sayfadan ${back} geri = ${cur + 1}. sayfa.`; } };
    });
  };

  /* sıralı tıklama yardımcı (LIFO/FIFO) */
  function clickOrder(i, cs, correct, getStep, setStep, getDone, setDone, info, solved, api) {
    if (getDone()) return; const step = getStep();
    if (i === correct[step]) { cs[i].classList.add("good"); cs[i].appendChild(el("span", "pin", step + 1)); setStep(step + 1); if (step + 1 === correct.length) { setDone(); info.innerHTML = "Sıra doğru ✓"; info.classList.add("hit"); solved(); } }
    else { cs[i].classList.add("bad"); api.penalty(); info.innerHTML = "Sıra yanlış! Baştan."; setTimeout(() => { cs.forEach((c) => { c.classList.remove("good", "bad"); const p = c.querySelector(".pin"); if (p) p.remove(); }); setStep(0); }, 500); }
  }

  K.override(R);
})();
