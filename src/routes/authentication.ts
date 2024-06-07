import { verify } from "crypto";
import { NextFunction, Request, Response } from "express";
import { verifyJWT } from "../services/JWTService";
import { LoginResource } from "../Resources";

declare global {
  namespace Express {
    export interface Request {
      /**
       * Mongo-ID of currently logged in pfleger; or undefined, if pfleger is a guest.
       */
      pflegerId?: string;
      /**
       * Role of currently logged in pfleger; or undefined, if pfleger is a guest.
       */
      role?: "u" | "a";
    }
  }
}

export function requiresAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.pflegerId = undefined;
  try {
    const auth = req.header("Authorization");
    if (!auth) {
      return res.status(401).json({ error: "Unauthorized" }); // Kein oder falscher Authorization-Header
    }
    const jwtString = auth!.substring("Bearer ".length);
    const resource: LoginResource | undefined = verifyJWT(jwtString);
    if (!resource) {
      return res.status(401).json({ error: "Unauthorized" }); // Kein oder falscher Authorization-Header
    }
    req.pflegerId = resource.id;
    next();
  } catch (err) {
    res.status(401); // Unauthorized
    // ggf. weitere Header setzen, je nach Protokoll
    next(err);
  }
}

export function optionalAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.pflegerId = undefined;
  try {
    const auth = req.header("Authorization");
    if (auth) {
      const jwtString = auth.substring("Bearer ".length);
      const resource: LoginResource | undefined = verifyJWT(jwtString);
      if (resource) {
        req.pflegerId = resource.id;
      } else {
        return res.status(401).json({ error: "Unauthorized" }); // Kein oder falscher Authorization-Header
      }
    }
    next();
  } catch (err) {
    res.status(401); // Unauthorized
    // ggf. weitere Header setzen, je nach Protokoll
    next(err);
  }
}
