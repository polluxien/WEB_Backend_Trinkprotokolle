import { HydratedDocument } from "mongoose";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { login } from "../../src/services/AuthenticationService";

let pflegerHarry: HydratedDocument<IPfleger>;

beforeEach(async () => {
  pflegerHarry = await Pfleger.create({
    name: "Harry",
    password: "password",
    admin: false,
  });
  await pflegerHarry.save();
});

test("login test", async () => {
  //t1 prüfen ob bei richtiger eingabe funktioniert
  const rück = await login(pflegerHarry.name, "password");
  expect(rück).toEqual(
    expect.objectContaining({
      id: pflegerHarry.id,
      role: pflegerHarry.admin ? "a" : "u",
    })
  );
});

test("login test falsch", async () => {
  const rück2 = await login(pflegerHarry.name, "12324");
  expect(rück2).toBeFalsy();

  const rück3 = await login("Megan", pflegerHarry.password);
  expect(rück3).toBeFalsy();
});