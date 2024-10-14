import { verifyJWT, verifyPasswordAndCreateJWT } from "../../src/services/JWTService";
import { createPfleger } from "../../src/services/PflegerService";
import { Gender } from "../../src/model/PflegerModel"

describe("JWT Service", () => {
  beforeAll(async () => {
    // Ein Benutzer für die Tests erstellen
    await createPfleger({
      name: "John",
      password: "1234abcdABCD..;,.",
      admin: false,
      gender: Gender.Männlich,
      adress: "Behrensenstraße 14, 14059 Berlin",
      position: "Teamleader",
      birth: new Date("1975-12-11"),
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