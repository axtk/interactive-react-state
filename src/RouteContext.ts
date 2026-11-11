import { Route } from "stategear";
import { createContext } from "react";

export const RouteContext = createContext(
  new Route(null, { autoStart: false }),
);
