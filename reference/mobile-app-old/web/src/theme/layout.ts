/** Shared layout tokens for screen chrome (mobile shell max width 480). */
export const LAYOUT = {
  shellMaxWidth: 480,
  /** Raw numbers for inline styles / `calc()` only. */
  headerHeight: 52,
  bottomTabHeight: 58,
  iconSm: 20,
  iconMd: 24,
  tapMin: 44,
  /**
   * Chakra sizing props (`minH`, `boxSize`, …) must use px strings — bare numbers map to `theme.space[n]` (rem), not pixels.
   */
  headerHeightPx: "52px",
  tapMinPx: "44px",
  bottomTabHeightPx: "58px",
  /**
   * Search strip padding — numeric fields are for React `style={{ padding*: n }}` (px).
   * Chakra `pt`/`pb`/`px` must use `*Px` strings; bare numbers map to `theme.space` (rem), not pixels.
   */
  /** Extra air above the search row; business tab uses the same numbers via `LAYOUT`. */
  searchFieldInsetTop: 6,
  searchFieldInsetBottom: 6,
  searchFieldInsetX: 12,
  searchFieldInsetXPx: "12px",
  searchFieldInsetTopPx: "6px",
  searchFieldInsetBottomPx: "6px",
} as const;
