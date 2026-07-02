import { getCloudflareContext } from "@opennextjs/cloudflare";

export type D1Result<T> = {
  results?: T[];
  success?: boolean;
};

export type D1PreparedStatementLike = {
  bind(...values: unknown[]): D1PreparedStatementLike;
  all<T>(): Promise<D1Result<T>>;
  first<T>(): Promise<T | null>;
  run(): Promise<D1Result<unknown>>;
};

export type D1DatabaseLike = {
  prepare(query: string): D1PreparedStatementLike;
};

export function getD1Database() {
  try {
    const context = getCloudflareContext();
    const env = context.env as CloudflareEnv & { DB?: D1DatabaseLike };
    return env.DB ?? null;
  } catch {
    return null;
  }
}

export function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}
