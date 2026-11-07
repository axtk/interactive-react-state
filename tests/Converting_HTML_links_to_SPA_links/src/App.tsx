import { useRef } from "react";
import { A, useRoute, useRouteLinks } from "../../../index.ts";

// Some safe HTML content that could have been fetched from the server.
const htmlContent =
  '<p>Lorem ipsum. See the <a href="/story">full story</a>.</p>';
// This HTML content contains a baked-in HTML link which can't be easily
// replaced with a SPA link component. That's where the `useRouteLinks` hook
// can help: it makes plain HTML links act like SPA links.

function Intro() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert HTML links inside the specified container to SPA links.
  // To further narrow down the relevant links, a selector can be passed as
  // the second parameter.
  useRouteLinks(containerRef);

  return (
    <main>
      <h2>Intro</h2>
      <div
        ref={containerRef}
        className="content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </main>
  );
}

function Story() {
  return (
    <main>
      <h2>Story</h2>
    </main>
  );
}

export function App() {
  const { at } = useRoute();

  return (
    <>
      <header className={at("/", "full", "compact")}>
        <h1>App</h1>
        <nav>
          <A href="/">Intro</A>
        </nav>
      </header>
      {at("/", <Intro />)}
      {at("/story", <Story />)}
    </>
  );
}
