import { A, useRoute } from "../../../index.ts";
import { Browser } from "./Browser.tsx";

function Content() {
  const { at } = useRoute();

  return (
    <>
      <nav>
        <p>
          {/* `<A>` is a link component which is like
            a plain HTML link for SPA navigation */}
          <A href="/">Intro</A>
          {" | "}
          <A href="/about">About</A>
          {" | "}
          <A href="/sections/1">Section 1</A>
          {" | "}
          <A href="/sections/2">Section 2</A>
        </p>
      </nav>
      <section>
        {/* at(url, x, y) acts similarly to `atURL ? x : y` */}
        {at("/", <h1>Intro</h1>)}
        {at("/about", <h1>About</h1>)}
        {at(/^\/sections\/(?<id>\d+)$/, ({ params }) => (
          <h1>Section {params.id}</h1>
        ))}
      </section>
    </>
  );
}

export function App() {
  // The `Browser` components below contain their own `RouteProvider`s
  // interacting with the text inputs. The identical `Content` components
  // respond accordingly to the different `RouteProvider`s closest to them.
  return (
    <>
      {/* Interacts with the browser's URL */}
      <Content />
      <hr />
      <Browser autoFocus>
        {/* Interacts with the first text input */}
        <Content />
      </Browser>
      <Browser initialLocation="/sections/1">
        {/* Interacts with the second text input */}
        <Content />
      </Browser>
    </>
  );
}
