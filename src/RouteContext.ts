import { Route } from "interactive-state";
import { createContext } from "react";

export const RouteContext = createContext(
  new Route(null, { autoStart: false }),
);
