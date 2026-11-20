import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

type YouTubeEmbedProps = {
  videoId: string
  title: string
}

/** Standard 16:9 iframe embed (privacy-enhanced host). */
export function YouTubeEmbed({ videoId, title }: YouTubeEmbedProps) {
  if (!videoId.trim()) {
    return (
      <Box
        sx={{
          aspectRatio: '16 / 9',
          width: '100%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Add a YouTube video ID in <code>src/data/videoExplanations.ts</code> for this episode.
        </Typography>
      </Box>
    )
  }

  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        bgcolor: 'common.black',
      }}
    >
      <Box
        component="iframe"
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 0,
        }}
      />
    </Box>
  )
}