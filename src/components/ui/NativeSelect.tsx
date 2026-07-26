import type { ComponentProps, ReactNode } from "react";

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface NativeSelectProps
  extends Omit<ComponentProps<"select">, "size"> {
  icon?: ReactNode;
  wrapperClassName?: string;
}

function NativeSelect({
  className,
  icon,
  wrapperClassName,
  children,
  ...props
}: NativeSelectProps) {
  return (
    <div
      data-slot="native-select-wrapper"
      className={cn("relative inline-flex", wrapperClassName)}
    >
      <select
        data-slot="native-select"
        className={cn(
          "h-9 w-full cursor-pointer appearance-none rounded-md border border-input bg-card py-1.5 pr-9 pl-3 text-sm font-medium text-foreground shadow-sm outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-70",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <span
        aria-hidden="true"
        data-slot="native-select-icon"
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground [&_svg]:size-4"
      >
        {icon ?? <ChevronDown />}
      </span>
    </div>
  );
}

export { NativeSelect };
