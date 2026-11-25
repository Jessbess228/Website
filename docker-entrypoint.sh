#!/bin/sh
set -eu

PORT="${PORT:-8080}"
export PORT
export DJANGO_DEBUG="${DJANGO_DEBUG:-false}"
export ENABLE_FETCH_SCHEDULER="${ENABLE_FETCH_SCHEDULER:-false}"
export DJANGO_ALLOWED_HOSTS="${DJANGO_ALLOWED_HOSTS:-*}"

mkdir -p /etc/nginx/conf.d/proxies

host_of() {
  printf '%s' "$1" | sed 's|^[a-zA-Z][a-zA-Z0-9+.-]*://||; s|/.*||'
}

strip_slash() {
  printf '%s' "$1" | sed 's|/*$||'
}

if [ -n "${SYNC_APP_ORIGIN:-}" ]; then
  origin="$(strip_slash "$SYNC_APP_ORIGIN")"
  host="$(host_of "$origin")"
  cat > /etc/nginx/conf.d/proxies/sync.conf <<EOF
# /website-builder (no slash) was the old project URL; send it to the SPA route.
location = /website-builder {
    return 308 /site-builder;
}

# Proxy /website-builder/… (iframe + builder assets) to the sync Cloud Run service.
location /website-builder/ {
    proxy_pass ${origin};
    proxy_http_version 1.1;
    proxy_ssl_server_name on;
    proxy_set_header Host ${host};
    proxy_set_header X-Forwarded-Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_redirect http://${host}/ https://\$host/;
    proxy_redirect https://${host}/ https://\$host/;
    proxy_redirect http://\$host:8080/ https://\$host/;
    proxy_redirect https://\$host:8080/ https://\$host/;
    # Cloud Run may send DENY; same-origin iframe needs these stripped at the portfolio proxy.
    proxy_hide_header X-Frame-Options;
    proxy_hide_header Content-Security-Policy;
    proxy_hide_header Cross-Origin-Opener-Policy;
    proxy_hide_header Cross-Origin-Resource-Policy;
    proxy_hide_header Cross-Origin-Embedder-Policy;
}

location /cms-api {
    proxy_pass ${origin};
    proxy_http_version 1.1;
    proxy_ssl_server_name on;
    proxy_set_header Host ${host};
    proxy_set_header X-Forwarded-Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_cookie_path / /;
}
EOF
else
  cat > /etc/nginx/conf.d/proxies/sync.conf <<'EOF'
location = /website-builder {
    return 308 /site-builder;
}

location /website-builder/ {
    default_type text/plain;
    return 503 "Website builder is not configured. Set SYNC_APP_ORIGIN on this Cloud Run service.";
}

location /cms-api {
    default_type text/plain;
    return 503 "Website builder is not configured. Set SYNC_APP_ORIGIN on this Cloud Run service.";
}
EOF
fi

envsubst '${PORT}' < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

# Ignore stale Cloud Run env (e.g. data_files/puppies.db); always restore from bake.
export PUPPIES_DATABASE_PATH="/opt/puppy/data/puppies.db"
PUPPIES_DB="$PUPPIES_DATABASE_PATH"
BAKED_DB="/opt/puppy/puppies.db.baked"
mkdir -p "$(dirname "$PUPPIES_DB")"
if [ ! -s "$BAKED_DB" ]; then
  echo "ERROR: missing baked puppies.db at $BAKED_DB" >&2
  exit 1
fi
cp -f "$BAKED_DB" "$PUPPIES_DB"
if [ ! -s "$PUPPIES_DB" ]; then
  echo "ERROR: failed to copy puppies.db to $PUPPIES_DB" >&2
  exit 1
fi
if ! python3 -c "
import sqlite3, sys
con = sqlite3.connect('${PUPPIES_DB}')
con.execute('SELECT 1 FROM dogs_puppy LIMIT 1')
" 2>/dev/null; then
  echo "ERROR: ${PUPPIES_DB} has no dogs_puppy table (use repo data/puppies.db in the image)" >&2
  exit 1
fi

export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-config.settings}"
if [ -z "$DJANGO_SETTINGS_MODULE" ] || [ "$DJANGO_SETTINGS_MODULE" = "django.conf.global_settings" ]; then
  echo "ERROR: DJANGO_SETTINGS_MODULE must be config.settings (check Cloud Run env vars)" >&2
  exit 1
fi

# Opt-in: wrapping gunicorn with opentelemetry-instrument breaks Django settings when always on.
if [ "${ENABLE_OTEL_INSTRUMENT:-false}" = "true" ] && [ -n "${OTEL_EXPORTER_OTLP_ENDPOINT:-}" ]; then
  OTEL_CMD="opentelemetry-instrument"
else
  OTEL_CMD=""
fi

$OTEL_CMD gunicorn \
  --chdir /opt/puppy \
  --bind 127.0.0.1:8081 \
  --workers 1 \
  --threads 4 \
  --access-logfile - \
  --error-logfile - \
  config.wsgi:application &

exec nginx -g 'daemon off;'
