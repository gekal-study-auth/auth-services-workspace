"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import type { ReactNode } from "react";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6ee7d8", contrastText: "#04141b" },
    secondary: { main: "#9fb7cf" },
    background: { default: "#08111f", paper: "#0a192a" },
    divider: "#29435d",
    error: { main: "#ef7b72" },
    text: { primary: "#e8f0ff", secondary: "#aec0d2" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    h1: { fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 700, lineHeight: 1.04 },
    h2: { fontSize: "1rem", fontWeight: 700, color: "#9fb7cf" },
    button: { fontWeight: 800, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: "100vh",
          background: "radial-gradient(circle at top right, #143b55, transparent 42%), #08111f",
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
  },
});

export function AppTheme({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
