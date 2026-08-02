import { createTheme } from '@mui/material/styles'

const cream = '#F7F1E8'
const ivory = '#FFFCFA'
const ink = '#2A221F'
const cocoa = '#6B4F45'
const burgundy = '#7A1F2B'
const blush = '#E8D5CF'
const borderGrey = '#3E3A38'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: burgundy,
      contrastText: ivory,
    },
    secondary: {
      main: blush,
      contrastText: ink,
    },
    background: {
      default: cream,
      paper: ivory,
    },
    text: {
      primary: ink,
      secondary: cocoa,
    },
    divider: blush,
    // Standard MUI grey scale — use as borderColor: 'grey.500'
    grey: {
      500: borderGrey,
    },
  },
  typography: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    h1: {
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
    },
    h2: {
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      fontSize: '1.75rem',
      lineHeight: 1.25,
    },
    h3: {
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.35,
    },
    h4: {
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontWeight: 500,
      fontSize: '1.1rem',
    },
    subtitle1: {
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    body2: {
      fontSize: '0.95rem',
      lineHeight: 1.65,
    },
    overline: {
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontWeight: 600,
      letterSpacing: '0.12em',
      fontSize: '0.7rem',
    },
    button: {
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(42, 34, 31, 0.04)',
    '0 2px 8px rgba(42, 34, 31, 0.06)',
    '0 4px 16px rgba(42, 34, 31, 0.08)',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: 'smooth',
        },
        body: {
          backgroundImage:
            'radial-gradient(ellipse at top, rgba(232, 213, 207, 0.45) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(122, 31, 43, 0.04) 0%, transparent 45%)',
          backgroundAttachment: 'fixed',
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: 'transparent',
      },
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(247, 241, 232, 0.85)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${blush}`,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: cream,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: borderGrey,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: cocoa,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 20,
          '&:focus-visible': {
            outline: `2px solid ${burgundy}`,
            outlineOffset: 3,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: ivory,
          border: `1px solid ${blush}`,
          transition: 'border-color 0.25s ease, transform 0.25s ease',
        },
      },
    },
    MuiLink: {
      defaultProps: {
        underline: 'hover',
      },
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `2px solid ${burgundy}`,
            outlineOffset: 3,
            borderRadius: 2,
          },
        },
      },
    },
    MuiCardActionArea: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `2px solid ${burgundy}`,
            outlineOffset: 2,
          },
        },
      },
    },
  },
})
