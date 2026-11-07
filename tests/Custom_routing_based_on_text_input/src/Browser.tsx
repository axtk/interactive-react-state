import { type ReactNode, useId } from "react";
import { RouteProvider, useInitialValue } from "../../../index.ts";
import { InputRoute } from "./InputRoute.ts";
import "./Browser.css";

export type BrowserProps = {
  children?: ReactNode;
  initialLocation?: string;
  autoFocus?: boolean;
};

export function Browser({
  children,
  initialLocation = "/",
  autoFocus,
}: BrowserProps) {
  const inputId = useId();
  const route = useInitialValue(() => new InputRoute(inputId, initialLocation));

  return (
    <div className="browser">
      <div className="navbar">
        <span>View:</span>
        <input
          id={inputId}
          defaultValue={initialLocation}
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder="Enter location"
        />
      </div>
      <div className="content">
        <RouteProvider href={route}>{children}</RouteProvider>
      </div>
    </div>
  );
}
