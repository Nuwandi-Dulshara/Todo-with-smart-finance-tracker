
import React from "react";
import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import App from "./App";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import Dashboard from "./pages/Dashboard";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* EXISTING HOME PAGE */}
        <Route path="/" element={<App />} />

        {/* EXISTING AUTH PAGES */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* NEW DASHBOARD PAGE */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* UNKNOWN ROUTES */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

