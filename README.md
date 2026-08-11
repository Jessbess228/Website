# Jessica Berry — Portfolio Website

Personal portfolio site for [jessicaberry.info](https://jessicaberry.info).

- **Frontend:** Vite + React + TypeScript + MUI (this repo)
- **API (puppies project page):** Django app in the sibling repo  
  [`puppy_data-collection`](https://github.com/Jessbess228/puppy_data-collection)

---

## Local development

### Frontend

```bash
npm install --ignore-scripts
npm run dev
```

Have open in browser `http://127.0.0.1:9000`.  
Vite proxies `/api` → `http://127.0.0.1:8080` (see `vite.config.ts`).

### Production build (local)

```bash
npm install --ignore-scripts
npm run build
```

Output is in `dist/`. Preview with:

```bash
npx --yes serve -s dist -l 9000
```

### Puppy API (required for `/puppies`)

In a second terminal:

```bash
cd ../puppy_data-collection
python3.12 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -e .
cp .env.example .env   # set THE_DOG_API_KEY
python manage.py migrate
python manage.py runserver 8080
```

---

## Deploy on Amazon EC2 (Amazon Linux)

This matches the working setup on EC2 for [jessicaberry.info](https://jessicaberry.info).

| Piece | Role | Port |
|-------|------|------|
| **Caddy** | Public HTTPS/HTTP entry for `jessicaberry.info` | 80 / 443 |
| **`serve`** | Serves the Vite `dist/` SPA | 9000 |
| **Django** | Puppy search API | 8080 |

```text
Internet → Caddy (jessicaberry.info)
              ├─ /api*   → reverse_proxy → Django :8080
              └─ /*      → reverse_proxy → serve  :9000  (static React app)
```

Use an Amazon Linux AMI (yum/dnf). Open security group ports **80** and **443** (and **22** for SSH). You do **not** need to expose 8080 or 9000 publicly if Caddy proxies them on localhost.

### Why we got HTTP 502 (and how we fixed it)

Two separate problems showed up as “site down” / empty puppies UI:

1. **Processes died when SSH exited → 502**  
   Starting Django and `serve` with a bare `&` still ties them to the SSH session. On `exit`, they receive `SIGHUP` and stop. Caddy keeps running, has nothing healthy on `:8080` / `:9000`, and returns **502 Bad Gateway**.  
   **Fix:** start both with `nohup ... &` (or `systemd` / `tmux`) so they survive logout.

2. **Caddy path matcher too narrow → UI “Could not reach the puppy API”**  
   The React app calls relative URLs like `/api/puppies/` and `/api/puppies/filters/`.  
   `handle /api/*` only matches **one** path segment after `/api/`, so:
   - `/api/puppies/` → Django (JSON) ✓  
   - `/api/puppies/filters/` → fell through to `serve` → SPA `index.html` ✗  
   The browser then failed to parse HTML as JSON.  
   **Fix:** use `handle /api*` (prefix match) so nested API routes reach Django. Confirm with `curl -sI` that **both** endpoints return `content-type: application/json`.

HTTP **304** in `serve` logs is normal cache behaviour (“Not Modified”), not the root cause.

---

### 1. Install Python 3.12 and clone the API repo

```bash
cd /home/ec2-user
sudo dnf install -y python3.12 python3.12-pip python3.12-devel git

git clone https://github.com/Jessbess228/puppy_data-collection.git
cd puppy_data-collection

python3.12 -m venv .venv
source .venv/bin/activate
python --version   # expect 3.12.x
pip install -U pip
pip install -e .

cp .env.example .env
# edit .env — at minimum:
#   THE_DOG_API_KEY=your_key_from_thedogapi.com
#   MAX_PUPPIES=6
#   ENABLE_FETCH_SCHEDULER=true
#   DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost,jessicaberry.info,www.jessicaberry.info,<EC2_PUBLIC_IP>

python manage.py migrate
```

Start Django with **`nohup`** so it survives SSH logout (`-u` unbuffers logs):

```bash
cd /home/ec2-user/puppy_data-collection
source .venv/bin/activate
nohup python3 -u manage.py runserver 0.0.0.0:8080 > /tmp/django-8080.log 2>&1 &
```

Check:

```bash
lsof -i :8080
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8080/api/puppies/
# expect 200 and JSON from: curl -s http://127.0.0.1:8080/api/puppies/ | head -c 200
tail -n 30 /tmp/django-8080.log
```

Optional one-shot seed without waiting for the scheduler:

```bash
python manage.py fetch_puppies
```

---

### 2. Install Node/npm and build the Website

```bash
cd /home/ec2-user
sudo yum install -y nodejs npm
node -v   # prefer 18+ if available from your AMI

git clone https://github.com/Jessbess228/Website.git
cd Website

# Safer install: do not run dependency lifecycle scripts
npm install --ignore-scripts
npm run build
```

Confirm output:

```bash
ls dist
# assets/  index.html  vite.svg
```

The chunk-size warning from Vite (`> 500 kB`) is OK to ignore for this site.

Serve the production build on port **9000** with **`nohup`** (Caddy will proxy to it):

```bash
cd /home/ec2-user/Website
nohup npx --yes serve -s dist -l 9000 > /tmp/serve-9000.log 2>&1 &
```

`-s` enables SPA fallback so routes like `/puppies` work.

Check:

```bash
lsof -i :9000
curl -I http://127.0.0.1:9000/
# expect 200
```

---

### 3. Caddy reverse proxy

Vite’s dev proxy does **not** apply to `serve dist`. In production, Caddy must send `/api*` to Django and everything else to the SPA.

Example `/etc/caddy/Caddyfile`:

```caddy
{
	auto_https disable_redirects
}

jessicaberry.info, www.jessicaberry.info {
	handle /api* {
		reverse_proxy 127.0.0.1:8080
	}

	handle {
		reverse_proxy 127.0.0.1:9000
	}
}
```

On this host Caddy may **not** be a systemd unit. Prefer:

```bash
caddy validate --config /etc/caddy/Caddyfile
caddy reload --config /etc/caddy/Caddyfile
# if reload says Caddy is not running:
#   pkill caddy || true
#   nohup caddy run --config /etc/caddy/Caddyfile > /tmp/caddy.log 2>&1 &
```

Do **not** use `handle /api/*` alone — nested routes like `/api/puppies/filters/` will miss Django and return `index.html`.

---

### 4. Verify end-to-end (from your laptop)

Both API routes must be JSON (not HTML):

```bash
curl -sI "https://jessicaberry.info/api/puppies/" | grep -i content-type
curl -sI "https://jessicaberry.info/api/puppies/filters/" | grep -i content-type
# expect: content-type: application/json for both
```

Then hard-refresh the browser (`Cmd + Shift + R`) on `/puppies`.

On the instance, confirm backends are still up after you `exit` SSH and reconnect:

```bash
lsof -i :8080
lsof -i :9000
ps aux | grep -E 'caddy|manage.py|serve -s' | grep -v grep
```

## Common failures

| Symptom | Likely cause | Fix |
|--------|----------------|-----|
| HTTP **502** after SSH `exit` | Django / `serve` started with bare `&` and died on logout | Restart with `nohup ... > /tmp/….log 2>&1 &` |
| UI: “Could not reach the puppy API” | Caddy sends some `/api` paths to port 9000 (SPA HTML) | Use `handle /api*` → `8080` **before** the catch-all to `9000` |
| `/api/puppies/` JSON but `/api/puppies/filters/` HTML | Matcher `/api/*` is too narrow (one segment) | Change to `/api*`; reload Caddy |
| `GET /api/...` returns `index.html` | Same proxy miss / SPA fallback | Fix Caddyfile; `curl -sI` must show `application/json` |
| HTTP **304** in `serve` logs | Browser / static cache “Not Modified” | Harmless; not a 502. Hard-refresh if the UI looks stale |
| `yarn: command not found` | Yarn not installed | Use `npm` (`npm install --ignore-scripts`, `npm run build`) |
| Django import / Python errors | Wrong Python version | Use **Python 3.12** venv (`python3.12 -m venv .venv`) |
| `systemctl reload caddy` → unit not found | Caddy not installed as a systemd service | Use `caddy reload --config /etc/caddy/Caddyfile` or `caddy run` under `nohup` |
| Port 80 already in use | Nginx or old Caddy | Stop the other listener; start Caddy again |
| Site works on EC2 curl but not in browser | Security group / DNS / CDN cache | Open 80/443; confirm DNS A record; purge CDN cache for `/api*` if used |

## Project scripts (this repo)

| Command | Purpose |
|---------|---------|
| `npm install --ignore-scripts` | Install deps without running package lifecycle scripts |
| `npm run dev` | Local Vite dev server |
| `npm run build` | Typecheck + production build → `dist/` |
| `npm run preview` | Local preview of `dist/` |
