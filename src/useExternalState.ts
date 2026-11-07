import { useEffect, useMemo, useRef, useState } from "react";
import { isState, type State, type StatePayloadMap } from "statepack";

export type Subscribe = (render: () => void) => void | (() => void);

export type SetExternalStateValue<
  T,
  P extends StatePayloadMap<T> = StatePayloadMap<T>,
> = State<T, P>["setValue"];

export function useExternalState<T, P extends StatePayloadMap<T>, V = T>(
  state: State<T, P> | null | undefined,
  subscribe?: Subscribe | boolean,
  getSnapshot?: () => V,
): [V, SetExternalStateValue<T, P>] {
  if (state === undefined || state === null)
    throw new TypeError(`state is ${state} but should be an instance of State`);

  if (!isState<T, P>(state))
    throw new TypeError("state is not an instance of State");

  let [, setRevision] = useState(-1);

  let setValue = useMemo(() => state.setValue.bind(state), [state]);
  let initialStateRevision = useRef(state.revision);
  let mounted = useRef(false);

  useEffect(() => {
    // The `start()` and `stop()` methods allow some varieties of State (like
    // PersistentState) to hook into the component's life cycle.
    state.start();

    if (subscribe === false) return;

    mounted.current = true;

    let render = () => {
      if (mounted.current) setRevision(Math.random());
    };

    let cleanup =
      typeof subscribe === "function"
        ? subscribe(render)
        : state.on("update", render);

    // Update the component if the state receives updates after the component
    // has already got mounted but before this effect runs and the component
    // subscribes to the state.
    if (state.revision !== initialStateRevision.current) render();

    return () => {
      cleanup?.();
      state.stop();
      initialStateRevision.current = state.revision;
      mounted.current = false;
    };
  }, [state, subscribe]);

  let value =
    getSnapshot === undefined
      ? (state.getValue() as unknown as V)
      : getSnapshot();

  return [value, setValue];
}
