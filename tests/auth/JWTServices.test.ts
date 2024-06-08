import { verifyJWT, verifyPasswordAndCreateJWT } from "../../src/services/JWTService";
import { createPfleger } from "../../src/services/PflegerService";

describe("JWT Service", () => {
  beforeAll(async () => {
    // Ein Benutzer für die Tests erstellen
    await createPfleger({
      name: "John",
      password: "1234abcdABCD..;,.",
      admin: false,
    });
  });

  test("verifyPasswordAndCreateJWT sollte JWT zurückgeben", async () => {
    const jwtString = await verifyPasswordAndCreateJWT("John", "1234abcdABCD..;,.");
    expect(jwtString).toBeDefined();
  });

  test("verifyPasswordAndCreateJWT sollte undefined zurückgeben bei ungültigen Daten", async () => {
    const jwtString = await verifyPasswordAndCreateJWT("InvalidUser", "InvalidPassword");
    expect(jwtString).toBeUndefined();
  });

  test("verifyJWT sollte LoginResource zurückgeben", async () => {
    const jwtString = await verifyPasswordAndCreateJWT("John", "1234abcdABCD..;,.");
    if (jwtString) {
      const resource = verifyJWT(jwtString);
      expect(resource).toHaveProperty("id");
      expect(resource).toHaveProperty("role");
      expect(resource).toHaveProperty("exp");
    }
  });

  test("verifyJWT sollte Fehler werfen bei ungültigem JWT", () => {
    expect(() => verifyJWT("invalid.jwt.token")).toThrow("Jason Web Token falsch");
  });
});