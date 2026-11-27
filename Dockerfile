# Cloud Run image: static Vite SPA; puppy data comes from the Go API service.
# Set SYNC_APP_ORIGIN on Cloud Run to proxy /website-builder/ and /cms-api to the builder service.

FROM node:22-bookworm-slim AS frontend
WORKDIR /app
ARG VITE_PUPPY_API_BASE_URL=https://puppy-collector-190658296050.australia-southeast1.run.app
ENV VITE_PUPPY_API_BASE_URL=${VITE_PUPPY_API_BASE_URL}
RUN corepack enable && corepack prepare yarn@4.18.0 --activate
COPY package.json yarn.lock .yarnrc.yml ./
# Yarn's lockfile includes Rollup's Linux binaries; npm's macOS lockfile does not.
RUN yarn install --immutable
COPY . .
RUN yarn build

FROM node:22-bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx gettext-base \
    && rm -rf /var/lib/apt/lists/* \
    && rm -f /etc/nginx/sites-enabled/default

COPY --from=frontend /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV PORT=8080

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
