import { useState } from "react";
import { ComponentCard } from "../ComponentCard";
import { Input } from "../ui/Input";

export function InputDemo() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full flex flex-col gap-8">
      <ComponentCard
        title="Variants"
        description="Different visual styles for the input field."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Default
            </span>
            <Input placeholder="Enter your name" variant="default" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Underlined
            </span>
            <Input placeholder="Enter your name" variant="underlined" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Flat
            </span>
            <Input placeholder="Enter your name" variant="flat" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Outline
            </span>
            <Input placeholder="Enter your name" variant="outline" />
          </div>
        </div>
      </ComponentCard>

      <ComponentCard
        title="Content Slots"
        description="Add elements to the start or end of the input."
      >
        <div className="flex flex-col gap-4 w-full max-w-md">
          <Input placeholder="Search..." startContent={<SearchIcon />} />

          <Input
            placeholder="Enter amount"
            type="number"
            startContent={<span className="text-sm font-medium">$</span>}
            endContent={
              <span className="text-xs text-muted-foreground">USD</span>
            }
          />

          <Input
            placeholder="example@email.com"
            type="email"
            startContent={<MailIcon />}
            endContent={
              <div className="flex items-center justify-center w-5 h-5 rounded bg-muted text-[10px] font-bold">
                ⌘K
              </div>
            }
          />
        </div>
      </ComponentCard>

      <ComponentCard
        title="Practical Examples"
        description="Real-world usage like password toggles and custom wrapper styles."
      >
        <div className="flex flex-col gap-4 w-full max-w-md">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            startContent={<LockIcon />}
            endContent={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />

          <Input
            placeholder="Custom styled wrapper..."
            startContent={<SearchIcon className="text-blue-500" />}
            classNames={{
              wrapper: "shadow-md rounded-full",
              input:
                "rounded-full border-blue-200 focus:border-blue-500 focus:ring-blue-500/20",
            }}
          />
        </div>
      </ComponentCard>

      <ComponentCard title="States" description="Loading and disabled states.">
        <div className="flex flex-col gap-4 w-full max-w-md">
          <Input placeholder="Saving changes..." isLoading />

          <Input
            placeholder="Verifying username..."
            startContent={<UserIcon />}
            endContent={<span className="text-green-500">Available</span>}
            isLoading
          />

          <Input
            placeholder="Disabled input"
            startContent={<MailIcon />}
            disabled
          />
        </div>
      </ComponentCard>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className || "size-4"}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
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
      className={className || "size-4"}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className || "size-4"}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className || "size-4"}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className || "size-4"}
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className || "size-4"}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
