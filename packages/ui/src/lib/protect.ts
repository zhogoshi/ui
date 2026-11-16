const registry = new Set<string>();

export function protect<T extends (...args: never[]) => unknown>(tag: "hogoshi:vm", fn: T): T {
  for (const key of [tag]) registry.add(key);
  return fn;
}
