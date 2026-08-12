import Button from '@mui/material/Button'
import { Link as RouterLink } from 'react-router-dom'

/** Link back to the resume home page — used on project / puppies pages. */
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
