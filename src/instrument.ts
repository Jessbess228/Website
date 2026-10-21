import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://e17bad93f0c7424c045824d9250630ef@o4512263690452992.ingest.us.sentry.io/4512293656854528',
  environment: import.meta.env.MODE,
})
