import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const table = "__hogoshi_class_map__".split(" ");
const hidden = new Map<string, string>();
const original = new Map<string, string>();

for (let i = 0; i + 1 < table.length; i += 2) {
  hidden.set(table[i], table[i + 1]);
  original.set(table[i + 1], table[i]);
}

const swap = (value: string, map: Map<string, string>) => (map.size ? value.replace(/\S+/g, (token) => map.get(token) ?? token) : value);

export function cn(...inputs: ClassValue[]) {
  return swap(twMerge(swap(clsx(inputs), original)), hidden);
}
