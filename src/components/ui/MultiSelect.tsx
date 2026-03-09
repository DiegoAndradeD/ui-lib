"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  values: T[];
  metadata: {
    totalItems: number;
    totalPages: number;
    limit: number;
    currentPage: number;
  };
}

export interface SelectOption {
  value: string;
  label: string;
  display?: ReactNode;
}

interface MultiSelectProps {
  /** Fully static list of options — no fetching. */
  options?: SelectOption[];

  /**
   * Simple async fetcher: receives the current search string,
   * returns the full (already-filtered) list of options.
   */
  simpleQueryFn?: (search: string) => Promise<SelectOption[]>;

  /**
   * Paginated async fetcher used when `enableInfiniteScroll` is true.
   */
  queryFn?: (params: {
    page: number;
    pageSize: number;
    search: string;
  }) => Promise<PaginatedResult<SelectOption>>;

  /** Stable cache key array (similar to TanStack Query's queryKey). */
  queryKey?: string[];

  onChange: (values: string[]) => void;
  placeholder?: string;
  name: string;
  /** Controlled array of selected values. */
  value: string[];

  classNames?: {
    trigger?: string;
    menu?: string;
    container?: string;
    tag?: string;
  };

  isClearable?: boolean;
  isSearchable?: boolean;
  isDisabled?: boolean;
  variant?: "default" | "alternative";

  /**
   * Max number of tag chips rendered inside the trigger before collapsing
   * the rest into a "+N" badge. Defaults to 3.
   */
  maxDisplay?: number;

  enableInfiniteScroll?: boolean;
  pageSize?: number;
  searchDebounce?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MultiSelect({
  options: staticOptions,
  simpleQueryFn,
  queryFn,
  queryKey = [],
  onChange,
  placeholder = "Select…",
  name,
  value,
  classNames,
  isClearable = true,
  isSearchable = true,
  isDisabled = false,
  variant = "default",
  maxDisplay = 3,
  enableInfiniteScroll = false,
  pageSize = 10,
  searchDebounce = 300,
}: MultiSelectProps) {
  const instanceId = useId();
  const menuId = `${instanceId}-menu`;
  const triggerId = `${instanceId}-trigger`;

  // ── UI state ──────────────────────────────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ── Data state ────────────────────────────────────────────────────────────────
  const [simpleOptions, setSimpleOptions] = useState<SelectOption[]>([]);
  const [pagedOptions, setPagedOptions] = useState<SelectOption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // ── Refs ──────────────────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // ── Keyboard focus ────────────────────────────────────────────────────────────
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // ── Debounce ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), searchDebounce);
    return () => clearTimeout(t);
  }, [search, searchDebounce]);

  // ── Reset paged data on search change ─────────────────────────────────────────
  useEffect(() => {
    if (enableInfiniteScroll) {
      setPagedOptions([]);
      setCurrentPage(1);
      setHasNextPage(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, enableInfiniteScroll, ...queryKey]);

  // ── Simple fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (staticOptions || !simpleQueryFn || enableInfiniteScroll) return;
    let cancelled = false;
    setIsLoading(true);
    simpleQueryFn(debouncedSearch)
      .then((data) => {
        if (!cancelled) setSimpleOptions(data);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, simpleQueryFn, staticOptions, enableInfiniteScroll]);

  // ── Paginated fetch ───────────────────────────────────────────────────────────
  const fetchPage = useCallback(
    async (page: number) => {
      if (!queryFn || !enableInfiniteScroll) return;
      if (page === 1) setIsLoading(true);
      else setIsFetchingMore(true);
      try {
        const result = await queryFn({
          page,
          pageSize,
          search: debouncedSearch,
        });
        setPagedOptions((prev) =>
          page === 1 ? result.values : [...prev, ...result.values],
        );
        setCurrentPage(result.metadata.currentPage);
        setHasNextPage(
          result.metadata.currentPage < result.metadata.totalPages,
        );
      } finally {
        if (page === 1) setIsLoading(false);
        else setIsFetchingMore(false);
      }
    },
    [queryFn, enableInfiniteScroll, pageSize, debouncedSearch],
  );

  useEffect(() => {
    if (enableInfiniteScroll && queryFn) fetchPage(1);
  }, [debouncedSearch, fetchPage, enableInfiniteScroll, queryFn]);

  // ── Intersection observer for infinite scroll ─────────────────────────────────
  useEffect(() => {
    if (!enableInfiniteScroll || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingMore)
          fetchPage(currentPage + 1);
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [
    enableInfiniteScroll,
    hasNextPage,
    isFetchingMore,
    currentPage,
    fetchPage,
  ]);

  // ── Close on outside click ────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  // ── Focus search on open ──────────────────────────────────────────────────────
  useEffect(() => {
    if (open && isSearchable) setTimeout(() => searchRef.current?.focus(), 0);
  }, [open, isSearchable]);

  // ── Reset focused index on close ─────────────────────────────────────────────
  useEffect(() => {
    if (!open) setFocusedIndex(-1);
  }, [open]);

  // ── Scroll focused item into view ─────────────────────────────────────────────
  useEffect(() => {
    if (focusedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[focusedIndex] as HTMLElement;
    item?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex]);

  // ── Computed options ──────────────────────────────────────────────────────────
  const visibleOptions: SelectOption[] = staticOptions
    ? staticOptions.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()),
      )
    : enableInfiniteScroll
      ? pagedOptions
      : simpleOptions;

  /**
   * Build a lookup map so we can resolve labels for selected values that may
   * not be present in the current `visibleOptions` page (e.g. infinite scroll).
   */
  const optionByValue = new Map<string, SelectOption>(
    visibleOptions.map((o) => [o.value, o]),
  );

  const selectedOptions: SelectOption[] = value.map(
    (v) => optionByValue.get(v) ?? { value: v, label: v },
  );

  const displayedTags = selectedOptions.slice(0, maxDisplay);
  const overflowCount = selectedOptions.length - displayedTags.length;

  // ── Handlers ──────────────────────────────────────────────────────────────────

  /** Toggles an option: adds if absent, removes if present. */
  function toggleOption(option: SelectOption) {
    if (value.includes(option.value)) {
      onChange(value.filter((v) => v !== option.value));
    } else {
      onChange([...value, option.value]);
    }
    // Keep the menu open so the user can keep selecting.
  }

  /** Removes a single tag from the trigger chip row. */
  function removeTag(e: React.MouseEvent | React.KeyboardEvent, val: string) {
    e.stopPropagation();
    onChange(value.filter((v) => v !== val));
  }

  /** Clears the entire selection. */
  function clearAll(e: React.MouseEvent) {
    e.stopPropagation();
    onChange([]);
  }

  function toggleOpen() {
    if (isDisabled) return;
    setOpen((v) => !v);
    if (open) setSearch("");
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (["Enter", " ", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
    }
    if (e.key === "Escape") setOpen(false);
  }

  function handleMenuKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, visibleOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      toggleOption(visibleOptions[focusedIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
  }

  // ─── Variant flags ────────────────────────────────────────────────────────────
  //
  //  "default"     → background / foreground / border / muted / muted-foreground / ring
  //  "alternative" → primary / primary-foreground / ring
  //
  const isAlt = variant === "alternative";

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", classNames?.container)}
      data-name={name}
    >
      {/* ── Trigger ── */}
      <button
        id={triggerId}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="listbox"
        aria-multiselectable="true"
        aria-disabled={isDisabled}
        disabled={isDisabled}
        onClick={toggleOpen}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "relative flex items-center gap-1.5 flex-wrap w-full min-h-10 px-3 py-1.5 rounded-lg border text-sm",
          "transition-colors duration-150 outline-none select-none cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          !isAlt &&
            "bg-background border-border text-foreground hover:border-ring",
          !isAlt &&
            open &&
            "border-ring ring-2 ring-ring ring-offset-2 ring-offset-background",
          isAlt && "bg-primary border-primary text-primary-foreground",
          isAlt &&
            open &&
            "ring-2 ring-ring ring-offset-2 ring-offset-background",
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
          classNames?.trigger,
        )}
      >
        {/* ── Tag chips or placeholder ── */}
        <span className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
          {selectedOptions.length === 0 ? (
            <span
              className={cn(
                "text-sm",
                !isAlt && "text-muted-foreground",
                isAlt && "text-primary-foreground/60",
              )}
            >
              {placeholder}
            </span>
          ) : (
            <>
              {displayedTags.map((opt) => (
                <span
                  key={opt.value}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium leading-none",
                    !isAlt && "bg-muted text-foreground",
                    isAlt && "bg-primary-foreground/20 text-primary-foreground",
                    classNames?.tag,
                  )}
                >
                  {opt.display ?? opt.label}
                  {/* Per-tag remove button */}
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Remove ${opt.label}`}
                    onClick={(e) => removeTag(e, opt.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && removeTag(e, opt.value)
                    }
                    className={cn(
                      "rounded-sm transition-colors",
                      !isAlt && "text-muted-foreground hover:text-foreground",
                      isAlt &&
                        "text-primary-foreground/60 hover:text-primary-foreground",
                    )}
                  >
                    <XIcon className="h-2.5 w-2.5" />
                  </span>
                </span>
              ))}

              {/* "+N more" overflow badge */}
              {overflowCount > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium leading-none",
                    !isAlt && "bg-muted text-muted-foreground",
                    isAlt &&
                      "bg-primary-foreground/20 text-primary-foreground/70",
                  )}
                >
                  +{overflowCount}
                </span>
              )}
            </>
          )}
        </span>

        {/* ── Right controls ── */}
        <span className="flex items-center gap-1 shrink-0 ml-auto pl-1">
          {/* Clear all */}
          {isClearable && selectedOptions.length > 0 && !isDisabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear all"
              onClick={clearAll}
              onKeyDown={(e) => e.key === "Enter" && clearAll(e as any)}
              className={cn(
                "rounded-sm p-0.5 transition-colors",
                !isAlt &&
                  "text-muted-foreground hover:text-foreground hover:bg-muted",
                isAlt &&
                  "text-primary-foreground/60 hover:text-primary-foreground",
              )}
            >
              <XIcon className="h-3.5 w-3.5" />
            </span>
          )}

          {/* Chevron */}
          <ChevronDownIcon
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              !isAlt && "text-muted-foreground",
              isAlt && "text-primary-foreground/60",
              open && "rotate-180",
            )}
          />
        </span>
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div
          id={menuId}
          role="dialog"
          aria-label={`${name} options`}
          onKeyDown={handleMenuKeyDown}
          className={cn(
            "absolute z-50 mt-1 w-full rounded-lg border overflow-hidden shadow-md",
            !isAlt && "bg-background border-border text-foreground",
            isAlt && "bg-primary border-primary text-primary-foreground",
            classNames?.menu,
          )}
        >
          {/* ── Search ── */}
          {isSearchable && (
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 border-b",
                !isAlt && "border-border",
                isAlt && "border-primary-foreground/20",
              )}
            >
              <SearchIcon
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  !isAlt && "text-muted-foreground",
                  isAlt && "text-primary-foreground/60",
                )}
              />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setFocusedIndex(-1);
                }}
                placeholder="Search..."
                className={cn(
                  "flex-1 bg-transparent text-sm outline-none",
                  !isAlt && "text-foreground placeholder:text-muted-foreground",
                  isAlt &&
                    "text-primary-foreground placeholder:text-primary-foreground/50",
                )}
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    searchRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className={cn(
                    "shrink-0 transition-opacity opacity-60 hover:opacity-100",
                    !isAlt && "text-muted-foreground",
                    isAlt && "text-primary-foreground/60",
                  )}
                >
                  <XIcon className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {/* ── Selection summary bar ── */}
          {selectedOptions.length > 0 && (
            <div
              className={cn(
                "flex items-center justify-between px-3 py-1.5 text-xs border-b",
                !isAlt && "border-border text-muted-foreground",
                isAlt &&
                  "border-primary-foreground/20 text-primary-foreground/60",
              )}
            >
              <span>
                {selectedOptions.length} selecionado
                {selectedOptions.length > 1 ? "s" : ""}
              </span>
              <button
                onClick={(e) => clearAll(e)}
                className={cn(
                  "transition-colors hover:underline",
                  !isAlt && "hover:text-foreground",
                  isAlt && "hover:text-primary-foreground",
                )}
              >
                Clean
              </button>
            </div>
          )}

          {/* ── Options list ── */}
          <ul
            ref={listRef}
            role="listbox"
            aria-multiselectable="true"
            aria-label={name}
            className="max-h-37.5 overflow-y-auto p-1"
          >
            {isLoading && visibleOptions.length === 0 ? (
              <li
                className={cn(
                  "flex items-center justify-center gap-2 py-4 text-sm",
                  !isAlt && "text-muted-foreground",
                  isAlt && "text-primary-foreground/60",
                )}
              >
                <SpinnerIcon className="h-4 w-4 animate-spin" />
                Carregando…
              </li>
            ) : visibleOptions.length === 0 ? (
              <li
                className={cn(
                  "py-4 text-center text-sm",
                  !isAlt && "text-muted-foreground",
                  isAlt && "text-primary-foreground/60",
                )}
              >
                Nenhuma opção encontrada
              </li>
            ) : (
              visibleOptions.map((option, index) => {
                const isSelected = value.includes(option.value);
                const isFocused = focusedIndex === index;
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleOption(option)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 my-0.5 rounded-md text-sm cursor-pointer select-none",
                      "transition-colors duration-100",
                      !isAlt && "text-foreground",
                      !isAlt && isFocused && !isSelected && "bg-muted",
                      !isAlt && isSelected && "bg-muted font-medium",
                      isAlt && "text-primary-foreground",
                      isAlt &&
                        isFocused &&
                        !isSelected &&
                        "bg-primary-foreground/10",
                      isAlt &&
                        isSelected &&
                        "bg-primary-foreground/20 font-medium",
                    )}
                  >
                    {/* Checkbox visual */}
                    <span
                      className={cn(
                        "flex items-center justify-center h-4 w-4 shrink-0 rounded border transition-colors",
                        !isAlt &&
                          isSelected &&
                          "bg-primary border-primary text-primary-foreground",
                        !isAlt && !isSelected && "border-border",
                        isAlt &&
                          isSelected &&
                          "bg-primary-foreground border-primary-foreground text-primary",
                        isAlt && !isSelected && "border-primary-foreground/40",
                      )}
                    >
                      {isSelected && <CheckIcon className="h-2.5 w-2.5" />}
                    </span>

                    <span className="flex-1 flex items-center gap-2 min-w-0">
                      {option.display ?? option.label}
                    </span>
                  </li>
                );
              })
            )}

            {/* ── Infinite scroll sentinel ── */}
            {enableInfiniteScroll && (
              <div ref={sentinelRef} className="h-1">
                {isFetchingMore && (
                  <div className="flex items-center justify-center py-2">
                    <SpinnerIcon
                      className={cn(
                        "h-4 w-4 animate-spin",
                        !isAlt && "text-muted-foreground",
                        isAlt && "text-primary-foreground/60",
                      )}
                    />
                  </div>
                )}
              </div>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Inline SVG icons (zero dependencies) ────────────────────────────────────

function ChevronDownIcon({ className }: { className?: string }) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
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
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
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
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

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
