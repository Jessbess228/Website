import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
/* Pulls email / location / name from resume data so contact info stays in one place. */
import { contact } from '../data/resume'

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 4,
        mt: 2,
        textAlign: 'center',
      }}
    >
      {/* mailto opens the default mail client */}
      <Typography variant="body2" color="text.secondary">
        <Link href={`mailto:${contact.email}`} color="inherit">
          {contact.email}
        </Link>
        {' · '}
        {contact.location}
      </Typography>
      {/* Year is computed at render time so it stays current */}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        © {new Date().getFullYear()} {contact.name}
      </Typography>
    </Box>
  )
}
