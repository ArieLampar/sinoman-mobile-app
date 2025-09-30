// Common API Response Types

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface SuccessResponse {
  success: boolean;
  message?: string;
}

// Request configuration
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// API Status
export enum ApiStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

// Common query parameters
export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, any>;
}

// File upload
export interface FileUpload {
  uri: string;
  name: string;
  type: string;
}

export interface UploadResponse {
  url: string;
  publicId: string;
}