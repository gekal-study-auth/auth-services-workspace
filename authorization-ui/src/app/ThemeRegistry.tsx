"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import type { ReactNode } from "react";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6ee7d8", contrastText: "#04141b" },
    background: { default: "#07101d", paper: "#0b1b2d" },
    divider: "#29435d",
    text: { primary: "#e8f0ff", secondary: "#a9bdd0" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    h1: { fontSize: "clamp(1.9rem, 5vw, 3.2rem)", fontWeight: 750, lineHeight: 1.1 },
    button: { textTransform: "none", fontWeight: 800 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: "100vh",
          background:
            "radial-gradient(circle at 80% 0%, rgba(28, 94, 107, .48), transparent 38%), #07101d",
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});

export function ThemeRegistry({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
