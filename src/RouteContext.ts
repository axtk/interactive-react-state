import { createContext } from "react";
import { Route } from "statepack";

export const RouteContext = createContext(
  new Route(null, { autoStart: false }),
);
