import type { NavigationOptions } from "stategear";

export type LinkNavigationProps = {
  "data-spa"?: NavigationOptions["spa"];
  "data-history"?: NavigationOptions["history"];
  "data-scroll"?: NavigationOptions["scroll"];
  "data-id"?: NavigationOptions["id"];
};
