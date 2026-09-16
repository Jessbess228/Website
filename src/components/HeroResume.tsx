import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { design as d, weight } from '../designTokens'
import { contact, education, experience, skillCategories, summary } from '../data/resume'

/** Small caps label used above every block ("CONTACT", "EXPERIENCE", …). */
function BlockLabel({ children }: { children: ReactNode }) {
  return (
    <Typography
      component="h3"
      sx={{
        fontFamily: d.sans,
        fontWeight: weight.bold,
        fontSize: 11,
        textTransform: 'uppercase',
        color: d.sage,
        m: 0,
      }}
    >
      {children}
    </Typography>
  )
}

type TimelineEntryProps = {
  title: string
  org: string
  dates: string
  /** Draws the connector rail down to the next entry. Omit on the last one. */
  showConnector?: boolean
  children?: ReactNode
}

/** One dotted-rail row, shared by the Experience and Education blocks. */
function TimelineEntry({ title, org, dates, showConnector, children }: TimelineEntryProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
      {/* Rail: 6px dot, then a hairline that stretches to the next entry */}
      <Box
        aria-hidden
        sx={{
          width: 16,
          flexShrink: 0,
          alignSelf: 'stretch',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // Nudges the dot down onto the title's optical centre
          pt: '12px',
        }}
      >
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: d.rose, flexShrink: 0 }} />
        {showConnector && (
          <Box sx={{ width: '1px', flex: 1, bgcolor: d.hairline, opacity: 0.4, mt: '4px' }} />
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, pb: 3, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Box
          sx={{
            display: 'flex',
            // Dates drop below the title on phones, where a long title would
            // otherwise wrap around them
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'baseline' },
            justifyContent: 'space-between',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              flexWrap: 'wrap',
              gap: 1,
              flex: 1,
              minWidth: 0,
            }}
          >
            <Typography
              component="h4"
              sx={{ fontFamily: d.display, fontWeight: weight.regular, fontSize: 18, color: d.ink, m: 0 }}
            >
              {title}
            </Typography>
            <Typography
              component="span"
              sx={{ fontFamily: d.sans, fontWeight: weight.bold, fontSize: 14, color: d.rose }}
            >
              {org}
            </Typography>
          </Box>
          <Typography
            component="span"
            sx={{
              fontFamily: d.sans,
              fontWeight: weight.bold,
              fontSize: 12,
              textTransform: 'uppercase',
              color: d.sage,
              whiteSpace: 'nowrap',
            }}
          >
            {dates}
          </Typography>
        </Box>
        {children}
      </Box>
    </Box>
  )
}

/** Body copy inside a timeline entry — the design's Lato Light 13px/1.5. */
const detailSx = {
  fontFamily: d.sans,
  fontWeight: weight.light,
  fontSize: 13,
  lineHeight: 1.5,
  color: d.body,
} as const

type ContactPill = { label: string; href: string }

/**
 * Hand-cut edges so the pills read as torn paper rather than rectangles.
 * Percentages scale with the element, so one shape suits any label length.
 * Opacity is applied to the background only, keeping the text fully opaque —
 * fading the whole element would drop the label's contrast with it.
 */
const pillShapes = [
  {
    clipPath: 'polygon(0% 12%, 5% 0%, 95% 0%, 100% 15%, 97% 85%, 92% 100%, 5% 98%, 0% 85%)',
    opacity: 1,
  },
  {
    clipPath: 'polygon(0% 0%, 90% 0%, 100% 10%, 100% 90%, 88% 100%, 0% 100%)',
    opacity: 0.85,
  },
  {
    clipPath: 'polygon(5% 0%, 95% 0%, 100% 8%, 100% 92%, 95% 100%, 5% 100%, 0% 92%, 0% 8%)',
    opacity: 0.75,
  },
  {
    clipPath: 'polygon(0% 0%, 92% 0%, 100% 12%, 98% 88%, 100% 100%, 8% 100%, 0% 88%, 2% 12%)',
    opacity: 0.65,
  },
]

/**
 * The summary is authored with line breaks, which HTML would otherwise collapse
 * into one paragraph. Split on them so each line gets its own row, matching the
 * job summaries.
 */
const summaryLines = summary
  .split(/\n+/)
  .map((line) => line.trim())
  .filter(Boolean)

const contactPills: ContactPill[] = [
  { label: contact.email, href: `mailto:${contact.email}` },
  { label: contact.phone, href: `tel:${contact.phone}` },
  { label: contact.github.label, href: contact.github.url },
  { label: contact.linkedin.label, href: contact.linkedin.url },
]

export function HeroResume() {
  return (
    <Box
      sx={{
        display: 'flex',
        // Stacks below md; the design only specifies the wide two-column layout
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'stretch',
        minHeight: { md: 720 },
      }}
    >
      {/* ---------- Left: photo + frosted card ---------- */}
      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          // Card sits centred on the photo, both axes
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 4, md: 6 },
          // Narrower right inset lets the card run further towards the resume
          // panel, so the photo shows more on the left than the right
          pr: { md: 2 },
          minHeight: { xs: 460, md: 'auto' },
          backgroundImage: 'url(/images/finely-cropped.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'left center',
          // Knocks the photo back so the card copy stays legible
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(58, 48, 48, 0.15)',
            pointerEvents: 'none',
          },
        }}
      >
        <Stack
          spacing={3}
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: { xs: 540, md: 640 },
            p: { xs: 3, md: '36px' },
            bgcolor: 'rgba(250, 250, 250, 0.63)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 12px 24px rgba(58, 48, 48, 0.11)',
          }}
        >
          <Typography
            sx={{
              fontFamily: d.sans,
              fontWeight: weight.black,
              fontSize: 11,
              textTransform: 'uppercase',
              color: d.rose,
            }}
          >
            ✦ {contact.role}
          </Typography>

          <Typography
            variant="h1"
            sx={{
              fontFamily: d.display,
              fontWeight: weight.regular,
              fontSize: { xs: 36, md: 44 },
              lineHeight: 1.1,
              letterSpacing: 0,
              color: d.ink,
            }}
          >
            {contact.name}
          </Typography>

          <Stack spacing={0.75}>
            {summaryLines.map((line) => (
              <Typography
                key={line}
                sx={{
                  fontFamily: d.sans,
                  fontWeight: weight.light,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: d.body,
                }}
              >
                {line}
              </Typography>
            ))}
          </Stack>

          <Box aria-hidden sx={{ height: '1px', bgcolor: d.hairline, opacity: 0.5 }} />

          <Stack spacing={1.75}>
            <BlockLabel>Contact</BlockLabel>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {contactPills.map((pill, i) => {
                const shape = pillShapes[i % pillShapes.length]
                return (
                  <Box
                    key={pill.label}
                    component="a"
                    href={pill.href}
                    // Only the profile links leave the site; mailto / tel should not
                    // open a blank tab
                    {...(pill.href.startsWith('http')
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    // The focus ring lives on this unclipped wrapper, because
                    // clip-path on the face below would crop an outline away.
                    sx={{
                      display: 'inline-block',
                      textDecoration: 'none',
                      '&:hover .ContactPill-face': { backgroundColor: d.ink },
                      '&:focus-visible': {
                        outline: `2px solid ${d.ink}`,
                        outlineOffset: 3,
                      },
                    }}
                  >
                    <Typography
                      className="ContactPill-face"
                      component="span"
                      sx={{
                        display: 'block',
                        px: '20px',
                        py: '14px',
                        backgroundColor: `rgba(${d.roseRgb}, ${shape.opacity})`,
                        clipPath: shape.clipPath,
                        color: d.offWhite,
                        fontFamily: d.sans,
                        fontWeight: weight.bold,
                        fontSize: 12,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      {pill.label}
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          </Stack>
        </Stack>
      </Box>

      {/* ---------- Right: resume panel ---------- */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          bgcolor: d.panel,
          px: { xs: 3, sm: 4, md: 8 },
          py: { xs: 5, md: 6 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3.5,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontFamily: d.display,
            fontWeight: weight.regular,
            fontSize: 32,
            letterSpacing: 0,
            color: d.ink,
          }}
        >
          Resume
        </Typography>

        <Stack spacing={1.5}>
          <BlockLabel>Experience</BlockLabel>
          <Box>
            {experience.map((job, i) => (
              <TimelineEntry
                key={`${job.company}-${job.title}`}
                title={job.title}
                org={job.company}
                dates={job.dates}
                showConnector={i < experience.length - 1}
              >
                <Stack spacing={0.75}>
                  {job.bullets.map((line) => (
                    <Typography key={line} sx={detailSx}>
                      {line}
                    </Typography>
                  ))}
                </Stack>
              </TimelineEntry>
            ))}
          </Box>
        </Stack>

        <Stack spacing={1.5}>
          <BlockLabel>Education</BlockLabel>
          <TimelineEntry
            title={education.degree}
            org={education.school}
            dates={education.dates}
          >
            <Typography sx={detailSx}>{education.note}</Typography>
          </TimelineEntry>
        </Stack>

        <Stack spacing={1.5}>
          <BlockLabel>Skills</BlockLabel>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            {skillCategories.map((group) => (
              // Groups are unlabelled — they exist only to split the pills into columns
              <Stack key={group.items.join('|')} spacing={1} sx={{ alignSelf: 'start' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {group.items.map((item) => (
                    <Typography
                      key={item}
                      component="span"
                      sx={{
                        px: 1.5,
                        py: 0.75,
                        bgcolor: d.offWhite,
                        border: `1px solid ${d.panel}`,
                        borderRadius: '6px',
                        fontFamily: d.sans,
                        fontWeight: weight.regular,
                        fontSize: 12,
                        color: d.pillInk,
                      }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Stack>
            ))}
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}
