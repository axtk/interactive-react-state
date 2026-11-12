import { StateSelector } from "./StateSelector.ts";

export function select<
  T,
  V = T,
>(
  selector: (value: T) => V,
  equal?: (a: unknown, b: unknown) => boolean,
) {
  return new StateSelector(selector, equal);
}
