import { useContext, useMemo } from "react";
import type { NavigationOptions } from "stategear";
import { RouteContext } from "./RouteContext.ts";
import type { RenderCallback } from "./types/RenderCallback.ts";
import { useExternalState } from "./useExternalState.ts";
import { subscribe } from "./subscribe.ts";

export function useRoute(callback?: RenderCallback<NavigationOptions>) {
  let route = useContext(RouteContext);

  let subscription = useMemo(() => subscribe(
    (render) => route.on("navigation", (payload) => {
      if (callback) callback(render, payload);
      else render();
    }),
  ), [route, callback]);

  useExternalState(route, subscription);

  return useMemo(
    () => ({
      route,
      at: route.at.bind(route),
    }),
    [route],
  );
}
