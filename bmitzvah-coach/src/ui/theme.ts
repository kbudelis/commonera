/**
 * Era theming for the DOM side: CSS custom properties + a data-era attribute.
 * The :root defaults in index.html are the Torah-scroll look; applying a
 * theme overrides only the tokens an era names, resetting restores defaults.
 */

export type ThemeToken =
  | 'accent'
  | 'accentText'
  | 'paper'
  | 'heading'
  | 'bg'
  | 'card'
  | 'cardBorder'
  | 'muted'
  | 'dim'
  | 'scrim';

export interface EraTheme {
  tokens: Partial<Record<ThemeToken, string>>;
  vignette: boolean;
}

const CSS_VAR: Record<ThemeToken, string> = {
  accent: '--accent',
  accentText: '--accent-text',
  paper: '--paper',
  heading: '--heading',
  bg: '--bg',
  card: '--card',
  cardBorder: '--card-border',
  muted: '--muted',
  dim: '--dim',
  scrim: '--scrim',
};

const DEFAULT_THEME_COLOR = '#1a120b';

export function applyEraTheme(eraId: string, theme: EraTheme) {
  const root = document.documentElement;
  resetEraTheme();
  root.dataset.era = eraId;
  for (const [token, value] of Object.entries(theme.tokens)) {
    root.style.setProperty(CSS_VAR[token as ThemeToken], value);
  }
  root.style.setProperty('--vignette', theme.vignette ? '1' : '0');
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme.tokens.bg ?? DEFAULT_THEME_COLOR);
}

export function resetEraTheme() {
  const root = document.documentElement;
  delete root.dataset.era;
  for (const cssVar of Object.values(CSS_VAR)) root.style.removeProperty(cssVar);
  root.style.removeProperty('--vignette');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', DEFAULT_THEME_COLOR);
}
