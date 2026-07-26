interface SiteLogoProps {
  showName?: boolean;
}

export function SiteLogo({ showName = true }: SiteLogoProps) {
  return (
    <span className="inline-flex items-center gap-2.5 md:gap-3">
      <svg
        aria-hidden="true"
        viewBox="0 0 44 44"
        className="size-10 shrink-0 md:size-11"
      >
        <rect
          x="0.5"
          y="0.5"
          width="43"
          height="43"
          rx="13.5"
          className="fill-brand-mark-background stroke-brand-mark-border"
        />
        <g transform="translate(1 -1.5)">
          <path
            d="M10.5 25.5v-7.25A2.25 2.25 0 0 1 12.75 16h12.5a3 3 0 0 1 2.4 1.2l4.6 6.13c.49.65.75 1.44.75 2.25v2.17A2.25 2.25 0 0 1 30.75 30h-1.5a3.75 3.75 0 0 0-7.5 0h-4.5a3.75 3.75 0 0 0-7.5 0H9v-2.25c0-.83.67-1.5 1.5-1.5"
            fill="none"
            className="stroke-brand-mark-foreground"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.4"
          />
          <path
            d="M27.25 18.25H29l3.38 4.5h-5.13v-4.5Z"
            className="fill-brand-mark-foreground"
          />
          <circle
            cx="13.5"
            cy="30"
            r="2.5"
            className="fill-brand-mark-accent stroke-brand-mark-foreground"
            strokeWidth="1.4"
          />
          <circle
            cx="25.5"
            cy="30"
            r="2.5"
            className="fill-brand-mark-accent stroke-brand-mark-foreground"
            strokeWidth="1.4"
          />
          <rect
            x="17.25"
            y="18.1"
            width="5.75"
            height="2.3"
            rx="1.15"
            className="fill-brand-mark-foreground"
          />
        </g>
      </svg>

      {showName && (
        <span className="whitespace-nowrap font-brand text-lg font-extrabold tracking-[0.03em] text-foreground md:text-xl md:tracking-[0.04em]">
          台中車泊景點
        </span>
      )}
    </span>
  );
}
