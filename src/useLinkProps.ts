import { type MouseEvent as ReactMouseEvent, useCallback } from "react";
import { getNavigationOptions, isRouteEvent } from "statepack";
import type { AProps } from "./types/AProps.ts";
import type { AreaProps } from "./types/AreaProps.ts";
import { useRoute } from "./useRoute.ts";

export function useLinkProps<T extends AProps | AreaProps>({
  href,
  target,
  onClick,
  ...props
}: T) {
  let { at, route } = useRoute();

  let handleClick = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement & HTMLAreaElement>) => {
      onClick?.(event);

      if (
        !event.defaultPrevented &&
        isRouteEvent(event) &&
        (!target || target === "_self")
      ) {
        event.preventDefault();
        route.navigate(getNavigationOptions(event.currentTarget));
      }
    },
    [route, target, onClick],
  );

  return {
    ...props,
    href: href && String(href),
    target,
    onClick: handleClick,
    "data-active": at(href, true),
  };
}
