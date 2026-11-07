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

export function App() {
  const { at } = useRoute();

  return (
    <>
      {/* at(url, x, y) acts similarly to `atURL ? x : y`.
        It works equally with components and props. */}
      <header className={at("/", "full", "compact")}>
        <h1>App</h1>
        <nav>
          <A href="/">Intro</A>
          {" | "}
          <A href="/sections/1">Section 1</A>
          {" | "}
          <A href="/sections/2">Section 2</A>
        </nav>
      </header>
      {at("/", <Intro />)}
      {at(/^\/sections\/(?<id>\d+)\/?$/, ({ params }) => (
        // `params` contains the capturing group values of the URL pattern
        <Section id={params.id} />
      ))}
    </>
  );
}
