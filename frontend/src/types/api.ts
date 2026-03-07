export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ msg: string; field?: string }>;
}

export interface Pagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}
