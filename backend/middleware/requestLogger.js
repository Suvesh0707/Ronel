import logger from "../utils/logger.js";

/**
 * Request logging middleware.
 *
 * Logs every completed request with:
 *   - timestamp (from winston)
 *   - method, route, statusCode
 *   - userId + email  (if req.user is set by auth middleware)
 *   - ip address
 *   - duration in ms
 *
 * Errors (4xx/5xx) are logged at "error" level → appear in error.log
 * Successful requests are logged at "info" level → appear in combined.log
 */
const requestLogger = (req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startedAt;
    const statusCode = res.statusCode;

    const logData = {
      method: req.method,
      route: req.route?.path ?? req.path,
      statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.headers["x-forwarded-for"] || "unknown",
      // User info — only present after protect() middleware runs
      userId: req.user?._id ?? null,
      email: req.user?.email ?? null,
      role: req.user?.role ?? null,
    };

    const message = `${req.method} ${req.originalUrl} ${statusCode} ${duration}ms`;

    if (statusCode >= 500) {
      logger.error(message, logData);
    } else if (statusCode >= 400) {
      logger.warn(message, logData);
    } else {
      logger.info(message, logData);
    }
  });

  next();
};

export default requestLogger;
