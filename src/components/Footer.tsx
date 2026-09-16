import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { design as d, weight } from '../designTokens'
/* Pulls email / location / name from resume data so contact info stays in one place. */
import { contact } from '../data/resume'

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: '1px solid',
        borderTopColor: 'rgba(201, 160, 160, 0.4)',
        py: 4,
        mt: 2,
        textAlign: 'center',
      }}
    >
      {/* mailto opens the default mail client */}
      <Typography
        sx={{ fontFamily: d.sans, fontWeight: weight.light, fontSize: 13, color: d.body }}
      >
        <Link
          href={`mailto:${contact.email}`}
          underline="none"
          sx={{
            fontWeight: weight.bold,
            color: d.rose,
            '&:hover': { color: d.ink },
            '&:focus-visible': { outline: `2px solid ${d.rose}`, outlineOffset: 3 },
          }}
        >
          {contact.email}
        </Link>
        {' · '}
        {contact.phone}
      </Typography>
      {/* Year is computed at render time so it stays current */}
      <Typography
        sx={{
          mt: 0.5,
          fontFamily: d.sans,
          fontWeight: weight.light,
          fontSize: 12,
          color: d.sage,
        }}
      >
        © {new Date().getFullYear()} {contact.name}
      </Typography>
    </Box>
  )
}
