import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "../../index.css";
import { SmartSelect } from "../react/components/SmartSelect";

const mockFetchUsers = async (search: string, page: number) => {
  console.log(`Searching: "${search}", Page: ${page}`);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const totalItems = 50;
  const itemsPerPage = 10;

  const values = Array.from({ length: itemsPerPage }).map((_, i) => ({
    value: `user-${page}-${i}`,
    label: `User ${search ? search + " " : ""}(Pág ${page} - Item ${i + 1})`,
  }));

  return {
    values,
    metadata: {
      totalPages: Math.ceil(totalItems / itemsPerPage),
      currentPage: page,
    },
  };
};

const Playground = () => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="w-150">
        <div className="flex justify-between items-center pb-4">
          <h1 className="text-2xl font-bold">Lib Components</h1>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity"
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-muted-foreground">
            Smart Select of Users
          </label>

          <SmartSelect
            fetchFn={mockFetchUsers}
            onChange={(opt) => console.log("Selected Option:", opt)}
            placeholder="Search by name..."
          />
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Playground />
  </React.StrictMode>,
);
