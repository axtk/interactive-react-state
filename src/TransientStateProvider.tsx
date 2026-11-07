import type { ReactNode } from "react";
import { State } from "statepack";
import { TransientStateContext } from "./TransientStateContext.ts";
import type { TransientState } from "./types/TransientState.ts";
import { useInitialValue } from "./useInitialValue.ts";

export type TransientStateProviderProps = {
  value?:
    | Record<string, TransientState>
    | Map<string, State<TransientState>>
    | null
    | undefined;
  children?: ReactNode;
};

/**
 * This components provides a scoped transient state container. Its `value`
 * prop defines the initial value of the transient state map.
 */
export const TransientStateProvider = ({
  value,
  children,
}: TransientStateProviderProps) => {
  let stateMap = useInitialValue(() => {
    if (value instanceof Map) return value;

    if (typeof value === "object" && value !== null)
      return new Map(
        Object.entries(value).map(([key, value]) => [key, new State(value)]),
      );

    return new Map<string, State<TransientState>>();
  });

  return (
    <TransientStateContext.Provider value={stateMap}>
      {children}
    </TransientStateContext.Provider>
  );
};
