export interface PaginatedResult<T> {
  values: T[];
  metadata: {
    totalPages: number;
    currentPage: number;
  };
}
