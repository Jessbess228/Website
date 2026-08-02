import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

type SectionProps = {
  id?: string
  eyebrow?: string
  title: string
  children: ReactNode
  wide?: boolean
}

export function Section({ id, eyebrow, title, children, wide }: SectionProps) {
  return (
    <Box
      component="section"
      id={id}
      sx={{
        py: { xs: 5, md: 7 },
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
