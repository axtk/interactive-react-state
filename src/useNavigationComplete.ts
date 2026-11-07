import { useContext, useEffect } from "react";
import type { EventCallback, NavigationOptions } from "statepack";
import { RouteContext } from "./RouteContext.ts";

export function useNavigationComplete(
  callback: EventCallback<NavigationOptions>,
) {
  let route = useContext(RouteContext);

  useEffect(() => route.on("navigationcomplete", callback), [route, callback]);
}
