import { sign, verify } from "jsonwebtoken";
import { promisify } from "util";
import { unauthorizedError, forbiddenError } from "./errorHandler";

const signToken = (id) => {
  return sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        unauthorizedError("You are not logged in! Please log in to get access.")
      );
    }

    // 2) Verification token
    const decoded = await promisify(verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        unauthorizedError("The user belonging to this token no longer exists.")
      );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        unauthorizedError(
          "User recently changed password! Please log in again."
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        forbiddenError("You do not have permission to perform this action")
      );
    }
    next();
  };
};

export const verifyEmailToken = async (token) => {
  try {
    const decoded = await promisify(verify)(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};

export const generatePasswordResetToken = (user) => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

export const checkPermissions = (resourceUserId, currentUserId, userRole) => {
  if (userRole === "Admin") return true;
  if (resourceUserId.toString() === currentUserId.toString()) return true;
  return false;
};

export const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = "Too many requests, please try again later.",
  } = options;

  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [key, value] of requests.entries()) {
      if (value.timestamp < windowStart) {
        requests.delete(key);
      }
    }

    // Check if IP has exceeded the limit
    const userRequests = requests.get(ip) || { count: 0, timestamp: now };
    if (userRequests.count >= max) {
      return res.status(429).json({
        status: "error",
        message,
      });
    }

    // Update request count
    requests.set(ip, {
      count: userRequests.count + 1,
      timestamp: now,
    });

    next();
  };
};
