import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { fetch as expoFetch } from 'expo/fetch';
import { File } from 'expo-file-system';

// Expo Network in React Native DevTools only captures expo/fetch (OkHttp CDP
// interceptors from expo-dev-client). RN global fetch bypasses that pipeline.
const apiFetch: typeof globalThis.fetch = expoFetch;

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

const FALLBACK_API_BASE_URL = 'http://localhost:3000';

function getDevMachineHost(): string | null {
  const sources = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.linkingUri,
  ].filter(Boolean) as string[];

  for (const source of sources) {
    const ip = source.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
    if (ip) return ip[1];
  }

  if (Platform.OS === 'android') return '10.0.2.2';
  return null;
}

function resolveApiBaseUrl(raw: string): string {
  if (!raw.includes('localhost') && !raw.includes('127.0.0.1')) return raw;
  const host = getDevMachineHost();
  if (!host) return raw;
  return raw.replace(/localhost|127\.0\.0\.1/g, host);
}

export const API_BASE_URL = resolveApiBaseUrl(
  process.env.EXPO_PUBLIC_API_BASE_URL ?? FALLBACK_API_BASE_URL,
);
export const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION ?? 'v1';
export const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API === 'true';
const API_DEBUG = __DEV__ && process.env.EXPO_PUBLIC_API_DEBUG !== 'false';

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (phone.startsWith('+')) return phone;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return `+${digits}`;
}

export function getApiUrl(path: string): string {
  return `${API_BASE_URL}/api/${API_VERSION}${path}`;
}

if (API_DEBUG) {
  console.log('[API config]', {
    baseUrl: API_BASE_URL,
    version: API_VERSION,
    mock: USE_MOCK_API,
  });
}

let authTokenGetter: (() => string | null) | null = null;
let refreshTokenGetter: (() => string | null) | null = null;
let onTokensRefreshed: ((token: string, refreshToken: string) => void | Promise<void>) | null = null;
let onUnauthorized: (() => void) | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAuthTokenGetter(getter: () => string | null) {
  authTokenGetter = getter;
}

export function setRefreshTokenGetter(getter: () => string | null) {
  refreshTokenGetter = getter;
}

export function setOnTokensRefreshed(
  handler: (token: string, refreshToken: string) => void | Promise<void>
) {
  onTokensRefreshed = handler;
}

export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler;
}

function getUnauthorizedMessage(data: unknown): string {
  return (data as { message?: string }).message ?? 'Session expired';
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = refreshTokenGetter?.();
    if (!refreshToken) return null;

    try {
      const response = await apiFetch(getApiUrl('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return null;

      const token = (data as { token?: string }).token;
      const nextRefreshToken = (data as { refreshToken?: string }).refreshToken;
      if (!token || !nextRefreshToken) return null;

      await onTokensRefreshed?.(token, nextRefreshToken);
      return token;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

function logApi(
  kind: 'request' | 'response' | 'error',
  method: string,
  url: string,
  detail?: unknown
) {
  if (!API_DEBUG) return;

  const prefix = `[API ${kind}] ${method} ${url}`;
  if (kind === 'error') {
    console.error(prefix, detail ?? '');
    return;
  }
  console.log(prefix, detail ?? '');
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
  allowRefresh = true
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  const url = getApiUrl(path);
  const startedAt = Date.now();

  const token = authTokenGetter?.();
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  logApi('request', method, url, {
    body: body ?? null,
    hasAuth: Boolean(token),
  });

  try {
    const response = await apiFetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({}));
    const elapsedMs = Date.now() - startedAt;

    if (response.status === 401 && allowRefresh) {
      const nextToken = await refreshAccessToken();
      if (nextToken) {
        return apiClient<T>(
          path,
          {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${nextToken}`,
            },
          },
          false,
        );
      }
      onUnauthorized?.();
      const error = new ApiError(
        'UNAUTHORIZED',
        getUnauthorizedMessage(data),
        401
      );
      logApi('error', method, url, { status: 401, elapsedMs, error: error.message });
      throw error;
    }

    if (!response.ok) {
      const error = new ApiError(
        (data as { code?: string }).code ?? 'API_ERROR',
        (data as { message?: string }).message ?? 'Something went wrong',
        response.status,
        (data as { details?: unknown }).details
      );
      logApi('error', method, url, {
        status: response.status,
        elapsedMs,
        body: data,
      });
      throw error;
    }

    logApi('response', method, url, {
      status: response.status,
      elapsedMs,
      body: data,
    });

    return data as T;
  } catch (error) {
    const elapsedMs = Date.now() - startedAt;
    if (error instanceof ApiError) throw error;

    const networkError = new ApiError(
      'NETWORK_ERROR',
      'No internet connection. Please try again.'
    );
    logApi('error', method, url, {
      elapsedMs,
      message: error instanceof Error ? error.message : String(error),
      hint: 'Check EXPO_PUBLIC_API_BASE_URL and that phone is on the same Wi-Fi as your laptop.',
    });
    throw networkError;
  }
}

export async function uploadMultipart<T>(
  path: string,
  type: string,
  uri: string,
): Promise<T> {
  const url = getApiUrl(path);
  const token = authTokenGetter?.();
  const startedAt = Date.now();

  const formData = new FormData();
  const file = new File(uri);
  formData.append('file', file);
  formData.append('type', type);

  logApi('request', 'POST', url, { type, hasAuth: Boolean(token) });

  try {
    const response = await apiFetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    const elapsedMs = Date.now() - startedAt;

    if (response.status === 401) {
      const nextToken = await refreshAccessToken();
      if (nextToken) {
        const retryResponse = await apiFetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${nextToken}`,
          },
          body: formData,
        });
        const retryData = await retryResponse.json().catch(() => ({}));
        const retryElapsedMs = Date.now() - startedAt;

        if (retryResponse.ok) {
          logApi('response', 'POST', url, {
            status: retryResponse.status,
            elapsedMs: retryElapsedMs,
            body: retryData,
          });
          return retryData as T;
        }

        if (retryResponse.status === 401) {
          onUnauthorized?.();
          const error = new ApiError(
            'UNAUTHORIZED',
            getUnauthorizedMessage(retryData),
            401
          );
          logApi('error', 'POST', url, {
            status: 401,
            elapsedMs: retryElapsedMs,
            error: error.message,
          });
          throw error;
        }

        const error = new ApiError(
          (retryData as { errorCode?: string }).errorCode ?? 'API_ERROR',
          (retryData as { message?: string }).message ?? 'Upload failed',
          retryResponse.status,
        );
        logApi('error', 'POST', url, {
          status: retryResponse.status,
          elapsedMs: retryElapsedMs,
          body: retryData,
        });
        throw error;
      }

      onUnauthorized?.();
      const error = new ApiError(
        'UNAUTHORIZED',
        getUnauthorizedMessage(data),
        401
      );
      logApi('error', 'POST', url, { status: 401, elapsedMs, error: error.message });
      throw error;
    }

    if (!response.ok) {
      const error = new ApiError(
        (data as { errorCode?: string }).errorCode ?? 'API_ERROR',
        (data as { message?: string }).message ?? 'Upload failed',
        response.status,
      );
      logApi('error', 'POST', url, {
        status: response.status,
        elapsedMs,
        body: data,
      });
      throw error;
    }

    logApi('response', 'POST', url, { status: response.status, elapsedMs, body: data });
    return data as T;
  } catch (error) {
    const elapsedMs = Date.now() - startedAt;
    if (error instanceof ApiError) throw error;

    const networkError = new ApiError(
      'NETWORK_ERROR',
      'Upload failed. Please try again.',
    );
    logApi('error', 'POST', url, {
      elapsedMs,
      message: error instanceof Error ? error.message : String(error),
    });
    throw networkError;
  }
}

export async function uploadImageOnly<T>(path: string, uri: string): Promise<T> {
  const url = getApiUrl(path);
  const token = authTokenGetter?.();
  const startedAt = Date.now();

  const formData = new FormData();
  const file = new File(uri);
  formData.append('file', file);

  logApi('request', 'POST', url, { hasAuth: Boolean(token) });

  try {
    const response = await apiFetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    const elapsedMs = Date.now() - startedAt;

    if (!response.ok) {
      const error = new ApiError(
        (data as { errorCode?: string }).errorCode ?? 'API_ERROR',
        (data as { message?: string }).message ?? 'Upload failed',
        response.status,
      );
      logApi('error', 'POST', url, {
        status: response.status,
        elapsedMs,
        body: data,
      });
      throw error;
    }

    logApi('response', 'POST', url, { status: response.status, elapsedMs, body: data });
    return data as T;
  } catch (error) {
    const elapsedMs = Date.now() - startedAt;
    if (error instanceof ApiError) throw error;

    const networkError = new ApiError(
      'NETWORK_ERROR',
      'Upload failed. Please try again.',
    );
    logApi('error', 'POST', url, {
      elapsedMs,
      message: error instanceof Error ? error.message : String(error),
    });
    throw networkError;
  }
}
