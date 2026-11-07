import { type ReactNode, useEffect } from "react";
import { Route } from "statepack";
import { RouteContext } from "./RouteContext.ts";
import { useInitialValue } from "./useInitialValue.ts";

export type RouteProviderProps = {
  href?: string | Route | undefined;
  children?: ReactNode;
};

/**
 * This component provides a `Route` instance to the nested components. Its
 * `href` prop defines the initial value of the provided instance.
 */
export const RouteProvider = ({ href, children }: RouteProviderProps) => {
  let route = useInitialValue(() => {
    if (href instanceof Route) return href;
    else if (href === undefined || typeof href === "string")
      return new Route(href);
    else throw new Error("RouteProvider's 'href' of unsupported type");
  });

  useEffect(() => {
    route.start();

    return () => route.stop();
  }, [route]);

  return (
    <RouteContext.Provider value={route}>{children}</RouteContext.Provider>
  );
};
