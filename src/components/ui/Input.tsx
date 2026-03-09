"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InputVariant = "default" | "underlined" | "flat" | "outline";

export interface InputProps extends React.ComponentProps<"input"> {
  variant?: InputVariant;
  /** Node rendered on the left side, inside the input. */
  startContent?: React.ReactNode;
  /** Node rendered on the right side, inside the input. Replaced by spinner when `isLoading`. */
  endContent?: React.ReactNode;
  /** Shows a spinner as endContent and marks the field as busy. */
  isLoading?: boolean;
  classNames?: {
    wrapper?: string;
    input?: string;
    startContent?: string;
    endContent?: string;
  };
}

// ─── Class maps ───────────────────────────────────────────────────────────────

const VARIANT_CLASSES: Record<InputVariant, string> = {
  default:
    "border border-border rounded-md bg-background focus:border-primary focus:ring-2 focus:ring-ring/20 shadow-none transition-all",
  underlined:
    "border-0 border-b-2 border-muted-foreground rounded-none focus:ring-0 focus:border-b-2 focus:border-muted-foreground bg-transparent",
  flat: "border-none border-transparent bg-foreground/10 rounded-lg hover:bg-foreground/15",
  outline: "border border-foreground bg-background",
};

// ─── Base classes (always applied) ───────────────────────────────────────────

const BASE_CLASSES = `
  flex h-9 w-full px-3 py-1 text-sm text-foreground shadow-sm transition-colors outline-none
  file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground
  placeholder:text-muted-foreground
  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
  disabled:cursor-not-allowed disabled:opacity-50
`;

// ─── inputVariants (utility for external use) ─────────────────────────────────

export function inputVariants({
  variant = "default",
  className,
}: {
  variant?: InputVariant;
  className?: string;
} = {}) {
  return cn(BASE_CLASSES, VARIANT_CLASSES[variant], className);
}

// ─── Component ────────────────────────────────────────────────────────────────

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant = "default",
      startContent,
      endContent,
      isLoading = false,
      classNames,
      disabled,
      ...props
    },
    ref,
  ) => {
    /* Spinner takes priority over endContent when loading */
    const resolvedEndContent = isLoading ? (
      <SpinnerIcon className="animate-spin text-foreground" />
    ) : (
      endContent
    );

    return (
      <div
        className={cn("relative flex items-center w-full", classNames?.wrapper)}
      >
        {/* Left slot */}
        {startContent && (
          <div
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground",
              classNames?.startContent,
            )}
          >
            {startContent}
          </div>
        )}

        <input
          ref={ref}
          type={type}
          disabled={disabled}
          aria-busy={isLoading}
          className={cn(
            inputVariants({ variant }),
            startContent && "pl-10",
            resolvedEndContent && "pr-10",
            classNames?.input,
            className,
          )}
          {...props}
        />

        {/* Right slot */}
        {resolvedEndContent && (
          <div
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground",
              classNames?.endContent,
            )}
          >
            {resolvedEndContent}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };

// ─── Inline SVG icons (zero dependencies) ────────────────────────────────────

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4", className)}
      aria-hidden
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
