import Button from '@mui/material/Button'
import { Link as RouterLink } from 'react-router-dom'

export function BackHome() {
  return (
    <Button
      component={RouterLink}
      to="/"
      color="primary"
      size="small"
      sx={{
        fontWeight: 600,
        px: 0,
        minWidth: 0,
        mb: 3,
        alignSelf: 'flex-start',
      }}
    >
      ← Back home
    </Button>
  )
}
