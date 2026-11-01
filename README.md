# react-statepack

This lib explores an approach to shared state management and routing in React apps that seeks to approximate common React patterns and to be expressed with familiar and concise code.

Core parts:

- Shared state management: [useExternalState](#useexternalstate)
- Routing: [useRoute](#useroute) · [useNavigationStart / useNavigationComplete](#usenavigationstart--usenavigationcomplete) · [useRouteState](#useroutestate) · [Type-safe routes](#type-safe-routes)
- Async state management: [useTransientState](#usetransientstate)

Under the hood, routing is a special case of shared state management, too, with the shared state being the URL. So all these core parts fall under the broad category of state management, with `useExternalState()` being the general-purpose React hook for arbitrary state management (which is also the basis of the lib's other hooks).

\+ [Annotated live demos](#annotated-live-demos) · [Internals](#internals) · [Motivation and comparison](#motivation-and-comparison)

## useExternalState

This hook is focused on simplicity of both setting up shared state from scratch and migrating from local state. The equally common latter scenario is often missed out with commonly used approaches resulting in sizable code rewrites.

### Shared state

Move local state to the full-fledged shared state with minimal paradigm shift and minimal code changes:

```diff
+ import { State, useExternalState } from "react-statepack";
+
+ const counterState = new State(0);

  function Counter() {
-   const [count, setCount] = useState(0);
+   const [count, setCount] = useExternalState(counterState);

    const handleClick = () => setCount((c) => c + 1);

    return <button onClick={handleClick}>+ {count}</button>;
  }

  function ResetButton() {
-   const [, setCount] = useState(0);
+   const [, setCount] = useExternalState(counterState);

    const handleClick = () => setCount(0);

    return <button onClick={handleClick}>×</button>;
  }

  export function App() {
    return (
      <>
        <Counter/>{" "}<ResetButton/>
      </>
    );
  }
```

&#x2BC8; [Live demo: Shared state without Context](https://codesandbox.io/p/sandbox/gxkn85?file=%252Fsrc%252FApp.tsx)

The shared state instance `new State(initialValue)` can contain data of any type, primitive or nonprimitive.

With TypeScript, the value type of a `State` instance is inferred from the initial value, or it can be explicitly specified with a generic type as `new State<T>(value)`.

### Sharing state via Context

With SSR, it's common practice to put shared values into React Context rather than module-level variables to avoid cross-request data sharing. The same applies to external state. Provide external state to multiple components via React Context like any data in a React app:

```diff
+ import { createContext, useContext } from "react";
- import { State, useExternalState } from "react-statepack";
+ import { State, useExternalState, useInitialValue } from "react-statepack";

- const counterState = new State(0);
+ const AppContext = createContext(null);

  function Counter() {
-   const [count, setCount] = useExternalState(counterState);
+   const [count, setCount] = useExternalState(useContext(AppContext));

    const handleClick = () => setCount((c) => c + 1);

    return <button onClick={handleClick}>+ {count}</button>;
  }

  function ResetButton() {
-   const [, setCount] = useExternalState(counterState);
+   const [, setCount] = useExternalState(useContext(AppContext));

    const handleClick = () => setCount(0);

    return <button onClick={handleClick}>×</button>;
  }

  export function App() {
+   const appState = useInitialValue(() => new State(0));

    return (
-     <>
+     <AppContext.Provider value={appState}>
        <Counter/>{" "}<ResetButton/>
-     </>
+     </AppContext.Provider>
    );
  }
```

&#x2BC8; [Live demo: Shared state with Context](https://codesandbox.io/p/sandbox/9mpfsf?file=%252Fsrc%252FApp.tsx)

⬥ The `useInitialValue(initializer)` hook returns a value that remains unchanged across potential re-renders by calling the `initializer` function only once. Unlike `useState()` with an initializer function, `useInitialValue()` seeks to bypass extra initializer calls in development Strict Mode, too. Under the hood, this hook wraps up the common pattern of [stabilizing values with React's `useRef()`](https://react.dev/reference/react/useRef#avoiding-recreating-the-ref-contents).

⬥ The application state can also be split across multiple instances of `State` and multiple Contexts to maintain clearer semantic boundaries and more targeted data update subscriptions.

```js
import { createContext, useContext } from "react";
import { State, useExternalState, useInitialValue } from "react-statepack";

const AppContext = createContext(null);

function ItemList() {
  const [items] = useExternalState(useContext(AppContext).items);

  return (
    <ul>
      {items.map((item) => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
}

export function App() {
  const appState = useInitialValue(() => ({
    users: new State(/* User data, e.g. a map of <id>: <user info> */),
    items: new State(/* Items, e.g. a map of <id>: <item info> */),
  }));

  return (
    <AppContext.Provider value={appState}>
      <ItemList/>
      {/* ... */}
    </AppContext.Provide>
  );
}
```

⬥ Note that updating the `State` value doesn't change the instance's reference sitting in the React Context and therefore doesn't cause updates of the entire Context. Only the components subscribed to updates of the particular `State` instance by means of `useExternalState(state)` will be notified to re-render.

⬥ `useExternalState(state)` accepts `null` and `undefined` values as `state`, but throws an error if such a `state` value is encountered. This helps handle empty (typically `null`) default Context values without repetitive checks and follows a [common pattern](https://react.dev/learn/typescript#typing-usecontext).

### Selectors

Use the `select(state, selector)` utility with `useExternalState()` to pick a state value derived from `state` as defined by the `selector()` function:

```jsx
import { State, useExternalState, select } from "react-statepack";

const appState = {
  items: new State({/* ... id: { name: string } */}),
  // ... Rest of the shared application data
};

function ItemCard({ id }: { id: string }) {
  const [name] = useExternalState(...select(
    appState.items,             // State instance
    (items) => items[id]?.name, // Selector
  ));

  return <div className="item">Name: {name}</div>;
}

export function App() {
  return (
    <>
      <ItemCard/>
      {/* ... */}
    </>
  );
}
```

&#x2BC8; [Live demo: Selectors](https://codesandbox.io/p/sandbox/738w2p?file=%252Fsrc%252FApp.tsx)

Or, alternatively, with a React Context:

```jsx
import { createContext, useContext } from "react";
import { State, useExternalState, useInitialValue, select } from "react-statepack";

const AppContext = createContext(null);

function ItemCard({ id }: { id: string }) {
  const [name] = useExternalState(...select(
    useContext(AppContext)?.items, // State instance
    (items) => items[id]?.name,    // Selector
  ));

  return <div className="item">Name: {name}</div>;
}

export function App() {
  const appState = useInitialValue(() => ({
    items: new State({/* ... id: { name: string } */}),
    // ... Rest of the shared application data
  }));

  return (
    <AppContext.Provider value={appState}>
      <ItemCard/>
      {/* ... */}
    </AppContext.Provider>
  );
}
```

⬥ With a selector subscription to a `State` instance, the component will only be notified to re-render when the state snapshot returned from the selector changes. By default, whether there's no value change is determined as shallow equality of the previous and current snapshots. Optionally, another equality function can be set as the third parameter of `select()`.

⬥ The state setter returned from `useExternalState(...select(state, selector))` alongside the selector snapshot updates the entire state regardless of the selector.

### Custom subscription

Use the second parameter of `useExternalState(state, subscribe?)` for more fine-grained control over component's subscription to the `State` instance and re-renders:

```js
const itemState = new State({/* A map of `<id>: <item>` */});

// Renders a specific item from `itemState`
function ItemCard({ id }) {
  const [items, setItems] = useExternalState(itemState, (render) => {
    // The subscription to the state events returns a cleanup function.
    return itemState.on("update", ({ current, previous }) => {
      // Assuming that the items have a `timestamp` property, re-render
      // `ItemCard` only if the relevant item's `timestamp` has increased
      if (current[id].timestamp > previous[id].timestamp) render();
    });
  });

  // ...
}
```

⬥ Set the `subscribe` parameter to `false`, as in `useExternalState(state, false)`, to tell the hook not to subscribe the component to tracking the external state updates altogether. A use case for it is when a component makes use of the external state value setter without using the state value itself. The `false` parameter could have been used in the `ResetButton` in the first example above, but in many cases of infrequent updates with lightweight component renders it might be unnecessary, since React automatically skips updating the DOM when there are no changes.

⬥ Under the hood, the `select(state, selector)` utility, discussed in the previous section, creates a custom subscription based on the selector function which is then passed to `useExternalState()`.

### Integration with Immer

The same way as with `useState()`, Immer can be optionally used with state setters returned from `useExternalState()` to facilitate deeply nested data changes.

&#x2BC8; [Live demo: Shared state with Immer](https://codesandbox.io/p/sandbox/gv4rgw?file=%252Fsrc%252FApp.tsx)

### Persistence across page reloads

Replace `State` with `PersistentState` as shown below to get the state data synced to the specified `key` in `localStorage` and restored on page reload. After a persistent state is created, use it with `useExternalState(state)` the same way as `State` instances.

```js
import { PersistentState } from "react-statepack";

const counterState = new PersistentState(0, { key: "counter" });
```

⬥ Set `options.session` to `true` in `new PersistentState(value, options)` to use `sessionStorage`.

⬥ Set `options.serialize()` and `options.deserialize()` to override the default data transform behavior, including filtering and rearranging the data (it's `JSON.stringify()` and `JSON.parse()` by default).

⬥ Set up interaction with a custom storage by setting `{ read(), write(value)? }` as `options` in `new PersistentState(value, options)`.

⬥ `PersistentState` skips interaction with the browser storage in non-browser environments, which makes it usable with SSR. Since persistent state depends on a browser storage, mismatch errors while hydrating SSR content based on a persisent state should be specifically handled with React's `use(browser())` (v19.3+) or other client-side rendering detection techniques such as [`react-clientside`](https://www.npmjs.com/package/react-clientside).

## useRoute

Use this hook for URL-based rendering and SPA navigation, which boil down to accessing and changing the current URL treated as shared state under the hood.

### URL-based rendering

URL-based rendering with `at(url, x, y?)` shown below works similarly to conditional rendering with the ternary operator `atURL ? x : y`. It's equally applicable to props and components:

```jsx
import { useRoute } from "react-statepack";

function App() {
  const { at } = useRoute();

  return (
    <header className={at("/", "full", "compact")}>
      <h1>App</h1>
    </header>
    {at("/", <Intro/>)}
    {at(/^\/sections\/(?<id>\d+)\/?$/, ({ params }) => <Section id={params.id}/>)}
  );
}
```

&#x2BC8; [Live demo: URL-based rendering](https://codesandbox.io/p/sandbox/2nv8ck?file=%252Fsrc%252FApp.tsx)

⬥ `params` in dynamic values (as in `({ params }) => <Section id={params.id}/>` above) contains the URL pattern's capturing groups.

⬥ Use `at(url)` as a shorthand for `at(url, true, false)`. Example: `<Component isOpen={at("/")}/>`.

⬥ By default, `useRoute` makes use of the browser's URL, if it's available. Otherwise, use `<RouteProvider href={url}>` to set a specific URL value. Common use cases: SSR and tests. A less common use case: custom routing behavior, including custom non-URL-based routing. &#x2BC8; [Live demo: Custom routing based on text input](https://codesandbox.io/p/sandbox/tykt44?file=%252Fsrc%252FApp.tsx)

⬥ See also the [Type-safe routes](#type-safe-routes) section. &#x2BC8; [Live demo: Type-safe URL-based rendering](https://codesandbox.io/p/sandbox/tltq5r?file=%252Fsrc%252FApp.tsx)

⬥ Routing with `react-statepack` is based on the core idea behind all approaches to route-based rendering: conditional rendering based on the URL. Unlike component-, config-, or file-based approaches, the `react-statepack`'s imperative approach sticks to this core idea without additional abstraction layers and specific relations between routes (like layout nesting or parameter inheritance) offering full explicit control over route-based rendering.

### SPA navigation

The shape of the SPA navigation API is largely aligned with the similar built-in browser APIs (but still compatible with SSR):

```diff
+ import { A, useRoute } from "react-statepack";

  function UserNav({ signedIn }) {
+   const { route } = useRoute();

    const handleClick = () => {
-     window.location.href = signedIn ? "/profile" : "/login";
+     route.href = signedIn ? "/profile" : "/login";
    };

    return (
      <nav>
-       <a href="/">Home</a>
+       <A href="/">Home</A>
        <button onClick={handleClick}>Profile</button>
      </nav>
    );
  }
```

&#x2BC8; [Live demo: Link components](https://codesandbox.io/p/sandbox/2nv8ck?file=%252Fsrc%252FApp.tsx)

⬥ `<A>` and `<Area>` are the two kinds of SPA route link components available out of the box. They have the same props and semantics as the corresponding HTML link elements `<a>` and `<area>`.

⬥ The `route` object returned from `useRoute()` exposes an API resembling the built-in APIs of `window.location` and `history` carried over to SPA navigation: `.assign(url)`, `.replace(url)`, `.reload()`, `.href`, `.pathname`, `.search`, `.hash`, `.back()`, `.forward()`, `.go(delta)`.

⬥ `route.navigate(options)` combines and extends `route.assign(url)` and `route.replace(url)` serving as a handy drop-in replacement for the similar `window.location` methods:

```js
route.navigate({ href: "/intro", history: "replace", scroll: "off" });
```

⬥ Tweak link components by adding a relevant combination of the optional `data-` props corresponding to the `options` of `route.navigate(options)`:

```jsx
<A href="/intro">Intro</A>
<A href="/intro" data-history="replace">Intro</A>
<A href="/intro" data-scroll="off">Intro</A>
<A href="/intro" data-spa="off">Intro</A>
```

Using HTML link attributes as SPA link component props makes link components easily interchangeable with HTML links and more familiar without prior knowledge.

⬥ Link components also automatically receive the `data-active="true"` prop whenever their `href` prop matches the current URL, which can be used for additional styling.

⬥ Use the optional `callback` parameter of `useRoute(callback?)` for more fine-grained control over the component rendering in response to URL changes. This callback receives the `render` function as a parameter that should be called at some point. Use cases for this render callback include, for example, activating animated view transitions (&#x2BC8; [Live demo: View transitions](https://codesandbox.io/p/sandbox/w4q95n?file=%252Fsrc%252FApp.tsx)) or (less likely in regular circumstances) skipping re-renders for certain URL changes.

## useNavigationStart / useNavigationComplete

These hooks set up optional actions to be done before and after a SPA navigation occurs respectively. Such intermediate actions are also known as routing middleware.

Some common examples of what can be handled with the routing middleware include redirecting to another URL, preventing navigation with unsaved user input, setting the page title based on the current URL:

```jsx
import { useNavigationComplete, useNavigationStart } from "react-statepack";

function setTitle({ href }) {
  document.title = href === "/intro" ? "Intro" : "App";
}

function App() {
  const { route } = useRoute();
  const [hasUnsavedChanges, setUnsavedChanges] = useState(false);

  const handleNavigationStart = useCallback(({ href }) => {
    if (hasUnsavedChanges)
      return false; // Preventing navigation

    if (href === "/") {
      route.href = "/intro"; // SPA redirection
      return false;
    }
  }, [hasUnsavedChanges, route]);

  useNavigationStart(handleNavigationStart);
  useNavigationComplete(setTitle);

  // ...
}
```

&#x2BC8; [Live demo: Routing middleware](https://codesandbox.io/p/sandbox/9ks34r?file=%2Fsrc%2FApp.tsx)

⬥ The object parameter of the hooks' callbacks has the shape of the `route.navigate()`'s options, including `href` and `referrer`, the navigation destination and initial URLs.

⬥ The callback of both hooks is first called when the component gets mounted if the route is already in the navigation-complete state.

## useRouteState

When it's necessary to put a portion of the app's state to the URL, use this hook to manage URL parameters as state in a `useState`-like manner. Use the React's state mental model and migrate from local state without major code rewrites:

```diff
+ import { useRouteState } from "react-statepack";

  function App() {
-   const [{ coords }, setState] = useState({ coords: { x: 0, y: 0 } });
+   const [{ query }, setState] = useRouteState("/");

    const setPosition = () => {
      setState(state => ({
        ...state,
-       coords: {
+       query: {
          x: Math.random(),
          y: Math.random(),
        },
      });
    };

    return (
      <>
        <h1>Shape</h1>
-       <Shape x={coords.x} y={coords.y}/>
+       <Shape x={query.x} y={query.y}/>
        <p><button onClick={setPosition}>Move</button></p>
      </>
    );
  }
```

&#x2BC8; [Live demo: URL parameters as state](https://codesandbox.io/p/sandbox/6rp4sy?file=%252Fsrc%252FApp.tsx)

⬥ `useRouteState(url, options?)` has an optional second parameter in the shape of the `route.navigate()`'s options. Pass `{ scroll: "off" }` as `options` to opt out from the default scroll-to-the-top behavior when the URL changes.

⬥ See also the [Type-safe routes](#type-safe-routes) section. &#x2BC8; [Live demo: Type-safe URL parameters as state](https://codesandbox.io/p/sandbox/6ck4qz?file=%252Fsrc%252FShapeSection.tsx)

## Type-safe routes

When it comes to accessing parameters extracted from a URL pattern, by default the parameters are typed as `Record<string, string | undefined>`, which quite literally represents a map containing portions of a string URL.

```tsx
const { at } = useRoute();

at(/^\/sections\/(?<id>\d+)\/?$/, ({ params }) => <Section id={params.id}/>)
                                  // ^ Record<string, string | undefined>

const [state, setState] = useRouteState("/");
    // ^ { query: Record<string, string | undefined> }
```

&#x2BC8; Loosely typed routing demos: [URL-based rendering](https://codesandbox.io/p/sandbox/2nv8ck?file=%252Fsrc%252FApp.tsx) &middot; [URL parameters as state](https://codesandbox.io/p/sandbox/6rp4sy?file=%252Fsrc%252FApp.tsx)

While the loosely typed routing as shown above works just fine, optionally, more specific type-aware parsing of URL parameters can be achieved by replacing string and RegExp URL patterns with URL patterns produced by a schema-based URL builder, like with `url-shape` and `zod` or a [similar tool](https://standardschema.dev/schema#what-schema-libraries-implement-the-spec):

```ts
import { createURLBuilder } from "url-shape";
import { z } from "zod"; // Or another Standard Schema-compliant lib

// Get a type-aware URL builder `url()` based on a URL schema
export const url = createURLBuilder({
  "/sections/:id": z.object({
    // URL path placeholder parameters
    params: z.object({ id: z.coerce.number() }),
  }),
  "/": z.object({
    // URL query (or search) parameters
    query: z.optional(z.object({ x: z.coerce.number(), y: z.coerce.number() })),
  }),
});
```

The type-aware URL builder `url(pattern, options?)` provides hints about the types of the parsed URL parameters and helps avoid typos and type mismatches:

```tsx
const { at } = useRoute();

at(url("/sections/:id"), ({ params }) => <Section id={params.id}/>)
                         // ^ { id: number }

const [state, setState] = useRouteState(url("/"));
    // ^ { query?: { x: number, y: number } }

<A href={url("/sections/:id", { id: 1 })}>Section 1</A>
                           // ^ { id: number }
```

&#x2BC8; Live demos: [Type-safe URL-based rendering](https://codesandbox.io/p/sandbox/tltq5r?file=%252Fsrc%252FApp.tsx) &middot; [Type-safe URL parameters as state](https://codesandbox.io/p/sandbox/6ck4qz?file=%252Fsrc%252FShapeSection.tsx)

The URL schema as shown above doesn't have to cover the entire app. This approach allows for incremental or partial adoption of type-safe routing, where needed.

On the other hand, once the entire app is covered with type-safe routes, it might be reasonable to prevent future use of relaxed typing with string and RegExp URL patterns. This can be achieved by adding the following type declaration that effectively disallows string and RegExp URL patterns:

```ts
declare module "react-statepack" {
  interface URLConfig {
    strict: true;
  }
}
```

### Nested routes

All routes are handled independently, so nested routes don't require special handling and don't maintain implicit relations with other routes. This also means that nested routes don't inherit their parent route parameters by default.

With type-safe routes, any practical relations between them can be transparently defined at the URL schema level, without default implicit constraints, too. Here's an example:

```ts
import { createURLBuilder } from "url-shape";
import { z } from "zod";

const sectionParams = z.object({
  sectionId: z.coerce.number(),
});

export const url = createURLBuilder({
  "/sections/:sectionId": z.object({
    params: sectionParams,
  }),
  "/sections/:sectionId/stories/:storyId": z.object({
    params: z.object({
      ...sectionParams.shape, // Shared URL parameters
      storyId: z.coerce.number(),
    }),
  }),
});
```

&#x2BC8; [Live demo: Type-safe nested routes](https://codesandbox.io/p/sandbox/pv9rgh?file=%252Fsrc%252FApp.tsx)

## useTransientState

Use this hook to track an async action's state, whether it's pending, successfully completed, or failed, without affecting the application's data management.

In the example below, storing and rendering the essential app data (`items`) and the happy path scenario remain unaffected. The loading and error state handling works like a decoupled scaffolding to the main scenario. (`items` are stored in local state here, but any other state used by the app can be there instead.)

```diff
+ import { useTransientState } from "react-statepack";
- import { fetchItems } from "./fetchItems.js";
+ import { fetchItems as fetchItemsOriginal } from "./fetchItems.js";

  export function ItemList() {
    const [items, setItems] = useState([]);
+   const [state, fetchItems] = useTransientState("items", fetchItemsOriginal);

    useEffect(() => {
      // The fetched items can be stored with any approach to app state
      fetchItems().then(setItems);
    }, [fetchItems]);

+   if (state.initial || state.pending) return <p>Loading...</p>;
+   if (state.error) return <p>An error occurred</p>;

    return <ul>{items.map(/* ... */)}</ul>;
  }
```

```diff
+ import { useTransientState } from "react-statepack";

- export function Status({ state }) {
+ export function Status() {
+   const [state] = useTransientState("items");

    if (state.initial) return null;
    if (state.pending) return <>Busy</>;
    if (state.error) return <>Error</>;

    return <>OK</>;
  }
```

&#x2BC8; [Live demo: Shared async action state](https://codesandbox.io/p/sandbox/x9d2c9?file=%252Fsrc%252FItemList.tsx)

### Shared and local async action state

Use a string key with `useTransientState(key, action?)` to access the same action state from multiple components (as in `ItemList` and `Status` above). Pass `null` as the key to have the action state scoped locally to the component where the hook is used.

### Silent pending state

Use case: background actions or optimistic updates.

Set `{ silent: true }` as the last parameter of the trackable action returned from the `useTransientState` hook to prevent the `pending` property from switching to `true` in the pending state.

```js
const [state, fetchItems] = useTransientState(fetchItemsOriginal);
    // ^ `state.pending` remains `false` in the silent mode

fetchItems({ silent: true })
```

### Delayed pending state

Use case: Avoid flashing a process indicator when the action is likely to complete in a short while by delaying the pending state.

```js
const [state, fetchItems] = useTransientState(fetchItemsOriginal);
    // ^ `state.pending` remains `false` during the delay

fetchItems({ delay: 500 }) // in milliseconds
```

### Custom rejection handler

Allow the trackable action to reject explicitly with `{ throws: true }` as the last parameter, along with exposing `state.error` returned from `useTransientState` that goes by default.

```js
const [state, fetchItems] = useTransientState(fetchItemsOriginal);

fetchItems({ throws: true }).catch(handleError)
```

### Action state provider

`<TransientStateProvider>` creates an isolated instance of initial shared async action state. Its prime use cases are SSR and tests. It isn't required with client-side rendering, but it can be used to separate action states of larger self-contained portions of an app.

```jsx
import { TransientStateProvider } from "react-statepack";

<TransientStateProvider>
  <App/>
</TransientStateProvider>
```

Use the provider to set up a specific initial async action state when required:

```jsx
const initialState = {
  "fetch-items": { initial: false, pending: true },
};

<TransientStateProvider value={initialState}>
  <App/>
</TransientStateProvider>
```

⬥ With an explicit value or without, the `<TransientStateProvider>`'s nested components will only respond to updates in the particular action state they subscribed to by means of `useTransientState`.

## Annotated live demos

Shared state

- [Shared state without Context](https://codesandbox.io/p/sandbox/gxkn85?file=%252Fsrc%252FApp.tsx)
- [Shared state with Context](https://codesandbox.io/p/sandbox/9mpfsf?file=%252Fsrc%252FApp.tsx)
- [Shared state with Immer](https://codesandbox.io/p/sandbox/gv4rgw?file=%252Fsrc%252FApp.tsx)
- [Selectors](https://codesandbox.io/p/sandbox/738w2p?file=%252Fsrc%252FApp.tsx)

Routing

- [URL-based rendering](https://codesandbox.io/p/sandbox/2nv8ck?file=%252Fsrc%252FApp.tsx)
- [Type-safe URL-based rendering](https://codesandbox.io/p/sandbox/tltq5r?file=%252Fsrc%252FApp.tsx)
- [Routing middleware](https://codesandbox.io/p/sandbox/9ks34r?file=%2Fsrc%2FApp.tsx)
- [URL parameters as state](https://codesandbox.io/p/sandbox/6rp4sy?file=%252Fsrc%252FApp.tsx)
- [Type-safe URL parameters as state](https://codesandbox.io/p/sandbox/6ck4qz?file=%252Fsrc%252FShapeSection.tsx)
- [Type-safe nested routes](https://codesandbox.io/p/sandbox/pv9rgh?file=%252Fsrc%252FApp.tsx)
- [Unknown routes](https://codesandbox.io/p/sandbox/jnngqt?file=%252Fsrc%252FApp.tsx)
- [Lazy routes](https://codesandbox.io/p/sandbox/qw5r6g?file=%252Fsrc%252FApp.tsx)
- [View transitions](https://codesandbox.io/p/sandbox/w4q95n?file=%252Fsrc%252FApp.tsx)
- [Custom routing based on text input](https://codesandbox.io/p/sandbox/tykt44?file=%252Fsrc%252FApp.tsx)
- [Converting links in HTML content to SPA links](https://codesandbox.io/p/sandbox/7pfjc7?file=%252Fsrc%252FApp.tsx)

Async action state

- [Shared async action state](https://codesandbox.io/p/sandbox/x9d2c9?file=%252Fsrc%252FItemList.tsx)

Find also the code of these live demos in the repo's [`tests`](https://github.com/axtk/react-statepack/tree/main/tests) directory.

## Internals

[`statepack`](https://www.npmjs.com/package/statepack)

---

## Motivation and comparison

With several options available, state management in React apps still feels more cumbersome than it could be. With the React's local state mental model in mind, we might expect that a shared state management lib

(1) has a simple API introducing a minimal set of entities,<br>
(2) requires minimal changes to move local state to shared state,<br>
(3) straightforwardly supports SSR without workaround APIs.

The popular approaches to state management seem to depart from at least one of these points:

Apparently focusing on other aspects, **Redux Toolkit** and **MobX** don't fulfill any of the points listed above by bringing in their own mental models of shared state management with an inventory of new concepts and approaches.

**Zustand** does have a simple and minimalist API (point (1) fulfilled), but it's not quite similar to the React's state API, which leads to significant code rewrites while migrating from local state to shared state (so simplicity alone is not sufficient, point (2) unfulfilled). The Zustand's SSR setup requires that the default React store setup be transitioned to vanilla stores<sup>[[1](https://github.com/pmndrs/zustand/tree/main#react-context)]</sup>, which adds another state management pattern to the code and yet another sizable migration rewrite (point (3) unmet). Also, subjectively, Zustand introduces patterns that look unidiomatic in React, like calling methods on Zustand's store hooks (`useXStore.subscribe()`)<sup>[[2](https://github.com/pmndrs/zustand/tree/main#transient-updates-for-often-occurring-state-changes)]</sup>.

With a useState-like API, **Jotai** is the closest match (points (1) and (2) fulfilled). Still, Jotai requires a workaround API, a special hook, to set up SSR<sup>[[3](https://jotai.org/docs/utilities/ssr)]</sup> (point (3) unmet). Also, subjectively, the Jotai's core `atom()` function with its elaborate capabilities is an overkill for state management that looks hard to tree-shake.

The `useExternalState()` hook of `react-statepack` is an attempt to come up with a mostly self-explanatory lightweight useState-like approach to shared state management by focusing on the three points listed above. The lib's other hooks are built around the common practical use cases for `useExternalState()`. Whatever unused is tree-shakable.
