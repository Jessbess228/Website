# Jessica Berry — Portfolio Website

Personal portfolio site for [jessicaberry.info](https://jessicaberry.info).

- **Frontend:** Vite + React + TypeScript + MUI (this repo)
- **API (puppies project page):** Go service in the sibling repo
  [`puppy_data-collection`](https://github.com/Jessbess228/puppy_data-collection)

---

## Local development

### Frontend

```bash
npm install --ignore-scripts
npm run dev
```

Open `http://127.0.0.1:5173` in your browser.
The puppy page calls the Go service directly at `http://127.0.0.1:8080`. There is no `/api` proxy; Go's default CORS origins allow Vite's `localhost:5173` and `127.0.0.1:5173`.

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

In a second terminal, start the Go service:

```bash
cd ../puppy_data-collection
cp .env.example .env   # set THE_DOG_API_KEY if it is not already configured
go run ./cmd/puppyserver
```

For production, build the frontend with `VITE_PUPPY_API_BASE_URL` set to the Go service's public origin (for example, `https://puppy-api.example.com`). For the Docker image, pass it as `--build-arg VITE_PUPPY_API_BASE_URL=https://puppy-api.example.com`. Set `CORS_ALLOWED_ORIGINS` on the Go service to include the website's origin. The production website container serves static files and does not run or proxy the puppy API.

### Sync Consulting (required for `/website-builder`)

In another terminal, run the sibling app (Vite proxies `/website-builder` → `:5174`):

```bash
cd ../Sync-Consulting
npm install
npm run dev
```

Then open `/site-builder` on the portfolio. The live site and Admin page builder load in an iframe from `/website-builder/`.


---
