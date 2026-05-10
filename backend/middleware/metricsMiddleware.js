import {
  httpRequestsTotal,
  httpRequestDuration,
  httpRequestsInProgress,
} from "../utils/metrics.js";

/**
 * Prometheus HTTP metrics middleware.
 *
 * Tracks:
 *  - http_requests_in_progress  (gauge)
 *  - http_requests_total        (counter)
 *  - http_request_duration_seconds (histogram)
 *
 * Route labels are normalised using req.route.path (e.g. /api/users/:id)
 * to avoid unbounded cardinality from dynamic path segments.
 */
const metricsMiddleware = (req, res, next) => {
  const method = req.method;

  // Increment in-flight gauge immediately
  httpRequestsInProgress.inc({ method });

  // Start high-resolution timer
  const endTimer = httpRequestDuration.startTimer();

  res.on("finish", () => {
    // Normalise route: use matched route pattern or fall back to raw path
    const route = req.route?.path ?? req.path ?? "unknown";

    const labels = {
      method,
      route,
      status_code: res.statusCode,
    };

    httpRequestsInProgress.dec({ method });
    httpRequestsTotal.inc(labels);
    endTimer(labels);
  });

  next();
};

export default metricsMiddleware;
