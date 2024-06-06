import { HydratedDocument } from "mongoose";
import {
  getAllePfleger,
  createPfleger,
  updatePfleger,
  deletePfleger,
} from "../../src/services/PflegerService";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { PflegerResource } from "../../src/Resources";

let pflegerHarry: HydratedDocument<IPfleger>;
let pflegerSimon: HydratedDocument<IPfleger>;
let pflegerGusti: HydratedDocument<IPfleger>;

let myProtokoll: HydratedDocument<IProtokoll>;

beforeEach(async () => {
  pflegerHarry = await Pfleger.create({
    name: "Harry",
    password: "password",
    admin: false,
  });
  pflegerSimon = await Pfleger.create({
    name: "Simon",
    password: "123456789",
  });
  pflegerGusti = await Pfleger.create({
    name: "Gusti",
    password: "miau",
    admin: false,
  });
  await pflegerHarry.save();
  await pflegerSimon.save();
  await pflegerGusti.save();

  myProtokoll = await Protokoll.create({
    ersteller: pflegerHarry.id,
    patient: "Michi",
    datum: new Date(),
    public: true,
  });
  await myProtokoll.save();
});

test("getAllPfleger test", async () => {
  const pflegerListe = await getAllePfleger();

  //t1 Richtige länge
  expect(pflegerListe.length).toBe(3);

  //t2 übersetztung Boolean funktioniert
  expect(pflegerListe.every((pfleger) => pfleger.admin == false)).toBeTruthy();

  //t3 kein passwort wird mitgeliefert
  expect(
    pflegerListe.every((pfleger) => pfleger.password == undefined)
  ).toBeTruthy();

  //t4 anderen werte gesetzt
  expect(
    pflegerListe.every(
      (pfleger) =>
        pfleger.id != undefined &&
        pfleger.name != undefined &&
        pfleger.admin != undefined
    )
  ).toBeTruthy();
});

test("createPfleger test", async () => {
  const pfleger = await createPfleger({
    name: "derNeue",
    password: "1234356789",
    admin: true,
  });
  //t1 Richtige initalisiert
  expect(pfleger.name).toBe("derNeue");
  expect(pfleger.password).toBeUndefined();
  expect(pfleger.admin).toBeTruthy();

  const pflegerListe = await getAllePfleger();

  //t2 Richtige länge von Pflegerliste
  expect(pflegerListe.length).toBe(4);
});

test("updatePfleger test", async () => {
  const pflegerListe = await getAllePfleger();

  //{ name: 'Harry', admin: false, id: '6634b8e08d574e011bb3a37c' }
  const id = pflegerListe[0].id;

  const pflegerUpp: PflegerResource = {
    name: "Willi",
    admin: true,
    id: id,
  };
  const pflegerBack = await updatePfleger(pflegerUpp);

  //t1 beide Pfleger gleichen sich inhaltlich
  //expect(pflegerBack.name).toBe(pflegerUpp.name);
  //expect(pflegerBack.admin).toBe(pflegerUpp.admin);

  //t2 gibt keine zwei obj mit selber id
  const pfle = await Pfleger.findById(id);
  expect(pfle!.name).toBe("Willi");
  expect(pfle!.admin).toBeTruthy();
});

test("deletePfleger test", async () => {
  const pflegerListe = await getAllePfleger();

  //Protokoll exestiert
  const proto = await Protokoll.findOne({ersteller: pflegerHarry.id})
  expect(proto).not.toBeNull();

  //{ name: 'Harry', admin: false, id: '6634b8e08d574e011bb3a37c' }
  const id = pflegerListe[0].id;

  //t1 Pfleger exestiert
  const pfleger1 = await Pfleger.findById(id);
  expect(pfleger1).not.toBeNull();

  //t2 Pfleger wurde erfolgreicxh gelöscht
  await deletePfleger(id!);
  const pfleger2 = await Pfleger.findById(id);
  expect(pfleger2).toBeNull();

  //t3 Protokoll wird auch erfolgreich gelöscht
  const proto2 = await Protokoll.findOne({ersteller: pflegerHarry.id});
  expect(proto2).toBeNull();
});

test("updatePfleger test - only name", async () => {
  const pflegerListe = await getAllePfleger();
  const id = pflegerListe[0].id;

  const pflegerUpp: PflegerResource = {
    name: "Willi",
    id: id,
    admin: false
  };
  const pflegerBack = await updatePfleger(pflegerUpp);

  // Überprüfen, ob nur der Name aktualisiert wurde
  expect(pflegerBack.name).toBe(pflegerUpp.name);
  expect(pflegerBack.admin).toBe(pflegerListe[0].admin);

  // Überprüfen, ob die Änderungen in der Datenbank gespeichert wurden
  const pfle = await Pfleger.findById(id);
  expect(pfle!.name).toBe("Willi");
  expect(pfle!.admin).toBe(pflegerListe[0].admin);
});

test("updatePfleger test - name and admin", async () => {
  const pflegerListe = await getAllePfleger();
  const id = pflegerListe[0].id;

  const pflegerUpp: PflegerResource = {
    name: "Willi",
    admin: true,
    id: id,
  };
  const pflegerBack = await updatePfleger(pflegerUpp);

  // Überprüfen, ob Name und Admin-Flag aktualisiert wurden
  expect(pflegerBack.name).toBe(pflegerUpp.name);
  expect(pflegerBack.admin).toBe(pflegerUpp.admin);

  // Überprüfen, ob die Änderungen in der Datenbank gespeichert wurden
  const pfle = await Pfleger.findById(id);
  expect(pfle!.name).toBe("Willi");
  expect(pfle!.admin).toBe(true);
});

test("Pflegername existiert bereits", async () => {
  await expect(createPfleger({
    name: "Harry",
    password: "1234356789",
    admin: true,
  })).rejects.toThrow();
});