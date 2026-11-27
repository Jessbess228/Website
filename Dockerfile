# Cloud Run image: Vite SPA + Django puppy API + baked SQLite snapshot.
# Set SYNC_APP_ORIGIN on Cloud Run to proxy /website-builder/ and /cms-api to the builder service.

FROM node:22-bookworm-slim AS frontend
WORKDIR /app
RUN corepack enable && corepack prepare yarn@4.18.0 --activate
COPY package.json yarn.lock .yarnrc.yml ./
# Yarn's lockfile includes Rollup's Linux binaries; npm's macOS lockfile does not.
RUN yarn install --immutable
COPY . .
RUN yarn build

FROM python:3.12-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx gettext-base \
    && rm -rf /var/lib/apt/lists/* \
    && rm -f /etc/nginx/sites-enabled/default

RUN pip install --no-cache-dir \
    gunicorn \
    "django>=5.0" \
    "djangorestframework>=3.15" \
    "django-cors-headers>=4.0" \
    python-dotenv

COPY puppy-api /opt/puppy
COPY data/puppies.db /opt/puppy/data_files/puppies.db
COPY --from=frontend /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV PORT=8080 \
    DJANGO_DEBUG=false \
    ENABLE_FETCH_SCHEDULER=false \
    DJANGO_ALLOWED_HOSTS=* \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
