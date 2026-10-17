import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';

import { request } from './api';
import { ApiError } from './envelope';
import type { Viewer } from './types';

const TOKEN_KEY = 'sandhi.session';

/**
 * The keychain, readable only while the phone is unlocked and never copied to
 * another device or a backup. The web preview has no keychain, so there the
 * session lasts as long as the tab.
 */
const store =
  Platform.OS === 'web'
    ? (() => {
        let value: string | null = null;
        return {
          get: async () => value,
          set: async (next: string) => void (value = next),
          clear: async () => void (value = null),
        };
      })()
    : {
        get: () => SecureStore.getItemAsync(TOKEN_KEY),
        set: (next: string) =>
          SecureStore.setItemAsync(TOKEN_KEY, next, {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          }),
        clear: () => SecureStore.deleteItemAsync(TOKEN_KEY),
      };

type SignInAnswer =
  | { status: 'signed-in'; token: string; expiresAt: string }
  | { status: 'two-factor'; challenge: string };

type Session = {
  /** False until the stored token, if any, has been checked. */
  ready: boolean;
  token: string | null;
  viewer: Viewer | null;
  signIn: (email: string, password: string) => Promise<'signed-in' | 'two-factor'>;
  verify: (code: string, method: 'totp' | 'backup') => Promise<void>;
  signOut: () => Promise<void>;
  /** The server no longer accepts the token (a 401): forget it locally. */
  expire: () => void;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  // The two-factor challenge lives here only: never on disk, never in a URL.
  const challenge = useRef<string | null>(null);

  const forget = useCallback(() => {
    setToken(null);
    setViewer(null);
    void store.clear().catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await store.get().catch(() => null);
      if (saved) {
        try {
          const who = await request<Viewer>('/auth/session', { token: saved });
          if (!cancelled) {
            setToken(saved);
            setViewer(who);
          }
        } catch (error) {
          if (cancelled) return;
          // Refused: the session ended elsewhere. Offline: keep it and retry later.
          if (error instanceof ApiError && error.status === 401) forget();
          else setToken(saved);
        }
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [forget]);

  const establish = useCallback(async (next: string) => {
    const who = await request<Viewer>('/auth/session', { token: next });
    await store.set(next);
    setToken(next);
    setViewer(who);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const answer = await request<SignInAnswer>('/auth/sign-in', {
        method: 'POST',
        body: { email, password },
      });
      if (answer.status === 'two-factor') {
        challenge.current = answer.challenge;
        return 'two-factor' as const;
      }
      await establish(answer.token);
      return 'signed-in' as const;
    },
    [establish],
  );

  const verify = useCallback(
    async (code: string, method: 'totp' | 'backup') => {
      if (!challenge.current) {
        throw new ApiError('bad_request', 'This sign-in has expired. Sign in again.', 400);
      }
      const answer = await request<SignInAnswer>('/auth/two-factor', {
        method: 'POST',
        body: { challenge: challenge.current, code, method },
      });
      if (answer.status !== 'signed-in') {
        throw new ApiError('server_error', 'Sign-in did not complete. Please try again.', 500);
      }
      challenge.current = null;
      await establish(answer.token);
    },
    [establish],
  );

  const signOut = useCallback(async () => {
    const current = token;
    forget();
    // Ends this session on the server too; offline, it simply expires there.
    if (current) {
      await request('/auth/sign-out', { method: 'POST', body: {}, token: current }).catch(
        () => undefined,
      );
    }
  }, [token, forget]);

  const value = useMemo(
    () => ({ ready, token, viewer, signIn, verify, signOut, expire: forget }),
    [ready, token, viewer, signIn, verify, signOut, forget],
  );
  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): Session {
  const session = use(SessionContext);
  if (!session) throw new Error('useSession needs <SessionProvider>.');
  return session;
}
