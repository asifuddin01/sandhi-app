/**
 * The API answers `{ data }` or `{ error: { code, message } }` (docs/mobile/API.md
 * in the sandhi repo). This is the one place that shape is read, so no screen
 * has to know it. Kept free of React Native imports so `node --test` can run it.
 */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export const OFFLINE = new ApiError(
  'offline',
  'Could not reach SANDHI. Check your connection and try again.',
  0,
);

export function readEnvelope<T>(status: number, body: unknown): T {
  const envelope = body as {
    data?: T;
    error?: { code?: unknown; message?: unknown };
  } | null;
  if (status >= 200 && status < 300 && envelope && 'data' in envelope) {
    return envelope.data as T;
  }
  const code = envelope?.error?.code;
  const message = envelope?.error?.message;
  throw new ApiError(
    typeof code === 'string' ? code : 'server_error',
    typeof message === 'string'
      ? message
      : 'Something went wrong. Please try again.',
    status,
  );
}
