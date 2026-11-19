(() => {
  "use strict";

  const DATA = window.COLLECTION || { sets: [] };
  const SETS = DATA.sets.map((s) => ({ ...s, num: String(s.num).trim() }));

  // ── Thèmes : couleur + ordre d'affichage (les autres sont ajoutés à la fin) ──
  const THEMES = {
    "Icons": "#2b3466",
    "Ideas": "#f0a500",
    "Architecture": "#0e8a7a",
    "Botanicals": "#4f9a1f",
    "Creator Expert": "#7b3fe4",
    "Technic": "#4b5563",
    "Speed Champions": "#12a150",
    "BrickHeadz": "#e6007e",
    "City": "#1e5bd8",
    "Creator 3-en-1": "#ff6a00",
    "Racers": "#e3241b",
  };
  const THEME_ORDER = Object.keys(THEMES);
  const themeColor = (t) => THEMES[t] || "#6b7280";
  const themeRank = (t) => {
    const i = THEME_ORDER.indexOf(t);
    return i === -1 ? 999 : i;
  };

  const IMG = {
    primary: (n) => `https://cdn.rebrickable.com/media/sets/${n}-1.jpg`,
    fallback: (n) => `https://images.brickset.com/sets/images/${n}-1.jpg`,
  };
  const setUrl = (n) => `https://brickset.com/sets/${n}-1`;
  const noticeUrl = (id) => `https://www.lego.com/cdn/product-assets/product.bi.core.pdf/${id}.pdf`;

  // ── Utilitaires ──
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const normChar = (c) => c.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’‘]/g, "'");
  const norm = (s) => Array.from(String(s)).map(normChar).join("").trim();

  function highlight(text, nq) {
    if (!nq) return esc(text);
    const chars = Array.from(text);
    const normed = chars.map(normChar);
    if (normed.some((c) => c.length !== 1)) return esc(text);
    const i = normed.join("").indexOf(nq);
    if (i === -1) return esc(text);
    return esc(chars.slice(0, i).join("")) + "<mark>" + esc(chars.slice(i, i + nq.length).join("")) + "</mark>" + esc(chars.slice(i + nq.length).join(""));
  }

  // ── Brique isométrique en SVG ──
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return `rgb(${r},${g},${b})`;
  }

  function isoBrick(w, d, color) {
    const U = 20, H = 1.2, SH = 0.22, R = 0.3;
    const P = (x, y, z) => [(x - y) * 0.866 * U, (x + y) * 0.5 * U - z * U];
    const pts = (arr) => arr.map((p) => p.map((v) => v.toFixed(2)).join(",")).join(" ");
    const top = shade(color, 0.12), right = color, left = shade(color, -0.28);
    const rx = R * U * 1.2247, ry = R * U * 0.7071;

    let svg = "";
    svg += `<polygon points="${pts([P(w, 0, 0), P(w, d, 0), P(w, d, H), P(w, 0, H)])}" fill="${right}"/>`;
    svg += `<polygon points="${pts([P(0, d, 0), P(w, d, 0), P(w, d, H), P(0, d, H)])}" fill="${left}"/>`;
    svg += `<polygon points="${pts([P(0, 0, H), P(w, 0, H), P(w, d, H), P(0, d, H)])}" fill="${top}"/>`;

    const studs = [];
    for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) studs.push([i, j]);
    studs.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
    for (const [i, j] of studs) {
      const [bx, by] = P(i + 0.5, j + 0.5, H);
      const ty = by - SH * U;
      svg += `<ellipse cx="${bx}" cy="${by}" rx="${rx}" ry="${ry}" fill="${left}"/>`;
      svg += `<rect x="${bx - rx}" y="${ty}" width="${rx * 2}" height="${by - ty}" fill="${left}"/>`;
      svg += `<ellipse cx="${bx}" cy="${ty}" rx="${rx}" ry="${ry}" fill="${shade(color, 0.22)}"/>`;
    }

    const minX = -d * 0.866 * U - 1, maxX = w * 0.866 * U + 1;
    const minY = -(H + SH) * U - ry - 1, maxY = (w + d) * 0.5 * U + 1;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}">${svg}</svg>`;
  }

  // ── Briques flottantes du hero ──
  function renderFloatingBricks() {
    const C = { purple: "#7b3fe4", green: "#12a150", red: "#e3241b", blue: "#1e5bd8", yellow: "#ffd500", orange: "#ff6a00" };
    const list = [
      { x: 6, y: 50, w: 3, d: 1, c: C.purple, s: 150, r: -6, cls: "hide-sm" },
      { x: 10, y: 76, w: 1, d: 1, c: C.green, s: 70, r: 12, cls: "hide-sm" },
      { x: 84, y: 72, w: 2, d: 1, c: C.red, s: 120, r: 10, cls: "hide-sm" },
      { x: 88, y: 42, w: 1, d: 1, c: C.blue, s: 52, r: -10, cls: "hide-sm" },
      { x: 22, y: 5, w: 1, d: 1, c: C.blue, s: 46, r: 8, cls: "far" },
      { x: 95, y: 56, w: 1, d: 1, c: C.blue, s: 40, r: 0, cls: "far" },
      { x: 88, y: 12, w: 2, d: 2, c: C.yellow, s: 84, r: -12, cls: "far" },
      { x: 2, y: 22, w: 2, d: 1, c: C.orange, s: 64, r: 16, cls: "far" },
      { x: 70, y: 88, w: 1, d: 1, c: C.green, s: 40, r: 0, cls: "far hide-sm" },
    ];
    $("#floating-bricks").innerHTML = list
      .map((b, i) => `<div class="fbrick ${b.cls}" style="left:${b.x}%;top:${b.y}%;width:${b.s}px;--r:${b.r}deg;--dur:${7 + (i % 4) * 1.5}s;--delay:${-i * 1.3}s">${isoBrick(b.w, b.d, b.c)}</div>`)
      .join("");
  }

  // ── État ──
  const state = { q: "", theme: "all", sort: "theme" };

  function parseQuery(raw) {
    const q = raw.trim();
    const m = q.match(/^#?\s*(\d{3,7})(?:\s*-\s*\d+)?$/);
    if (m) return { type: "num", value: m[1] };
    return { type: "text", value: norm(q) };
  }

  function matches(set, pq) {
    if (!pq.value) return true;
    if (pq.type === "num") return set.num.startsWith(pq.value);
    return norm(set.name).includes(pq.value) || norm(set.theme).includes(pq.value) || set.num.includes(pq.value);
  }

  // ── Rendu des chips ──
  function renderChips() {
    const counts = {};
    SETS.forEach((s) => (counts[s.theme] = (counts[s.theme] || 0) + 1));
    const themes = Object.keys(counts).sort((a, b) => themeRank(a) - themeRank(b) || a.localeCompare(b));
    const chip = (key, label, n, color) =>
      `<button type="button" class="chip" role="tab" data-theme="${esc(key)}" aria-selected="${state.theme === key}" style="--c:${color}">` +
      (color ? `<span class="dot"></span>` : "") + `${esc(label)}<span class="n">${n}</span></button>`;

    $("#chips").innerHTML = chip("all", "Tous", SETS.length, "") + themes.map((t) => chip(t, t, counts[t], themeColor(t))).join("");
    $("#stat-sets").textContent = SETS.length;
    $("#stat-themes").textContent = themes.length;
  }

  // ── Rendu d'une carte ──
  function cardHTML(s, nq) {
    const c = themeColor(s.theme);
    const notices = [...new Set(s.notices || [])];
    let links = `<a href="${setUrl(s.num)}" target="_blank" rel="noopener">Voir le set ↗</a>`;
    if (notices.length === 1) links += `<a href="${noticeUrl(notices[0])}" target="_blank" rel="noopener">Notice PDF</a>`;
    else if (notices.length > 1)
      links += `<span>Notices&nbsp;: ${notices.map((id, i) => `<a href="${noticeUrl(id)}" target="_blank" rel="noopener">${i + 1}</a>`).join(" · ")}</span>`;

    return `<article class="card" id="set-${esc(s.num)}" style="--c:${c}">
      <a class="card-media" href="${setUrl(s.num)}" target="_blank" rel="noopener" aria-label="Voir le set ${esc(s.num)}">
        <img src="${IMG.primary(s.num)}" data-num="${esc(s.num)}" data-color="${c}" alt="${esc(s.name)}" loading="lazy" decoding="async">
        <span class="badge-num">${esc(s.num)}</span>
      </a>
      <div class="card-body">
        <span class="card-theme">${esc(s.theme)}</span>
        <h3>${highlight(s.name, nq)}</h3>
        <div class="card-links">${links}</div>
      </div>
    </article>`;
  }

  // Images : Rebrickable → Brickset → brique dessinée
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.dataset.num) return;
    if (!img.dataset.tried) {
      img.dataset.tried = "1";
      img.src = IMG.fallback(img.dataset.num);
    } else {
      const ph = document.createElement("div");
      ph.className = "ph";
      ph.innerHTML = isoBrick(2, 2, img.dataset.color || "#6b7280");
      img.replaceWith(ph);
    }
  }, true);

  // ── Rendu de la grille ──
  function renderGrid() {
    const pq = parseQuery(state.q);
    const nq = pq.type === "text" ? pq.value : "";
    let list = SETS.filter((s) => (state.theme === "all" || s.theme === state.theme) && matches(s, pq));

    const byNum = (a, b) => Number(a.num) - Number(b.num);
    if (state.sort === "num") list.sort(byNum);
    else if (state.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
    else list.sort((a, b) => themeRank(a.theme) - themeRank(b.theme) || a.theme.localeCompare(b.theme) || byNum(a, b));

    let html = "";
    if (state.sort === "theme") {
      let current = null;
      for (const s of list) {
        if (s.theme !== current) {
          current = s.theme;
          const n = list.filter((x) => x.theme === current).length;
          html += `<h3 class="theme-title" style="--c:${themeColor(current)}"><span class="bar"></span>${esc(current)} <small>${n} set${n > 1 ? "s" : ""}</small></h3>`;
        }
        html += cardHTML(s, nq);
      }
    } else {
      html = list.map((s) => cardHTML(s, nq)).join("");
    }

    $("#grid").innerHTML = html;
    $("#empty").hidden = list.length > 0;
    const filtered = list.length !== SETS.length;
    $("#result-count").textContent = filtered
      ? `${list.length} set${list.length > 1 ? "s" : ""} sur ${SETS.length}`
      : `${SETS.length} sets au total`;
  }

  // ── Verdict « je l'ai / je ne l'ai pas » ──
  function renderVerdict() {
    const box = $("#verdict");
    const pq = parseQuery(state.q);
    if (!pq.value) { box.innerHTML = ""; return; }

    const ownedCard = (s) => `<div class="verdict-card v-owned">
        <img class="v-img" src="${IMG.primary(s.num)}" data-num="${esc(s.num)}" data-color="${themeColor(s.theme)}" alt="">
        <div><strong>Je l'ai déjà !</strong><span>${esc(s.num)} · ${esc(s.name)} (${esc(s.theme)}). <a href="#set-${esc(s.num)}" data-jump="${esc(s.num)}">Voir dans la liste</a></span></div>
      </div>`;

    if (pq.type === "num") {
      const exact = SETS.find((s) => s.num === pq.value);
      if (exact) { box.innerHTML = ownedCard(exact); return; }
      if (pq.value.length < 4) {
        box.innerHTML = `<div class="verdict-card v-info"><div class="v-icon">⌨️</div><div><strong>Continue…</strong><span>Un numéro de set fait en général 4 ou 5 chiffres.</span></div></div>`;
        return;
      }
      box.innerHTML = `<div class="verdict-card v-free"><div class="v-icon">🎁</div><div><strong>Je ne l'ai pas !</strong><span>Le set ${esc(pq.value)} n'est pas dans ma collection : bonne idée cadeau. <a href="${setUrl(pq.value)}" target="_blank" rel="noopener">C'est lequel ? ↗</a></span></div></div>`;
      return;
    }

    const found = SETS.filter((s) => matches(s, pq));
    if (found.length === 1) { box.innerHTML = ownedCard(found[0]); return; }
    if (found.length > 1) {
      box.innerHTML = `<div class="verdict-card v-info"><div class="v-icon">🔎</div><div><strong>${found.length} sets correspondent</strong><span>Ils sont listés <a href="#collection">juste en dessous</a>. Pour être sûr, compare avec le numéro sur la boîte.</span></div></div>`;
      return;
    }
    box.innerHTML = `<div class="verdict-card v-free"><div class="v-icon">🤔</div><div><strong>Rien trouvé pour « ${esc(state.q.trim())} »</strong><span>Je ne l'ai sûrement pas. Les noms peuvent varier : vérifie avec le numéro de la boîte pour être sûr à 100 %.</span></div></div>`;
  }

  function render() {
    renderGrid();
    renderVerdict();
    $("#clear").hidden = !state.q;
  }

  // ── Événements ──
  const input = $("#q");
  input.addEventListener("input", () => {
    state.q = input.value;
    render();
    const url = new URL(location.href);
    state.q.trim() ? url.searchParams.set("q", state.q.trim()) : url.searchParams.delete("q");
    history.replaceState(null, "", url);
  });
  $("#clear").addEventListener("click", () => {
    input.value = "";
    input.dispatchEvent(new Event("input"));
    input.focus();
  });
  $("#chips").addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    state.theme = btn.dataset.theme;
    document.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-selected", c === btn));
    renderGrid();
  });
  $("#sort").addEventListener("change", (e) => {
    state.sort = e.target.value;
    renderGrid();
  });
  $("#verdict").addEventListener("click", (e) => {
    const a = e.target.closest("[data-jump]");
    if (!a) return;
    e.preventDefault();
    const card = document.getElementById(`set-${a.dataset.jump}`);
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.remove("flash");
    void card.offsetWidth;
    card.classList.add("flash");
  });

  // ── Init ──
  const owner = DATA.owner || "moi";
  document.querySelectorAll("[data-owner]").forEach((el) => (el.textContent = owner));
  document.title = `Les LEGO® de ${owner}`;
  if (DATA.updated) {
    const d = new Date(DATA.updated + "T12:00:00");
    $("#updated").textContent = isNaN(d) ? DATA.updated : d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }

  const initial = new URLSearchParams(location.search).get("q");
  if (initial) { input.value = initial; state.q = initial; }

  renderFloatingBricks();
  renderChips();
  render();
})();
