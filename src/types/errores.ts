export type APIError = {
  message: string
}

export type APIResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: APIError }
