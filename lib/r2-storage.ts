import { getCloudflareContext } from "@opennextjs/cloudflare";

export type R2ObjectLike = {
  arrayBuffer(): Promise<ArrayBuffer>;
  httpMetadata?: {
    contentType?: string;
  };
};

export type R2BucketLike = {
  get(key: string): Promise<R2ObjectLike | null>;
  put(
    key: string,
    value: string | ArrayBuffer,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
  delete(key: string): Promise<void>;
};

export function getR2Bucket(bindingName: string, fallbackBindingName?: string) {
  const context = getCloudflareContext();
  const env = context.env as CloudflareEnv & Record<string, R2BucketLike | undefined>;
  const bucket = env[bindingName] ?? (fallbackBindingName ? env[fallbackBindingName] : undefined);

  if (!bucket) {
    throw new Error(`Missing Cloudflare R2 binding: ${bindingName}`);
  }

  return bucket;
}
