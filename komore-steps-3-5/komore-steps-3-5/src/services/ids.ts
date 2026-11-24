/**
 * File: ids.ts
 * Local id generator for records created on the phone.
 */
let counter = 0;

/** Small local id generator (no extra library needed). */
export function newId(prefix: string = 'id'): string {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${rand}`;
}
