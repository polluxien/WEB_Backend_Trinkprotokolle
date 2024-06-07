import { verifyPasswordAndCreateJWT } from "../../src/services/JWTService";
import { createPfleger } from "../../src/services/PflegerService";


beforeEach(async () => {
  await createPfleger({
    name: "Hofrat Behrens",
    password: "12345bcdABCD..;,.",
    admin: false,
  });
});

test("verifyPasswordAndCreateJWT sollte jwt empfangen", async () => {
  const maJwt = await verifyPasswordAndCreateJWT(
    "Hofrat Behrens",
    "12345bcdABCD..;,."
  );
  expect(maJwt).toBeDefined();
});

test("verifyPasswordAndCreateJWT sollte nicht jwt empfangen", async () => {
  const maJwt = await verifyPasswordAndCreateJWT(
    "Horat Behren",
    "12345bcdABCD..;,."
  );
  expect(maJwt).not.toBeDefined();
});


//-----------------------------------------------------------------------