import { createContext } from "react";
import { Route } from "interactive-state";

export const RouteContext = createContext(
  new Route(null, { autoStart: false }),
);
