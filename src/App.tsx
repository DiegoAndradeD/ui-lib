import { useState } from "react";
import {
  SingleSelectDemo,
  ButtonDemo,
  InputDemo,
  MultiSelectDemo,
} from "./components/demo";

const COMPONENTS = [
  {
    id: "single-select",
    name: "Single Select",
    component: <SingleSelectDemo />,
  },
  { id: "multi-select", name: "Multi Select", component: <MultiSelectDemo /> },
  { id: "button", name: "Button", component: <ButtonDemo /> },
  { id: "input", name: "Input", component: <InputDemo /> },
];

function App() {
  const [activeComponentId, setActiveComponentId] = useState(COMPONENTS[0].id);

  const activeComponent = COMPONENTS.find((c) => c.id === activeComponentId);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="w-64 border-r border-border bg-muted/30 p-6 hidden md:flex md:flex-col shrink-0 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-tight">ui-lib</h1>
          <p className="text-sm text-muted-foreground mt-1">Components</p>
        </div>

        <nav className="flex flex-col gap-1">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Componentes
          </h2>
          {COMPONENTS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveComponentId(item.id)}
              className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                activeComponentId === item.id
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.name}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="max-w-5xl w-full mx-auto p-6 md:p-12">
          <div className="md:hidden mb-8 border-b border-border pb-4">
            <h1 className="text-xl font-bold">ui-lib</h1>
            <select
              className="mt-4 w-full p-2 rounded-md border border-border bg-background"
              value={activeComponentId}
              onChange={(e) => setActiveComponentId(e.target.value)}
            >
              {COMPONENTS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <header className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight">
              {activeComponent?.name}
            </h1>
            <hr className="mt-6 border-border" />
          </header>

          <div className="pb-20">{activeComponent?.component}</div>
        </div>
      </main>
    </div>
  );
}

export default App;
