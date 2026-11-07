import { flushSync } from "react-dom";
import { A, useRoute } from "../../../index.ts";
import { Intro } from "./Intro.tsx";
import { Section } from "./Section.tsx";

// This function specifies when the component is re-rendered in response to
// URL changes, when used as a `useRoute` callback
function renderViewTransition(render: () => void) {
  // Making sure the View Transition API is supported by the browser
  if (document.startViewTransition)
    // Starting a view transition with the browser's API
    document.startViewTransition(() => {
      // React's `flushSync` applies the following render synchronously
      flushSync(render);
    });
  // Resorting to ordinary rendering, if the View Transition API is unsupported
  else render();
}

export function App() {
  const { at } = useRoute(renderViewTransition);

  return (
    <>
      <nav>
        <A href="/">Intro</A>
        {" | "}
        <A href="/sections/1">Section 1</A>
        {" | "}
        <A href="/sections/2">Section 2</A>
      </nav>
      {/* at(url, x, y) acts similarly to `atURL ? x : y`. */}
      {at("/", <Intro />)}
      {at(/^\/sections\/(?<id>\d+)\/?$/, ({ params }) => (
        <Section id={params.id} />
      ))}
    </>
  );
}
