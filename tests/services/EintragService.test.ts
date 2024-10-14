import { HydratedDocument } from "mongoose";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { Eintrag, IEintrag } from "../../src/model/EintragModel";
import { Gender } from "../../src/model/PflegerModel";

import {
  createEintrag,
  deleteEintrag,
  getAlleEintraege,
  getEintrag,
  updateEintrag,
} from "../../src/services/EintragService";
import { stringToDate, dateToString } from "../../src/services/ServiceHelper";
import { EintragResource } from "../../src/Resources";

let pflegerHarry: HydratedDocument<IPfleger>;
let pflegerLilli: HydratedDocument<IPfleger>;

let testProtoH: HydratedDocument<IProtokoll>;
let testProtoL: HydratedDocument<IProtokoll>;

let testEintrag1: HydratedDocument<IEintrag>;
let testEintrag2: HydratedDocument<IEintrag>;

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
  pflegerLilli = await Pfleger.create({
    name: "Lilli",
    password: "12345",
    gender: Gender.Weiblich,
    adress: "Behrensenstraße 14, 14059 Berlin",
    position: "Teamleader",
    birth: new Date("1975-12-11"),
  });
  await pflegerHarry.save();
  await pflegerLilli.save();

  //Harry
  testProtoH = await Protokoll.create({
    ersteller: pflegerHarry.id,
    patient: "Michi",
    datum: new Date(),
    public: true,
  });

  //Lilli
  testProtoL = await Protokoll.create({
    ersteller: pflegerLilli.id,
    patient: "Tobi",
    datum: new Date(),
    public: true,
  });

  await testProtoH.save();
  await testProtoL.save();

  testEintrag1 = await Eintrag.create({
    getraenk: "Cola",
    menge: 600,
    ersteller: pflegerLilli.id,
    createdAt: new Date(),
    protokoll: testProtoL.id,
  });

  testEintrag2 = await Eintrag.create({
    getraenk: "Wasser",
    menge: 400,
    ersteller: pflegerHarry.id,
    createdAt: new Date(),
    protokoll: testProtoH.id,
  });

  await testEintrag1.save();
  await testEintrag2.save();
});

test("getEintrag test", async () => {
  const eintragListe = await Eintrag.find({});

  // _id: new ObjectId('663cd4bd885a45e0af1f24a1'), ersteller: new ObjectId('663cd4bd885a45e0af1f2497'),protokoll: new ObjectId('663cd4bd885a45e0af1f249d'),getraenk: 'Cola', menge: 600, createdAt: 2024-05-09T13:50:53.513Z, updatedAt: 2024-05-09T13:50:53.513Z, __v: 0
  const id = eintragListe[0].id;
  let eintrag = await getEintrag(id);

  //t1 angaben stimmen überein
  expect(eintrag.id).toBe(id);
  expect(eintrag.ersteller).toBe(pflegerLilli.id);
  expect(eintrag.protokoll).toBe(testProtoL.id);
  expect(eintrag.getraenk).toBe("Cola");
  expect(eintrag.menge).toBe(600);
  expect(eintrag.erstellerName).toBe("Lilli");
  expect(eintrag.kommentar).toBeUndefined();
  expect(eintrag.createdAt!).toBe(dateToString(eintragListe[0].createdAt!));

  //t2 Fehler wird geworfen bei falscher id
  await expect(getEintrag("123")).rejects.toThrow();
});

test("createEintrag test", async () => {
  //t0 davor nicht vorhanden
  let ein = await Eintrag.findOne({ getraenk: "Vino" });
  expect(ein).toBeNull();

  const eintrag = await createEintrag({
    getraenk: "Vino",
    menge: 750,
    ersteller: pflegerHarry.id,
    createdAt: dateToString(new Date()),
    protokoll: testProtoH.id,
  });

  //t1 Fehler bei falscher Protokollid
  await expect(
    createEintrag({
      getraenk: "Apfelsaft",
      menge: 30,
      ersteller: pflegerHarry.id,
      createdAt: dateToString(new Date()),
      protokoll: "123",
    })
  ).rejects.toThrow();

  //t2 Fehler bei falscher Erstellerid
  await expect(
    createEintrag({
      getraenk: "Gurkensaft",
      menge: 200,
      ersteller: "123",
      createdAt: dateToString(new Date()),
      protokoll: testProtoH.id,
    })
  ).rejects.toThrow();

  //t3 taucht in Liste auf
  let ein2 = await Eintrag.findOne({ getraenk: "Vino" });
  expect(ein2).not.toBeNull();

  //t3 rückgabe stimmt überein
  expect(eintrag.ersteller).toBe(pflegerHarry.id);
  expect(eintrag.protokoll).toBe(testProtoH.id);
  expect(eintrag.getraenk).toBe("Vino");
  expect(eintrag.menge).toBe(750);
  expect(eintrag.erstellerName).toBe("Harry");
  expect(eintrag.kommentar).toBeUndefined();
});

test("updateEintrag", async () => {
  //t0 davor nicht vorhanden
  let ein = await Eintrag.findOne({ getraenk: "limo" });
  expect(ein).toBeNull();

  const changable = await Eintrag.findOne({ getraenk: "Wasser" });
  const id = changable?.id;
  const eintragRes: EintragResource = {
    id: id,
    getraenk: "limo",
    menge: 40,
    ersteller: pflegerHarry.id,
    createdAt: dateToString(new Date()),
    protokoll: testProtoH.id,
    kommentar: "Limo ist nicht gesund",
  };
  const eintrag = await updateEintrag(eintragRes);

  //t1 rückgabe stimmt überein
  expect(eintrag.id).toBe(id);
  expect(eintrag.ersteller).toBe(pflegerHarry.id);
  expect(eintrag.protokoll).toBe(testProtoH.id);
  expect(eintrag.getraenk).toBe("limo");
  expect(eintrag.menge).toBe(40);
  expect(eintrag.erstellerName).toBe("Harry");
  expect(eintrag.kommentar).toBe("Limo ist nicht gesund");

  //t2 wird in der liste gefunden
  let myeintrag = await Eintrag.findOne({ getraenk: "limo" });
  expect(myeintrag).not.toBeNull();

  //t3 hat beim finden richtige attribute
  myeintrag = await Eintrag.findOne({ getraenk: "limo" });
  expect(myeintrag?.id).toBe(id);
  expect(String(myeintrag?.ersteller)).toBe(pflegerHarry.id);
  expect(String(myeintrag?.protokoll)).toBe(testProtoH.id);
  expect(eintrag.erstellerName).toBe("Harry");
  expect(myeintrag?.getraenk).toBe("limo");
  expect(myeintrag?.menge).toBe(40);
  expect(myeintrag?.kommentar).toBe("Limo ist nicht gesund");
});

test("deleteEintrag test", async () => {
  //t0 Eintrag vorher vorhanden
  const notDeletedEintrag = await Eintrag.findOne({ getraenk: "Wasser" });
  expect(notDeletedEintrag).not.toBeNull();

  const eintragToDelete = await Eintrag.findOne({ getraenk: "Wasser" });
  const id = eintragToDelete?.id;
  await deleteEintrag(id);

  //t1 ist gelöscht
  const deletedEintrag = await Eintrag.findOne({ getraenk: "Wasser" });
  expect(deletedEintrag).toBeNull();

  //t2 wirft Fehler bei falscher ID
  await expect(deleteEintrag("123")).rejects.toThrow();
})

test("getAlleEintrage test", async ()  => {
  let protoliste = await getAlleEintraege(testProtoH.id);

  //t1 überprüfe ob die richtige größe übergeben wird
  expect(protoliste.length).toBe(1);

  await createEintrag({
    getraenk: "Vino",
    menge: 750,
    ersteller: pflegerHarry.id,
    createdAt: dateToString(new Date()),
    protokoll: testProtoH.id,
  });

  //t2 immer noch richtige größe
  protoliste = await getAlleEintraege(testProtoH.id);
  expect(protoliste.length).toBe(2);

  //t3 Fehler bei falscher id
  await expect(getAlleEintraege("123")).rejects.toThrow();
})