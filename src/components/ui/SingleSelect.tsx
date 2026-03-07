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

interface SingleSelectProps {
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

  onChange: (value: string | undefined) => void;
  placeholder?: string;
  name: string;
  value: string | null | undefined;

  classNames?: {
    trigger?: string;
    menu?: string;
    container?: string;
  };

  isClearable?: boolean;
  clearValueAs?: "undefined" | "emptyString";
  isSearchable?: boolean;
  isDisabled?: boolean;
  variant?: "default" | "alternative";

  enableInfiniteScroll?: boolean;
  pageSize?: number;
  searchDebounce?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SingleSelect({
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
  clearValueAs = "undefined",
  isSearchable = true,
  isDisabled = false,
  variant = "default",
  enableInfiniteScroll = false,
  pageSize = 10,
  searchDebounce = 300,
}: SingleSelectProps) {
  const instanceId = useId();
  const menuId = `${instanceId}-menu`;
  const triggerId = `${instanceId}-trigger`;

  // ── UI state ─────────────────────────────────────────────────────────────────
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

  const selectedOption = value
    ? (visibleOptions.find((o) => o.value === value) ?? { value, label: value })
    : null;

  // ── Handlers ──────────────────────────────────────────────────────────────────
  function selectOption(option: SelectOption) {
    onChange(option.value);
    setOpen(false);
    setSearch("");
  }

  function clearSelection(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(clearValueAs === "emptyString" ? "" : undefined);
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
      selectOption(visibleOptions[focusedIndex]);
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
        aria-disabled={isDisabled}
        disabled={isDisabled}
        onClick={toggleOpen}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "relative flex items-center gap-2 w-full h-10 px-3 rounded-lg border text-sm",
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
        {/* Label / placeholder */}
        <span className="flex-1 truncate text-left">
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.display ?? selectedOption.label}
            </span>
          ) : (
            <span
              className={cn(
                !isAlt && "text-muted-foreground",
                isAlt && "text-primary-foreground/60",
              )}
            >
              {placeholder}
            </span>
          )}
        </span>

        {/* Clear button */}
        {isClearable && selectedOption && !isDisabled && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear selection"
            onClick={clearSelection}
            onKeyDown={(e) => e.key === "Enter" && clearSelection(e as any)}
            className={cn(
              "shrink-0 rounded-sm p-0.5 transition-colors",
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
            "h-4 w-4 shrink-0 transition-transform duration-200",
            !isAlt && "text-muted-foreground",
            isAlt && "text-primary-foreground/60",
            open && "rotate-180",
          )}
        />
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
          {/* Search */}
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

          {/* Options list */}
          <ul
            ref={listRef}
            role="listbox"
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
                const isSelected = option.value === value;
                const isFocused = focusedIndex === index;
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => selectOption(option)}
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
                    <span className="flex-1 flex items-center gap-2 min-w-0">
                      {option.display ?? option.label}
                    </span>
                    {isSelected && (
                      <CheckIcon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          !isAlt && "text-foreground",
                          isAlt && "text-primary-foreground",
                        )}
                      />
                    )}
                  </li>
                );
              })
            )}

            {/* Infinite scroll sentinel */}
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
