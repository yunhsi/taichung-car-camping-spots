interface LogoProps {
  showName?: boolean;
}

export function Logo({ showName = true }: LogoProps) {
  return (
    <div className="inline-flex items-center gap-3">
      <svg
        aria-hidden="true"
        viewBox="0 0 44 44"
        className="size-11 shrink-0"
      >
        <rect width="44" height="44" rx="14" className="fill-primary" />
        <path
          d="M10.5 25.5v-7.25A2.25 2.25 0 0 1 12.75 16h12.5a3 3 0 0 1 2.4 1.2l4.6 6.13c.49.65.75 1.44.75 2.25v2.17A2.25 2.25 0 0 1 30.75 30h-1.5a3.75 3.75 0 0 0-7.5 0h-4.5a3.75 3.75 0 0 0-7.5 0H9v-2.25c0-.83.67-1.5 1.5-1.5"
          fill="none"
          stroke="var(--primary-foreground)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path
          d="M27.25 18.25H29l3.38 4.5h-5.13v-4.5Z"
          fill="var(--primary-foreground)"
        />
        <circle
          cx="13.5"
          cy="30"
          r="2.25"
          fill="var(--accent)"
          stroke="var(--primary-foreground)"
          strokeWidth="1.5"
        />
        <circle
          cx="25.5"
          cy="30"
          r="2.25"
          fill="var(--accent)"
          stroke="var(--primary-foreground)"
          strokeWidth="1.5"
        />
        <path
          d="M17.5 19.25h5.25"
          stroke="var(--primary-foreground)"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>

      {showName && (
        <span className="font-brand text-lg font-extrabold tracking-[0.04em] text-foreground sm:text-xl">
          台中車泊景點
        </span>
      )}
    </div>
  );
}
