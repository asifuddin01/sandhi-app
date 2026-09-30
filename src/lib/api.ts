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

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${SITE_URL}/api/v1${path}`, {
      headers: { Accept: 'application/json', 'X-Sandhi-Client': CLIENT },
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
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
 * One read, with pull-to-refresh. `path` null waits (an empty search, say).
 * Loading is derived — the request that last settled is not the one wanted —
 * and the previous data stays on screen until the next arrives.
 */
export function useApi<T>(path: string | null): Load<T> {
  const [attempt, setAttempt] = useState(0);
  const [refreshAttempt, setRefreshAttempt] = useState(-1);
  const [settled, setSettled] = useState<{ key: string; data?: T; error?: ApiError }>();
  const key = path === null ? null : `${attempt}:${path}`;

  useEffect(() => {
    if (key === null || path === null) return;
    const controller = new AbortController();
    apiGet<T>(path, controller.signal).then(
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
  }, [key, path]);

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
