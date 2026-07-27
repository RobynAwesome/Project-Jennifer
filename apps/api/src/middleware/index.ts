import type { Request, Response, NextFunction } from "express";
import { TelemetryCollector } from "@jennifer/telemetry";

/**
 * Emits a telemetry event for every HTTP request.
 */
export function telemetryMiddleware(collector: TelemetryCollector) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    void collector.emit("user.action", "http", {
      method: req.method,
      path: req.path,
      ip: req.ip,
    });
    next();
  };
}

/**
 * Global error handler – logs the error and returns a structured JSON response.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("[Jennifer API]", err.message);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
}
