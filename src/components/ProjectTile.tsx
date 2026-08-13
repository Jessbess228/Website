import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import type { Project } from '../data/projects'

type ProjectTileProps = {
  project: Project
  /**
   * Position in the grid (0-based).
   * Used only to stagger the entrance animation so tiles don't all pop in together.
   */
  index?: number
}

export function ProjectTile({ project, index = 0 }: ProjectTileProps) {
  return (
    <Card
      sx={{
        height: '100%', // stretch to match tallest tile in the grid row
        animation: 'tileIn 0.6s ease both',
        // Later tiles wait a bit longer → cascade effect
        animationDelay: `${0.15 + index * 0.08}s`,
        '@keyframes tileIn': {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        // Subtle lift + border on hover
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
        },
        // Respect prefers-reduced-motion
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
          '&:hover': {
            transform: 'none',
          },
        },
      }}
    >
      {/* Whole card is one big link */}
      <CardActionArea
        component={RouterLink}
        to={`/${project.slug}`}
        sx={{ height: '100%', alignItems: 'stretch' }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            {/* Decorative accent bar */}
            <Box
              sx={{
                width: 36,
                height: 3,
                bgcolor: 'primary.main',
                borderRadius: 1,
              }}
            />
            <Typography variant="h3" component="h3">
              {project.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {project.summary}
            </Typography>
            {/* Show at most 4 stack chips so the tile stays compact */}
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ pt: 0.5 }}>
              {project.stack.slice(0, 4).map((tech) => (
                <Chip key={tech} label={tech} size="small" variant="outlined" />
              ))}
            </Stack>
            <Typography
              variant="body2"
              color="primary"
              sx={{ fontWeight: 600, pt: 0.5 }}
            >
              View project →
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
