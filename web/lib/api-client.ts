const appApiBaseUrl = process.env.NEXT_PUBLIC_APP_API_URL ?? "http://localhost:5050";

interface ProblemResponse {
  title?: string;
  detail?: string;
  message?: string;
  error?: string;
}

export class ApiError extends Error {
  public readonly status: number;

  public constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function appApiRequest<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(`${appApiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = (await response.json()) as ProblemResponse;
      message = payload.detail ?? payload.message ?? payload.error ?? payload.title ?? message;
    } catch {
      // レスポンス本文が空のケースを許容します。
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}
