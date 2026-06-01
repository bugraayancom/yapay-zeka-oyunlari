/* Kelimeler — harflerle etkileşimli bulmacalar */
(function () {
  "use strict";
  const K = window.AZK; if (!K) return;
  const { ri, shuffle, el, runRounds, cards, pill } = K;
  const SES = "AEIİOÖUÜ";
  const PAL = ["KAYAK", "ELE", "ANA", "OTO", "RADAR", "NEDEN"];
  const NOPAL = ["KEDI", "OKUL", "MASA", "ELMA", "KALEM", "DENIZ"];
  const WORDS = ["KEDI", "ELMA", "OKUL", "BALIK", "GUNES", "DENIZ", "CICEK", "KALEM", "ARABA"];
  const R = {};

  /* 1) Palindrom — iki işaretçi */
  R["strings-1"] = (host, api) => {
    api.prompt("Kelime tersten de aynı mı? Uçlardan ortaya doğru harfleri eşleştir (two pointers).");
    runRounds(host, api, [0, 1, 2], (slot, lvl, solved) => {
      const yes = Math.random() < 0.5; const w = (yes ? PAL : NOPAL)[ri(0, (yes ? PAL : NOPAL).length - 1)];
      const real = w === w.split("").reverse().join("");
      const cs = cards(slot, w.split(""));
      const info = pill(slot, "İncele, sonra karar ver.");
      let done = false;
      const compare = () => { let l = 0, r = w.length - 1, step = 0; const tick = () => { if (l > r) return; cs[l].classList.add(w[l] === w[r] ? "good" : "bad"); cs[r].classList.add(w[l] === w[r] ? "good" : "bad"); if (w[l] !== w[r]) { info.innerHTML = `${w[l]} ≠ ${w[r]} → palindrom değil`; return; } l++; r--; setTimeout(tick, 420); }; tick(); };
      const ch = el("div", "choices"); ch.style.maxWidth = "340px";
      ["✅ Palindrom", "❌ Değil"].forEach((t, idx) => { const c = el("div", "choice", t); c.onclick = () => { if (done) return; if ((idx === 0) === real) { done = true; c.classList.add("ok"); compare(); info.innerHTML = real ? "Tersten de aynı ✓" : "Doğru, palindrom değil ✓"; solved(); } else { c.classList.add("bad"); api.penalty(); compare(); } }; ch.appendChild(c); });
      slot.appendChild(ch);
      return { hint: () => compare() };
    });
  };

  /* 2) Tekrarsız en uzun — kayan pencere */
  R["strings-2"] = (host, api) => {
    api.prompt("Harfleri <b>tekrar etmeyen</b> en uzun bitişik parçayı seç (başlangıç + bitiş harfine tıkla).");
    runRounds(host, api, [6, 7, 8], (slot, n, solved) => {
      const al = "ABCDE"; let s = ""; for (let i = 0; i < n; i++) s += al[ri(0, 4)];
      let best = 0, L = 0; const last = {}; for (let r = 0; r < n; r++) { if (last[s[r]] >= L) L = last[s[r]] + 1; last[s[r]] = r; best = Math.max(best, r - L + 1); }
      let a = -1, b = -1, done = false;
      const info = pill(slot, "Başlangıç harfini seç.");
      const cs = cards(slot, s.split(""), { onClick: (i) => {
        if (done) return; if (a < 0 || b >= 0) { a = i; b = -1; } else { b = i; if (b < a) [a, b] = [b, a]; } draw();
      } });
      function draw() {
        cs.forEach((c) => c.classList.remove("sel", "good", "bad"));
        if (a >= 0 && b < 0) { cs[a].classList.add("sel"); info.innerHTML = "Bitiş harfini seç."; return; }
        if (a >= 0 && b >= 0) {
          const seg = s.slice(a, b + 1); const uniq = new Set(seg).size === seg.length;
          for (let k = a; k <= b; k++) cs[k].classList.add(uniq ? "sel" : "bad");
          if (uniq && seg.length === best) { done = true; for (let k = a; k <= b; k++) { cs[k].classList.remove("sel"); cs[k].classList.add("good"); } info.innerHTML = `${seg.length} harf, tekrarsız ✓ (en uzun!)`; info.classList.add("hit"); solved(); }
          else if (!uniq) info.innerHTML = "Bu parçada tekrar var!";
          else info.innerHTML = `${seg.length} harf — daha uzunu var.`;
        }
      }
      return { hint: () => { let bl = 0, L = 0; const lst = {}; for (let r = 0; r < n; r++) { if (lst[s[r]] >= L) L = lst[s[r]] + 1; lst[s[r]] = r; if (r - L + 1 === best) bl = L; } cs.forEach((c) => c.classList.remove("sel", "good")); for (let k = bl; k < bl + best; k++) cs[k].classList.add("good"); info.innerHTML = `İpucu: en uzun tekrarsız parça ${best} harf.`; a = -1; b = -1; } };
    });
  };

  /* 3) Anagram mı */
  R["strings-3"] = (host, api) => {
    api.prompt("İki kelime aynı harflerden mi oluşuyor? Harfleri sayıp karşılaştır (anagram).");
    runRounds(host, api, [0, 1, 2], (slot, lvl, solved) => {
      const base = WORDS[ri(0, WORDS.length - 1)]; const yes = Math.random() < 0.5;
      let other = shuffle(base.split("")).join(""); if (!yes) { const arr = base.split(""); arr[ri(0, arr.length - 1)] = "X"; other = shuffle(arr).join(""); }
      const real = base.split("").sort().join("") === other.split("").sort().join("");
      slot.appendChild(el("div", null, `<div style="text-align:center"><b>1.</b></div>`)); cards(slot, base.split(""));
      slot.appendChild(el("div", null, `<div style="text-align:center"><b>2.</b></div>`)); cards(slot, other.split(""));
      const info = pill(slot, `Sıralı 1: ${base.split("").sort().join("")} · Sıralı 2: ${other.split("").sort().join("")}`);
      let done = false; const ch = el("div", "choices"); ch.style.maxWidth = "340px";
      ["✅ Anagram", "❌ Değil"].forEach((t, idx) => { const c = el("div", "choice", t); c.onclick = () => { if (done) return; if ((idx === 0) === real) { done = true; c.classList.add("ok"); solved(); } else { c.classList.add("bad"); api.penalty(); } }; ch.appendChild(c); });
      slot.appendChild(ch);
      return { hint: () => { info.innerHTML = real ? "İpucu: sıralı harfleri aynı → anagram." : "İpucu: sıralı harfler farklı → anagram değil."; } };
    });
  };

  /* 4) En çok tekrar eden harf */
  R["strings-4"] = (host, api) => {
    api.prompt("En çok tekrar eden harfi bul. Tıkladıkça kaç kez geçtiğini göstereceğim.");
    runRounds(host, api, [6, 7, 8], (slot, n, solved) => {
      const al = "ABCD"; const star = al[ri(0, 3)]; const arr = [star, star, star]; for (let i = 0; i < n - 3; i++) arr.push(al[ri(0, 3)]); const a = shuffle(arr);
      const cnt = {}; a.forEach((x) => (cnt[x] = (cnt[x] || 0) + 1)); const mx = Math.max(...Object.values(cnt)); let done = false;
      const info = pill(slot, "En sık harfi seç.");
      const cs = cards(slot, a, { onClick: (i) => { if (done) return; if (cnt[a[i]] === mx) { done = true; cs.forEach((c, k) => { if (a[k] === a[i]) c.classList.add("good"); }); info.innerHTML = `${a[i]} → ${mx} kez ✓`; info.classList.add("hit"); solved(); } else { cs[i].classList.add("bad"); api.penalty(); info.innerHTML = `${a[i]} → ${cnt[a[i]]} kez. Daha sık biri var.`; setTimeout(() => cs[i].classList.remove("bad"), 450); } } });
      return { hint: () => { const h = a.findIndex((x) => cnt[x] === mx); cs[h].classList.add("sel"); info.innerHTML = `İpucu: ${a[h]} en sık (${mx}).`; } };
    });
  };

  /* 5) Ters çevir — sondan başa */
  R["strings-5"] = (host, api) => {
    api.prompt("Kelimeyi <b>sondan başa</b> harf harf tıkla (Reverse String).");
    runRounds(host, api, [0, 1, 2], (slot, lvl, solved) => {
      const w = WORDS[ri(0, WORDS.length - 1)]; const correct = w.split("").map((_, i) => w.length - 1 - i);
      let step = 0, done = false; const info = pill(slot, "Son harften başla.");
      const cs = cards(slot, w.split(""), { onClick: (i) => {
        if (done) return;
        if (i === correct[step]) { cs[i].classList.add("good"); cs[i].appendChild(el("span", "pin", step + 1)); step++; if (step === w.length) { done = true; info.innerHTML = `Ters: ${w.split("").reverse().join("")} ✓`; info.classList.add("hit"); solved(); } }
        else { cs[i].classList.add("bad"); api.penalty(); info.innerHTML = "Sıra yanlış! Sondan başa git."; setTimeout(() => { cs.forEach((c) => { c.classList.remove("good", "bad"); const p = c.querySelector(".pin"); if (p) p.remove(); }); step = 0; }, 500); }
      } });
      return { hint: () => { info.innerHTML = `İpucu: önce '${w[w.length - 1]}' (son harf).`; } };
    });
  };

  /* 6) Sesli harf say */
  R["strings-6"] = (host, api) => {
    api.prompt("Tüm <b>sesli harfleri</b> seç (A E I İ O Ö U Ü), sonra Kontrol Et.");
    runRounds(host, api, [6, 7, 8], (slot, n, solved) => {
      const w = (WORDS[ri(0, WORDS.length - 1)] + WORDS[ri(0, WORDS.length - 1)]).slice(0, n).split("");
      const vowels = w.map((c, i) => (SES.includes(c) ? i : -1)).filter((x) => x >= 0);
      const got = new Set(); let done = false;
      const info = pill(slot, `${vowels.length} sesli harf var.`);
      const cs = cards(slot, w, { onClick: (i) => { if (done) return; if (got.has(i)) { got.delete(i); cs[i].classList.remove("sel"); } else { got.add(i); cs[i].classList.add("sel"); } } });
      api.button("✅ Kontrol Et", "go", () => { if (done) return; const ok = got.size === vowels.length && [...got].every((i) => SES.includes(w[i])); if (ok) { done = true; vowels.forEach((i) => { cs[i].classList.remove("sel"); cs[i].classList.add("good"); }); info.innerHTML = "Tüm sesliler ✓"; info.classList.add("hit"); solved(); } else { api.penalty(); info.innerHTML = "Tam değil — tüm seslileri seç."; } });
      return { hint: () => { cs.forEach((c, i) => c.classList.toggle("sel", vowels.includes(i))); got.clear(); vowels.forEach((i) => got.add(i)); info.innerHTML = "İpucu: sesliler işaretlendi."; } };
    });
  };

  /* 7) Anagram olmayan */
  R["strings-7"] = (host, api) => {
    api.prompt("Üçü aynı harflerin karışığı; biri farklı. <b>Anagram olmayanı</b> bul.");
    runRounds(host, api, [0, 1, 2], (slot, lvl, solved) => {
      const base = WORDS[ri(0, WORDS.length - 1)]; const sig = base.split("").sort().join("");
      let odd = WORDS[ri(0, WORDS.length - 1)]; while (odd.split("").sort().join("") === sig) odd = WORDS[ri(0, WORDS.length - 1)];
      const list = shuffle([base, shuffle(base.split("")).join(""), shuffle(base.split("")).join(""), odd]);
      const oddIdx = list.findIndex((w) => w.split("").sort().join("") !== sig);
      let done = false; const info = pill(slot, "Farklı olanı seç.");
      const cs = cards(slot, list, { onClick: (i) => { if (done) return; if (i === oddIdx) { done = true; cs[i].classList.add("good"); info.innerHTML = `${list[i]} diğerlerinin anagramı değil ✓`; info.classList.add("hit"); solved(); } else { cs[i].classList.add("bad"); api.penalty(); setTimeout(() => cs[i].classList.remove("bad"), 450); } } });
      cs.forEach((c) => (c.style.fontSize = "1rem"));
      return { hint: () => { cs[oddIdx].classList.add("sel"); info.innerHTML = `İpucu: ${list[oddIdx]} harfleri farklı.`; } };
    });
  };

  K.override(R);
})();
