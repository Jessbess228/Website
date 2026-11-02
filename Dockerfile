# Cloud Run image: Vite SPA + Django puppy API + baked SQLite snapshot.
# Website builder is not included.

FROM node:22-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

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
