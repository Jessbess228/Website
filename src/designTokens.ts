/**
 * designTokens.ts — palette and type scale taken from the Figma home page frame.
 *
 * These live outside theme.ts because the redesign is being rolled out surface
 * by surface: the home page, Nav, and Footer use these values, while the
 * project pages still render against the older cream/burgundy MUI theme.
 * Once every page is migrated these should fold into theme.ts proper.
 */
export const design = {
  rose: '#A0646E',
  /** Same colour as `rose`, for rgba() when only the background should fade. */
  roseRgb: '160, 100, 110',
  ink: '#1A1515',
  body: '#6B5050',
  sage: '#8A9E8A',
  panel: '#F0EDED',
  offWhite: '#FAFAFA',
  /** Tag background on the project cards. */
  sageTint: '#D4E2D4',
  pillInk: '#3A3030',
  hairline: '#C9A0A0',
  /** `hairline` at 40% — the border on panels, inputs and rules. */
  hairlineSoft: 'rgba(201, 160, 160, 0.4)',
  /** Card surface on the project pages, brighter than the page background. */
  card: '#FFFFFF',
  /** Sits behind a card image until (or unless) the photo loads. */
  imagePlaceholder: '#E8E3DE',
  display: '"Playfair Display", Georgia, serif',
  sans: '"Lato", system-ui, sans-serif',
}

/**
 * Lato ships only 300/400/700/900 on Google Fonts, so the design's Medium (500)
 * and SemiBold (600) are mapped to the nearest real weights the browser would
 * pick anyway. Requesting 500/600 would silently fall back and risk faux-bold.
 */
export const weight = { light: 300, regular: 400, bold: 700, black: 900 }
