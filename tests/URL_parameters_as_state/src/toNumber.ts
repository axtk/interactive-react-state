export function toNumber(x: number | string | undefined, fallback: number) {
  if (typeof x === "number") return x;
  const n = Number(x);
  return Number.isNaN(n) ? fallback : n;
}
