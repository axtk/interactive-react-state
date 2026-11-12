import type { State } from "stategear";
import { StateSubscription } from "./StateSubscription.ts";
import { shallowEqual } from "./shallowEqual.ts";

export class StateSelector<T, V = T> {
  select: (value: T) => V;
  equal: (a: unknown, b: unknown) => boolean;
  constructor(select: (value: T) => V, equal = shallowEqual) {
    this.select = select;
    this.equal = equal;
  }
  toSubscription(state: State<T>) {
    let { select, equal } = this;
    return new StateSubscription(
      (render) => {
        return state.on("update", ({ current, previous }) => {
          if (!equal(select(current), select(previous))) render();
        });
      },
      () => select(state.getValue()),
    );
  }
}
