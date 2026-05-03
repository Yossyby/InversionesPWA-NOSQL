import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export type UserRole = "viewer" | "trader" | "admin";

export interface AuthContext {
  userId: string;
  email?: string;
  role: UserRole;
  mfaSessionId?: string;
}

interface TokenClaims extends JwtPayload {
  sub?: string;
  email?: string;
  role?: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      authContext?: AuthContext;
    }
  }
}

function isValidRole(role: string | undefined): role is UserRole {
  return role === "viewer" || role === "trader" || role === "admin";
}

export function authContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (process.env.AUTH_BYPASS === "true") {
    req.authContext = {
      userId: process.env.AUTH_BYPASS_USER_ID ?? "dev-user",
      email: process.env.AUTH_BYPASS_EMAIL ?? "dev@local",
      role: (process.env.AUTH_BYPASS_ROLE as UserRole) ?? "trader",
      mfaSessionId: req.header("x-mfa-session-id") ?? "dev-mfa-session"
    };
    next();
    return;
  }

  const authorization = req.header("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({ code: "AUTH_CONTEXT_MISSING" });
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();
  const publicKey = process.env.JWT_PUBLIC_KEY;

  if (!publicKey) {
    res.status(500).json({ code: "AUTH_CONTEXT_CONFIG_ERROR" });
    return;
  }

  try {
    const decoded = jwt.verify(token, publicKey, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      algorithms: ["RS256", "HS256"]
    }) as TokenClaims;

    if (!decoded.sub || !isValidRole(decoded.role)) {
      res.status(401).json({ code: "AUTH_CONTEXT_INVALID_TOKEN" });
      return;
    }

    req.authContext = {
      userId: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      mfaSessionId: req.header("x-mfa-session-id") ?? undefined
    };
    next();
  } catch {
    res.status(401).json({ code: "AUTH_CONTEXT_INVALID_TOKEN" });
  }
}
