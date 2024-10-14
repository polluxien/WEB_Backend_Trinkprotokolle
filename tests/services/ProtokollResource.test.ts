import { HydratedDocument } from "mongoose";
import { ProtokollResource } from "src/Resources";
import {
  getAlleProtokolle,
  getProtokoll,
  createProtokoll,
  updateProtokoll,
  deleteProtokoll,
} from "../../src/services/ProtokollService";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { stringToDate, dateToString } from "../../src/services/ServiceHelper";
import { Eintrag, IEintrag } from "../../src/model/EintragModel";
import { Gender } from "../../src/model/PflegerModel";


let pflegerHarry: HydratedDocument<IPfleger>;
let pflegerLilli: HydratedDocument<IPfleger>;

let testProto1: HydratedDocument<IProtokoll>;
let testProto2: HydratedDocument<IProtokoll>;
let testProto3: HydratedDocument<IProtokoll>;
let testProto4: HydratedDocument<IProtokoll>;

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
  testProto1 = await Protokoll.create({
    ersteller: pflegerHarry.id,
    patient: "Michi",
    datum: new Date(),
    public: true,
  });
  testProto2 = await Protokoll.create({
    ersteller: pflegerHarry.id,
    patient: "Simon",
    datum: new Date(),
  });

  //Lilli
  testProto3 = await Protokoll.create({
    ersteller: pflegerLilli.id,
    patient: "Tobi",
    datum: new Date(),
    public: true,
  });
  testProto4 = await Protokoll.create({
    ersteller: pflegerLilli.id,
    patient: "Miri",
    datum: new Date(),
    public: false,
  });
  await testProto1.save();
  await testProto2.save();
  await testProto3.save();
  await testProto4.save();

  testEintrag1 = await Eintrag.create({
    getraenk: "Cola",
    menge: 600,
    ersteller: pflegerLilli.id,
    createdAt: new Date(),
    protokoll: testProto1.id,
  });

  testEintrag2 = await Eintrag.create({
    getraenk: "Cola",
    menge: 600,
    ersteller: pflegerLilli.id,
    createdAt: new Date(),
    protokoll: testProto1.id,
  });
  await testEintrag1.save();
  await testEintrag2.save();
});

test("getAlleProtokolle test", async () => {
  const protoliste = await getAlleProtokolle(pflegerHarry.id);

  //t1 überprüfe ob die richtige größe übergeben wird
  expect(protoliste.length).toBe(3);

  //t2 Fehler bei falscher id
  await expect(getAlleProtokolle("123")).rejects.toThrow();
});

test("getProtokoll test", async () => {
  const myproto = await getProtokoll(String(testProto1!.id));
  expect(myproto.gesamtMenge).toBe(1200);
});

test("createProtokoll test", async () => {
  const myproto = await createProtokoll({
    ersteller: pflegerHarry.id,
    patient: "Milan",
    public: true,
    datum: dateToString(new Date()),
  });

  //t1 Richtige initalisiert
  expect(myproto.ersteller).toBe(pflegerHarry.id);
  expect(myproto.patient).toBe("Milan");
  expect(myproto.public).toBeTruthy();
  expect(myproto.gesamtMenge).toBe(0);

  //t2 exestiert in Protokollen
  expect(
    Protokoll.findOne({ ersteller: pflegerHarry.id, patient: "Milan" }, {})
  ).not.toBeNull();

  //t2 Richtige länge von Protokollliste
  const protoliste = await getAlleProtokolle(pflegerHarry.id);
  expect(protoliste.length).toBe(4);
});

test("updateProtokoll test", async () => {
  const protoListe = await getAlleProtokolle(pflegerHarry.id);

  //{ ersteller: '66379bb743c02dfabe056ab9', patient: 'Michi', datum: '05.05.2024', public: true, closed: false, updatedAt: '05.05.2024', id: '66379bb743c02dfabe056abf' }
  const id = protoListe[0].id;

  const pflegerUpp: ProtokollResource = {
    id: id,
    ersteller: pflegerHarry.id,
    patient: "Matti",
    public: true,
    datum: dateToString(new Date()),
  };
  const protoBack = await updateProtokoll(pflegerUpp);

  //t2 gibt keine zwei obj mit selber id
  const proto = await Protokoll.findById(id).exec();
  expect(proto!.patient).toBe("Matti");
  expect(proto!.public).toBeTruthy();
});

test("deleteProtokoll test", async () => {
  const protoListe = await getAlleProtokolle(pflegerHarry.id);

  //{ ersteller: '66379bb743c02dfabe056ab9', patient: 'Michi', datum: '05.05.2024', public: true, closed: false, updatedAt: '05.05.2024', id: '66379bb743c02dfabe056abf' }
  const id = protoListe[0].id;

  //t1 Protokoll exestiert
  const proto = await Protokoll.findById(id).exec();
  expect(proto).not.toBeNull();

  //t2 Protokoll wurde erfolgreicxh gelöscht
  await deleteProtokoll(id!);
  const proto2 = await Protokoll.findById(id).exec();
  expect(proto2).toBeNull();
});
