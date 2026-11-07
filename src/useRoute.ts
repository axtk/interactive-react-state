import { useContext, useMemo } from "react";
import type { NavigationOptions } from "statepack";
import { RouteContext } from "./RouteContext.ts";
import type { RenderCallback } from "./types/RenderCallback.ts";
import { useExternalState } from "./useExternalState.ts";

export function useRoute(callback?: RenderCallback<NavigationOptions>) {
  let route = useContext(RouteContext);

  useExternalState(route, (render) =>
    route.on("navigation", (payload) => {
      if (callback) callback(render, payload);
      else render();
    }),
  );

  return useMemo(
    () => ({
      route,
      at: route.at.bind(route),
    }),
    [route],
  );
}
