import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

type SectionProps = {
  /** Optional HTML id for nav hash links (e.g. #experience) */
  id?: string
  eyebrow?: string
  title: string
  children: ReactNode
  /** Wider content column (default is 720px) */
  wide?: boolean
}

/** Shared home-page section: eyebrow + title + children. */
export function Section({ id, eyebrow, title, children, wide }: SectionProps) {
  return (
    <Box
      component="section"
      id={id}
      sx={{
        py: { xs: 5, md: 7 },
        // Keeps hash targets below the sticky nav when scrolling
        scrollMarginTop: 80,
      }}
    >
      <Box sx={{ maxWidth: wide ? 880 : 720, mx: 'auto' }}>
        {eyebrow && (
          <Typography
            variant="overline"
            color="primary"
            sx={{ display: 'block', mb: 1 }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography
          variant="h2"
          component="h2"
          sx={{
            mb: 3,
            pb: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {title}
        </Typography>
        {children}
      </Box>
    </Box>
  )
}
