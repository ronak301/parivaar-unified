type Props = { size?: number; color?: string };

/** Sliders / filters icon — fixed visual size for toolbar (matches `size`). */
export function IconSliders({ size = 22, color = "currentColor" }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16M8 12h8M10 18h4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="9" cy="6" r="2" fill={color} />
      <circle cx="15" cy="12" r="2" fill={color} />
      <circle cx="12" cy="18" r="2" fill={color} />
    </svg>
  );
}

export function IconChevronLeft({ size = 22, color = "currentColor" }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 6l-6 6 6 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
