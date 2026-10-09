import React from "react";
import { AppProviders } from "./providers/index.ts";
import { AppRoutes } from "./routes/index.ts";

export const App: React.FC = () => {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
};

export default App;
