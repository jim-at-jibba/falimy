/**
 * Centralized logging utility for the Falimy mobile app.
 * 
 * Provides structured logging with context and can be easily integrated
 * with error tracking services (Sentry, etc.) in the future.
 * 
 * In production builds, console.log statements are stripped by Babel,
 * but this logger can still send errors to analytics services.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  component?: string;
  action?: string;
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = __DEV__;

  /**
   * Log a debug message (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const prefix = context?.component ? `[${context.component}]` : "[Debug]";
      console.log(prefix, message, context ? this.sanitizeContext(context) : "");
    }
  }

  /**
   * Log an informational message
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const prefix = context?.component ? `[${context.component}]` : "[Info]";
      console.log(prefix, message, context ? this.sanitizeContext(context) : "");
    }
  }

  /**
   * Log a warning (potential issue but not critical)
   */
  warn(message: string, context?: LogContext): void {
    const prefix = context?.component ? `[${context.component}]` : "[Warn]";
    console.warn(prefix, message, context ? this.sanitizeContext(context) : "");
    
    // TODO: Send to analytics service in production
    // if (!this.isDevelopment) {
    //   analytics.trackWarning(message, context);
    // }
  }

  /**
   * Log an error (critical issue requiring attention)
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const prefix = context?.component ? `[${context.component}]` : "[Error]";
    console.error(prefix, message, error, context ? this.sanitizeContext(context) : "");
    
    // TODO: Send to error tracking service
    // if (!this.isDevelopment) {
    //   Sentry.captureException(error, {
    //     tags: { component: context?.component },
    //     extra: context,
    //   });
    // }
  }

  /**
   * Remove sensitive data from context before logging
   */
  private sanitizeContext(context: LogContext): LogContext {
    const sanitized = { ...context };
    
    // Remove common sensitive fields
    const sensitiveKeys = [
      "password",
      "token",
      "inviteCode",
      "invite_code",
      "email", // Consider removing email in production
      "authToken",
      "auth_token",
    ];
    
    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = "[REDACTED]";
      }
    }
    
    return sanitized;
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports for common use cases
export const logDebug = logger.debug.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);
