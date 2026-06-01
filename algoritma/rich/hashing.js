/* Hashing — "gördüklerim kümesi" görselleştirmesiyle */
(function () {
  "use strict";
  const K = window.AZK; if (!K) return;
  const { ri, shuffle, distinct, el, runRounds, cards, pill } = K;
  const R = {};
  const setBox = (slot, label) => { const b = el("div", "sumread", `${label}: { }`); slot.appendChild(b); return { box: b, vals: [], add(v) { this.vals.push(v); b.innerHTML = `${label}: { ${this.vals.join(", ")} }`; } }; };

  /* 1) Tamamlayıcı */
  R["hashing-1"] = (host, api) => {
    api.prompt("Hash tablosu 'bu sayı var mı?'yı anında söyler. Sarı sayıyla toplanınca hedefi veren <b>tamamlayıcıyı</b> seç.");
    runRounds(host, api, [6, 7, 8], (slot, n, solved) => {
      const target = ri(10, 18); const arr = distinct(n, 1, 9); const hi = ri(0, n - 1); const need = target - arr[hi];
      const ci = (hi + 1) % n; arr[ci] = need;
      pill(slot, `🎯 Hedef: <b>${target}</b>`);
      let done = false; const info = pill(slot, `Aranan: ${target} − ${arr[hi]} = <b>${need}</b>`);
      const cs = cards(slot, arr, { fixed: [hi], onClick: (i) => { if (done) return; if (arr[i] + arr[hi] === target) { done = true; cs[i].classList.add("good"); cs[hi].classList.add("good"); info.innerHTML = `${arr[hi]} + ${arr[i]} = ${target} ✓`; info.classList.add("hit"); solved(); } else { cs[i].classList.add("bad"); api.penalty(); setTimeout(() => cs[i].classList.remove("bad"), 450); } } });
      cs[hi].classList.add("sel");
      return { hint: () => { cs[ci].classList.add("sel"); info.innerHTML = `İpucu: ${need} sayısını ara.`; } };
    });
  };

  /* 2) İlk tekrar — gördüklerim kümesi */
  R["hashing-2"] = (host, api) => {
    api.prompt("Soldan sırayla tıkla; her sayıyı <b>kümeye</b> atıyorum. Kümede zaten olan ilk sayı cevaptır!");
    runRounds(host, api, [6, 7, 8], (slot, n, solved) => {
      const base = distinct(n - 2, 1, 9); const dup = base[ri(0, base.length - 1)]; const arr = shuffle(base.slice()); arr.splice(ri(2, arr.length), 0, dup);
      const seen = setBox(slot, "Gördüklerim");
      let p = 0, done = false; const info = pill(slot, "Soldan başla.");
      const cs = cards(slot, arr, { onClick: (i) => {
        if (done) return;
        if (i !== p) { info.innerHTML = "Soldan SIRAYLA ilerle!"; return; }
        if (seen.vals.includes(arr[i])) { done = true; cs[i].classList.add("good"); info.innerHTML = `${arr[i]} kümede zaten vardı → ilk tekrar ✓`; info.classList.add("hit"); solved(); }
        else { seen.add(arr[i]); cs[i].classList.add("dim"); p++; info.innerHTML = `${arr[i]} kümeye eklendi.`; }
      } });
      return { hint: () => { info.innerHTML = "İpucu: kümede daha önce gördüğün sayıya gelince dur."; } };
    });
  };

  /* 3) En çok tekrar (mode) */
  R["hashing-3"] = (host, api) => {
    api.prompt("Sayım sözlüğü tut: en çok geçen sayıyı bul. Tıkladıkça sayısını göstereceğim.");
    runRounds(host, api, [6, 7, 8], (slot, n, solved) => {
      const star = ri(1, 5); const arr = [star, star, star]; for (let i = 0; i < n - 3; i++) arr.push(ri(1, 5)); const a = shuffle(arr);
      const cnt = {}; a.forEach((x) => (cnt[x] = (cnt[x] || 0) + 1)); const mx = Math.max(...Object.values(cnt)); let done = false;
      const info = pill(slot, "En sık sayıyı seç.");
      const cs = cards(slot, a, { onClick: (i) => { if (done) return; if (cnt[a[i]] === mx) { done = true; cs.forEach((c, k) => { if (a[k] === a[i]) c.classList.add("good"); }); info.innerHTML = `${a[i]} → ${mx} kez ✓`; info.classList.add("hit"); solved(); } else { cs[i].classList.add("bad"); api.penalty(); info.innerHTML = `${a[i]} → ${cnt[a[i]]} kez.`; setTimeout(() => cs[i].classList.remove("bad"), 450); } } });
      return { hint: () => { cs[a.findIndex((x) => cnt[x] === mx)].classList.add("sel"); info.innerHTML = `İpucu: en sık sayı ${mx} kez geçiyor.`; } };
    });
  };

  /* 4) Eşi olmayan (single) */
  R["hashing-4"] = (host, api) => {
    api.prompt("Herkesin bir çifti var, <b>birinin yok</b>. Sayımda 1 kez geçeni bul.");
    runRounds(host, api, [5, 7, 7], (slot, n, solved) => {
      const pairs = distinct((n - 1) / 2 | 0, 1, 9); const single = distinct(1, 10, 20)[0]; const a = shuffle([...pairs, ...pairs, single]);
      const cnt = {}; a.forEach((x) => (cnt[x] = (cnt[x] || 0) + 1)); let done = false;
      const info = pill(slot, "Tek kalanı seç.");
      const cs = cards(slot, a, { onClick: (i) => { if (done) return; if (cnt[a[i]] === 1) { done = true; cs[i].classList.add("good"); info.innerHTML = `${a[i]} çiftsiz ✓`; info.classList.add("hit"); solved(); } else { cs[i].classList.add("bad"); api.penalty(); info.innerHTML = `${a[i]} → ${cnt[a[i]]} kez (çifti var).`; setTimeout(() => cs[i].classList.remove("bad"), 450); } } });
      return { hint: () => { cs[a.findIndex((x) => cnt[x] === 1)].classList.add("sel"); info.innerHTML = "İpucu: sadece 1 kez geçen sayı."; } };
    });
  };

  /* 5) Ortak eleman (kesişim) */
  R["hashing-5"] = (host, api) => {
    api.prompt("A grubunu kümeye at, B'yi sorgula: <b>iki grupta da</b> olan sayıları seç.");
    runRounds(host, api, [2, 2, 3], (slot, common, solved) => {
      const inter = distinct(common, 1, 9); const A = shuffle([...inter, ...distinct(2, 10, 15)]); const B = shuffle([...inter, ...distinct(2, 16, 22)]);
      const setI = new Set(inter); const all = A.concat(B); const labels = A.map((v) => "A:" + v).concat(B.map((v) => "B:" + v));
      const correct = all.map((v, i) => (setI.has(v) ? i : -1)).filter((x) => x >= 0);
      const got = new Set(); let done = false;
      slot.appendChild(el("div", null, "<div style='text-align:center'><b>A</b></div>")); const ca = cards(slot, A, { onClick: (i) => tog(i) });
      slot.appendChild(el("div", null, "<div style='text-align:center'><b>B</b></div>")); const cb = cards(slot, B, { onClick: (i) => tog(A.length + i) });
      const allc = ca.concat(cb); const info = pill(slot, "Ortak olanları seç.");
      function tog(i) { if (done) return; if (got.has(i)) { got.delete(i); allc[i].classList.remove("sel"); } else { got.add(i); allc[i].classList.add("sel"); } }
      api.button("✅ Kontrol Et", "go", () => { if (done) return; const ok = got.size === correct.length && [...got].every((i) => setI.has(all[i])); if (ok) { done = true; correct.forEach((i) => { allc[i].classList.remove("sel"); allc[i].classList.add("good"); }); info.innerHTML = "Kesişim doğru ✓"; info.classList.add("hit"); solved(); } else { api.penalty(); info.innerHTML = "Tam değil — her iki grupta da olanları seç."; } });
      return { hint: () => { allc.forEach((c, i) => c.classList.toggle("sel", correct.includes(i))); got.clear(); correct.forEach((i) => got.add(i)); info.innerHTML = "İpucu: ortak sayılar işaretlendi."; } };
    });
  };

  K.override(R);
})();
