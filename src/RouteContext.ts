import { createContext } from "react";
import { Route } from "stategear";

export const RouteContext = createContext(
  new Route(null, { autoStart: false }),
);
