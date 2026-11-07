import {
  type InputEvent,
  type SubmitEvent,
  useCallback,
  useState,
} from "react";
import {
  A,
  useNavigationComplete,
  useNavigationStart,
  useRoute,
} from "../../../index.ts";

function setTitle({ href }: { href?: string }) {
  document.title = href === "/intro" ? "Intro" : "App";
}

export function App() {
  const { at, route } = useRoute();
  const [hasUnsavedChanges, setUnsavedChanges] = useState(false);

  const handleNavigationStart = useCallback(
    ({ href }: { href?: string }) => {
      if (hasUnsavedChanges) return false; // Preventing navigation

      if (href === "/start") {
        route.href = "/"; // SPA redirection
        return false;
      }
    },
    [hasUnsavedChanges, route],
  );

  useNavigationStart(handleNavigationStart);
  useNavigationComplete(setTitle);

  const handleInput = useCallback((event: InputEvent) => {
    if (event.target instanceof HTMLInputElement)
      setUnsavedChanges(event.target.value !== "");
  }, []);

  const handleSubmit = useCallback((event: SubmitEvent) => {
    event.preventDefault();
    setUnsavedChanges(false);
  }, []);

  return (
    <>
      {/* at(url, x, y) acts similarly to `atURL ? x : y`.
        It works equally with components and props. */}
      <header className={at("/", "full", "compact")}>
        <h1>App</h1>
        <nav>
          <A href="/">Intro</A>
          {" | "}
          <A href="/start">Start</A>
          {" → Intro"}
          {" | "}
          <A href="/sections/1">Section 1</A>
          {" | "}
          <A href="/sections/2">Section 2</A>
        </nav>
      </header>
      <main>
        {at(
          "/",
          <>
            <h2>Intro</h2>
            <p>Lorem ipsum</p>
          </>,
        )}
        {at(/^\/sections\/(?<id>\d+)\/?$/, ({ params }) => (
          <>
            <h2>Section {params.id}</h2>
            <p>Ipsum lorem [{params.id}]</p>
          </>
        ))}
        <p>
          Due to the condition in the <code>handleNavigationStart()</code>{" "}
          callback, when the text input below is not empty, the links in the
          header won't be allowed to leave the current page until the input is
          saved or cleared.
        </p>
        <form onSubmit={handleSubmit}>
          <input onInput={handleInput} /> <button type="submit">Save</button>
        </form>
      </main>
    </>
  );
}
