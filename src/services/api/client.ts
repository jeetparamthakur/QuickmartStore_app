export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.example.com';
export const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION ?? 'v1';
export const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API === 'true';

export function getApiUrl(path: string): string {
  return `${API_BASE_URL}/${API_VERSION}${path}`;
}

let authTokenGetter: (() => string | null) | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthTokenGetter(getter: () => string | null) {
  authTokenGetter = getter;
}

export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const token = authTokenGetter?.();
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(getApiUrl(path), {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      onUnauthorized?.();
      throw new ApiError('UNAUTHORIZED', 'Session expired', 401);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        data.code ?? 'API_ERROR',
        data.message ?? 'Something went wrong',
        response.status,
        data.details
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('NETWORK_ERROR', 'No internet connection. Please try again.');
  }
}
