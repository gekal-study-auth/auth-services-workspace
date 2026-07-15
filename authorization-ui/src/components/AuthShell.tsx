import { Box, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Box component="main" sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Paper
        component="section"
        variant="outlined"
        sx={{
          width: "min(560px, 100%)",
          p: { xs: 3, sm: 5 },
          borderColor: "divider",
          borderRadius: 3,
          backgroundColor: "rgba(11, 27, 45, .94)",
          boxShadow: "0 28px 90px rgba(1, 7, 15, .58)",
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography
              variant="overline"
              sx={{ color: "primary.main", fontWeight: 900, letterSpacing: ".14em" }}
            >
              {eyebrow}
            </Typography>
            <Typography component="h1" variant="h1" sx={{ mt: 1 }}>
              {title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.75 }}>
              {description}
            </Typography>
          </Box>
          {children}
        </Stack>
      </Paper>
    </Box>
  );
}
