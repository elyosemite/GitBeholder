import { SessionProvider } from "./features/session";
import { AppShell } from "./layout/AppShell";
import { Toaster } from "./components/ui/sonner";
import "./App.css";

function App() {
  return (
    <SessionProvider>
      <AppShell />
      <Toaster />
    </SessionProvider>
  );
}

export default App;
