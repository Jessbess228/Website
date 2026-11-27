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

### Sync Consulting (required for `/website-builder`)

In another terminal, run the sibling app (Vite proxies `/website-builder` → `:5174`):

```bash
cd ../Sync-Consulting
npm install
npm run dev
```

Then open `/site-builder` on the portfolio. The live site and Admin page builder load in an iframe from `/website-builder/`.


---

