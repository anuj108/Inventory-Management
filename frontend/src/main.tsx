import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "./ui/AppLayout";
import { InventoryPage } from "./pages/InventoryPage";
import { SalesPage } from "./pages/SalesPage";
import { SearchDashboard } from "./pages/SearchDashboard";
import { LoginPage } from "./pages/LoginPage";

function RequireAuth({ children }: { children: JSX.Element }) {
  const authed = Boolean(localStorage.getItem("auth_token"));
  return authed ? children : <Navigate to="/login" replace />;
}

const theme = createTheme({
    palette: {
        mode: "light",
        primary: { main: "#2e7d32" },
        secondary: { main: "#00796b" },
        background: { default: "#f7faf9" }
    },
    shape: { borderRadius: 10 },
    typography: {
        fontFamily: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"].join(",")
    },
    components: {
        MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 10 } } },
        MuiCard: { styleOverrides: { root: { borderRadius: 14 } } },
        MuiAppBar: { styleOverrides: { root: { background: "linear-gradient(90deg,#2e7d32,#00796b)" } } }
    }
});

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <RequireAuth><InventoryPage /></RequireAuth> },
      { path: "sales", element: <RequireAuth><SalesPage /></RequireAuth> },
      { path: "search", element: <RequireAuth><SearchDashboard /></RequireAuth> }
    ]
  }
]);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<RouterProvider router={router} />
			</ThemeProvider>
		</QueryClientProvider>
	</React.StrictMode>
);
