/**
 * Color tokens for light and dark mode.
 *
 * `accent` (the neon lilac, #c084fc) is the one color that is
 * intentionally IDENTICAL in both palettes -- the project owner asked
 * explicitly for the neon accent to stay constant across themes, since
 * it's meant to glow the same way regardless of background.
 *
 * `accentText` is a *different* token: a purple in the same hue family
 * used for actual body/heading text (card titles, section labels).
 * Using the literal #c084fc for text would read fine on a dark
 * background but fail contrast on a light one (it's how the light-mode
 * app already looked before dark mode existed -- headings used a
 * darker #6b21a8, not the glow color itself). accentText is allowed to
 * differ per theme so text stays legible; accent does not.
 */
export interface ColorPalette {
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceDisabled: string;
  border: string;
  borderMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  /** Neon lilac -- identical in light and dark palettes by design. */
  accent: string;
  /** Purple used for legible text/headings; differs per theme for contrast. */
  accentText: string;
  accentSurface: string;
  /**
   * Dark purple used as a *filled* background behind white text/icons
   * (selected chips, primary buttons). Also constant across themes,
   * like `accent` -- a solid button doesn't need to invert, and this
   * shade keeps white-on-top text legible in both. This is what
   * previously was an unrelated blue (#1f6feb) scattered across a few
   * components; unified here so the app has exactly one accent
   * identity instead of two.
   */
  accentSolid: string;
  error: string;
  errorSurface: string;
  warning: string;
}

const ACCENT = '#c084fc';

export const lightPalette: ColorPalette = {
  background: '#ffffff',
  surface: '#ffffff',
  surfaceMuted: '#f7f9fb',
  surfaceDisabled: '#f4f5f6',
  border: '#c7ccd1',
  borderMuted: '#e4e9ee',
  textPrimary: '#102a43',
  textSecondary: '#52606d',
  textMuted: '#7b8794',
  textDisabled: '#9aa5b1',
  accent: ACCENT,
  accentText: '#6b21a8',
  accentSurface: '#faf5ff',
  accentSolid: '#6b21a8',
  error: '#b3261e',
  errorSurface: '#fdecea',
  warning: '#8a6d00',
};

export const darkPalette: ColorPalette = {
  background: '#0d1117',
  surface: '#161b22',
  surfaceMuted: '#1c2128',
  surfaceDisabled: '#1c2128',
  border: '#30363d',
  borderMuted: '#21262d',
  textPrimary: '#e6edf3',
  textSecondary: '#adbac7',
  textMuted: '#8b949e',
  textDisabled: '#6e7681',
  accent: ACCENT,
  accentText: '#e2b8ff',
  accentSurface: '#211230',
  accentSolid: '#6b21a8',
  error: '#ff7b72',
  errorSurface: '#3d1618',
  warning: '#e3b341',
};
