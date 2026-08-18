# Olga's Birthday Wishlist

A tiny, single-page wishlist site that lets anyone reserve an item so no two
people bring the same gift. Live reservations sync between everyone in real
time via Firebase Firestore. No accounts, no sign-in — just click **Reserve**.

- 100% static (plain HTML/CSS/JS)
- Deploys on Vercel or GitHub Pages in one click
- Uses the same styling language as the `p` portfolio (Voxel + Aurellis
  fonts, beige background, chrome gradients, white glass cards)
- Pixel-art black icons instead of product images

---

## 1. Files

```
wishlist/
├── index.html        # Page markup
├── styles.css        # Adapted styles from the p portfolio
├── script.js         # Renders items, wires reservations, listens to Firestore
├── config.js         # Firebase project keys (paste your values here)
├── assets/
│   ├── Voxel.otf     # Hero font
│   └── Aurellis.ttf  # Fallback display font
├── vercel.json       # Cache headers for fonts
├── .gitignore
└── README.md
```

---

## 2. Why Firebase (and how the reservation model works)

There is no server. To let *everyone* see the same reservations without
requiring accounts, the page reads and writes to a single free Firebase
Firestore collection called `reservations`.

- **Anyone** can toggle Reserve / Un-reserve — this matches your ask.
- Each browser gets a random `sessionId` (stored in `localStorage`). If the
  same browser un-reserves its own item, it does so silently. If a different
  browser tries to un-reserve, we show a confirm dialog explaining "please
  don't unless it's a mistake."
- The green dot in the footer means "live sync is on." A grey/red dot means
  the page is running in local-only fallback (per-browser memory) — that
  happens only when Firebase isn't configured yet.

### Alternatives I considered and skipped

| Option | Why not |
| --- | --- |
| localStorage only | Doesn't sync between people — useless for a shared wishlist. |
| GitHub Issues / Gist | Requires OAuth for writes → forces logins. |
| Netlify Forms / Formspree | One-shot submissions, no read-back. |
| Vercel KV / Upstash Redis | Great, but requires a serverless function and a paid-ish add-on. |
| Supabase | Also great; slightly heavier setup than Firestore. |

Firebase Firestore's free tier is ridiculously generous for a birthday
wishlist (roughly 50k reads and 20k writes per day, forever free).

---

## 3. One-time Firebase setup (≈ 3 minutes)

1. Go to <https://console.firebase.google.com> and sign in with any Google
   account. Click **Add project**, name it `olga-wishlist` (or anything).
   Google Analytics can be turned off.
2. In the left sidebar → **Build → Firestore Database → Create database**.
   Start in **production** mode and pick a region close to you
   (`europe-west3` works for Germany).
3. Once created, click the **Rules** tab and paste this, then **Publish**:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /reservations/{itemId} {
         // Anyone can read/write reservations (no accounts).
         allow read: if true;

         // Delete is allowed for un-reserving.
         allow delete: if true;

         // Create/update: only the three allowed fields, correct types.
         allow create, update: if
           request.resource.data.keys().hasOnly(['reservedBy','reservedAt','sessionId'])
           && request.resource.data.reservedBy is string
           && request.resource.data.reservedAt is number
           && request.resource.data.sessionId is string;
       }
     }
   }
   ```

4. Back in **Project Overview**, click the **web** icon (`</>`) to register
   a web app. Give it a nickname (e.g. `wishlist-web`), skip Firebase
   Hosting, and copy the `firebaseConfig` object it shows you.
5. Paste those values into `config.js` in this project, replacing the
   `YOUR_*` placeholders. Save.

That's it — reload the page and the green "Syncing live" indicator should
appear.

---

## 4. Deploy to Vercel

The easiest path:

```bash
# from inside the wishlist/ folder
npx vercel
# follow the prompts, pick "Other" as framework preset
# accept defaults for build (there is no build step)
```

Or via the Vercel dashboard:

1. Push this folder to a GitHub repo (see step 5).
2. In <https://vercel.com/new>, import the repo.
3. Framework preset: **Other**. Build command: *(empty)*. Output directory:
   *(empty)*. Root directory: `wishlist` (or `.` if you pushed just this
   folder).
4. Deploy. You'll get a `https://olga-wishlist.vercel.app` URL to share.

Vercel serves the static files directly — no build step, no server code.

## 5. Push to GitHub

```bash
cd /Users/olga.pasibaieva/Documents/content/wishlist
git init
git add .
git commit -m "Olga's birthday wishlist"

# create a repo on github.com first (public or private, up to you),
# then:
git branch -M main
git remote add origin git@github.com:<your-username>/olga-wishlist.git
git push -u origin main
```

If you also want to host on **GitHub Pages** (a nice free backup URL):

1. In the repo's **Settings → Pages**, set Source to `main` branch, folder
   `/ (root)`.
2. You'll get `https://<your-username>.github.io/olga-wishlist/`.
   Both URLs will read/write the same Firestore data — so reservations
   stay in sync no matter where guests open the link.

---

## 6. Editing the wishlist

Add / remove / edit items by editing the `ITEMS` array near the top of
`script.js`. Each entry has an `icon` field pointing at one of the pixel
icons defined in the same file (`coffee`, `diamond`, `plant`, `bag`,
`pants`, `perfume`, `ring`). To add a new icon, add a new key to the
`ICONS` map with a 16×16 pixel grid (`X` = pixel, `.` = empty).

---

## 7. Sharing safely

The Firebase `apiKey` in `config.js` is safe to expose publicly — it only
identifies the project, and access is controlled by the Firestore Rules you
pasted in step 3. The rules limit writes to the `reservations` collection
with only the three allowed fields, so no one can turn your wishlist into
their own data dump.
