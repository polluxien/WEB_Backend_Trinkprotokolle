import { PflegerResource } from "../Resources";
import { Eintrag } from "../model/EintragModel";
import { Pfleger } from "../model/PflegerModel";
import { Protokoll } from "../model/ProtokollModel";

/**
 * Die Passwörter dürfen nicht zurückgegeben werden.
 */
export async function getAllePfleger(): Promise<PflegerResource[]> {
  const pflegerListe = await Pfleger.find({});
  const pflegerResources: PflegerResource[] = [];
  for (let pfleger of pflegerListe) {
    const pflegerPush = {
      name: pfleger.name,
      admin: !!pfleger.admin,
      id: pfleger.id,
    };
    pflegerResources.push(pflegerPush);
  }
  return pflegerResources;
}

export async function getPfleger(pflegerid: string): Promise<PflegerResource> {
  const pfleger = await Pfleger.findById(pflegerid).exec();
  const pflegerResources: PflegerResource = {
      name: pfleger!.name,
      admin: !!pfleger!.admin,
      id: pfleger!.id,
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
    name: pfleger.name,
    admin: !!pfleger.admin,
    id: pfleger.id!,
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

  if (pflegerResource.name !== undefined) {
    updatingpfleger.name = pflegerResource.name;
  }
  if (pflegerResource.admin !== undefined) {
    updatingpfleger.admin = pflegerResource.admin;
  }
  if (pflegerResource.password !== undefined) {
    updatingpfleger.password = pflegerResource.password;
  }
  const savedPfleger = await updatingpfleger.save();

  return {
    name: savedPfleger.name,
    admin: !!savedPfleger.admin,
    id: savedPfleger.id,
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
