import {
  type LocationValue,
  type NavigationOptions,
  Route,
} from "../../../index.ts";

// Defining a variety of `Route` that interacts with a text input
// rather than the browser's URL
export class InputRoute extends Route {
  inputId: string;
  constructor(inputId: string, url?: LocationValue) {
    super(url);
    this.inputId = inputId;
  }
  _init() {
    const handleInput = (event: KeyboardEvent) => {
      const element = event.target;

      if (
        element instanceof HTMLInputElement &&
        element.id === this.inputId &&
        event.key === "Enter"
      ) {
        event.preventDefault();
        this.navigate({ href: element.value });
      }
    };

    this.on("start", () => {
      window.addEventListener("keydown", handleInput);
    });

    this.on("stop", () => {
      window.removeEventListener("keydown", handleInput);
    });
  }
  _getElement() {
    return document.querySelector<HTMLInputElement>(`#${this.inputId}`);
  }
  _transition(options?: NavigationOptions) {
    const href = options?.href;

    if (typeof window === "undefined" || href === undefined) return;

    const input = this._getElement();

    if (input && input.value !== href) input.value = href;
  }
  _complete() {
    // Do nothing for now. Can be used to emulate the view container
    // scrolling to the top or to the element specified by the URL fragment
    // after the navigation is complete.
  }
  toValue(url?: LocationValue) {
    if (url === undefined)
      return typeof window === "undefined"
        ? ""
        : (this._getElement()?.value ?? "");

    return String(url);
  }
}
