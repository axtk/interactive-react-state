import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { isState, State } from "statepack";
import { TransientStateContext } from "./TransientStateContext.ts";
import type { TransientState } from "./types/TransientState.ts";
import {
  type SetExternalStateValue,
  useExternalState,
} from "./useExternalState.ts";

function createState(
  initial = true,
  pending = false,
  error?: unknown,
): TransientState {
  return {
    initial,
    pending,
    error,
    time: Date.now(),
  };
}

export type TransientStateOptions = {
  /**
   * Whether to track the action state silently (e.g. with a background
   * action or an optimistic update).
   *
   * When set to `true`, the state's `pending` property doesn't switch
   * to `true` in the pending state.
   */
  silent?: boolean;
  /**
   * Delays switching the action state's `pending` property to `true`
   * in the pending state by the given number of milliseconds.
   *
   * Use case: to avoid flashing a process indicator if the action is
   * likely to complete by the end of a short delay.
   */
  delay?: number;
  /**
   * Allows the async action to reject explicitly, along with exposing
   * the action state's `error` property that goes by default.
   */
  throws?: boolean;
};

export type ControllableTransientState = TransientState & {
  update: SetExternalStateValue<TransientState>;
};

/**
 * The hook's `state` parameter is a unique string key or an instance of
 * `State`. Providing a string key or a `State` instance allows to share the
 * action state across multiple components. If the key is omitted or set to
 * `null`, the action state stays locally scoped to the component where the
 * hook is used.
 */
export function useTransientState<F extends (...args: unknown[]) => unknown>(
  state: string | State<TransientState> | null,
  action: F,
): [
  ControllableTransientState,
  (...args: [...Parameters<F>, TransientStateOptions?]) => ReturnType<F>,
];

export function useTransientState(
  state: string | State<TransientState> | null,
): [ControllableTransientState];

export function useTransientState<F extends (...args: unknown[]) => unknown>(
  state: string | State<TransientState> | null,
  action?: F,
): [
  ControllableTransientState,
  ((...args: [...Parameters<F>, TransientStateOptions?]) => ReturnType<F>)?,
] {
  let stateMap = useContext(TransientStateContext);
  let stateRef = useRef<State<TransientState> | null>(null);
  let [stateItemInited, setStateItemInited] = useState(false);

  let resolvedState = useMemo(() => {
    if (isState<TransientState>(state)) return state;

    if (typeof state === "string") {
      let stateItem = stateMap.get(state);

      if (!stateItem) {
        stateItem = new State(createState());
        stateMap.set(state, stateItem);

        if (!stateItemInited) setStateItemInited(true);
      }

      return stateItem;
    }

    if (!stateRef.current) stateRef.current = new State(createState());

    return stateRef.current;
  }, [state, stateMap, stateItemInited]);

  let [actionState, setActionState] = useExternalState(resolvedState);

  let trackableAction = useCallback(
    (...args: [...Parameters<F>, TransientStateOptions?]) => {
      if (!action)
        throw new Error(
          "A trackable action is only available when the hook's 'action' parameter is set",
        );

      let options = args.at(-1) as TransientStateOptions | undefined;
      let originalArgs = args.slice(0, -1) as Parameters<F>;
      let result: unknown;

      try {
        result = action(...originalArgs);
      } catch (error) {
        setActionState((prevState) => ({
          ...prevState,
          ...createState(false, false, error),
        }));

        if (options?.throws) throw error;
      }

      if (result instanceof Promise) {
        let delayedTracking: ReturnType<typeof setTimeout> | null = null;

        if (!options?.silent) {
          let delay = options?.delay;

          if (delay === undefined)
            setActionState((prevState) => ({
              ...prevState,
              ...createState(false, true),
            }));
          else
            delayedTracking = setTimeout(() => {
              setActionState((prevState) => ({
                ...prevState,
                ...createState(false, true),
              }));

              delayedTracking = null;
            }, delay);
        }

        return result
          .then((value) => {
            if (delayedTracking !== null) clearTimeout(delayedTracking);

            setActionState((prevState) => ({
              ...prevState,
              ...createState(false, false),
            }));

            return value;
          })
          .catch((error) => {
            if (delayedTracking !== null) clearTimeout(delayedTracking);

            setActionState((prevState) => ({
              ...prevState,
              ...createState(false, false, error),
            }));

            if (options?.throws) throw error;
          }) as ReturnType<F>;
      }

      setActionState((prevState) => ({
        ...prevState,
        ...createState(false, false),
      }));

      return result as ReturnType<F>;
    },
    [action, setActionState],
  );

  return useMemo(() => {
    let extendedActionState = {
      ...actionState,
      update: setActionState,
    };

    return action
      ? [extendedActionState, trackableAction]
      : [extendedActionState];
  }, [action, trackableAction, actionState, setActionState]);
}
