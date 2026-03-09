"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

export type ButtonEffect =
  | "expandIcon"
  | "ringHover"
  | "shine"
  | "shineHover"
  | "gooeyRight"
  | "gooeyLeft"
  | "underline"
  | "hoverUnderline";

export type ButtonSize =
  | "default"
  | "sm"
  | "lg"
  | "icon"
  | "icon-sm"
  | "icon-lg";

export type ButtonRadius = "none" | "sm" | "md" | "lg" | "xl" | "full";

interface IconProps {
  icon: React.ReactNode;
  iconPlacement: "left" | "right";
}

interface IconRefProps {
  icon?: never;
  iconPlacement?: undefined;
}

export type ButtonIconProps = IconProps | IconRefProps;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  effect?: ButtonEffect;
  size?: ButtonSize;
  radius?: ButtonRadius;
  /** Renders as child element, merging all props into it. */
  asChild?: boolean;
  /** Shows a spinner and disables pointer events. */
  isLoading?: boolean;
}

// ─── Class maps ───────────────────────────────────────────────────────────────

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive:
    "bg-red-600 text-white hover:bg-red-600/90 focus-visible:ring-red-600/20",
  outline:
    "border border-border bg-background shadow-xs hover:bg-muted hover:text-foreground",
  secondary: "bg-muted text-foreground hover:bg-muted/80",
  ghost: "hover:bg-muted hover:text-foreground",
  link: "text-foreground underline-offset-4 hover:underline",
};

const EFFECT_CLASSES: Record<ButtonEffect, string> = {
  expandIcon: "group gap-0 relative",
  ringHover:
    "transition-all duration-300 hover:ring-2 hover:ring-primary/90 hover:ring-offset-2",
  shine: `
    before:animate-shine relative overflow-hidden
    before:absolute before:inset-0 before:rounded-[inherit]
    before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)]
    before:bg-[length:250%_250%,100%_100%] before:bg-no-repeat background-position_0s_ease
  `,
  shineHover: `
    relative overflow-hidden
    before:absolute before:inset-0 before:rounded-[inherit]
    before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)]
    before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat
    before:transition-[background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] before:duration-1000
  `,
  gooeyRight: `
    relative z-0 overflow-hidden transition-all duration-500
    before:absolute before:inset-0 before:-z-10
    before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5] before:rounded-[100%]
    before:bg-gradient-to-r from-white/40 before:transition-transform before:duration-1000
    hover:before:translate-x-[0%] hover:before:translate-y-[0%]
  `,
  gooeyLeft: `
    relative z-0 overflow-hidden transition-all duration-500
    after:absolute after:inset-0 after:-z-10
    after:translate-x-[-150%] after:translate-y-[150%] after:scale-[2.5] after:rounded-[100%]
    after:bg-gradient-to-l from-white/40 after:transition-transform after:duration-1000
    hover:after:translate-x-[0%] hover:after:translate-y-[0%]
  `,
  underline: `
    relative !no-underline
    after:absolute after:bg-primary after:bottom-2 after:h-[1px] after:w-2/3
    after:origin-bottom-left after:scale-x-100
    hover:after:origin-bottom-right hover:after:scale-x-0
    after:transition-transform after:ease-in-out after:duration-300
  `,
  hoverUnderline: `
    relative !no-underline
    after:absolute after:bg-primary after:bottom-2 after:h-[1px] after:w-2/3
    after:origin-bottom-right after:scale-x-0
    hover:after:origin-bottom-left hover:after:scale-x-100
    after:transition-transform after:ease-in-out after:duration-300
  `,
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  default: "h-9 px-4 py-2 has-[>svg]:px-3",
  sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
  lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
  icon: "size-9",
  "icon-sm": "size-8",
  "icon-lg": "size-10",
};

const RADIUS_CLASSES: Record<ButtonRadius, string> = {
  none: "!rounded-none",
  sm: "!rounded-sm",
  md: "!rounded-md",
  lg: "!rounded-lg",
  xl: "!rounded-xl",
  full: "!rounded-full",
};

// ─── Base classes (always applied) ───────────────────────────────────────────

const BASE_CLASSES = `
  inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium
  transition-all cursor-pointer shrink-0 outline-none select-none
  disabled:pointer-events-none disabled:opacity-50
  focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
  [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0
`;

// ─── buttonVariants (utility for external use) ────────────────────────────────

export function buttonVariants({
  variant = "default",
  effect,
  size = "default",
  radius,
  className,
}: {
  variant?: ButtonVariant;
  effect?: ButtonEffect;
  size?: ButtonSize;
  radius?: ButtonRadius;
  className?: string;
} = {}) {
  return cn(
    BASE_CLASSES,
    VARIANT_CLASSES[variant],
    effect && EFFECT_CLASSES[effect],
    SIZE_CLASSES[size],
    radius && RADIUS_CLASSES[radius],
    className,
  );
}

// ─── Simple Slot (asChild support, zero deps) ─────────────────────────────────

function Slot({
  children,
  ...slotProps
}: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  if (!React.isValidElement(children)) return <>{children}</>;
  return React.cloneElement(
    children as React.ReactElement<Record<string, unknown>>,
    {
      ...slotProps,
      ...(children.props as Record<string, unknown>),
      className: cn(
        (slotProps as { className?: string }).className,
        (children.props as { className?: string }).className,
      ),
    },
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & ButtonIconProps
>(
  (
    {
      className,
      variant = "default",
      effect,
      size = "default",
      radius,
      icon,
      iconPlacement,
      asChild = false,
      isLoading = false,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isIconOnly =
      size === "icon" || size === "icon-sm" || size === "icon-lg";

    return (
      <Comp
        ref={ref}
        className={buttonVariants({ variant, effect, size, radius, className })}
        {...props}
      >
        {isIconOnly ? (
          /* Icon-only: swap content for spinner when loading */
          isLoading ? (
            <SpinnerIcon className="animate-spin" />
          ) : (
            children
          )
        ) : (
          <>
            {/* Left icon — animates inward when effect="expandIcon" */}
            {icon &&
              iconPlacement === "left" &&
              (effect === "expandIcon" ? (
                <div className="w-0 translate-x-[0%] pr-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-100 group-hover:pr-2 group-hover:opacity-100">
                  {icon}
                </div>
              ) : (
                icon
              ))}

            {children}

            {/* Right icon — animates inward when effect="expandIcon" */}
            {icon &&
              iconPlacement === "right" &&
              (effect === "expandIcon" ? (
                <div className="w-0 translate-x-full pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-2 group-hover:opacity-100">
                  {icon}
                </div>
              ) : (
                icon
              ))}

            {/* Inline spinner appended after content when loading */}
            {isLoading && <SpinnerIcon className="animate-spin" />}
          </>
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { Button };

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
      className={className}
      aria-hidden
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
