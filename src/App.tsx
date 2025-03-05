import React from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { Layout } from "@app/Layout";
import { HomePage, SettingsPage } from "@app/pages";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
