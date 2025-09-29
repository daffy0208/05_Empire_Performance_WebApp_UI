import React from "react";
import Routes from "./Routes";
import AppProviders from "./providers/AppProviders";

const App: React.FC = () => {
  return (
    <AppProviders>
      <Routes />
    </AppProviders>
  );
};

export default App;