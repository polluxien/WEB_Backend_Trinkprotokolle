import { HydratedDocument } from "mongoose";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";

let pflegerHarry: HydratedDocument<IPfleger>;

beforeEach(async () => {
  pflegerHarry = await Pfleger.create({
    name: "Harry",
    password: "password",
    admin: true,
  });
  await pflegerHarry.save();
});

test("Erstellen von Protokoll", async () => {
  const proto = new Protokoll({
    ersteller: pflegerHarry._id,
    patient: "Michi",
    datum: 1870,
  });
  await proto.save();

  const protoFound: HydratedDocument<IProtokoll>[] = await Protokoll.find({
    ersteller: pflegerHarry._id,
  }).exec();
  expect(protoFound.length).toBe(1);
  expect(protoFound[0].patient).toBe("Michi");
  expect(protoFound[0].datum).toStrictEqual(new Date(1870));
  expect(protoFound[0].toJSON()).toEqual(proto.toJSON());
});

test("Löschen von Protokoll", async () => {
  const proto = new Protokoll({
    ersteller: pflegerHarry._id,
    patient: "Michi",
    datum: 1870,
  });
  await proto.save();

  //--- t1
  const t1 = await Protokoll.findOne({ ersteller: pflegerHarry._id }).exec();
  expect(t1).toBeTruthy();

  //--- t2
  const deleted = await Protokoll.deleteOne({
    ersteller: pflegerHarry._id,
  }).exec();
  const t2 = await Protokoll.findOne({ ersteller: pflegerHarry._id }).exec();
  expect(t2).toBeFalsy();
});

test("Updaten von Protokoll", async () => {
  const proto = new Protokoll({
    ersteller: pflegerHarry._id,
    patient: "Michi",
    datum: 1870,
  });
  await proto.save();

  await Protokoll.updateOne(
    { ersteller: pflegerHarry._id },
    { patient: "Thomas", public: true }
  ).exec();

  //--- t1
  const t1 = await Protokoll.findOne({ patient: "Michi" }).exec();
  expect(t1).toBeFalsy();

  //--- t2
  const t2 = await Protokoll.findOne({ patient: "Thomas" }).exec();
  expect(t2).toBeTruthy();
});

test("Erstellen mit zu wenig Attributen", async () => {
  try {
    let protokoll: HydratedDocument<IProtokoll> = await Protokoll.create({
      ersteller: pflegerHarry._id,
      patient: "Michi",
    });
  } catch (err) {
    expect(err).toBeDefined();
  }
});
