/* ==========================================================================
   Olga's Birthday Wishlist
   - Renders item cards with pixel-art SVG icons
   - Syncs reservations in real-time via Firebase Firestore
   - If Firebase isn't configured, gracefully falls back to localStorage
     so the page still works (with a friendly setup hint)
   ========================================================================== */

/* ---------- ITEMS ---------- */
const ITEMS = [
  {
    id: 'coffee-set',
    name: 'Silver Cappuccino Cups',
    note: 'I\'ve been dreaming about something like this — found this pair on Vinted.',
    url: 'https://www.vinted.de/items/9668096302-vintage-silver-cappuccino-cups',
    linkLabel: 'View on Vinted',
    image: 'assets/coffee.png',
  },
  {
    id: 'jewelry-cert',
    name: 'Simuero Gift Card or Silver Earring(s)',
    note: 'A single earring for my piercing, a pair, or the gift card — whichever you prefer. I love a LOT of their jewelry.',
    url: 'https://simuero.com/collections/gift-card?srsltid=AfmBOooHli4I9f9UkQ7-B39p6SPllDyuvTTUwvrClTnbo5kYsADY1R0J',
    linkLabel: 'View on Simuero',
    image: 'assets/simuero.png',
    imageFit: 'cover',
    imagePosition: '22% center',
  },
  {
    id: 'plnts-cert',
    name: 'PLNTS Big Plant on your choice or a Gift Card',
    note: 'I would love to get a new plant. Our apartment is super sunny and hot — my banana plant feels amazing there, for reference.',
    url: 'https://plnts.com/de/',
    linkLabel: 'View on PLNTS',
    image: 'assets/plant.png',
    imageFit: 'cover',
  },
  {
    id: 'olend-bag',
    name: 'Olend Folded Bag',
    note: 'I really need a bag for my office life — this one in black.',
    url: 'https://www.olend.net/collections/backpacks/products/folded-bag?variant=55528407990607',
    linkLabel: 'View on Olend',
    image: 'assets/bag.png',
  },
  {
    id: 'sephora-cert',
    name: 'Sephora Gift Card',
    note: 'I always need something from there.',
    url: null,
    linkLabel: 'No link',
    image: 'assets/sephora.png',
    imageFit: 'contain-tight',
  },
  {
    id: 'ring',
    name: 'A Silver Ring',
    note: 'To grow my ring collection. My size: 16 mm diameter · 56 EU · 7.5 US · O–P UK.',
    url: null,
    linkLabel: 'No link',
    icon: 'ring',
  },
  {
    id: 'keychain',
    name: 'Keychain, Carabiner or iPhone Strap',
    note: 'To clip on top of my pants, or an iPhone strap with a keychain (I keep dropping my phone). In my palette — silver, white, or grey (no black, it won\'t stand out on me).',
    url: null,
    linkLabel: 'Surprise me',
    icon: 'key',
  },
  {
    id: 'dumb-tiger',
    name: 'A dumb tiger',
    note: 'Anything with a tiger that doesn\'t look normal — goofy, weird, wonky eyes. A carpet, a book, a figurine, a print. If it looks a little dumb, it\'s perfect.',
    url: null,
    linkLabel: 'Surprise me',
    image: 'assets/tiger.png',
    imageFit: 'cover',
    imagePosition: '35% 35%',
  },
];

/* ---------- PIXEL ICONS (16x16 grids, black rects) ---------- */
/* Each icon returns an SVG string. Uses shape-rendering: crispEdges to keep
   the pixel look sharp at any size. */
const PX = 'shape-rendering="crispEdges" fill="#111"';

// Helper: build an SVG from a 16x16 string grid (X = pixel, . = empty)
function gridToSvg(grid) {
  const rows = grid.trim().split('\n').map((r) => r.trim());
  const rects = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === 'X') {
        rects.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
      }
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" ${PX}>${rects.join('')}</svg>`;
}

const ICONS = {
  // Coffee cup with saucer + steam
  coffee: gridToSvg(`
    ................
    ..X..X..X.......
    .X..X..X........
    ..X..X..X.......
    ................
    XXXXXXXXX..XXX..
    X.......X.X...X.
    X.......X.X...X.
    X.......X.X...X.
    X.......X.XXXX..
    X.......X.......
    X.......X.......
    XXXXXXXXX.......
    ................
    XXXXXXXXXXX.....
    .XXXXXXXXX......
  `),

  // Classic diamond
  diamond: gridToSvg(`
    ................
    ................
    .XXXXXXXXXXXX...
    .X..X..X..X.X...
    .X.X..X..X..X...
    .XXXXXXXXXXXX...
    ..X........X....
    ..X........X....
    ...X......X.....
    ...X......X.....
    ....X....X......
    ....X....X......
    .....X..X.......
    .....X..X.......
    ......XX........
    ................
  `),

  // Potted plant with three leaves
  plant: gridToSvg(`
    ................
    ......X.........
    .....XXX........
    ....XX.XX.X.....
    ..X.X...XXX.....
    .XXXX....X......
    XX..X....X..XX..
    .X..X....X.XX...
    ..X.X....XX.....
    ....X....X......
    ....XXXXXX......
    ................
    ..XXXXXXXXX.....
    ..X........X....
    ...X......X.....
    ....XXXXXX......
  `),

  // Bag / backpack with handle
  bag: gridToSvg(`
    ................
    .....XXXXX......
    ....X.....X.....
    ....X.....X.....
    ....X.....X.....
    ..XXXXXXXXXXX...
    ..X.........X...
    ..X.........X...
    ..X..XXXXX..X...
    ..X..X...X..X...
    ..X..X...X..X...
    ..X..XXXXX..X...
    ..X.........X...
    ..X.........X...
    ..X.........X...
    ..XXXXXXXXXXX...
  `),

  // Pants
  pants: gridToSvg(`
    ................
    ..XXXXXXXXXX....
    ..X........X....
    ..X........X....
    ..X........X....
    ..X..XXXX..X....
    ..X..X..X..X....
    ..X..X..X..X....
    ..X..X..X..X....
    ..XX.X..X.XX....
    ...X.X..X.X.....
    ...X.X..X.X.....
    ...X.X..X.X.....
    ...X.X..X.X.....
    ...X.X..X.X.....
    ...XXX..XXX.....
  `),

  // Perfume bottle
  perfume: gridToSvg(`
    ................
    .....XXXX.......
    .....X..X.......
    .....X..X.......
    ...XXXXXXXX.....
    ...X......X.....
    ..XXXXXXXXXX....
    ..X........X....
    ..X..XXXX..X....
    ..X..X..X..X....
    ..X..X..X..X....
    ..X..XXXX..X....
    ..X........X....
    ..X........X....
    ..XXXXXXXXXX....
    ................
  `),

  // Ring with gem on top
  ring: gridToSvg(`
    ................
    .......XX.......
    ......XXXX......
    .....XXXXXX.....
    ......XXXX......
    .......XX.......
    ................
    ....XX....XX....
    ...X........X...
    ..X..........X..
    ..X..........X..
    ..X..........X..
    ..X..........X..
    ...X........X...
    ....XX....XX....
    ......XXXX......
  `),

  // Key (for keychain / carabiner)
  key: gridToSvg(`
    ................
    .....XXXX.......
    ....X....X......
    ....X.XX.X......
    ....X.XX.X......
    ....X....X......
    .....XXXX.......
    .......X........
    .......X........
    .......X........
    .......X........
    .......X........
    .......XX.......
    .......X........
    .......XX.......
    ................
  `),
};

/* ---------- STATE ---------- */
/**
 * reservations: { [itemId]: { reservedBy: string|null, reservedAt: number|null, sessionId: string|null } }
 * The sessionId is what identifies this browser as the reserver, so only the
 * same browser (or anyone who insists) can toggle it back off with a nudge.
 */
let reservations = {};
let firebaseReady = false;
let sessionId = getOrCreateSessionId();

/* ---------- HELPERS ---------- */
function getOrCreateSessionId() {
  let sid = localStorage.getItem('wishlist:sessionId');
  if (!sid) {
    sid = 'u_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    localStorage.setItem('wishlist:sessionId', sid);
  }
  return sid;
}

function toast(msg, duration = 2600) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('is-visible');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('is-visible'), duration);
}

function setSyncStatus(state) {
  const el = document.getElementById('sync-indicator');
  const nav = document.getElementById('nav-status');
  el.classList.remove('is-live', 'is-error');
  if (state === 'live') {
    el.classList.add('is-live');
    el.textContent = 'Syncing live';
  } else if (state === 'error') {
    el.classList.add('is-error');
    el.textContent = 'Offline · using local memory';
  } else {
    el.textContent = 'Connecting…';
  }
  updateNavStatus();
}

function updateNavStatus() {
  const reservedCount = ITEMS.filter((it) => reservations[it.id]?.reservedBy).length;
  const total = ITEMS.length;
  const available = total - reservedCount;
  const nav = document.getElementById('nav-status');
  nav.textContent = `${available} of ${total} still available`;
  const countAvailable = document.getElementById('count-available');
  if (countAvailable) countAvailable.textContent = available;
}

/* ---------- RENDER ---------- */
function renderCards() {
  const grid = document.getElementById('wish-grid');
  grid.innerHTML = ITEMS.map((item) => {
    const res = reservations[item.id];
    const isReserved = !!res?.reservedBy;
    const mine = isReserved && res?.sessionId === sessionId;
    const btnLabel = isReserved
      ? mine ? 'Un-reserve (mine)' : 'Un-reserve'
      : 'Reserve this';
    const link = item.url
      ? `<a class="wish-link" href="${item.url}" target="_blank" rel="noopener noreferrer">${item.linkLabel || 'View'}</a>`
      : `<span class="wish-link no-link">${item.linkLabel || 'Surprise me'}</span>`;

    const imgStyle = item.imagePosition
      ? ` style="object-position: ${item.imagePosition}"`
      : '';
    const themeClass = item.mediaTheme ? ` wish-media--theme-${item.mediaTheme}` : '';
    const media = item.image
      ? `<div class="wish-media wish-media--${item.imageFit || 'contain'}${themeClass}">
           <img src="${item.image}" alt="${item.name}" loading="lazy"${imgStyle} />
         </div>`
      : `<div class="wish-media wish-media--icon">${ICONS[item.icon] || ''}</div>`;

    return `
      <article class="wish-card ${isReserved ? 'is-reserved' : ''}" data-id="${item.id}">
        <span class="wish-badge">Reserved</span>
        ${media}
        <div class="wish-body">
          <h3 class="wish-name">${item.name}</h3>
          <p class="wish-note">${item.note}</p>
          ${link}
        </div>
        <div class="wish-actions">
          <button class="reserve-btn" data-id="${item.id}" data-action="${isReserved ? 'unreserve' : 'reserve'}">
            ${btnLabel}
          </button>
        </div>
      </article>
    `;
  }).join('');

  grid.querySelectorAll('.reserve-btn').forEach((btn) => {
    btn.addEventListener('click', onReserveClick);
  });

  updateNavStatus();
}

/* ---------- ACTIONS ---------- */
async function onReserveClick(e) {
  const btn = e.currentTarget;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  const item = ITEMS.find((i) => i.id === id);
  if (!item) return;

  btn.disabled = true;

  try {
    if (action === 'reserve') {
      await setReservation(id, {
        reservedBy: 'anonymous',
        reservedAt: Date.now(),
        sessionId: sessionId,
      });
      toast(`Reserved: ${item.name} · thank you `);
    } else {
      const res = reservations[id];
      const mine = res?.sessionId === sessionId;
      if (!mine) {
        const ok = confirm(
          `This item was reserved by someone else. Are you sure you want to un-reserve "${item.name}"?\n\nOnly do this if you know it's a mistake — otherwise Olga might end up with two of the same thing missing.`
        );
        if (!ok) {
          btn.disabled = false;
          return;
        }
      }
      await setReservation(id, {
        reservedBy: null,
        reservedAt: null,
        sessionId: null,
      });
      toast(`Un-reserved: ${item.name}`);
    }
  } catch (err) {
    console.error(err);
    toast('Something went wrong — try again in a sec');
  } finally {
    btn.disabled = false;
  }
}

async function setReservation(id, data) {
  if (firebaseReady) {
    const docRef = window.__db.collection('reservations').doc(id);
    if (data.reservedBy) {
      await docRef.set(data);
    } else {
      await docRef.delete();
    }
    // The onSnapshot listener will re-render.
  } else {
    if (data.reservedBy) {
      reservations[id] = data;
    } else {
      delete reservations[id];
    }
    saveLocal();
    renderCards();
  }
}

/* ---------- FIREBASE ---------- */
function initFirebase() {
  const cfg = window.WISHLIST_FIREBASE_CONFIG;
  const configured =
    cfg &&
    cfg.apiKey &&
    cfg.projectId &&
    !cfg.apiKey.includes('YOUR_') &&
    !cfg.projectId.includes('YOUR_');

  if (!configured) {
    setSyncStatus('error');
    loadLocal();
    renderCards();
    return;
  }

  try {
    firebase.initializeApp(cfg);
    const db = firebase.firestore();
    window.__db = db;
    firebaseReady = true;

    db.collection('reservations').onSnapshot(
      (snap) => {
        const next = {};
        snap.forEach((doc) => {
          const d = doc.data();
          if (d && d.reservedBy) next[doc.id] = d;
        });
        reservations = next;
        setSyncStatus('live');
        renderCards();
      },
      (err) => {
        console.error('Firestore listener error:', err);
        setSyncStatus('error');
      }
    );
  } catch (err) {
    console.error('Firebase init failed:', err);
    setSyncStatus('error');
    loadLocal();
    renderCards();
  }
}

/* ---------- LOCAL FALLBACK ---------- */
function loadLocal() {
  try {
    const raw = localStorage.getItem('wishlist:reservations');
    reservations = raw ? JSON.parse(raw) : {};
  } catch {
    reservations = {};
  }
}
function saveLocal() {
  try {
    localStorage.setItem('wishlist:reservations', JSON.stringify(reservations));
  } catch {}
}

/* ---------- BOOT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderCards();
  initFirebase();
});
