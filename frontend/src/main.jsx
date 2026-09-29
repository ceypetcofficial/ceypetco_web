import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes.jsx";
import AppErrorBoundary from "./components/AppErrorBoundary.jsx";
import { LanguageProvider } from "./i18n/LanguageContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <AppRoutes />
          </LanguageProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "12px",
                background: "#062e3b",
                color: "#fff",
                fontSize: "14px",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>
);
