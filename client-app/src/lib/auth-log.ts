import "server-only";

type LogDetails = Record<string, unknown>;

function entry(event: string, details: LogDetails) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    service: "client-app",
    event,
    ...details,
  });
}

export function authInfo(event: string, details: LogDetails = {}) {
  console.info(entry(event, details));
}

export function authWarn(event: string, details: LogDetails = {}) {
  console.warn(entry(event, details));
}
