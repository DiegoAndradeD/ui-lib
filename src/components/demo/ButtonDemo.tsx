import { ComponentCard } from "../ComponentCard";
import { Button } from "../ui/Button";

export function ButtonDemo() {
  return (
    <div className="w-full flex flex-col gap-8">
      <ComponentCard
        title="Variants"
        description="The base visual styles for the button."
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </ComponentCard>

      <ComponentCard
        title="Sizes & Radius"
        description="Different sizes, icon-only variants, and border-radius options."
      >
        <div className="flex flex-col gap-6 w-full items-center">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Icon only">
              <MailIcon />
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button radius="none">Square</Button>
            <Button radius="md">Rounded MD</Button>
            <Button radius="full">Pill Shape</Button>
          </div>
        </div>
      </ComponentCard>

      <ComponentCard
        title="States"
        description="Built-in loading spinners and disabled states."
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button isLoading>Save Changes</Button>
          <Button variant="outline" isLoading>
            Loading
          </Button>
          <Button disabled>Disabled</Button>
          <Button size="icon" isLoading aria-label="Loading icon" />
        </div>
      </ComponentCard>

      <ComponentCard
        title="Icons"
        description="Adding icons to the left or right of the text."
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button icon={<MailIcon />} iconPlacement="left">
            Email Me
          </Button>
          <Button
            variant="outline"
            icon={<ArrowRightIcon />}
            iconPlacement="right"
          >
            Continue
          </Button>
        </div>
      </ComponentCard>

      <ComponentCard
        title="Special Effects"
        description="Advanced CSS-only hover and interaction effects."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">Expand Icon</span>
            <Button
              effect="expandIcon"
              icon={<ArrowRightIcon />}
              iconPlacement="right"
            >
              Hover Me
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">Ring Hover</span>
            <Button variant="outline" effect="ringHover">
              Focus / Hover
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">Shine Hover</span>
            <Button effect="shineHover">Shiny Button</Button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">Gooey Right</span>
            <Button variant="outline" effect="gooeyRight">
              Hover over me
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">Underline</span>
            <Button variant="ghost" effect="underline">
              Animated Line
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Hover Underline
            </span>
            <Button variant="ghost" effect="hoverUnderline">
              Reveal Line
            </Button>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className || "w-4 h-4"}
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className || "w-4 h-4"}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
