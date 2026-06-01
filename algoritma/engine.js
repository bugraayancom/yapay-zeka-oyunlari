/* ===========================================================
   101 Algoritma Oyunu — motor (hub + kategori + oyun çalıştırıcı)
   =========================================================== */
(function () {
  "use strict";
  const { CATEGORIES, GAMES } = window.AZ;
  const TOTAL = GAMES.length;
  let SCORE = 0, STREAK = 0;
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const qp = (k) => new URLSearchParams(location.search).get(k);

  /* ---- ilerleme ---- */
  const PKEY = "azProgress101";
  const getProg = () => { try { return JSON.parse(localStorage.getItem(PKEY)) || {}; } catch (e) { return {}; } };
  const setDone = (id) => { const p = getProg(); p[id] = true; localStorage.setItem(PKEY, JSON.stringify(p)); };
  const catGames = (key) => GAMES.filter((g) => g.cat === key);
  const catDone = (key, p) => catGames(key).filter((g) => p[g.id]).length;
  const findGame = (id) => GAMES.find((g) => g.id === id);

  /* ---- konfeti ---- */
  function celebrate() {
    const end = Date.now() + 1400;
    (function frame() {
      for (let i = 0; i < 6; i++) {
        const c = el("div"); c.style.cssText = `position:fixed;width:9px;height:9px;border-radius:50%;pointer-events:none;z-index:9999;left:${Math.random() * window.innerWidth}px;top:-10px;background:hsl(${Math.random() * 360},90%,55%)`;
        document.body.appendChild(c);
        let y = -10, x = parseFloat(c.style.left), vy = Math.random() * 3 + 2, vx = (Math.random() - .5) * 4;
        const t = setInterval(() => { y += vy; x += vx; vy += .12; c.style.top = y + "px"; c.style.left = x + "px"; if (y > window.innerHeight) { c.remove(); clearInterval(t); } }, 20);
      }
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  /* =========================================================
     HUB
     ========================================================= */
  function renderHub(root) {
    const p = getProg(); const done = Object.keys(p).filter((k) => p[k]).length;
    const pct = Math.round((done / TOTAL) * 100);
    root.innerHTML = `
      <div class="progress-box">
        <h3>📊 İlerleme Durumun</h3>
        <div class="bar"><div id="pf">${pct}%</div></div>
        <p>${done} / ${TOTAL} oyun tamamlandı</p>
      </div>
      <div class="cats" id="cats"></div>`;
    setTimeout(() => ($("#pf").style.width = pct + "%"), 50);
    const cats = $("#cats");
    CATEGORIES.forEach((c) => {
      const d = catDone(c.key, p), t = catGames(c.key).length;
      const a = el("a", "cat-card");
      a.href = `category.html?cat=${c.key}`;
      a.innerHTML = `<div class="ico">${c.icon}</div><h3>${c.name}</h3>
        <div class="count">${t} Oyun</div>
        <div class="mini">${d} / ${t} tamamlandı</div>`;
      cats.appendChild(a);
    });
  }

  /* =========================================================
     KATEGORİ LİSTESİ
     ========================================================= */
  function renderCategory(root) {
    const key = qp("cat"); const cat = CATEGORIES.find((c) => c.key === key);
    if (!cat) { root.innerHTML = "<p style='color:#fff'>Kategori bulunamadı.</p>"; return; }
    const p = getProg();
    root.innerHTML = `
      <div class="cat-head"><h2>${cat.icon} ${cat.name}</h2><p>${cat.blurb}</p></div>
      <div class="games" id="games"></div>`;
    const wrap = $("#games");
    catGames(key).forEach((g, i) => {
      const a = el("a", "g-card" + (p[g.id] ? " done" : ""));
      a.href = `game.html?g=${g.id}`;
      a.innerHTML = `<div class="g-num">${i + 1}</div><div class="g-emoji">${g.emoji}</div>
        <h3>${g.title}</h3><p>${g.desc}</p>
        <span class="diff ${g.diff}">${g.diff === "easy" ? "Kolay" : g.diff === "medium" ? "Orta" : "Zor"}</span>`;
      wrap.appendChild(a);
    });
  }

  /* =========================================================
     OYUN ÇALIŞTIRICI
     ========================================================= */
  function renderGameShell(root, game) {
    const list = catGames(game.cat); const idx = list.findIndex((g) => g.id === game.id);
    const prev = list[idx - 1], next = list[idx + 1];
    const cat = CATEGORIES.find((c) => c.key === game.cat);
    root.innerHTML = `
      <div class="nav-row">
        <a class="pill" href="category.html?cat=${game.cat}">← ${cat.name}</a>
        <a class="pill" href="index.html">🏠 Ana Sayfa</a>
      </div>
      <div class="game-panel">
        <div class="game-head">
          <div class="emoji">${game.emoji}</div>
          <h2>${game.title}</h2>
          <div class="desc">${game.desc}</div>
        </div>
        <div class="toolbar"><div class="scoreboard">
          <span class="score-pill">⭐ Puan: <b id="score">${SCORE}</b></span>
          <span class="score-pill">🔥 Seri: <b id="streak">${STREAK}</b></span>
        </div></div>
        <div class="prompt-box" id="prompt"></div>
        <div class="stage" id="stage"></div>
        <div class="status info" id="status"></div>
        <div class="controls" id="controls"></div>
        <div class="ai-box">🧠 <b>Gerçek mülakat bağlantısı:</b> ${game.ai}</div>
        <div class="next-row">
          ${prev ? `<a class="btn sec" href="game.html?g=${prev.id}">← ${prev.title}</a>` : "<span></span>"}
          ${next ? `<a class="btn" href="game.html?g=${next.id}">${next.title} →</a>` : `<a class="btn go" href="category.html?cat=${game.cat}">Kategoriyi Bitir ✓</a>`}
        </div>
      </div>`;
    play(game);
  }

  function play(game) {
    const cfg = game.setup();
    const stage = $("#stage"), prompt = $("#prompt"), status = $("#status"), controls = $("#controls");
    prompt.innerHTML = cfg.prompt;
    stage.innerHTML = ""; controls.innerHTML = ""; status.className = "status info"; status.textContent = "";
    let finished = false;

    const updScore = () => { const s = $("#score"), st = $("#streak"); if (s) s.textContent = SCORE; if (st) st.textContent = STREAK; };
    const reward = (n) => { SCORE += n; STREAK += 1; updScore(); };
    const penalty = () => { STREAK = 0; updScore(); };

    const win = (msg) => { status.className = "status win"; status.innerHTML = msg || "🎉 Doğru! Harikasın!"; if (!finished) reward(20); setDone(game.id); celebrate(); finished = true; };
    const lose = (msg) => { status.className = "status lose"; status.innerHTML = msg || "❌ Olmadı, tekrar dene!"; penalty(); };
    const reveal = (msg) => { status.className = "status info"; status.innerHTML = "🤖 " + (msg != null ? msg : cfg.explain); finished = true; };

    const btn = (label, cls, fn) => { const b = el("button", "btn " + (cls || ""), label); b.onclick = fn; controls.appendChild(b); return b; };
    const addNew = () => btn("🔀 Yeni Oyun", "sec", () => play(game));

    /* ---------- CUSTOM (kategoriye özel zengin oyunlar) ---------- */
    if (cfg.kind === "custom") {
      const api = {
        host: stage, el, prompt: (h) => (prompt.innerHTML = h),
        status: (h, t = "info") => { status.className = "status " + t; status.innerHTML = h; },
        button: btn, newGame: () => play(game),
        win, fail: lose, reveal, reward, penalty,
      };
      cfg.render(stage, api);
      return;
    }

    /* ---------- PICK ---------- */
    if (cfg.kind === "pick") {
      const wrap = el("div", "items"); stage.appendChild(wrap);
      const sel = []; const boxes = [];
      cfg.items.forEach((it, i) => {
        const b = el("div", "box" + (it.fixed ? " " + it.fixed : ""), it.label);
        if (!it.fixed) b.onclick = () => {
          if (finished) return;
          const pos = sel.indexOf(i);
          if (cfg.need === 1 && !cfg.multi) { sel.length = 0; boxes.forEach((x) => x.classList.remove("sel")); if (pos < 0) { sel.push(i); b.classList.add("sel"); } trySingle(); return; }
          if (pos >= 0) { sel.splice(pos, 1); b.classList.remove("sel"); }
          else { if (cfg.need && sel.length >= cfg.need) return; sel.push(i); b.classList.add("sel"); }
        };
        boxes.push(b); wrap.appendChild(b);
      });
      const finish = (ok) => {
        if (ok) { sel.forEach((i) => { boxes[i].classList.remove("sel"); boxes[i].classList.add("ok", "pop"); }); win(); }
        else { sel.forEach((i) => boxes[i].classList.add("bad")); lose(); setTimeout(() => boxes.forEach((b) => b.classList.remove("bad")), 450); }
      };
      const trySingle = () => { if (sel.length === 1) finish(cfg.check(sel, cfg.items)); };
      if (!(cfg.need === 1 && !cfg.multi)) {
        btn("✅ Kontrol Et", "go", () => { if (finished) return; if (cfg.need && sel.length !== cfg.need) { lose(`${cfg.need} tane seçmelisin!`); return; } finish(cfg.check(sel, cfg.items)); });
      }
      btn("💡 Çözümü Göster", "", () => { boxes.forEach((b) => b.classList.remove("sel", "ok", "bad")); cfg.solve(cfg.items).forEach((i) => boxes[i].classList.add("ok", "pop")); reveal(); });
      addNew();
    }

    /* ---------- ORDER ---------- */
    else if (cfg.kind === "order") {
      const wrap = el("div", "items"); stage.appendChild(wrap);
      const boxes = cfg.items.map((it) => { const b = el("div", "box", it.label); wrap.appendChild(b); return b; });
      let step = 0;
      const reset = () => { step = 0; boxes.forEach((b) => { b.classList.remove("ok", "bad"); const t = b.querySelector(".order-tag"); if (t) t.remove(); }); };
      boxes.forEach((b, i) => b.onclick = () => {
        if (finished) return;
        if (i === cfg.correct[step]) {
          b.classList.add("ok", "pop"); b.appendChild(el("span", "order-tag", step + 1)); step++;
          if (step === cfg.correct.length) win("🎉 Sıralama tam doğru!");
        } else { b.classList.add("bad"); lose("Sıra yanlış! Baştan dene."); setTimeout(reset, 500); }
      });
      btn("💡 Çözümü Göster", "", () => { reset(); cfg.correct.forEach((idx, k) => { boxes[idx].classList.add("ok"); boxes[idx].appendChild(el("span", "order-tag", k + 1)); }); reveal(); });
      addNew();
    }

    /* ---------- NUMBER ---------- */
    else if (cfg.kind === "number") {
      if (cfg.visual) stage.appendChild(el("div", null, cfg.visual));
      const inp = el("input", "num-input"); inp.type = "number"; inp.placeholder = "?"; stage.appendChild(inp);
      const check = () => { if (finished) return; if (inp.value === "") return; Number(inp.value) === cfg.answer ? win() : lose(); };
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); });
      btn("✅ Kontrol Et", "go", check);
      btn("💡 Çözümü Göster", "", () => { inp.value = cfg.answer; reveal(); });
      addNew(); setTimeout(() => inp.focus(), 100);
    }

    /* ---------- CHOICE ---------- */
    else if (cfg.kind === "choice") {
      if (cfg.visual) stage.appendChild(el("div", null, cfg.visual));
      const box = el("div", "choices"); stage.appendChild(box);
      const opts = cfg.options.map((o, i) => { const c = el("div", "choice", o); c.onclick = () => pick(i, c); box.appendChild(c); return c; });
      const pick = (i, c) => { if (finished) return; if (i === cfg.answer) { c.classList.add("ok"); win(); } else { c.classList.add("bad"); opts[cfg.answer].classList.add("ok"); lose(); finished = true; } status.textContent += ""; setTimeout(() => { status.className = "status " + (i === cfg.answer ? "win" : "lose"); }, 0); };
      btn("💡 Açıklama", "", () => { opts[cfg.answer].classList.add("ok"); reveal(); });
      addNew();
    }

    /* ---------- TREE ---------- */
    else if (cfg.kind === "tree") {
      const svg = buildTree(cfg.nodes, cfg.highlight || []);
      stage.appendChild(svg.wrap);
      if (cfg.mode === "pick") {
        const sel = [];
        svg.nodes.forEach((g, i) => { if (g) g.onclick = () => {
          if (finished) return; const need = cfg.need || 1;
          if (need === 1) { svg.nodes.forEach((x) => x && x.classList.remove("sel")); g.classList.add("sel"); sel.length = 0; sel.push(i); cfg.check(sel) ? (g.classList.remove("sel"), g.classList.add("ok"), win()) : lose(); }
        }; });
        btn("💡 Çözümü Göster", "", () => { svg.nodes.forEach((x) => x && x.classList.remove("sel", "ok")); cfg.solve().forEach((i) => svg.nodes[i].classList.add("ok")); reveal(); });
        addNew();
      } else if (cfg.mode === "order") {
        let step = 0;
        const reset = () => { step = 0; svg.nodes.forEach((g) => { if (g) { g.classList.remove("ok", "bad"); const t = g.querySelector(".tlabel"); if (t) t.remove(); } }); };
        svg.nodes.forEach((g, i) => { if (g) g.onclick = () => {
          if (finished) return;
          if (i === cfg.correct[step]) { g.classList.add("ok"); step++; if (step === cfg.correct.length) win("🎉 Gezinti sırası doğru!"); }
          else { g.classList.add("bad"); lose("Sıra yanlış! Baştan."); setTimeout(reset, 500); }
        }; });
        btn("💡 Çözümü Göster", "", () => { reset(); cfg.correct.forEach((i) => svg.nodes[i].classList.add("ok")); reveal(); });
        addNew();
      } else { // display + number/choice
        if (cfg.numAnswer != null) {
          const inp = el("input", "num-input"); inp.type = "number"; inp.placeholder = "?"; stage.appendChild(inp);
          const check = () => { if (finished || inp.value === "") return; Number(inp.value) === cfg.numAnswer ? win() : lose(); };
          inp.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); });
          btn("✅ Kontrol Et", "go", check);
          btn("💡 Çözümü Göster", "", () => { inp.value = cfg.numAnswer; reveal(); });
          addNew();
        } else if (cfg.choiceOptions) {
          const box = el("div", "choices"); stage.appendChild(box);
          const opts = cfg.choiceOptions.map((o, i) => { const c = el("div", "choice", o); c.onclick = () => { if (finished) return; if (i === cfg.choiceAnswer) { c.classList.add("ok"); win(); } else { c.classList.add("bad"); opts[cfg.choiceAnswer].classList.add("ok"); lose(); finished = true; } }; box.appendChild(c); return c; });
          btn("💡 Açıklama", "", () => { opts[cfg.choiceAnswer].classList.add("ok"); reveal(); });
          addNew();
        }
      }
    }

    /* ---------- GRID ---------- */
    else if (cfg.kind === "grid") {
      const g = el("div", "grid2"); g.style.gridTemplateColumns = `repeat(${cfg.cols}, 1fr)`; g.style.display = "inline-grid"; g.style.margin = "0 auto";
      const cells = {};
      for (let r = 0; r < cfg.rows; r++) for (let c = 0; c < cfg.cols; c++) {
        const cls = cfg.cellClass ? cfg.cellClass(r, c) : "";
        const cell = el("div", "gcell " + (cls || ""), cfg.cellLabel ? cfg.cellLabel(r, c) : "");
        cell.dataset.k = r + "," + c; cells[r + "," + c] = cell; g.appendChild(cell);
      }
      stage.appendChild(g);

      if (cfg.mode === "order") {
        let step = 0;
        const reset = () => { step = 0; Object.values(cells).forEach((cell) => { cell.classList.remove("ok2", "bad"); const t = cell.querySelector(".order-tag"); if (t) t.remove(); cell.style.outline = ""; }); };
        Object.entries(cells).forEach(([k, cell]) => cell.onclick = () => {
          if (finished) return;
          if (k === cfg.correct[step]) { cell.style.outline = "3px solid #38a169"; cell.appendChild(el("span", "order-tag", step + 1)); step++; if (step === cfg.correct.length) win("🎉 Sıra doğru!"); }
          else { cell.classList.add("bad"); lose("Sıra yanlış! Baştan."); setTimeout(reset, 500); }
        });
        btn("💡 Çözümü Göster", "", () => { reset(); cfg.correct.forEach((k, i) => { cells[k].style.outline = "3px solid #38a169"; cells[k].appendChild(el("span", "order-tag", i + 1)); }); reveal(); });
        addNew();
      } else { // select
        const chosen = new Set();
        Object.entries(cells).forEach(([k, cell]) => { if (k === cfg.startCell) return; cell.onclick = () => { if (finished) return; if (chosen.has(k)) { chosen.delete(k); cell.classList.remove("sel"); } else { chosen.add(k); cell.classList.add("sel"); } }; });
        btn("✅ Kontrol Et", "go", () => {
          if (finished) return; const full = new Set(chosen); if (cfg.startCell) full.add(cfg.startCell);
          if (cfg.check(full)) { full.forEach((k) => { cells[k].classList.remove("sel"); cells[k].classList.add("ok"); }); win(); }
          else lose();
        });
        btn("💡 Çözümü Göster", "", () => { Object.values(cells).forEach((c) => c.classList.remove("sel", "ok")); cfg.solve().forEach((k) => cells[k].classList.add("ok")); reveal(); });
        addNew();
      }
    }
  }

  /* ---- SVG ağaç çizici ---- */
  function buildTree(nodes, highlight) {
    const present = nodes.map((v, i) => (v != null ? i : -1)).filter((i) => i >= 0);
    let maxD = 0; present.forEach((i) => (maxD = Math.max(maxD, Math.floor(Math.log2(i + 1)))));
    const W = 520, levelGap = 86, pad = 34, H = maxD * levelGap + pad * 2;
    const pos = (i) => { const d = Math.floor(Math.log2(i + 1)); const tot = 2 ** d; const p = i - (tot - 1); return { x: ((p + 0.5) / tot) * W, y: pad + d * levelGap, d }; };
    let svg = `<svg class="tree-wrap" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="height:auto">
      <defs><linearGradient id="ng" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#667eea"/><stop offset="1" stop-color="#764ba2"/></linearGradient></defs>`;
    // kenarlar
    present.forEach((i) => { [2 * i + 1, 2 * i + 2].forEach((c) => { if (c < nodes.length && nodes[c] != null) { const a = pos(i), b = pos(c); svg += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#cbd5e0" stroke-width="3"/>`; } }); });
    // düğümler
    present.forEach((i) => { const p = pos(i); const hl = highlight.includes(i) ? " hl" : ""; svg += `<g class="tnode${hl}" data-i="${i}"><circle cx="${p.x}" cy="${p.y}" r="22"/><text x="${p.x}" y="${p.y + 5}" text-anchor="middle">${nodes[i]}</text></g>`; });
    svg += "</svg>";
    const wrap = el("div", null, svg).firstChild;
    const map = nodes.map(() => null);
    wrap.querySelectorAll(".tnode").forEach((g) => { map[+g.dataset.i] = g; });
    return { wrap, nodes: map };
  }

  /* ---- yönlendirme ---- */
  document.addEventListener("DOMContentLoaded", () => {
    const hub = $("#hub"), cp = $("#catpage"), gp = $("#gamepage");
    if (hub) renderHub(hub);
    else if (cp) renderCategory(cp);
    else if (gp) {
      const game = findGame(qp("g"));
      if (!game) { gp.innerHTML = "<p style='color:#fff'>Oyun bulunamadı.</p>"; return; }
      document.title = game.title + " | 101 Algoritma Oyunu";
      renderGameShell(gp, game);
    }
  });
})();
