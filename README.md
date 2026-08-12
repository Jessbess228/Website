# Jessica Berry — Portfolio Website

Personal portfolio for [jessicaberry.info](https://jessicaberry.info).

- **Frontend:** Vite + React + TypeScript + MUI (this repo)
- **API** (puppies page): [`puppy_data-collection`](https://github.com/Jessbess228/puppy_data-collection)

---

## Local development

```bash
npm install --ignore-scripts
npm run dev
```

Open the URL Vite prints (usually `http://127.0.0.1:5173`). `/api` is proxied to `http://127.0.0.1:8080`.

For `/puppies`, run the API in another terminal:

```bash
cd ../puppy_data-collection
python3.12 -m venv .venv && source .venv/bin/activate
pip install -U pip && pip install -e .
cp .env.example .env   # set THE_DOG_API_KEY
python manage.py migrate
python manage.py runserver 8080
```

Production build locally:

```bash
npm run build
npx --yes serve -s dist -l 9000
```

---

## Production on EC2

```text
Internet → Caddy (jessicaberry.info)
              ├─ /api*  → Django :8080
              └─ /*     → static site :9000
```

Open security group ports **80**, **443**, and **22**. Keep **8080** / **9000** private (Caddy proxies on localhost).

Unit files live in [`deploy/`](deploy/). Prefer **systemd** so processes stay up after SSH logout.

### First-time setup

**1. API**

```bash
cd /home/ec2-user
sudo dnf install -y python3.12 python3.12-pip python3.12-devel git
git clone https://github.com/Jessbess228/puppy_data-collection.git
cd puppy_data-collection

python3.12 -m venv .venv && source .venv/bin/activate
pip install -U pip && pip install -e .
cp .env.example .env   # THE_DOG_API_KEY, DJANGO_ALLOWED_HOSTS, etc.
python manage.py migrate
```

**2. Website**

```bash
cd /home/ec2-user
sudo yum install -y nodejs npm
git clone https://github.com/Jessbess228/Website.git
cd Website
npm install --ignore-scripts
npm run build
```

**3. Start services**

```bash
sudo pkill -f 'serve -s dist' || true
sudo pkill -f 'manage.py runserver' || true

sudo cp /home/ec2-user/Website/deploy/website-serve.service /etc/systemd/system/
sudo cp /home/ec2-user/Website/deploy/puppy-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now website-serve puppy-api
```

**4. Caddy** (`/etc/caddy/Caddyfile`)

Use `/api*` (not `/api/*`) so nested routes like `/api/puppies/filters/` hit Django:

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

```bash
caddy validate --config /etc/caddy/Caddyfile
caddy reload --config /etc/caddy/Caddyfile
```

**5. Smoke check**

```bash
curl -sI "https://jessicaberry.info/api/puppies/" | grep -i content-type
curl -sI "https://jessicaberry.info/api/puppies/filters/" | grep -i content-type
# both should be application/json
```

---

## Redeploy

```bash
# Frontend
cd /home/ec2-user/Website
git pull
npm install --ignore-scripts   # if package.json changed
npm run build
sudo systemctl restart website-serve

# API (when that repo changed)
cd /home/ec2-user/puppy_data-collection
git pull
source .venv/bin/activate
pip install -e .               # if dependencies changed
python manage.py migrate       # if there are new migrations
sudo systemctl restart puppy-api
```

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm install --ignore-scripts` | Install deps |
| `npm run dev` | Local Vite server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview `dist/` |
