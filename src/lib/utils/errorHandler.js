export class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production mode
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        errorCode: err.errorCode,
      });
    } else {
      // Programming or unknown errors
      console.error("ERROR 💥", err);
      res.status(500).json({
        status: "error",
        message: "Something went wrong!",
        errorCode: "INTERNAL_SERVER_ERROR",
      });
    }
  }
};

export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export const validationError = (errors) => {
  return new AppError("Validation Error", 400, "VALIDATION_ERROR", errors);
};

export const notFoundError = (resource) => {
  return new AppError(`${resource} not found`, 404, "NOT_FOUND");
};

export const unauthorizedError = (message = "Unauthorized access") => {
  return new AppError(message, 401, "UNAUTHORIZED");
};

export const forbiddenError = (message = "Forbidden access") => {
  return new AppError(message, 403, "FORBIDDEN");
};

export const conflictError = (message = "Resource conflict") => {
  return new AppError(message, 409, "CONFLICT");
};

export const rateLimitError = (message = "Too many requests") => {
  return new AppError(message, 429, "RATE_LIMIT_EXCEEDED");
};
