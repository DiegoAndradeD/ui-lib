import { useState } from "react";
import type { SelectOption } from "../ui/SingleSelect";
import { ComponentCard } from "../ComponentCard";
import MultiSelect from "../ui/MultiSelect";

const MOCK_FRAMEWORKS: SelectOption[] = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue.js" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "SolidJS" },
  { value: "qwik", label: "Qwik" },
  { value: "next", label: "Next.js" },
  { value: "nuxt", label: "Nuxt" },
  { value: "astro", label: "Astro" },
];

const MOCK_ROLES: SelectOption[] = [
  { value: "admin", label: "Administrator" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
  { value: "billing", label: "Billing" },
];

export function MultiSelectDemo() {
  const [basicSelection, setBasicSelection] = useState<string[]>([]);
  const [overflowSelection, setOverflowSelection] = useState<string[]>([
    "react",
    "vue",
    "svelte",
    "next",
  ]);
  const [altSelection, setAltSelection] = useState<string[]>(["admin"]);

  return (
    <div className="w-full flex flex-col gap-8">
      <ComponentCard
        title="Multi Select (Default)"
        description="A standard multi-select with search, checkboxes, and tag chips."
      >
        <div className="w-full max-w-sm">
          <MultiSelect
            name="basic-frameworks"
            placeholder="Select frameworks..."
            options={MOCK_FRAMEWORKS}
            value={basicSelection}
            onChange={setBasicSelection}
          />
        </div>
        <div className="mt-2 text-xs text-muted-foreground wrap-break-word w-full max-w-sm text-center">
          Values:{" "}
          <strong className="text-foreground">
            {basicSelection.length > 0 ? basicSelection.join(", ") : "None"}
          </strong>
        </div>
      </ComponentCard>

      <ComponentCard
        title="Tag Overflow & Limits"
        description="Testing the maxDisplay prop. Try adding more options to see the '+N' badge."
      >
        <div className="w-full max-w-sm">
          <MultiSelect
            name="overflow-frameworks"
            placeholder="Select frameworks..."
            options={MOCK_FRAMEWORKS}
            value={overflowSelection}
            onChange={setOverflowSelection}
            maxDisplay={2}
          />
        </div>
      </ComponentCard>

      <ComponentCard
        title="Alternative & Disabled"
        description="Testing the inverted variant and disabled states."
      >
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Alternative Variant
            </span>
            <MultiSelect
              name="alt-roles"
              placeholder="Assign roles..."
              options={MOCK_ROLES}
              value={altSelection}
              onChange={setAltSelection}
              variant="alternative"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Disabled State
            </span>
            <MultiSelect
              name="disabled-select"
              placeholder="Can't touch this..."
              options={MOCK_ROLES}
              value={["admin", "editor"]}
              onChange={() => {}}
              isDisabled={true}
            />
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
