import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || "Internal server error";

  // Log the error with full user + request context
  logger.error(message, {
    statusCode,
    method: req.method,
    route: req.route?.path ?? req.path,
    originalUrl: req.originalUrl,
    userId: req.user?._id ?? null,
    email: req.user?.email ?? null,
    role: req.user?.role ?? null,
    ip: req.ip || req.headers["x-forwarded-for"] || "unknown",
    stack: err.stack ?? null,
  });

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
