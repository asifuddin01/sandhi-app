import Constants from 'expo-constants';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { ApiError, OFFLINE, readEnvelope } from './envelope';

/** The live site unless a dev build points elsewhere (EXPO_PUBLIC_API_URL). */
export const SITE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'https://sandhiresearch.org'
).replace(/\/$/, '');

const version = Constants.expoConfig?.version ?? '0.0.0';
const build =
  Platform.OS === 'android'
    ? String(Constants.expoConfig?.android?.versionCode ?? 1)
    : (Constants.expoConfig?.ios?.buildNumber ?? '1');

/** Names the app and its version, which the site uses for the update prompt. */
const CLIENT = `sandhi-mobile/${version} (${Platform.OS}; build=${build})`;

/**
 * Every request the app makes. A token, when given, goes in the Authorization
 * header and nowhere else — never in a URL, never in a log.
 */
export async function request<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST';
    body?: unknown;
    token?: string | null;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Sandhi-Client': CLIENT,
  };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let response: Response;
  try {
    response = await fetch(`${SITE_URL}/api/v1${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw OFFLINE;
  }
  return readEnvelope<T>(response.status, await response.json().catch(() => null));
}

type Load<T> = {
  data: T | undefined;
  error: ApiError | undefined;
  loading: boolean;
  refreshing: boolean;
  refresh: () => void;
};

/**
 * One read, with pull-to-refresh. `path` null waits (an empty search, or no
 * session yet). Loading is derived — the request that last settled is not the
 * one wanted — and the previous data stays on screen until the next arrives.
 * Member reads pass the session token; they live in memory only, never on disk.
 */
export function useApi<T>(path: string | null, token?: string | null): Load<T> {
  const [attempt, setAttempt] = useState(0);
  const [refreshAttempt, setRefreshAttempt] = useState(-1);
  const [settled, setSettled] = useState<{ key: string; data?: T; error?: ApiError }>();
  const key = path === null ? null : `${attempt}:${token ?? ''}:${path}`;

  useEffect(() => {
    if (key === null || path === null) return;
    const controller = new AbortController();
    request<T>(path, { token, signal: controller.signal }).then(
      (data) => setSettled({ key, data }),
      (reason: unknown) => {
        if (controller.signal.aborted) return;
        setSettled((previous) => ({
          key,
          data: previous?.data,
          error: reason instanceof ApiError ? reason : OFFLINE,
        }));
      },
    );
    return () => controller.abort();
  }, [key, path, token]);

  const loading = key !== null && settled?.key !== key;
  const refresh = useCallback(() => {
    setRefreshAttempt(attempt + 1);
    setAttempt(attempt + 1);
  }, [attempt]);

  return {
    data: settled?.data,
    error: settled?.key === key ? settled.error : undefined,
    loading,
    refreshing: loading && refreshAttempt === attempt,
    refresh,
  };
}
