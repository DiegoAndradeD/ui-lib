import { useState } from "react";
import type { ISelectOption } from "../ui/SingleSelect";
import { ComponentCard } from "../ComponentCard";
import SingleSelect from "../ui/SingleSelect";

const MOCK_OPTIONS: ISelectOption[] = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue.js" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "SolidJS" },
  { value: "qwik", label: "Qwik" },
];

export function SingleSelectDemo() {
  const [selectedValue, setSelectedValue] = useState<string | undefined>("");
  const [altValue, setAltValue] = useState<string | undefined>("");

  return (
    <div className="w-full flex flex-col gap-8">
      <ComponentCard
        title="Single Select (Default)"
        description="A standard searchable select component with local data filtering."
      >
        <div className="w-full max-w-sm">
          <SingleSelect
            name="framework-select"
            placeholder="Select a framework..."
            options={MOCK_OPTIONS}
            value={selectedValue}
            onChange={setSelectedValue}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Valor selecionado:{" "}
          <strong className="text-foreground">{selectedValue || "None"}</strong>
        </p>
      </ComponentCard>
      <ComponentCard
        title="Single Select (Alternative & Disabled)"
        description="Testing the alternative variant and disabled states."
      >
        <div className="w-full max-w-sm flex flex-col gap-4">
          <SingleSelect
            name="framework-alt"
            placeholder="Select (Alternative)..."
            options={MOCK_OPTIONS}
            value={altValue}
            onChange={setAltValue}
            variant="alternative"
          />

          <SingleSelect
            name="framework-disabled"
            placeholder="Disabled select..."
            options={MOCK_OPTIONS}
            value={undefined}
            onChange={() => {}}
            isDisabled={true}
          />
        </div>
      </ComponentCard>
    </div>
  );
}
