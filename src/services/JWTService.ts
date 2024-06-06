import { LoginResource } from "../Resources";
import { login } from "./AuthenticationService";
import dotenv from "dotenv";
import { JwtPayload, sign, verify } from "jsonwebtoken";

dotenv.config();

export async function verifyPasswordAndCreateJWT(
  name: string,
  password: string
): Promise<string | undefined> {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtTtl = process.env.JWT_SECRET;
  if (!jwtSecret || !jwtTtl)
    throw new Error("jwtSecret oder/und jwtTtl nicht gesetzt");

  const user = await login(name, password);
  if (user) {
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + Number(jwtTtl),
    };
    const jwtString = sign(payload, jwtSecret, {
      algorithm: "HS256"
    });
    return jwtString;
  }
  return undefined;
}

export function verifyJWT(jwtString: string | undefined): LoginResource {
  throw new Error("Function verifyJWT not implemented yet");
}
