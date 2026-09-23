import Box from '@mui/material/Box'

/** Portfolio host: Website Nav stays in App.tsx; the builder fills the rest. */
export function SyncConsultingPage() {
  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        // Sticky Nav is ~52px (16px padding + 20px icon). Iframe takes the rest.
        height: 'calc(100dvh - 52px)',
      }}
    >
      <Box
        component="iframe"
        title="Website Builder"
        src="/sync-app/"
        sx={{
          flex: 1,
          width: '100%',
          border: 0,
          display: 'block',
        }}
      />
    </Box>
  )
}
