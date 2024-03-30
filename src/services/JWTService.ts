import { LoginResource } from "../Resources";

export async function verifyPasswordAndCreateJWT(name: string, password: string): Promise<string | undefined> {
    throw new Error("Function verifyPasswordAndCreateJWT not implemented yet")
}

export function verifyJWT(jwtString: string | undefined): LoginResource {
    throw new Error("Function verifyJWT not implemented yet")
}
