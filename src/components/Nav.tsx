import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { contact } from '../data/resume'

const homeLinks = [
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
]

export function Nav() {
  const { pathname } = useLocation()
  const onHome = pathname === '/'

  return (
    <AppBar position="sticky">
      <Toolbar
        sx={{
          maxWidth: 960,
          width: '100%',
          mx: 'auto',
          gap: 2,
          justifyContent: 'space-between',
          py: 0.5,
        }}
      >
        <Typography
          component={RouterLink}
          to="/"
          variant="subtitle1"
          color="text.primary"
          sx={{
            textDecoration: 'none',
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 600,
            lineHeight: 1.2,
            '&:hover': { color: 'primary.main' },
          }}
        >
          {contact.name}
        </Typography>

        <Box
          component="nav"
          aria-label="Primary"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.5, sm: 1 },
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          {onHome &&
            homeLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                color="text.secondary"
                variant="body2"
                sx={{
                  px: { xs: 0.75, sm: 1 },
                  py: 0.5,
                  display: { xs: 'none', sm: 'inline' },
                }}
              >
                {link.label}
              </Link>
            ))}
          <Button
            component="a"
            href={`mailto:${contact.email}`}
            variant="contained"
            size="small"
            color="primary"
          >
            Contact
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
