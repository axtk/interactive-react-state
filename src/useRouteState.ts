import { useCallback } from "react";
import {
  compileURL,
  type LocationValue,
  type MatchState,
  matchURL,
  type NavigationOptions,
  type URLData,
} from "statepack";
import { useRoute } from "./useRoute.ts";

export type SetRouteState<T extends LocationValue> = (
  update: URLData<T> | ((state: MatchState<T>) => URLData<T>),
) => void;

/**
 * Reads and sets URL parameters in a way similar to React's `useState()`.
 * This hooks returns `[state, setState]`, where `state` contains path
 * placeholder parameters and query parameters, `{ params?, query? }`.
 *
 * Note that the path placeholders, `params`, are only available if the
 * `url` parameter is an output of a typed URL builder (like the one
 * produced with *url-shape*).
 */
export function useRouteState<T extends LocationValue>(
  url?: T,
  options?: Omit<NavigationOptions, "href">,
): [MatchState<T>, SetRouteState<T>] {
  let { route } = useRoute();

  let getState = useCallback(
    (href?: T) => {
      let resolvedHref = String(href ?? route.href);

      return matchURL<T>(
        url === undefined ? (resolvedHref as T) : url,
        resolvedHref,
      );
    },
    [url, route],
  );

  let setState = useCallback<SetRouteState<T>>(
    (update) => {
      let urlData = typeof update === "function" ? update(getState()) : update;

      route.navigate({
        ...options,
        href: compileURL(url, urlData),
      });
    },
    [url, route, options, getState],
  );

  return [getState(), setState];
}
