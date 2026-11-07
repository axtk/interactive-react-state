import { Suspense } from "react";
import { A, useRoute } from "../../../index.ts";
import { Intro } from "./Intro.tsx";
import { ItemList } from "./ItemList.lazy.ts";

export function App() {
  const { at } = useRoute();

  return (
    <>
      <nav>
        {/* `<A>` is a SPA link component */}
        <A href="/">Intro</A>
        {" | "}
        <A href="/items">Items</A>
      </nav>

      {/* at(url, x, y) acts similarly to `atURL ? x : y`. */}
      {at("/", <Intro />)}

      {/* `/items` is a lazy route loaded on demand, which
       is achieved with route matching and React Suspense */}
      {at(
        "/items",
        <Suspense fallback={<p>⌛ Loading...</p>}>
          <ItemList />
        </Suspense>,
      )}
    </>
  );
}
