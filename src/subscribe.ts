import { StateSubscription } from "./StateSubscription.ts";
import { Subscribe } from "./types/Subscribe.ts";

export function subscribe<V = void>(
  subscribe: Subscribe | null,
  getSnapshot?: () => V,
) {
  return new StateSubscription<V>(subscribe, getSnapshot);
}
