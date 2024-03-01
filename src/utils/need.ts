export function need<T extends unknown>(val: T | undefined | null): T {
  if (!val) throw new Error("Missing required value.");
  return val;
}
