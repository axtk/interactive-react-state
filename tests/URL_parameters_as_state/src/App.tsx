import { useRouteState } from "../../../index.ts";
import { Shape } from "./Shape.tsx";

export function App() {
  // Use `useRouteState()` to manipulate the URL in a
  // `useState()`-like manner.
  const [{ query }, setState] = useRouteState("/");

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
    setState({});
  };

  return (
    <main>
      <Shape x={query.x} y={query.y} r={query.r} />
      <p>
        <button onClick={setPosition}>Move</button>{" "}
        <button onClick={resetPosition}>Reset</button>
      </p>
    </main>
  );
}
