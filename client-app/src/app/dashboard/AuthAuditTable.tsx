"use client";

import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import type { AuthEventType } from "../../lib/auth-audit";

type AuditEventRow = {
  id: string;
  eventType: AuthEventType;
  subject: string | null;
  detail: Record<string, unknown>;
  occurredAt: string;
};

type AuthAuditTableProps = {
  events: AuditEventRow[];
  page: number;
  pageSize: number;
  totalItems: number;
};

const cellStyle = {
  borderColor: "#20374d",
  color: "#d6e5f4",
  fontSize: "0.82rem",
  verticalAlign: "top",
};

export function AuthAuditTable({
  events: initialEvents,
  page: initialPage,
  pageSize,
  totalItems: initialTotalItems,
}: AuthAuditTableProps) {
  const [events, setEvents] = useState(initialEvents);
  const [page, setPage] = useState(initialPage);
  const [totalItems, setTotalItems] = useState(initialTotalItems);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const requestSequence = useRef(0);

  async function changePage(_: unknown, zeroBasedPage: number) {
    const nextPage = zeroBasedPage + 1;
    const sequence = ++requestSequence.current;
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetch(`/api/auth/audit?page=${nextPage}&pageSize=${pageSize}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Audit API returned ${response.status}`);
      const result = (await response.json()) as {
        events: AuditEventRow[];
        page: number;
        totalItems: number;
      };
      if (sequence !== requestSequence.current) return;
      setEvents(result.events);
      setPage(result.page);
      setTotalItems(result.totalItems);
    } catch {
      if (sequence === requestSequence.current) setLoadError(true);
    } finally {
      if (sequence === requestSequence.current) setLoading(false);
    }
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        overflow: "hidden",
        borderColor: "#29435d",
        borderRadius: 3,
        backgroundColor: "#081421",
        color: "#e8f0ff",
      }}
    >
      <TableContainer sx={{ height: 560 }}>
        <Table stickyHeader sx={{ minWidth: 760 }} aria-label="Client Appの認証監査ログ">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#0d1d2e" }}>
              {[
                ["日時", "190px"],
                ["イベント", "180px"],
                ["ユーザー", "140px"],
                ["詳細", "auto"],
              ].map(([label, width]) => (
                <TableCell
                  key={label}
                  sx={{
                    width,
                    borderColor: "#29435d",
                    backgroundColor: "#0d1d2e",
                    color: "#9fb7cf",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    boxShadow: "inset 0 -1px 0 #29435d",
                  }}
                >
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ border: 0, color: "#8fa8c0" }}>
                  認証イベントはまだありません。
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id} hover sx={{ "&:last-child td": { border: 0 } }}>
                  <TableCell sx={cellStyle}>
                    {new Date(event.occurredAt).toLocaleString("ja-JP", {
                      timeZone: "Asia/Tokyo",
                    })}
                  </TableCell>
                  <TableCell sx={cellStyle}>
                    <Chip
                      label={event.eventType}
                      size="small"
                      sx={{
                        backgroundColor: "#173e48",
                        color: "#7ce9dc",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={cellStyle}>{event.subject ?? "—"}</TableCell>
                  <TableCell sx={cellStyle}>
                    <Typography
                      component="code"
                      sx={{
                        color: "#b9f5e9",
                        fontFamily: "ui-monospace, SFMono-Regular, monospace",
                        fontSize: "0.78rem",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {JSON.stringify(event.detail)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ borderTop: "1px solid #20374d" }}>
        {loadError && (
          <Typography role="alert" sx={{ px: 2, pt: 1.5, color: "#ffaaa3", fontSize: "0.8rem" }}>
            監査ログを取得できませんでした。もう一度お試しください。
          </Typography>
        )}
        <TablePagination
          component="div"
          count={totalItems}
          page={page - 1}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[pageSize]}
          onPageChange={changePage}
          disabled={loading}
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}件`}
          labelRowsPerPage="表示件数"
          sx={{
            color: "#aec0d2",
            ".MuiTablePagination-selectIcon, .MuiIconButton-root": { color: "#aec0d2" },
            ".Mui-disabled": { color: "#52687d !important" },
          }}
        />
      </Box>
    </Paper>
  );
}
