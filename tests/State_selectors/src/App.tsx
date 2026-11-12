import { State, select, useExternalState } from "../../../index.ts";
import { fetchPoints } from "./fetchPoints.ts";
import { fetchUsers, type User } from "./fetchUsers.ts";

// The app state can consist of as many State instances as needed.
// Splitting the app state into multiple State instances allows for more
// targeted state update subscriptions in components.
const users = new State<Record<string, User>>({});
const points = new State<Record<string, number>>({});

function UserName({ id }: { id: string }) {
  const [name] = useExternalState(users, select((u) => u[id]?.name));
  return <>{name}</>;
}

function UserPoints({ id }: { id: string }) {
  const [value] = useExternalState(points, select((p) => p[id]));
  return <strong>{value ?? 0}</strong>;
}

function TableRow({ id }: { id: string }) {
  return (
    <tr>
      <td>
        <UserName id={id} />
      </td>
      <td>
        <UserPoints id={id} />
      </td>
    </tr>
  );
}

fetchUsers().then((value) => {
  // State instances don't depend on React, so they can be used both inside and
  // outside of React components. With SSR though, state manipulation outside
  // of a React Context should be avoided in order to avoid cross-request data
  // sharing.
  users.setValue(value);
});

function updatePoints() {
  fetchPoints().then((value) => {
    points.setValue(value);
    setTimeout(updatePoints, 2000);
  });
}

updatePoints();

export function App() {
  return (
    <table>
      <thead>
        <tr>
          <td>User</td>
          <td>Points</td>
        </tr>
      </thead>
      <tbody>
        <TableRow id="jane" />
        <TableRow id="jack" />
      </tbody>
    </table>
  );
}
