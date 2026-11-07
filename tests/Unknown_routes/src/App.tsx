import { A, useRoute } from "../../../index.ts";

// `<A>` is a link component which is like a plain HTML link
// for SPA navigation

function Intro() {
  return (
    <main>
      <h2>Intro</h2>
    </main>
  );
}

function Section({ id }: { id: string | undefined }) {
  return (
    <main>
      <h2>Section {id}</h2>
    </main>
  );
}

function ErrorSection() {
  return (
    <main>
      <h2>Error 404</h2>
    </main>
  );
}

const routes = {
  intro: "/",
  sections: /^\/sections\/(?<id>\d+)\/?$/,
};

const knownRoutes = Object.values(routes);

export function App() {
  const { at } = useRoute();

  return (
    <>
      {/* at(url, x, y) acts similarly to `atURL ? x : y`.
        It works equally with components and props. */}
      <header className={at(routes.intro, "full", "compact")}>
        <h1>App</h1>
        <nav>
          <A href={routes.intro}>Intro</A>
          {" | "}
          <A href="/sections/1">Section 1</A>
          {" | "}
          <A href="/sections/2">Section 2</A>
          {" | "}
          <A href="/test">Broken link</A>
        </nav>
      </header>
      {at(routes.intro, <Intro />)}
      {at(routes.sections, ({ params }) => (
        // `params` contains the capturing group values of the URL pattern
        <Section id={params.id} />
      ))}
      {/* Rendering `null`, that is no content, for all known routes
        and the `ErrorSection` component for the rest unknown ones. */}
      {at(knownRoutes, null, <ErrorSection />)}
      {/* All `at()` calls are independent from each other, so they
        don't maintain any specific order, and an error handling one
        doesn't have to be the last one. */}
    </>
  );
}
