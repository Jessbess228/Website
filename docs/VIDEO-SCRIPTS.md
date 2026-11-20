# Architecture video scripts (~2 min each)

Plain-language narration for jessicaberry.info. Optional **[VISUAL]** cues are not spoken unless you want them.

---

## 1 — The website you see in the browser

What you’re looking at is the **face** of the project: the pages, buttons, colours, and navigation on jessicaberry.info.

It’s built with a toolset called React. Think of it like **Lego for web pages**: screens are designed as components, and the browser assembles them when you visit. When you click “Puppies” or “Website Builder,” the address bar changes but the page doesn’t fully reload every time—it swaps content inside one app, which feels faster.

This part **doesn’t store your data**. It **asks** the server for puppy lists or shows an embedded builder. On my laptop, a helper redirects those requests to the right backend during development; in production, that’s nginx’s job.

**[VISUAL]** Browser → jessicaberry.info → React Router → MUI components.

**Closing line:** The browser app is the storefront—it shows information and sends requests, but it isn’t the warehouse or the cash register in the back.

---

## 2 — The web server that sorts incoming traffic

Inside the main cloud container, **nginx** is like a **receptionist** at a building with several rooms.

Someone asks for a picture or a page file? Receptionist grabs it from the filing cabinet—the built website files. Someone asks for puppy data? Receptionist walks the request to the **Python/Django room** at `/api` and brings back the answer.

Someone wants the **website builder** tools? Receptionist forwards them to a **second building** (another cloud service), but the visitor still thinks they’re on jessicaberry.info. That matters so the builder can sit inside a frame on the portfolio page without security headaches.

We also fixed a nasty bug where the receptionist sent people to the wrong door with “port 8080” in the URL—the internal staff entrance, not the public website.

**Closing line:** Nginx decides “static page, puppy database, or builder?” and routes each request correctly.

### Code to show on screen (Layer 2)

| Behaviour | File | Lines |
|-----------|------|-------|
| SPA refresh fallback | `nginx.conf` | 29–31 |
| Proxy `/api` → Gunicorn | `nginx.conf` | 18–25 |
| Start Gunicorn, then nginx | `docker-entrypoint.sh` | 84–93 |
| Proxy builder + `/cms-api` to `sync` | `docker-entrypoint.sh` | 20–61 |
| 503 if `SYNC_APP_ORIGIN` unset | `docker-entrypoint.sh` | 64–77 |

---

## 3 — The puppies “brain” (Django)

The puppies demo isn’t fake data hard-coded into the site. There’s a **small backend program** whose job is: *given a search, return matching dogs as structured data*.

It runs **behind** nginx. You only see `/api/...` on the same domain. The puppies page types in a search box; the server looks in its database and sends back a list; React draws the table.

Gunicorn handles more than one visitor at a time without falling over—like having more than one clerk at the counter.

**Closing line:** Django is the clerk that looks up dogs and answers in a format the front page understands.

### Code to show on screen (Layer 3)

| Behaviour | File | Lines |
|-----------|------|-------|
| Mount API at `/api/` | `puppy-api/config/urls.py` | 4–7 |
| Routes `puppies/`, `puppies/filters/` | `puppy-api/dogs/urls.py` | 5–8 |
| GET search + filters | `puppy-api/dogs/views.py` | 41–81, 90–125 |
| Browser `fetch` | `src/api/puppies.ts` | 108–128 |
| Local dev proxy | `vite.config.ts` | 9–14 |

---

## 4 — Where the dog data comes from and how it stays fresh

The dogs live in a **database file**—think of it as a **spreadsheet on disk**. When the site first goes live, it ships with a copy already inside the image so the page isn’t empty.

A separate **public dog API** is the original source. Code can **periodically call that API**, pull new breeds, and merge them into the spreadsheet.

On my computer, a **background timer** does that automatically. In the cloud, that’s often turned off—containers restart; the right pattern is a scheduled “refresh” job in GCP.

The browser **never** holds the secret key to the dog API. Only the server does.

**Closing line:** Data is fetched behind the scenes into a local store; the website only reads that store through the puppy API.

---

## 5 — The page builder (what Sonja edits)

The Sync Consulting marketing site is a **second mini-website**: drag-and-drop sections—hero, photos, text blocks, footer, booking button.

The whole page is really **one big recipe file** (JSON). The live site **follows the recipe**. Admin mode is the **kitchen** where you change the recipe and hit Save.

It runs as its own cloud service under `/website-builder/`, but visitors often see it **inside a frame** on the portfolio—same domain.

**Closing line:** Puck is visual editing; the recipe file is the real page; the public site follows that recipe.

---

## 6 — The back office for the builder (login, save, bookings)

A small server next to the builder handles **jobs the editor shouldn’t do in the browser**.

**Login:** Password in admin; server sets a private cookie. **Save:** Full layout JSON written to `LAYOUT_PATH` (disk or GCS). **Bookings:** POST validates input, sends email, logs to JSON.

**Closing line:** The CMS is the locked office—auth, saving the page, and sending booking emails.

### Code to show on screen (Layer 6)

Repo: **Sync-Consulting**

| Behaviour | File | Lines |
|-----------|------|-------|
| Nginx → Koa `/cms-api` | `nginx.conf.template` | 8–16 |
| POST login + cookie | `cms/server.js` | 95–105 |
| GET session check | `cms/server.js` | 107–109, 56–62 |
| GET public layout | `cms/server.js` | 111–116, 77–91 |
| PUT save layout | `cms/server.js` | 130–147 |
| POST bookings | `cms/server.js` | 151–196 |
| React: session, save | `src/lib/layoutStorage.ts` | 33–78 |
| React: booking POST | `src/lib/BookingForm.tsx` | 40–44 |

---

## 7 — Why there are two cloud services (website + sync)

**Service one (website):** Portfolio, puppy demo, nginx forwards builder traffic.

**Service two (sync):** Builder + CMS.

Both use one domain. `SYNC_APP_ORIGIN` on **website** tells nginx where to forward `/website-builder/` and `/cms-api`.

Redeploying is **twofold**: portfolio changes → **website**; builder changes → **sync**. Merging GitHub without a new Cloud Run build does not update production.

**Closing line:** Two apps, one front door—the portfolio is the door; the builder is a room behind it.

### Code to show on screen (Layer 7)

| Behaviour | File | Lines |
|-----------|------|-------|
| Iframe same-origin | `src/pages/ProjectPage.tsx` | 74–78 |
| `SYNC_APP_ORIGIN` → proxy config | `docker-entrypoint.sh` | 20–61 |
| Local dev proxy | `vite.config.ts` | 15–23 |

---

## 8 — Why layout “disappeared” after deploy (persistent storage)

Saving felt fine, then after redeploy the old page came back.

Containers are like **hotel rooms**—notes on the notepad vanish on the next swap unless you use shared storage.

**Google Cloud Storage** is that shared safe: mount the bucket at `/var/cms-layout`, set `LAYOUT_PATH`, redeploy code that reads layout via `/cms-api/public-layout`.

**Closing line:** Saving only inside a temporary container doesn’t stick; a cloud bucket is the permanent notebook for the page.

---

## Quick cheat sheet

| Lay term | Technical layer |
|----------|-----------------|
| What you click and read | React portfolio |
| Traffic director | nginx |
| Dog lookup clerk | Django API |
| Spreadsheet + API refresh | SQLite + fetch job |
| Drag-and-drop site | Puck on `sync` |
| Password, save, email | Koa CMS |
| Two buildings, one address | `website` + `SYNC_APP_ORIGIN` |
| Permanent save file | GCS bucket + `LAYOUT_PATH` |

---

## Recording tips

- ~140 words/minute for ~2:00 per script.
- One diagram per video (browser → nginx → app).
- Show DevTools or `curl` once per layer where code is listed.