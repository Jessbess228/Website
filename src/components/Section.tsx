import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { design as d, weight } from '../designTokens'

type SectionProps = {
  id?: string
  eyebrow?: string
  title: string
  children: ReactNode
}

export function Section({ id, eyebrow, title, children }: SectionProps) {
  return (
    <Box
      component="section"
      id={id}
      sx={{
        py: { xs: 5, md: 7 },
        // When Nav is sticky, this keeps the heading visible under it
        scrollMarginTop: 80,
      }}
    >
      {/* Wide enough for the two-column project grid to match the Figma proportions */}
      <Box sx={{ maxWidth: 1080, mx: 'auto' }}>
        {eyebrow && (
          <Typography
            sx={{
              display: 'block',
              mb: 1,
              fontFamily: d.sans,
              fontWeight: weight.bold,
              fontSize: 11,
              textTransform: 'uppercase',
              color: d.rose,
            }}
          >
            {eyebrow}
          </Typography>
        )}
        {/* Matches the "Resume" panel heading — no rule underneath */}
        <Typography
          component="h2"
          sx={{
            mb: 4,
            fontFamily: d.display,
            fontWeight: weight.regular,
            fontSize: 32,
            color: d.ink,
          }}
        >
          {title}
        </Typography>
        {/* Caller then supplies the section body */}
        {children}
      </Box>
    </Box>
  )
}
