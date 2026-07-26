import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  headingLevel?: "h1" | "h2";
}

export function EmptyState({
  title,
  description,
  action,
  headingLevel = "h2",
}: EmptyStateProps) {
  const Heading = headingLevel;

  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center shadow-sm">
      <Heading className="text-xl font-semibold text-foreground">
        {title}
      </Heading>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
