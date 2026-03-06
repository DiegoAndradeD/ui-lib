import React, { useEffect, useRef } from "react";
import { SmartSelectConfig } from "../../../types";
import { SmartSelectCore } from "../../../core/components/SmartSelect";

export interface SmartSelectProps extends Omit<SmartSelectConfig, "element"> {
  placeholder?: string;
  className?: string;
}

export const SmartSelect: React.FC<SmartSelectProps> = ({
  fetchFn,
  onChange,
  debounceTime,
  placeholder = "Select an option...",
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<SmartSelectCore | null>(null);

  useEffect(() => {
    if (containerRef.current && !instanceRef.current) {
      instanceRef.current = new SmartSelectCore({
        element: containerRef.current,
        fetchFn,
        onChange,
        debounceTime,
      });
    }

    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
    };
  }, [fetchFn, onChange, debounceTime]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full font-sans ${className}`}
      data-smart-select
    >
      <button
        data-select-trigger
        type="button"
        className="w-full min-h-10 flex items-center justify-between bg-background border border-border rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
      >
        <span data-select-value className="text-foreground truncate">
          {placeholder}
        </span>
        <span className="text-muted-foreground text-xs ml-2">▼</span>
      </button>

      <div
        data-select-dropdown
        className="hidden absolute left-0 z-50 mt-1 w-full bg-background border border-border rounded-lg shadow-lg overflow-hidden"
      >
        <div className="p-2 border-b border-border bg-muted/50">
          <input
            data-select-search
            type="text"
            className="w-full bg-transparent px-2 py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Buscar..."
          />
        </div>

        <ul
          data-select-list
          className="max-h-60 overflow-y-auto p-1 no-scrollbar flex flex-col gap-1"
        ></ul>
      </div>
    </div>
  );
};
