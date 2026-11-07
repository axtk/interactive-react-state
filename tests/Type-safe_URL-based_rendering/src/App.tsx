import { createURLBuilder } from "url-shape";
import { z } from "zod";
import { A, useRoute } from "../../../index.ts";

// `<A>` is a link component which is like a plain HTML link
// for SPA navigation

// Get a typed URL builder `url()` based on a URL schema.
// A schema can cover the entire app or its portion, allowing for incremental
// or partial adoption of type-safe routing.
const url = createURLBuilder({
  "/sections/:id": z.object({
    // URL path placeholder parameters
    params: z.object({
      id: z.coerce.number(),
    }),
    // An optional URL `query` schema can be defined here, too
  }),
  "/": z.object({}), // No parameters, empty schema
});

function Intro() {
  return (
    <main>
      <h2>Intro</h2>
    </main>
  );
}

function Section({ id }: { id: number }) {
  return (
    <main>
      <h2>Section {id}</h2>
    </main>
  );
}

export function App() {
  const { at } = useRoute();

  return (
    // at(url, x, y) acts similarly to `atURL ? x : y`.
    // It works equally with components and props.
    <>
      <header className={at(url("/"), "full", "compact")}>
        <h1>App</h1>
        <nav>
          <A href={url("/")}>Intro</A>
          {" | "}
          {/* With the type-aware URL builder `url()`, `params` are
            typed according to the URL schema above. */}
          <A href={url("/sections/:id", { params: { id: 1 } })}>Section 1</A>
          {" | "}
          <A href={url("/sections/:id", { params: { id: 2 } })}>Section 2</A>
        </nav>
      </header>
      {at(url("/"), <Intro />)}
      {at(url("/sections/:id"), ({ params }) => (
        // `params` contains the capturing group values of the URL pattern.
        // Note that `params.id` is `number` as defined in the URL schema above.
        <Section id={params.id} />
      ))}
    </>
  );
}
