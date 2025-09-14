import React from "react";
import Routes from "./Routes";
import AppProviders from "./providers/AppProviders";

function App() {
  return (
    <AppProviders>
      <Routes />
    </AppProviders>
  );
}

export default App;