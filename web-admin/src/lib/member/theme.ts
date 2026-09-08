/**
 * JS-side access to the member-app design tokens defined in
 * `src/app/m/theme.css`. Use these when a colour has to go through an inline
 * `style={{}}` (dynamic per-item colours). For static styling prefer the
 * Tailwind utilities (`bg-m-tone-rose-bg`, `text-m-ink-2`, …).
 *
 * The values are CSS `var()` references, so changing theme.css is enough —
 * nothing here needs to be touched.
 */

export const TONES = ['indigo', 'violet', 'pink', 'rose', 'amber', 'emerald', 'sky', 'teal'] as const;
export type Tone = (typeof TONES)[number];

export interface TonePair {
  /** Soft background, e.g. avatar circle / category tile. */
  bg: string;
  /** Strong foreground, e.g. initials / icon / label text. */
  fg: string;
}

export function tone(name: Tone): TonePair {
  return { bg: `var(--m-tone-${name}-bg)`, fg: `var(--m-tone-${name}-fg)` };
}

/** Deterministic tone for a string (name, category id…). */
export function toneFor(key: string): TonePair {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash << 5) - hash + key.charCodeAt(i);
  return tone(TONES[Math.abs(hash) % TONES.length]);
}

/** Tailwind class pairs for the same tones — for static (non-inline) usage. */
export const TONE_CLASS: Record<Tone, string> = {
  indigo: 'bg-m-tone-indigo-bg text-m-tone-indigo-fg',
  violet: 'bg-m-tone-violet-bg text-m-tone-violet-fg',
  pink: 'bg-m-tone-pink-bg text-m-tone-pink-fg',
  rose: 'bg-m-tone-rose-bg text-m-tone-rose-fg',
  amber: 'bg-m-tone-amber-bg text-m-tone-amber-fg',
  emerald: 'bg-m-tone-emerald-bg text-m-tone-emerald-fg',
  sky: 'bg-m-tone-sky-bg text-m-tone-sky-fg',
  teal: 'bg-m-tone-teal-bg text-m-tone-teal-fg',
};
