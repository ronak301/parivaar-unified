import { toneFor } from './theme';

/** Deterministic avatar colours for a name — driven by theme.css tone palette. */
export function getAvatarColor(name: string) {
  const { bg, fg } = toneFor(name);
  return { bg, text: fg };
}
