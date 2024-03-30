import { NextFunction, Request, Response } from "express";

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

export function requiresAuthentication(req: Request, res: Response, next: NextFunction) {
    throw new Error("Function requiresAuthentication not implemented yet")
}

export function optionalAuthentication(req: Request, res: Response, next: NextFunction) {
    throw new Error("Function requiresAuthentication not implemented yet")
}
