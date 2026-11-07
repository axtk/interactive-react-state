import type { State, StatePayloadMap } from "statepack";
import { shallowEqual } from "./shallowEqual.ts";
import type { useExternalState } from "./useExternalState.ts";

export function select<
  T,
  P extends StatePayloadMap<T> = StatePayloadMap<T>,
  V = T,
>(
  state: State<T, P>,
  selector: (value: T) => V,
  equal = shallowEqual,
): Parameters<typeof useExternalState<T, P, V>> {
  return [
    state,
    (render) => {
      return state.on("update", ({ current, previous }) => {
        if (!equal(selector(current), selector(previous))) render();
      });
    },
    () => selector(state.getValue()),
  ];
}
