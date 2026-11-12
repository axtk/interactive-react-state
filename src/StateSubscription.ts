import { Subscribe } from "./types/Subscribe.ts";

export class StateSubscription<V = void> {
  subscribe?: Subscribe;
  getSnapshot?: () => V;
  constructor(
    subscribe: Subscribe | null,
    getSnapshot?: () => V,
  ) {
    if (subscribe) this.subscribe = subscribe;
    this.getSnapshot = getSnapshot;
  }
}
