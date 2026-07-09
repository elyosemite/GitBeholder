import { SessionProvider } from "./features/session";
import { AppShell } from "./layout/AppShell";
import "./App.css";

function App() {
  return (
    <SessionProvider>
      <AppShell />
    </SessionProvider>
  );
}

export default App;
