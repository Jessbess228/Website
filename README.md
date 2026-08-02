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

This matches a working setup used on EC2:

| Piece | Role | Port |
|-------|------|------|
| **Caddy** | Public HTTPS/HTTP entry for `jessicaberry.info` | 80 / 443 |
| **`serve`** | Serves the Vite `dist/` SPA | 9000 |
| **Django** | Puppy search API | 8080 |

```text
Internet → Caddy (jessicaberry.info)
              ├─ /api/*  → reverse_proxy → Django :8080
              └─ /*      → reverse_proxy → serve  :9000  (static React app)
```

Use an Amazon Linux AMI (yum/dnf). Open security group ports **80** and **443** (and **22** for SSH). You do **not** need to expose 8080 or 9000 publicly if Caddy proxies them on localhost.

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

python manage.py migrate
```

Run Django (keeps running in background for a simple setup):

```bash
source /home/ec2-user/puppy_data-collection/.venv/bin/activate
cd /home/ec2-user/puppy_data-collection
python manage.py runserver 0.0.0.0:8080 &
```

Check:

```bash
curl -i http://127.0.0.1:8080/api/puppies/
# expect JSON, status 200
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

Serve the production build on port **9000** (Caddy will proxy to it):

```bash
cd /home/ec2-user/Website
npx --yes serve -s dist -l 9000 &
```

`-s` enables SPA fallback so routes like `/puppies` work.

Check:

```bash
curl -I http://127.0.0.1:9000/
# expect 200
```

## Common failures

| Symptom | Likely cause | Fix |
|--------|----------------|-----|
| UI: “Could not reach the puppy API” | Caddy sends `/api` to port 9000 (SPA) instead of Django | Use `handle /api/*` → `8080` **before** the catch-all to `9000` |
| `GET /api/puppies/` returns HTML | Same as above (SPA fallback) | Fix Caddyfile; `curl` should show JSON |
| HTTP **304** on assets/API in `serve` logs | Browser cache / static server “Not Modified” | Not fatal; if API is wrong, still fix proxy. Hard-refresh browser |
| `yarn: command not found` | Yarn not installed | Use `npm` (`npm install --ignore-scripts`, `npm run build`) |
| Django import / Python errors | Wrong Python version | Use **Python 3.12** venv (`python3.12 -m venv .venv`) |
| Port 80 already in use | Nginx or old Caddy | `sudo systemctl stop nginx`; `caddy stop` then start again |
| Site works on EC2 curl but not in browser | Security group / DNS | Open 80/443; confirm DNS A record → Elastic IP |

## Project scripts (this repo)

| Command | Purpose |
|---------|---------|
| `npm install --ignore-scripts` | Install deps without running package lifecycle scripts |
| `npm run dev` | Local Vite dev server |
| `npm run build` | Typecheck + production build → `dist/` |
| `npm run preview` | Local preview of `dist/` |
