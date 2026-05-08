let customAttractions = JSON.parse(localStorage.getItem("disneyCustomAttractions") || "[]");
let importedAttractions = JSON.parse(localStorage.getItem("disneyImportedAttractions") || "null");
let blankDays = JSON.parse(localStorage.getItem("disneyBlankDays") || "[]");
let currentDay = Number(localStorage.getItem("disneyCurrentDay") || "1");
let currentView = localStorage.getItem("disneyCurrentView") || "overview";
let currentPark = localStorage.getItem("disneyCurrentPark") || "";
let currentLand = localStorage.getItem("disneyCurrentLand") || "";
let forcedNextKey = localStorage.getItem("disneyForcedNextKey") || "";
let pendingFlashKey = "";
const state = JSON.parse(localStorage.getItem("disneyParkListState") || "{}");
const browserSave = JSON.parse(localStorage.getItem("disneyBrowserSave") || "null");

if (browserSave) {
  if (localStorage.getItem("disneyImportedAttractions") === null) importedAttractions = browserSave.importedAttractions || null;
  if (localStorage.getItem("disneyCustomAttractions") === null) customAttractions = browserSave.customAttractions || [];
  if (localStorage.getItem("disneyBlankDays") === null) blankDays = browserSave.blankDays || [];
  if (localStorage.getItem("disneyCurrentDay") === null) currentDay = Number(browserSave.currentDay || 1);
  if (localStorage.getItem("disneyCurrentView") === null) currentView = browserSave.currentView || "overview";
  if (localStorage.getItem("disneyCurrentPark") === null) currentPark = browserSave.currentPark || "";
  if (localStorage.getItem("disneyCurrentLand") === null) currentLand = browserSave.currentLand || "";
  if (localStorage.getItem("disneyForcedNextKey") === null) forcedNextKey = browserSave.forcedNextKey || "";
  if (localStorage.getItem("disneyParkListState") === null && browserSave.state) Object.assign(state, browserSave.state);
}

function activeBaseAttractions() { return importedAttractions || baseAttractions; }
function allAttractions() { return [...activeBaseAttractions(), ...customAttractions]; }
function dayItems() { return allAttractions().filter(item => Number(item.day) === Number(currentDay)); }
function days() {
  const set = new Set([...allAttractions().map(item => Number(item.day)), ...blankDays.map(Number)]);
  return [...set].filter(Boolean).sort((a, b) => a - b);
}
function key(item) { return `${item.day}|${item.park}|${item.land}|${item.name}`; }
function itemState(item) { return state[key(item)] || {}; }
function isDone(item) { return Boolean(itemState(item).done); }
function isLater(item) { return Boolean(itemState(item).later); }
function isSkipNow(item) { return Boolean(itemState(item).skipNow) || item.status === "Skip"; }
function isFavorite(item) { return Boolean(itemState(item).fav); }
function isMust(item) {
  return String(item.meaning).toLowerCase().includes("must") || String(item.color).toLowerCase().includes("green") || isFavorite(item);
}

function heightRequirement(item) {
  return String(item.height || "").trim();
}

function hasHeightInfo(item) {
  return Boolean(heightRequirement(item));
}

function activeItems() {
  return dayItems().filter(item => !isDone(item) && !isSkipNow(item));
}

function parksForDay() {
  return [...new Set(dayItems().map(item => item.park))].filter(Boolean);
}

function parkItems() {
  return dayItems().filter(item => item.park === currentPark);
}

function colorClass(color) {
  const c = String(color || "").toLowerCase();
  if (c.includes("green")) return "green";
  if (c.includes("red")) return "red";
  if (c.includes("purple")) return "purple";
  if (c.includes("orange")) return "orange";
  if (c.includes("yellow")) return "yellow";
  if (c.includes("pink")) return "pink";
  if (c.includes("blue")) return "blue";
  return "gray";
}

const icons = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 0-6h2a3 3 0 0 0 3-3V8"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="m5.7 5.7 12.6 12.6"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3z"/>',
  map: '<path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3z"/><path d="M9 3v15"/><path d="M15 6v15"/>',
  pin: '<path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  ticket: '<path d="M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3z"/><path d="M13 6v12"/>',
  list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4h11l-1.5 4L16 12H5"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M3 10h18"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  upload: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M20 16v4H4v-4"/>',
  download: '<path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M20 20H4"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  alert: '<path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 2.5 18a2 2 0 0 0 1.8 3h15.4a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  height: '<path d="M4 20h16"/><path d="M6 20V4"/><path d="M6 4h9"/><path d="M6 8h5"/><path d="M6 12h7"/><path d="M6 16h5"/>'
};

function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.list}</svg>`;
}

function buttonLabel(name, label) {
  return `${icon(name)}<span>${label}</span>`;
}

function priorityLabel(item) {
  if (item.status === "Skip" || isSkipNow(item)) return "Avoid";
  if (isFavorite(item)) return "Priority";
  if (isMust(item)) return "Must";
  if (item.booking) return "Booking";
  if (item.status === "Uncertain") return "If Time";
  if (String(item.color).toLowerCase().includes("yellow") || String(item.color).toLowerCase().includes("orange")) return "Optional";
  return item.status || "Active";
}

const tagOptions = ["Auto", "Must", "Priority", "Optional", "If Time", "Avoid"];

function tagOverride(item) {
  return itemState(item).tag || "Auto";
}

function displayTag(item) {
  const tag = tagOverride(item);
  return tag === "Auto" ? priorityLabel(item) : tag;
}

function tagClass(label, item) {
  const text = String(label).toLowerCase();
  if (text.includes("must") || text.includes("priority")) return "green";
  if (text.includes("booking")) return "purple";
  if (text.includes("optional")) return "yellow";
  if (text.includes("heads") || text.includes("if time")) return "orange";
  if (text.includes("skip") || text.includes("avoid")) return "red";
  return colorClass(item.color);
}

function tagIcon(label) {
  const text = String(label).toLowerCase();
  if (text.includes("must") || text.includes("priority")) return "star";
  if (text.includes("booking")) return "ticket";
  if (text.includes("optional")) return "flag";
  if (text.includes("heads") || text.includes("if time")) return "clock";
  if (text.includes("skip") || text.includes("avoid")) return "ban";
  return "flag";
}

function setTagOverride(k, tag) {
  state[k] = state[k] || {};
  if (tag === "Auto") {
    delete state[k].tag;
  } else {
    state[k].tag = tag;
  }
  if (tag === "Avoid") state[k].skipNow = true;
  pendingFlashKey = k;
  saveToBrowser(`Tag: ${tag}`);
  render();
}

function savedAtText(timestamp) {
  if (!timestamp) return "Saved locally";
  return `Saved ${new Date(timestamp).toLocaleTimeString([], {hour: "numeric", minute: "2-digit"})}`;
}

function updateSaveStatus(message) {
  const status = document.getElementById("saveStatus");
  if (!status) return;
  status.textContent = message || savedAtText(localStorage.getItem("disneyLastSavedAt"));
}

function actionMessage(action, nextValue) {
  if (action === "done") return nextValue ? "Marked done" : "Marked not done";
  if (action === "later") return nextValue ? "Moved to later" : "Back to active";
  if (action === "skipNow") return nextValue ? "Added to avoid" : "Removed from avoid";
  if (action === "fav") return nextValue ? "Starred" : "Unstarred";
  return "Saved";
}

let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById("actionToast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
}

function saveToBrowser(message = "Saved") {
  const savedAt = new Date().toISOString();
  const snapshot = {
    version: 2,
    savedAt,
    importedAttractions,
    customAttractions,
    blankDays,
    currentDay,
    currentView,
    currentPark,
    currentLand,
    forcedNextKey,
    state
  };

  try {
    localStorage.setItem("disneyImportedAttractions", JSON.stringify(importedAttractions));
    localStorage.setItem("disneyCustomAttractions", JSON.stringify(customAttractions));
    localStorage.setItem("disneyBlankDays", JSON.stringify(blankDays));
    localStorage.setItem("disneyCurrentDay", String(currentDay));
    localStorage.setItem("disneyCurrentView", currentView);
    if (currentPark) localStorage.setItem("disneyCurrentPark", currentPark);
    else localStorage.removeItem("disneyCurrentPark");
    if (currentLand) localStorage.setItem("disneyCurrentLand", currentLand);
    else localStorage.removeItem("disneyCurrentLand");
    if (forcedNextKey) localStorage.setItem("disneyForcedNextKey", forcedNextKey);
    else localStorage.removeItem("disneyForcedNextKey");
    localStorage.setItem("disneyParkListState", JSON.stringify(state));
    localStorage.setItem("disneyBrowserSave", JSON.stringify(snapshot));
    localStorage.setItem("disneyLastSavedAt", savedAt);
    updateSaveStatus(message);
    showToast(message);
  } catch (error) {
    alert("This browser could not save the trip. Export CSV or JSON as a backup.");
  }
}

function saveState() { saveToBrowser(); }

function setActionByKey(k, action) {
  state[k] = state[k] || {};
  state[k][action] = !state[k][action];
  if (action === "skipNow") {
    if (state[k][action]) state[k].tag = "Avoid";
    else if (state[k].tag === "Avoid") delete state[k].tag;
  }
  if (action === "done" && state[k][action]) {
    state[k].later = false;
    state[k].skipNow = false;
    if (state[k].tag === "Avoid") delete state[k].tag;
    if (forcedNextKey === k) clearForcedNext();
  }
  pendingFlashKey = k;
  saveToBrowser(actionMessage(action, state[k][action]));
  render();
}

function makeNext(k) {
  forcedNextKey = k;
  currentView = "overview";
  pendingFlashKey = k;
  saveToBrowser("Pinned as next");
  render();
}

function clearForcedNext() {
  forcedNextKey = "";
  localStorage.removeItem("disneyForcedNextKey");
}

function getCurrentPark() {
  return currentPark || parksForDay()[0] || "Trip";
}

function landsForDay() {
  return [...new Set(parkItems().map(item => item.land))].filter(Boolean);
}

function ensureCurrentPark() {
  const parks = parksForDay();
  if (!parks.includes(currentPark)) {
    const landMatch = dayItems().find(item => item.land === currentLand && item.park);
    currentPark = parks.includes(landMatch && landMatch.park) ? landMatch.park : (parks[0] || "");
  }
}

function ensureCurrentDayParkAndLand() {
  const ds = days();
  if (!ds.includes(currentDay)) currentDay = ds[0] || 1;
  ensureCurrentPark();
  const lands = landsForDay();
  if (!lands.includes(currentLand)) currentLand = lands[0] || "";
}

function setCurrentPark(park) {
  currentPark = park;
  currentLand = "";
  clearForcedNext();
  saveToBrowser("Park saved");
  render();
}

function scoreItem(item) {
  let score = 0;
  const s = itemState(item);
  if (key(item) === forcedNextKey) score += 1000;
  if (item.park === currentPark) score += 100;
  if (item.land === currentLand) score += 140;
  if (item.booking) score += 90;
  if (isMust(item)) score += 80;
  if (s.fav) score += 70;
  if (item.status === "Uncertain" || item.uncertainty) score -= 10;
  if (s.later) score -= 160;
  score -= Number(item.order || 999) / 10;
  return score;
}

function rankedItems(items) {
  return [...items].sort((a, b) => scoreItem(b) - scoreItem(a));
}

function nextBestItem() {
  const forced = activeItems().find(item => key(item) === forcedNextKey);
  if (forced) return forced;
  return rankedItems(activeItems().filter(item => !isLater(item)))[0] || null;
}

function renderTabs() {
  const tabs = document.getElementById("tabs");
  tabs.innerHTML = "";
  days().forEach(day => {
    const btn = document.createElement("button");
    btn.className = "tab" + (day === currentDay ? " active" : "");
    btn.type = "button";
    btn.innerHTML = `${icon("calendar")}<span>Day ${day}</span>`;
    btn.onclick = () => {
      currentDay = day;
      clearForcedNext();
      ensureCurrentDayParkAndLand();
      saveToBrowser("Day saved");
      render();
    };
    tabs.appendChild(btn);
  });
}

function renderParkSelector() {
  const container = document.getElementById("currentPark");
  if (!container) return;
  container.innerHTML = "";
  parksForDay().forEach(park => {
    const btn = document.createElement("button");
    btn.className = "park-chip" + (park === currentPark ? " active" : "");
    btn.type = "button";
    btn.innerHTML = `${icon("map")}<span>${park}</span>`;
    btn.onclick = () => setCurrentPark(park);
    container.appendChild(btn);
  });
}

function renderLandSelector() {
  const container = document.getElementById("currentLand");
  container.innerHTML = "";
  landsForDay().forEach(land => {
    const btn = document.createElement("button");
    btn.className = "land-chip" + (land === currentLand ? " active" : "");
    btn.type = "button";
    btn.innerHTML = `${icon("pin")}<span>${land}</span>`;
    btn.onclick = () => setCurrentLand(land);
    container.appendChild(btn);
  });
}

function setCurrentLand(land) {
  currentLand = land;
  clearForcedNext();
  saveToBrowser("Location saved");
  render();
}

function renderViews() {
  const viewIcon = {overview: "calendar", next: "flag", nearby: "map", must: "star", booking: "ticket", height: "height", later: "clock", done: "check"};
  document.querySelectorAll(".view").forEach(btn => {
    const label = btn.dataset.label || btn.textContent.trim();
    btn.dataset.label = label;
    btn.innerHTML = `${icon(viewIcon[btn.dataset.view] || "list")}<span>${label}</span>`;
    btn.classList.toggle("active", btn.dataset.view === currentView);
  });
}

function progressStats() {
  const items = dayItems();
  const done = items.filter(isDone).length;
  const bookings = activeItems().filter(item => item.booking).length;
  const nearby = activeItems().filter(item => item.land === currentLand).length;
  return {total: items.length, done, bookings, nearby};
}

function renderStats() {
  const stats = progressStats();
  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  return `
    <section class="status-grid" aria-label="Day status">
      <div class="stat">${icon("map")}<strong>${stats.nearby}</strong><span>Nearby</span></div>
      <div class="stat">${icon("ticket")}<strong>${stats.bookings}</strong><span>Bookings</span></div>
      <div class="stat">
        ${icon("check")}
        <strong>${stats.done}/${stats.total}</strong><span>Done today</span>
        <div class="stat-progress-bar"><div class="stat-progress-fill" style="width:${pct}%"></div></div>
      </div>
    </section>
  `;
}

function itemBadges(item, compact = false) {
  const tag = displayTag(item);
  const badges = [`<span class="badge ${tagClass(tag, item)}">${icon(tagIcon(tag))}<span>${tag}</span></span>`];
  const height = heightRequirement(item);
  if (height) badges.push(`<span class="badge blue">${icon("height")}<span>${height}</span></span>`);
  if (!compact && item.booking) badges.push(`<span class="badge purple">${icon("ticket")}<span>Booking</span></span>`);
  if (!compact && isLater(item)) badges.push(`<span class="badge gray">${icon("clock")}<span>Later</span></span>`);
  if (item.status === "Uncertain" || item.uncertainty) badges.push(`<span class="badge orange">${icon("clock")}<span>If Time</span></span>`);
  return badges.join("");
}

function avoidItems() {
  return dayItems().filter(item => isSkipNow(item) && !isDone(item));
}

function renderActions(item, compact = false) {
  const k = key(item);
  const s = itemState(item);
  if (compact) {
    return `
      <div class="quick-actions quick-actions--compact">
        <button class="primary-action" type="button" onclick='setActionByKey(${JSON.stringify(k)}, "done")'>${buttonLabel("check", s.done ? "Undo" : "Done")}</button>
        <button type="button" onclick='setActionByKey(${JSON.stringify(k)}, "later")'>${buttonLabel("clock", s.later ? "Now" : "Later")}</button>
        <button class="quiet-action" type="button" onclick='makeNext(${JSON.stringify(k)})'>${buttonLabel("route", "Next")}</button>
      </div>
    `;
  }
  return `
    <div class="quick-actions">
      <button class="primary-action" type="button" onclick='setActionByKey(${JSON.stringify(k)}, "done")'>${buttonLabel("check", s.done ? "Undo" : "Done")}</button>
      <button type="button" onclick='setActionByKey(${JSON.stringify(k)}, "later")'>${buttonLabel("clock", s.later ? "Now" : "Later")}</button>
      <button class="quiet-action" type="button" onclick='setActionByKey(${JSON.stringify(k)}, "skipNow")'>${buttonLabel("ban", s.skipNow ? "Unavoid" : "Avoid")}</button>
      <button type="button" onclick='setActionByKey(${JSON.stringify(k)}, "fav")'>${buttonLabel("star", s.fav ? "Unstar" : "Star")}</button>
      <button type="button" onclick='makeNext(${JSON.stringify(k)})'>${buttonLabel("route", "Make Next")}</button>
    </div>
  `;
}

function renderDetails(item) {
  const k = key(item);
  const currentTag = tagOverride(item);
  const details = [];
  details.push(`
    <label class="tag-editor">
      <span>Display tag</span>
      <select onchange='setTagOverride(${JSON.stringify(k)}, this.value)'>
        ${tagOptions.map(tag => `<option value="${tag}"${tag === currentTag ? " selected" : ""}>${tag}</option>`).join("")}
      </select>
    </label>
  `);
  if (item.meaning) details.push(`<p class="notes"><strong>Meaning:</strong> ${item.meaning}</p>`);
  if (item.height) details.push(`<p class="notes"><strong>Height:</strong> ${item.height}</p>`);
  if (item.notes) details.push(`<p class="notes"><strong>Notes:</strong> ${item.notes}</p>`);
  if (item.uncertainty) details.push(`<p class="uncertain"><strong>If Time:</strong> ${item.uncertainty}</p>`);
  if (!details.length) return "";
  return `<details class="details-toggle"><summary>${buttonLabel("list", "Details")}</summary>${details.join("")}</details>`;
}

function sectionIcon(title) {
  const text = title.toLowerCase();
  if (text.includes("nearby")) return icon("map");
  if (text.includes("booking")) return icon("ticket");
  if (text.includes("coming")) return icon("route");
  if (text.includes("must")) return icon("star");
  if (text.includes("later")) return icon("clock");
  if (text.includes("completed")) return icon("check");
  return icon("list");
}

function renderCard(item, compact = false) {
  const classes = ["card"];
  if (isDone(item)) classes.push("done");
  if (isLater(item)) classes.push("later");
  if (isSkipNow(item)) classes.push("skip-now");
  if (item.booking) classes.push("booking");
  else if (isMust(item)) classes.push("must");

  return `
    <article class="${classes.join(" ")}" data-key="${k}">
      <div class="card-main">
        <div class="card-text">
          <h3 class="name">${item.name}</h3>
          <p class="land-line">${item.land} · ${item.park}</p>
        </div>
        <div class="badges">${itemBadges(item, compact)}</div>
      </div>
      ${renderActions(item, compact)}
      ${renderDetails(item)}
    </article>
  `;
}

function renderNextUp(item) {
  if (!item) {
    return `
      <section class="mission-card empty">
        <p class="eyebrow">Next Up</p>
        <h2>Nothing active for this day</h2>
        <p class="land-line">Open Edit Trip to add stops or switch days.</p>
      </section>
    `;
  }
  const missionClass = item.booking ? "mission-booking" : isMust(item) ? "mission-must" : "";
  return `
    <section class="mission-card ${missionClass}" data-key="${key(item)}">
      <div class="mission-head">
        <div>
          <p class="eyebrow">${key(item) === forcedNextKey ? "Pinned Next" : "Next Up"}</p>
          <h2 class="mission-name">${item.name}</h2>
          <div class="mission-meta">
            <span>${item.land}</span>
            ${item.booking ? "<span>Booking needed</span>" : ""}
          </div>
        </div>
      </div>
      <div class="badges">${itemBadges(item)}</div>
      ${renderActions(item, true)}
      ${renderDetails(item)}
    </section>
  `;
}

function section(title, subtitle, items, compact = false) {
  if (!items.length) return "";
  return `
    <section class="section">
      <div class="section-head">
        <div>
          <h2>${title}</h2>
          ${subtitle ? `<p>${subtitle}</p>` : ""}
        </div>
        <p>${items.length}</p>
      </div>
      <div class="cards">${items.map(item => renderCard(item, compact)).join("")}</div>
    </section>
  `;
}

function viewItems() {
  const active = activeItems();
  if (currentView === "nearby") return rankedItems(active.filter(item => item.land === currentLand && !isLater(item)));
  if (currentView === "must") return rankedItems(active.filter(item => isMust(item) && !isLater(item)));
  if (currentView === "booking") return rankedItems(active.filter(item => item.booking && !isLater(item)));
  if (currentView === "height") return rankedItems(active.filter(item => hasHeightInfo(item) && !isLater(item)));
  if (currentView === "later") return rankedItems(dayItems().filter(item => isLater(item)));
  if (currentView === "done") return dayItems().filter(isDone).sort((a, b) => (a.order || 999) - (b.order || 999));
  return [];
}

function viewAvoidItems() {
  const avoided = avoidItems();
  if (currentView === "nearby") return rankedItems(avoided.filter(item => item.land === currentLand));
  if (currentView === "must") return rankedItems(avoided.filter(isMust));
  if (currentView === "booking") return rankedItems(avoided.filter(item => item.booking));
  if (currentView === "height") return rankedItems(avoided.filter(hasHeightInfo));
  if (currentView === "later") return rankedItems(avoided.filter(isLater));
  if (currentView === "done") return [];
  return rankedItems(avoided);
}

function renderAvoidCard(item) {
  const k = key(item);
  const canUnavoid = Boolean(itemState(item).skipNow);
  return `
    <article class="avoid-card">
      <div>
        <h3 class="name">${item.name}</h3>
        <p class="land-line">${icon("pin")}<span>${item.land}</span><span>${item.park}</span></p>
      </div>
      ${canUnavoid ? `<button type="button" onclick='setActionByKey(${JSON.stringify(k)}, "skipNow")'>${buttonLabel("route", "Unavoid")}</button>` : ""}
    </article>
  `;
}

function renderAvoidList(items) {
  if (!items.length) return "";
  return `
    <details class="avoid-list">
      <summary>${icon("ban")}<span>Avoid</span><strong>${items.length}</strong></summary>
      <div class="avoid-cards">${items.map(renderAvoidCard).join("")}</div>
    </details>
  `;
}

function render() {
  ensureCurrentDayParkAndLand();
  renderTabs();
  renderParkSelector();
  renderLandSelector();
  renderViews();
  document.getElementById("currentParkTitle").textContent = `Day ${currentDay} · ${getCurrentPark()}`;
  updateSaveStatus();

  const app = document.getElementById("app");
  const next = nextBestItem();

  if (currentView === "overview") {
    app.innerHTML = renderOverview();
    if (pendingFlashKey) {
      const el = app.querySelector(`[data-key="${pendingFlashKey.replace(/"/g, '\\"')}"]`);
      if (el) {
        el.classList.add("flash");
        setTimeout(() => el.classList.remove("flash"), 700);
      }
      pendingFlashKey = "";
    }
    return;
  }

  if (currentView !== "next") {
    const items = viewItems();
    app.innerHTML = renderStats() + renderNextUp(next) + section(viewTitle(), viewSubtitle(), items, false, viewAvoidItems());
    return;
  }

  const nearby = rankedItems(activeItems().filter(item => item.land === currentLand && key(item) !== (next && key(next)) && !isLater(item))).slice(0, 6);
  const bookings = rankedItems(activeItems().filter(item => item.booking && key(item) !== (next && key(next)) && !isLater(item))).slice(0, 4);
  const coming = rankedItems(activeItems().filter(item => item.land !== currentLand && key(item) !== (next && key(next)) && !item.booking && !isLater(item))).slice(0, 8);
  const avoided = avoidItems();
  const nearbyAvoid = rankedItems(avoided.filter(item => item.land === currentLand));
  const bookingsAvoid = rankedItems(avoided.filter(item => item.booking));
  const comingAvoid = rankedItems(avoided.filter(item => item.land !== currentLand && !item.booking));

  app.innerHTML = [
    renderStats(),
    renderNextUp(next),
    section(`Nearby in ${currentLand || "this area"}`, "Closest practical choices", nearby, true, nearbyAvoid),
    section("Booking Watch", "Items that need purchase, return time, or special attention", bookings, true, bookingsAvoid),
    section("Coming Up", "Good next moves outside the current land", coming, true, comingAvoid)
  ].join("");

  if (pendingFlashKey) {
    const el = app.querySelector(`[data-key="${pendingFlashKey.replace(/"/g, '\\"')}"]`);
    if (el) {
      el.classList.add("flash");
      setTimeout(() => el.classList.remove("flash"), 700);
    }
    pendingFlashKey = "";
  }
}

function viewTitle() {
  if (currentView === "overview") return "Day Agenda";
  if (currentView === "nearby") return `Nearby in ${currentLand}`;
  if (currentView === "must") return "Must Do";
  if (currentView === "booking") return "Bookings";
  if (currentView === "height") return "Height Rules";
  if (currentView === "later") return "Later";
  if (currentView === "done") return "Completed";
  return "Items";
}

function viewSubtitle() {
  if (currentView === "overview") return "One ordered list for the day";
  if (currentView === "nearby") return "Only active items in your current land";
  if (currentView === "must") return "Highest-priority active items";
  if (currentView === "booking") return "Anything requiring booking or special attention";
  if (currentView === "height") return "Rides with a posted height minimum or supervision rule";
  if (currentView === "later") return "Deferred items you can bring back";
  if (currentView === "done") return "Finished today";
  return "";
}

function renderCard(item, compact = false) {
  const classes = ["card"];
  if (isDone(item)) classes.push("done");
  if (isLater(item)) classes.push("later");
  if (isSkipNow(item)) classes.push("skip-now");
  if (item.booking) classes.push("booking");
  else if (isMust(item)) classes.push("must");

  return `
    <article class="${classes.join(" ")}" data-key="${key(item)}">
      <div class="card-main">
        <div class="card-text">
          <h3 class="name">${item.name}</h3>
          <p class="land-line">${icon("pin")}<span>${item.land}</span><span>${item.park}</span></p>
        </div>
        <div class="badges">${itemBadges(item, compact)}</div>
      </div>
      ${renderActions(item, compact)}
      ${renderDetails(item)}
    </article>
  `;
}

function renderOverview() {
  const items = dayItems()
    .filter(item => !isDone(item) && !isSkipNow(item) && !isLater(item))
    .sort((a, b) => (a.order || 999) - (b.order || 999) || String(a.park).localeCompare(String(b.park)) || String(a.land).localeCompare(String(b.land)) || String(a.name).localeCompare(String(b.name)));

  let lastPark = "";
  const agenda = items.map((item, index) => {
    const isCurrent = item.park === currentPark && item.land === currentLand;
    const height = heightRequirement(item);
    const tags = [
      item.booking ? "Booking" : "",
      height ? height : "",
      isMust(item) ? "Must" : "",
      item.status === "Uncertain" || item.uncertainty ? "If Time" : ""
    ].filter(Boolean);
    const parkHeader = item.park !== lastPark ? `
      <div class="overview-park${item.park === currentPark ? " active" : ""}">
        <span>${item.park}</span>
      </div>
    ` : "";
    lastPark = item.park;

    return `
      ${parkHeader}
      <article class="overview-row${isCurrent ? " active" : ""}" data-key="${key(item)}">
        <div class="overview-row-head">
          <div class="overview-index">${String(index + 1).padStart(2, "0")}</div>
          <div class="overview-item-copy">
            <h3>${item.name}</h3>
            <p>${item.park} / ${item.land}</p>
          </div>
        </div>
        ${tags.length ? `<p class="overview-tags">${tags.map(tag => `<span>${tag}</span>`).join("")}</p>` : ""}
      </article>
    `;
  }).join("");

  return `
    <section class="overview-shell">
      <div class="overview-head">
        <p class="eyebrow">${icon("calendar")}<span>Overview</span></p>
        <h2>Day ${currentDay}</h2>
        <p>${items.length} stops in order.</p>
        <p class="overview-context">${getCurrentPark()} / ${currentLand || "No land selected"}</p>
      </div>
      <div class="overview-list">${agenda || `<div class="overview-empty">No stops for this day.</div>`}</div>
    </section>
  `;
}

function renderNextUp(item) {
  if (!item) {
    return `
      <section class="mission-card empty">
        <p class="eyebrow">${icon("flag")}<span>Next Up</span></p>
        <h2>Nothing active for this day</h2>
        <p class="land-line">Open Edit Trip to add stops or switch days.</p>
      </section>
    `;
  }
  const missionClass = item.booking ? "mission-booking" : isMust(item) ? "mission-must" : "";
  return `
    <section class="mission-card ${missionClass}" data-key="${key(item)}">
      <div class="mission-head">
        <div>
          <p class="eyebrow">${icon(key(item) === forcedNextKey ? "pin" : "flag")}<span>${key(item) === forcedNextKey ? "Pinned Next" : "Next Up"}</span></p>
          <h2 class="mission-name">${item.name}</h2>
          <div class="mission-meta">
            <span>${icon("map")}<span>${item.park}</span></span>
            <span>${icon("pin")}<span>${item.land}</span></span>
            ${item.booking ? `<span>${icon("ticket")}<span>Booking needed</span></span>` : ""}
          </div>
        </div>
      </div>
      <div class="badges">${itemBadges(item)}</div>
      ${renderActions(item, true)}
      ${renderDetails(item)}
    </section>
  `;
}

function section(title, subtitle, items, compact = false, avoid = []) {
  if (!items.length && !avoid.length) return "";
  return `
    <section class="section">
      <div class="section-head">
        <div>
          <h2>${sectionIcon(title)}<span>${title}</span></h2>
          ${subtitle ? `<p>${subtitle}</p>` : ""}
        </div>
        <p>${items.length}</p>
      </div>
      ${items.length ? `<div class="cards">${items.map(item => renderCard(item, compact)).join("")}</div>` : ""}
      ${renderAvoidList(avoid)}
    </section>
  `;
}

function addItem() {
  const day = Number(document.getElementById("newDay").value || 1);
  const park = document.getElementById("newPark").value.trim();
  const land = document.getElementById("newLand").value.trim();
  const name = document.getElementById("newName").value.trim();
  if (!park || !land || !name) { alert("Add a park, land/area, and attraction/stop name."); return; }
  const color = document.getElementById("newColor").value;
  const status = document.getElementById("newStatus").value;
  const booking = document.getElementById("newBooking").value === "true";
  const order = Number(document.getElementById("newOrder").value || 999);
  const height = document.getElementById("newHeight").value.trim();
  const notes = document.getElementById("newNotes").value.trim();
  const uncertainty = document.getElementById("newUncertainty").value.trim();
  const meaning = color === "Green" ? "Must do" : color === "Purple" ? "Booking or special attention" : color === "Red" ? "Skip" : "Custom priority";
  customAttractions.push({day, park, land, name, color, meaning, booking, height, notes, status, order, uncertainty});
  currentDay = day;
  currentLand = land;
  document.getElementById("newName").value = "";
  document.getElementById("newHeight").value = "";
  document.getElementById("newNotes").value = "";
  document.getElementById("newUncertainty").value = "";
  saveToBrowser("Item saved");
  render();
}

function addBlankDay() {
  const day = Number(document.getElementById("newDay").value || 1);
  if (!blankDays.includes(day)) blankDays.push(day);
  currentDay = day;
  saveToBrowser("Day saved");
  render();
}

const csvColumns = ["day", "park", "land", "name", "color", "meaning", "booking", "height", "notes", "status", "order", "uncertainty"];

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function attractionsToCsv(items) {
  const rows = items.map(item => csvColumns.map(column => csvEscape(item[column])).join(","));
  return [csvColumns.join(","), ...rows].join("\r\n") + "\r\n";
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else if (char !== "\r") {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows.filter(fields => fields.some(field => field.trim()));
}

function normalizeHeader(header) {
  return header.trim().toLowerCase().replace(/\s+/g, "");
}

function rowToAttraction(headers, fields, lineNumber) {
  const item = {};
  headers.forEach((header, index) => {
    item[header] = fields[index] == null ? "" : fields[index].trim();
  });

  const day = Number(item.day || 0);
  const order = Number(item.order || 999);
  if (!day || !item.park || !item.land || !item.name) {
    throw new Error(`CSV line ${lineNumber} needs day, park, land, and name.`);
  }

  return {
    day,
    park: item.park,
    land: item.land,
    name: item.name,
    color: item.color || "Green",
    meaning: item.meaning || "Custom priority",
    booking: ["true", "yes", "1", "y"].includes(String(item.booking).toLowerCase()),
    height: item.height || "",
    notes: item.notes || "",
    status: item.status || "Active",
    order: order || 999,
    uncertainty: item.uncertainty || ""
  };
}

function setImportStatus(message) {
  const status = document.getElementById("importStatus");
  if (status) status.textContent = message;
}

function exportCsv() {
  const blob = new Blob([attractionsToCsv(allAttractions())], {type: "text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "disney-park-list-attractions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function importCsv(event) {
  const input = event.target;
  const file = input.files && input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const rows = parseCsv(String(reader.result || ""));
      if (rows.length < 2) throw new Error("CSV needs a header row and at least one attraction row.");

      const headers = rows[0].map(normalizeHeader);
      const required = ["day", "park", "land", "name"];
      const missing = required.filter(column => !headers.includes(column));
      if (missing.length) throw new Error(`CSV is missing required column(s): ${missing.join(", ")}.`);

      const imported = rows.slice(1).map((fields, index) => rowToAttraction(headers, fields, index + 2));
      if (!confirm(`Import ${imported.length} CSV item(s)? This replaces the base trip list in this browser and clears manually added items.`)) {
        input.value = "";
        return;
      }

      importedAttractions = imported;
      customAttractions = [];
      blankDays = [];
      currentDay = days()[0] || 1;
      currentPark = "";
      currentLand = "";
      ensureCurrentDayParkAndLand();
      saveToBrowser("CSV saved");
      setImportStatus(`Imported ${imported.length} CSV item(s).`);
      render();
    } catch (error) {
      alert(error.message || "Could not import CSV.");
      setImportStatus("CSV import failed.");
    } finally {
      input.value = "";
    }
  };
  reader.readAsText(file);
}

function exportData() {
  const data = {baseAttractions: activeBaseAttractions(), customAttractions, blankDays, state};
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "disney-park-list-data.json";
  a.click();
  URL.revokeObjectURL(url);
}

function resetCustom() {
  if (!confirm("Clear the days/items you added and any imported CSV? Original scanned items stay.")) return;
  customAttractions = [];
  importedAttractions = null;
  blankDays = [];
  clearForcedNext();
  localStorage.removeItem("disneyCustomAttractions");
  localStorage.removeItem("disneyImportedAttractions");
  localStorage.removeItem("disneyBlankDays");
  saveToBrowser("Reset saved");
  setImportStatus("");
  render();
}

function resetToDefault() {
  if (!confirm("Reset this browser to the default trip state? This clears imported data, custom items, saved location, filters, and edits.")) return;
  customAttractions = [];
  importedAttractions = null;
  blankDays = [];
  currentDay = 1;
  currentView = "next";
  currentPark = "";
  currentLand = "";
  forcedNextKey = "";
  pendingFlashKey = "";
  Object.keys(state).forEach(key => delete state[key]);

  const keys = [
    "disneyImportedAttractions",
    "disneyCustomAttractions",
    "disneyBlankDays",
    "disneyCurrentDay",
    "disneyCurrentView",
    "disneyCurrentPark",
    "disneyCurrentLand",
    "disneyForcedNextKey",
    "disneyParkListState",
    "disneyBrowserSave",
    "disneyLastSavedAt"
  ];
  keys.forEach(key => localStorage.removeItem(key));
  saveToBrowser("Reset to default");
  setImportStatus("Restored default trip state.");
  render();
}

function toggleEditPanel(force) {
  const panel = document.getElementById("editPanel");
  const open = typeof force === "boolean" ? force : !panel.classList.contains("open");
  panel.classList.toggle("open", open);
  panel.setAttribute("aria-hidden", String(!open));
}

function toggleTopMenu(force) {
  const menu = document.getElementById("topMenu");
  const button = document.getElementById("menuButton");
  const open = typeof force === "boolean" ? force : !menu.classList.contains("open");
  menu.classList.toggle("open", open);
  button.classList.toggle("open", open);
  button.setAttribute("aria-expanded", String(open));
  button.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
}

document.querySelectorAll(".view").forEach(btn => btn.addEventListener("click", () => {
  currentView = btn.dataset.view;
  saveToBrowser("View saved");
  toggleTopMenu(false);
  render();
}));

render();
