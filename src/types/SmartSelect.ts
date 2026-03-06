import { PaginatedResult } from "./Pagination";

export interface Option {
  value: string;
  label: string;
}

export interface SmartSelectConfig {
  element: HTMLElement;
  fetchFn: (search: string, page: number) => Promise<PaginatedResult<Option>>;
  onChange?: (value: Option | null) => void;
  debounceTime?: number;
}
