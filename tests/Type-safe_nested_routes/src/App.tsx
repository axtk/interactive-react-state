import { createURLBuilder } from "url-shape";
import { z } from "zod";
import { A, useRoute } from "../../../index.ts";

const sectionParams = z.object({
  sectionId: z.coerce.number(),
});

// Get a type-aware URL builder `url()` based on a URL schema.
// A schema can cover the entire app or its portion, allowing for
// incremental or partial adoption of type-safe routing.
const url = createURLBuilder({
  "/": z.object({}),
  "/sections/:sectionId": z.object({
    params: sectionParams,
  }),
  // All routes are handled equally, nested routes don't inherit their parent
  // route parameters by default, since these relations can be pretty
  // straightforwardly defined on the URL schema level without imposing
  // implicit constraints, which could be hard to work around.
  "/sections/:sectionId/stories/:storyId": z.object({
    params: z.object({
      // Shared URL parameters
      ...sectionParams.shape,
      storyId: z.coerce.number(),
    }),
  }),
});

const sectionCount = 3;
const sectionStoryCount = 3;

function Nav() {
  return (
    <nav>
      <ul>
        <li>
          <A href={url("/")}>Intro</A>
        </li>
        {Array.from({ length: sectionCount }).map((_, i) => (
          <li key={i}>
            {/* With the type-aware URL builder `url()`, `params` are
              typed according to the URL schema above. */}
            <A
              href={url("/sections/:sectionId", {
                params: { sectionId: i + 1 },
              })}
            >
              Section {i + 1}
            </A>
            <ul>
              {Array.from({ length: sectionStoryCount }).map((_, k) => (
                <li key={`${i}_${k}`}>
                  <A
                    href={url("/sections/:sectionId/stories/:storyId", {
                      params: { sectionId: i + 1, storyId: k + 1 },
                    })}
                  >
                    Story {i + 1}.{k + 1}
                  </A>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function App() {
  const { at } = useRoute();

  return (
    <>
      <Nav />
      {/* at(url, x, y) acts similarly to `atURL ? x : y`.
        It works equally with components and props. */}
      {at(url("/sections/:sectionId"), ({ params }) => (
        <main>
          <h1>Section {params.sectionId}</h1>
        </main>
      ))}
      {at(url("/sections/:sectionId/stories/:storyId"), ({ params }) => (
        <main>
          <h1>
            Story {params.sectionId}.{params.storyId}
          </h1>
        </main>
      ))}
      {at(
        url("/"),
        <main>
          <h1>Intro</h1>
        </main>,
      )}
    </>
  );
}
