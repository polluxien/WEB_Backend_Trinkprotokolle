import { PflegerResource } from "../Resources";
import { Eintrag } from "../model/EintragModel";
import { Pfleger } from "../model/PflegerModel";
import { Protokoll } from "../model/ProtokollModel";
import { dateToString, stringToDate } from "./ServiceHelper";

/**
 * Die Passwörter dürfen nicht zurückgegeben werden.
 */
export async function getAllePfleger(): Promise<PflegerResource[]> {
  const pflegerListe = await Pfleger.find({});
  const pflegerResources: PflegerResource[] = [];
  for (let pfleger of pflegerListe) {
    const protMenge = await gesammtProtokolle(pfleger.id);
    const lastUpdated = await zuletztGeupdated(pfleger.id);
    const pflegerPush = {
      name: pfleger.name,
      admin: !!pfleger.admin,
      id: pfleger.id,
      gender: pfleger.gender,
      birth: dateToString(pfleger.birth),
      adress: pfleger.adress,
      position: pfleger.position,
      protoMenge: protMenge,
      updatedAt: lastUpdated ? dateToString(lastUpdated): lastUpdated,
    };
    pflegerResources.push(pflegerPush);
  }
  return pflegerResources;
}

export async function getPfleger(pflegerid: string): Promise<PflegerResource> {
  const pfleger = await Pfleger.findById(pflegerid).exec();
  if (!pfleger) {
    throw new Error("Pfleger wurde nicht gefunden");
  }
  const protMenge = await gesammtProtokolle(pflegerid);
  const lastUpdated = await zuletztGeupdated(pflegerid);
  const pflegerResources: PflegerResource = {
    name: pfleger!.name,
    admin: !!pfleger!.admin,
    id: pfleger!.id,
    gender: pfleger!.gender,
    birth: dateToString(pfleger!.birth),
    adress: pfleger!.adress,
    position: pfleger!.position,
    gesamtproto: protMenge,
    updatedAt: lastUpdated ? dateToString(lastUpdated) : lastUpdated,
  };
  return pflegerResources;
}

/**
 * Erzeugt einen Pfleger. Das Password darf nicht zurückgegeben werden.
 */
export async function createPfleger(
  pflegerResource: PflegerResource
): Promise<PflegerResource> {
  const existingPfleger = await Pfleger.findOne({ name: pflegerResource.name });
  if (existingPfleger) throw new Error("Name Exestiert bereits in Database");

  const pfleger = await Pfleger.create(pflegerResource);
  const pflegerBack: PflegerResource = {
    name: pfleger!.name,
    admin: !!pfleger!.admin,
    id: pfleger!.id,
    gender: pfleger!.gender,
    birth: dateToString(pfleger!.birth),
    adress: pfleger!.adress,
    position: pfleger!.position,
    gesamtproto: 0,
  };
  return pflegerBack;
}

/**
 * Updated einen Pfleger.
 */
export async function updatePfleger(
  pflegerResource: PflegerResource
): Promise<PflegerResource> {
  let updatingpfleger = await Pfleger.findById(pflegerResource.id).exec();
  if (!updatingpfleger) throw new Error("Pfleger wurde nicht gefunden");

  // Felder prüfen und aktualisieren
  if (pflegerResource.name !== undefined) {
    updatingpfleger.name = pflegerResource.name;
  }
  if (pflegerResource.admin !== undefined) {
    updatingpfleger.admin = pflegerResource.admin;
  }
  if (pflegerResource.password !== undefined) {
    updatingpfleger.password = pflegerResource.password;
  }
  if (pflegerResource.gender !== undefined) {
    updatingpfleger.gender = pflegerResource.gender;
  }
  if (pflegerResource.birth !== undefined) {
    updatingpfleger.birth = stringToDate(pflegerResource.birth); // Stelle sicher, dass birth ein Date-Objekt ist
  }
  if (pflegerResource.adress !== undefined) {
    updatingpfleger.adress = pflegerResource.adress;
  }
  if (pflegerResource.position !== undefined) {
    updatingpfleger.position = pflegerResource.position;
  }

  const savedPfleger = await updatingpfleger.save();
  const protMenge = await gesammtProtokolle(savedPfleger.id);
  const lastUpdated = await zuletztGeupdated(savedPfleger.id);

  return {
    name: savedPfleger.name,
    admin: !!savedPfleger.admin,
    id: savedPfleger.id,
    gender: savedPfleger.gender,
    birth: dateToString(savedPfleger.birth),
    adress: savedPfleger.adress,
    position: savedPfleger.position,
    updatedAt: lastUpdated ? dateToString(lastUpdated) : lastUpdated,
    gesamtproto: protMenge
  };
}

/**
 * Beim Löschen wird der Pfleger über die ID identifiziert.
 * Falls Pfleger nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 * Wenn der Pfleger gelöscht wird, müssen auch alle zugehörigen Protokolls und Eintrags gelöscht werden.
 */
export async function deletePfleger(id: string): Promise<void> {
  const pfleger = await Pfleger.findById(id).exec();
  if (!pfleger) {
    throw new Error(
      "Das Pflegerelement existiert nicht oder wurde bereits gelöscht"
    );
  }
  await Pfleger.findById(id).deleteOne();
  await Protokoll.deleteMany({ ersteller: id });
  await Eintrag.deleteMany({ ersteller: id });
  const deleteted = await Pfleger.findById(id).exec();
  if (deleteted) {
    throw new Error("Das Pflegerelement existiert immer noch");
  }
}

async function gesammtProtokolle(pflegerID: string): Promise<number> {
  const protoListe = await Protokoll.find({ ersteller: pflegerID });
  return protoListe.length;
}

async function zuletztGeupdated(pflegerID: string): Promise<Date | undefined> {
  const protoListe = await Protokoll.find({ ersteller: pflegerID });

  if (protoListe.length === 0) {
    return undefined;
  }

  const lastUpdated = protoListe
    .map((protokoll) => new Date(protokoll.datum))
    .reduce((latest, current) => (current > latest ? current : latest));
  return lastUpdated;
}
