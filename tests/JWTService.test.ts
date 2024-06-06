
import { verifyPasswordAndCreateJWT } from "../src/services/JWTService";
import { createPfleger } from "../src/services/PflegerService";

beforeEach(async () => {
  await createPfleger({
    name: "Hofrat Behrens",
    password: "12345bcdABCD..;,.",
    admin: false,
  });
});

test("erster Test verifyPasswordAndCreateJWT", async () => {
  const maJwt = await verifyPasswordAndCreateJWT(
    "Hofrat Behrens",
    "12345bcdABCD..;,."
  );
  expect(maJwt).toBeDefined();
});
