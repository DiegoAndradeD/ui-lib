import { type ReactNode } from "react";

interface ComponentCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function ComponentCard({
  title,
  description,
  children,
}: ComponentCardProps) {
  return (
    <div className="flex flex-col gap-4 mb-12 w-full max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
      </div>
      <div className="min-h-50 w-full rounded-xl border border-border bg-background p-6 flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30" />
        </div>
        <div className="w-full relative z-10 flex flex-col gap-6 items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
