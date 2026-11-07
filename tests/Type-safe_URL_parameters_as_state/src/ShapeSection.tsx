import { createURLBuilder } from "url-shape";
import { z } from "zod";
import { A, useRouteState } from "../../../index.ts";
import { Shape } from "./Shape.tsx";

// Get a type-aware URL builder `url()` based on a URL schema.
// A schema can cover the entire app or its portion, allowing for
// incremental or partial adoption of type-safe routing.
const url = createURLBuilder({
  "/shapes/:id": z.object({
    // URL path placeholder parameters
    params: z.object({
      id: z.coerce.number(),
    }),
    // URL query (or search) parameters
    query: z.optional(
      z.object({
        x: z.coerce.number(),
        y: z.coerce.number(),
        r: z.coerce.number(),
      }),
    ),
  }),
});

export function ShapeSection() {
  // Use `useRouteState()` to manipulate the URL in a
  // `useState()`-like manner.
  // The typed URL builder like `url()` allows to manipulate it with more
  // type safety, so that the `params` and `query` properties are in line
  // with the URL schema defined above.
  const [{ params, query }, setState] = useRouteState(url("/shapes/:id"));

  const setPosition = () => {
    setState((state) => ({
      ...state,
      query: {
        x: Math.floor(100 * Math.random()),
        y: Math.floor(100 * Math.random()),
        r: Math.floor(10 + 30 * Math.random()),
      },
    }));
  };

  const resetPosition = () => {
    setState({ params });
  };

  return (
    <main>
      <h1>Shape {params.id}</h1>
      <Shape x={query?.x} y={query?.y} r={query?.r} n={params.id + 2} />
      <p>
        <button onClick={setPosition}>Move</button>{" "}
        <button onClick={resetPosition}>Reset</button>
      </p>
      <nav>
        <A href="/">Intro</A>
        {" | "}
        <A href={url("/shapes/:id", { params: { id: params.id + 1 } })}>
          Next shape →
        </A>
      </nav>
    </main>
  );
}
