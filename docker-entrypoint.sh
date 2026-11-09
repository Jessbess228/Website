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
location = /website-builder {
    return 301 /website-builder/;
}

location /website-builder/ {
    proxy_pass ${origin};
    proxy_http_version 1.1;
    proxy_ssl_server_name on;
    proxy_set_header Host ${host};
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header X-Real-IP \$remote_addr;
}

location /cms-api {
    proxy_pass ${origin};
    proxy_http_version 1.1;
    proxy_ssl_server_name on;
    proxy_set_header Host ${host};
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header X-Real-IP \$remote_addr;
}
EOF
else
  cat > /etc/nginx/conf.d/proxies/sync.conf <<'EOF'
location = /website-builder {
    return 301 /website-builder/;
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

gunicorn \
  --chdir /opt/puppy \
  --bind 127.0.0.1:8081 \
  --workers 1 \
  --threads 4 \
  --access-logfile - \
  --error-logfile - \
  config.wsgi:application &

exec nginx -g 'daemon off;'
