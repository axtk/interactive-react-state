import type { LocationValue } from "statepack";

export type EnhanceHref<T extends { href?: string | undefined }> = Omit<
  T,
  "href"
> & {
  href?: LocationValue;
};
