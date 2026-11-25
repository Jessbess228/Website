# Deploy Website to Cloud Run

Merging a PR into **`main`** only updates GitHub. **Production (`jessicaberry.info`) does not change until you deploy a new Cloud Run revision** from that commit.

## Build error: `could not parse reference` … `/Website:…`

Docker image names must be **lowercase**. Change the Cloud Build / Cloud Run image from **`Website`** → **`website`**, or use this repo’s root **`cloudbuild.yaml`**.

Example:

```text
gcr.io/PROJECT_ID/website:$COMMIT_SHA
```

## After every merge to `main`

1. [Cloud Run](https://console.cloud.google.com/run) → **`asia-east1`** → service **`website`**.
2. Deploy a new revision built from latest **`main`** (or run the Cloud Build trigger).
3. Verify:

```bash
curl -s https://jessicaberry.info/api/puppies/health/
# expect JSON: {"ok":true,"dogs_puppy_rows":74,...}

curl -s -o /dev/null -w "%{http_code}\n" https://jessicaberry.info/api/puppies/filters/
# expect 200
```

### CLI

```bash
cd ~/Documents/Website
export PROJECT_ID="$(gcloud config get-value project)"

gcloud builds submit --config cloudbuild.yaml .

gcloud run deploy website \
  --image "gcr.io/${PROJECT_ID}/website:latest" \
  --region asia-east1 \
  --allow-unauthenticated
```

Keep existing env vars (`SYNC_APP_ORIGIN`, etc.) on the service.

## Cloud Run env (puppies + OTEL)

| Variable | Recommendation |
|----------|----------------|
| `PUPPIES_DATABASE_PATH` | **Remove** if set (image uses `/opt/puppy/data/puppies.db`). |
| `DJANGO_SETTINGS_MODULE` | **`config.settings`** or unset. Never empty / `django.conf.global_settings`. |
| `ENABLE_FETCH_SCHEDULER` | `false` (image default). |
| `ENABLE_OTEL_INSTRUMENT` | Leave unset/`false` until `/api/puppies/health/` is green; then `true` with OTLP vars. |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Only with `ENABLE_OTEL_INSTRUMENT=true` (otherwise Gunicorn is not wrapped). |

### Log: `global_settings` has no attribute `ROOT_URLCONF`

Django is not loading `config.settings`. Usually **`opentelemetry-instrument`** wrapping Gunicorn. Unset OTLP **or** set `ENABLE_OTEL_INSTRUMENT=false`, confirm API is 200, then redeploy an image that requires opt-in before turning OTEL back on.
