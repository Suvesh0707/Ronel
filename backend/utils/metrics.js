import client from "prom-client";

// Create a custom registry so we have full control
const registry = new client.Registry();

// Add default Node.js / process metrics (heap, GC, event loop lag, CPU, etc.)
client.collectDefaultMetrics({
  register: registry,
  prefix: "nodejs_",
});

// ─── Custom HTTP Metrics ──────────────────────────────────────────────────────

/**
 * Total number of HTTP requests completed.
 * Labels: method, route, status_code
 */
export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [registry],
});

/**
 * Histogram of HTTP request durations in seconds.
 * Labels: method, route, status_code
 */
export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
});

/**
 * Gauge of currently in-flight HTTP requests.
 * Labels: method
 */
export const httpRequestsInProgress = new client.Gauge({
  name: "http_requests_in_progress",
  help: "Number of HTTP requests currently being processed",
  labelNames: ["method"],
  registers: [registry],
});

export default registry;
