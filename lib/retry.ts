export async function withRetry<T>(
  operation: () => Promise<T>,
  options: { retries?: number; baseMs?: number; factor?: number } = {},
): Promise<T> {
  const retries = options.retries ?? 3;
  const baseMs = options.baseMs ?? 200;
  const factor = options.factor ?? 2;

  let attempt = 0;
  let lastError: unknown;
  while (attempt <= retries) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
      const delay = baseMs * Math.pow(factor, attempt);
      await new Promise((res) => setTimeout(res, delay));
      attempt += 1;
    }
  }
  throw lastError;
}

