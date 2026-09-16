import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Toolbar from '@mui/material/Toolbar'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { design as d, weight } from '../designTokens'

export function Nav() {
  const { pathname } = useLocation()
  const onHome = pathname === '/'

  return (
    // position="sticky" keeps the bar visible while scrolling.
    // Styling is set here rather than in theme.ts so the bar matches the
    // Figma home page (flat off-white) instead of the older cream theme.
    <AppBar
      position="sticky"
      sx={{
        bgcolor: d.offWhite,
        borderBottom: `1px solid ${d.panel}`,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: 'unset',
          justifyContent: 'space-between',
          px: { xs: 3, md: '48px' },
          py: '16px',
        }}
      >
        <Box
          component={RouterLink}
          to="/"
          aria-label="Home"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Box
            component="img"
            src="/images/house.svg"
            alt=""
            sx={{ width: 20, height: 20, display: 'block' }}
          />
        </Box>

        <Box component="nav" aria-label="Primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <Link
            href={onHome ? '#projects' : '/#projects'}
            underline="none"
            sx={{
              px: '12px',
              py: '8px',
              fontFamily: d.sans,
              fontWeight: weight.bold,
              fontSize: 12,
              textTransform: 'uppercase',
              color: d.sage,
              whiteSpace: 'nowrap',
              '&:hover': { color: d.rose },
              '&:focus-visible': { outline: `2px solid ${d.rose}`, outlineOffset: 2 },
            }}
          >
            Projects
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
