# Methynix Software — setup and handoff

This is the rebuilt site. Two parts:

- `client/` — the website (React + Vite)
- `server/` — the backend (Express) that sends contact emails and powers the staff portal

Everything you personally need to fill in is collected under **"What you need to do"** below. Search the project for the word `YOUR` to find the same spots in the files.

---

## What changed

- The sci-fi wording is gone. Copy is plain English describing web, mobile, desktop and animation work, with software first.
- New pages: **Work** (your projects), **What's new** (studio updates with the "nothing new yet" character), and a **Staff portal** at `/admin`.
- The **Process** page was removed.
- **About** now has a real map.
- **Contact** sends a real email through Resend (backend), and replies land in your inbox so you can reply straight back.
- New look: warm near-black, one teal accent (from your logo), a rare sand accent. No purple, gradients, glow or glassmorphism.

---

## Run it locally

You need Node.js 18+ installed.

### 1. Backend

```
cd server
npm install
cp .env.example .env        # then fill in .env (see below)
```

Set up the database once: open your Supabase project, go to the SQL Editor, paste the contents of `server/db/schema.sql`, and run it.

Create your staff login (uses `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env`):

```
npm run seed:admin
```

Start it:

```
npm start
```

### 2. Frontend

```
cd client
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api/v1
npm run dev
```

Open the printed local address. The staff portal is at `/admin`.

---

## What you need to do (your checklist)

### A. Company details and map — `client/src/constants/site.js`

This one file holds your email, phone, WhatsApp number, address, and the **map location**. Update:

- `email`, `phone`, `whatsapp` (digits only, e.g. `255715455422`), `addressLine`
- `map.latitude` and `map.longitude` — set these to your real location. Open OpenStreetMap or Google Maps, right-click your spot, copy the coordinates, and paste them here. The About page map uses these.

### B. Your projects (websites/apps) — done from the staff portal, no code

1. Go to `/admin`, sign in.
2. Open the **Work** tab.
3. For each project add: name, type (website / mobile / desktop), a one-line summary, the live link, and a **thumbnail image link**.

About the image link: you cannot upload a file in the form, you paste a **URL** to an image you have already hosted. Easiest options: upload the screenshot to Supabase Storage (Storage tab, make the bucket public, copy the file URL), or use a free image host like Cloudinary or imgur. Paste that URL into "Thumbnail image link". If you leave it empty, the card shows the project name instead, so nothing looks broken.

### C. What's new updates — staff portal, no code

`/admin` → **What's new** tab → write a title and text, optionally paste an image link, publish. If you publish nothing, visitors see the "Hey — nothing new yet" character. Delete removes a post.

### D. Maintenance mode — staff portal

`/admin` → **Site** tab → turn maintenance on/off. When on, visitors see a short maintenance message; you can still reach `/admin`.

### E. Email (Resend) — `server/.env`

1. Sign up at resend.com and add your domain (you already own one). Follow their DNS steps until it shows **Verified**.
2. In `server/.env` set:
   - `RESEND_API_KEY` — from the Resend dashboard
   - `MAIL_FROM` — must use your verified domain, e.g. `Methynix <hello@yourdomain.com>`
   - `MAIL_TO` — where enquiries should land (can be your Gmail)
3. Replies: when someone uses the contact form, the email to you has their address set as reply-to, so hitting "Reply" in your inbox emails the customer directly. The customer also gets an automatic "we received your message" email.

### F. Login security — `server/.env`

Set `JWT_SECRET` to a long random string (any 40+ random characters). Keep `.env` private and never commit it.

---

## Going live

- **Frontend**: build with `npm run build` in `client/` and deploy the `dist/` folder (Netlify config is already included). Set `VITE_API_URL` to your live backend URL, e.g. `https://api.yourdomain.com/api/v1`.
- **Backend**: deploy `server/` to a host like Railway or Render. Set all the `.env` values there. Set `FRONTEND_URL` to your live site address (comma-separate if more than one, e.g. `https://methynix.com,https://www.methynix.com`).
- Point the website's API at the live backend, and you are done.

---

## File map (where things live)

- Site text and map: `client/src/constants/site.js`
- Homepage: `client/src/pages/Home.jsx`
- Services wording: `client/src/pages/Services.jsx`
- Work page: `client/src/pages/Work.jsx`
- About + map: `client/src/pages/About.jsx`
- What's new + character: `client/src/pages/WhatsNew.jsx` and `client/src/components/Doll.jsx`
- Contact form: `client/src/pages/Contact.jsx`
- Staff portal: `client/src/pages/admin/`
- Colours and fonts: `client/tailwind.config.js`
- Database tables: `server/db/schema.sql`
- Email content: `server/services/mailService.js`
