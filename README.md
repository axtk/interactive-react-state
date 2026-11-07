# compact-react-state

Core parts:
- Shared state management: [useExternalState](#useexternalstate)
- Async state management: [useTransientState](#usetransientstate)

\+ [Annotated live demos](#annotated-live-demos)

## useExternalState

This hook is focused on simplicity of both setting up shared state from scratch and migrating from local state. The equally common latter scenario is often missed out with commonly used approaches resulting in sizable code rewrites.

### Shared state

Move local state to the full-fledged shared state with minimal paradigm shift and minimal code changes:

```diff
+ import { State, useExternalState } from "compact-react-state";
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
- import { State, useExternalState } from "compact-react-state";
+ import { State, useExternalState, useInitialValue } from "compact-react-state";

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
import { State, useExternalState, useInitialValue } from "compact-react-state";

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
  // Multi-instance state
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
import { State, useExternalState, select } from "compact-react-state";

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
import { State, useExternalState, useInitialValue, select } from "compact-react-state";

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

Use the optional second parameter of `useExternalState(state, subscribe?)` for more fine-grained control over component's subscription to the `State` instance and re-renders:

```js
const itemState = new State({
  /* A map of `<id>: <item>` */
});

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

⬥ Under the hood, the `select(state, selector)` utility, discussed in the previous section, creates a custom subscription based on the selector function. This utility function also makes use of the optional third parameter of `useExternalState()`, `getShapshot()`, a function that returns a value derived from `state`.

### Integration with Immer

The same way as with `useState()`, Immer can be optionally used with state setters returned from `useExternalState()` to facilitate deeply nested data changes.

&#x2BC8; [Live demo: Shared state with Immer](https://codesandbox.io/p/sandbox/gv4rgw?file=%252Fsrc%252FApp.tsx)

### Persistence across page reloads

Replace `State` with `PersistentState` from `compact-persistent-state` as shown below to get the state data synced to the specified `key` in `localStorage` and restored on page reload. After a persistent state is created, use it with `useExternalState(state)` the same way as `State` instances.

```js
import { PersistentState } from "compact-persistent-state";

const counterState = new PersistentState(0, { key: "counter" });
```

⬥ Set `options.session` to `true` in `new PersistentState(value, options)` to use `sessionStorage`.

⬥ Set `options.serialize()` and `options.deserialize()` to override the default data transform behavior, including filtering and rearranging the data (it's `JSON.stringify()` and `JSON.parse()` by default).

⬥ Set up interaction with a custom storage by setting `{ read(), write(value)? }` as `options` in `new PersistentState(value, options)`.

⬥ `PersistentState` skips interaction with the browser storage in non-browser environments, which makes it usable with SSR. Since persistent state depends on a browser API (`localStorage` or `sessionStorage`) by default, mismatch errors while hydrating SSR content based on a persisent state should be specifically handled with React's `use(browser())` (v19.3+) or other client-side rendering detection techniques such as [`react-clientside`](https://www.npmjs.com/package/react-clientside).

## useTransientState

Use this hook to track an async action's state, whether it's pending, successfully completed, or failed, without affecting the application's data management.

In the example below, storing and rendering the essential app data (`items`) and the happy path scenario remain unaffected. The loading and error state handling works like a decoupled scaffolding to the main scenario. (`items` are stored in local state here, but any other state used by the app can be there instead.)

```diff
+ import { useTransientState } from "compact-react-state";
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
+ import { useTransientState } from "compact-react-state";

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
//     ^ `state.pending` remains `false` in the silent mode

fetchItems({ silent: true });
```

### Delayed pending state

Use case: Avoid flashing a process indicator when the action is likely to complete in a short while by delaying the pending state.

```js
const [state, fetchItems] = useTransientState(fetchItemsOriginal);
//     ^ `state.pending` remains `false` during the delay

fetchItems({ delay: 500 }); // in milliseconds
```

### Custom rejection handler

Allow the trackable action to reject explicitly with `{ throws: true }` as the last parameter, along with exposing `state.error` returned from `useTransientState` that goes by default.

```js
const [state, fetchItems] = useTransientState(fetchItemsOriginal);

fetchItems({ throws: true }).catch(handleError);
```

### Action state provider

`<TransientStateProvider>` creates an isolated instance of initial shared async action state. Its prime use cases are SSR and tests. It isn't required with client-side rendering, but it can be used to separate action states of larger self-contained portions of an app.

```jsx
import { TransientStateProvider } from "compact-react-state";

<TransientStateProvider>
  <App />
</TransientStateProvider>;
```

Use the provider to set up a specific initial async action state when required:

```jsx
const initialState = {
  "fetch-items": { initial: false, pending: true },
};

<TransientStateProvider value={initialState}>
  <App />
</TransientStateProvider>;
```

⬥ With an explicit value or without, the `<TransientStateProvider>`'s nested components will only respond to updates in the particular action state they subscribed to by means of `useTransientState`.

## Annotated live demos

Shared state

- [Shared state without Context](https://codesandbox.io/p/sandbox/gxkn85?file=%252Fsrc%252FApp.tsx)
- [Shared state with Context](https://codesandbox.io/p/sandbox/9mpfsf?file=%252Fsrc%252FApp.tsx)
- [Shared state with Immer](https://codesandbox.io/p/sandbox/gv4rgw?file=%252Fsrc%252FApp.tsx)
- [Selectors](https://codesandbox.io/p/sandbox/738w2p?file=%252Fsrc%252FApp.tsx)

Async action state

- [Shared async action state](https://codesandbox.io/p/sandbox/x9d2c9?file=%252Fsrc%252FItemList.tsx)

Find also the code of these live demos in the repo's [`tests`](https://github.com/axtk/compact-react-state/tree/main/tests) directory.
