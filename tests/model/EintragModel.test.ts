import { HydratedDocument } from "mongoose";
import { IEintrag, Eintrag } from "../../src/model/EintragModel";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";

let pflegerHarry: HydratedDocument<IPfleger>;
let proto: HydratedDocument<IProtokoll>;

beforeEach(async () => {
  pflegerHarry = await Pfleger.create({
    name: "Harry",
    password: "password",
    admin: true,
  });
  await pflegerHarry.save();

  proto = await Protokoll.create({
    ersteller: pflegerHarry._id,
    patient: "Michi",
    datum: new Date(1807),
    public: true,
  });
  await proto.save();
});

test("Erstellen von Eintrag", async () => {
  const ein = new Eintrag({
    ersteller: pflegerHarry._id,
    protokoll: proto._id,
    getraenk: "Cola",
    menge: 450,
  });
  await ein.save();

  const einFound: HydratedDocument<IEintrag>[] = await Eintrag.find({ersteller: pflegerHarry._id}).exec();
  //expect(einFound.length).toBe(1);
  expect(einFound[0].getraenk).toBe("Cola");
  expect(einFound[0].menge).toStrictEqual(450);
  expect(einFound[0].toJSON()).toEqual(ein.toJSON());
});
