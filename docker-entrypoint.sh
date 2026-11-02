#!/bin/sh
set -eu

PORT="${PORT:-8080}"
export PORT
export DJANGO_DEBUG="${DJANGO_DEBUG:-false}"
export ENABLE_FETCH_SCHEDULER="${ENABLE_FETCH_SCHEDULER:-false}"
export DJANGO_ALLOWED_HOSTS="${DJANGO_ALLOWED_HOSTS:-*}"

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
