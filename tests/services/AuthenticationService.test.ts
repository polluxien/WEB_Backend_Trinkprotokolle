import { HydratedDocument } from "mongoose";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { login } from "../../src/services/AuthenticationService";
import { Gender } from "../../src/model/PflegerModel";


let pflegerHarry: HydratedDocument<IPfleger>;

beforeEach(async () => {
  pflegerHarry = await Pfleger.create({
    name: "Harry",
    password: "password",
    admin: false,
    gender: Gender.Männlich,
    adress: "Behrensenstraße 14, 14059 Berlin",
    position: "Teamleader",
    birth: new Date("1975-12-11"),
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