import "server-only";

type LogDetails = Record<string, unknown>;

// Logstash reports severity both by name and as logback's numeric level.
const LEVELS = { INFO: 20000, WARN: 30000 } as const;

type Level = keyof typeof LEVELS;

function entry(level: Level, event: string, details: LogDetails) {
  return JSON.stringify({
    "@timestamp": new Date().toISOString(),
    "@version": "1",
    message: event,
    logger_name: "client-app.auth",
    thread_name: "main",
    level,
    level_value: LEVELS[level],
    service: "client-app",
    event,
    ...details,
  });
}

export function authInfo(event: string, details: LogDetails = {}) {
  console.info(entry("INFO", event, details));
}

export function authWarn(event: string, details: LogDetails = {}) {
  console.warn(entry("WARN", event, details));
}
