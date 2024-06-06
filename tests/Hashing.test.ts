import { Pfleger } from "../src/model/PflegerModel";
import bcrypt from "bcryptjs";

test("save mit hash", async () => {
  let password: string = "123456789";
  let pflegerMartin = await Pfleger.create({
    name: "LeMartin",
    password: password,
  });
  const leM = await pflegerMartin.save();
  let hashedpassword = leM.password;

  try {
    const isMatch = await bcrypt.compare(password, hashedpassword);
    expect(isMatch).toBeTruthy();
  } catch (error) {}
});

test("ändern des passworts automatisch mit hash", async () => {
  let password: string = "Password";
  let pflegerMartin = await Pfleger.create({
    name: "LeMartin",
    password: password,
  });
  const leM = await pflegerMartin.save();

  let newPassword = "newPassword";
  await Pfleger.updateOne({ name: "LeMartin" }, { password: newPassword });

  try {
    const isMatch = await bcrypt.compare(newPassword, leM.password);
    expect(isMatch).toBeTruthy();
  } catch (error) {}
});

//------

test("Passwortkontrolle mit Schema-Methode", async () => {
  const password = "123456789";
  const pflegerMartin = await Pfleger.create({
    name: "LeMartin",
    password: password,
  });
  const leM = await pflegerMartin.save();
  const t1 = await leM.isCorrectPassword(password);
  expect(t1).toBeTruthy();

  const t2 = await leM.isCorrectPassword("hahahah");
  expect(t2).toBeFalsy();
});

test("sollte einen Fehler werfen, wenn das Passwort noch nicht gehasht wurde", async () => {
  const password = "123456789";

  const pfleger = new Pfleger({
    name: "LeMartin",
    password: password,
  });
  //wichtiggg
  pfleger.isNew = false;

  try {
    await pfleger.isCorrectPassword(password);
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    return;
  }
  fail(
    "Es wurde kein Fehler geworfen, obwohl das Passwort nicht gehasht ist und das Dokument nicht neu ist."
  );
});
