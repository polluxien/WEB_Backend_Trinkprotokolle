import { EintragResource } from "../Resources";
import { Eintrag } from "../model/EintragModel";
import { Pfleger } from "../model/PflegerModel";
import { Protokoll } from "../model/ProtokollModel";
import { dateToString, stringToDate } from "./ServiceHelper";

/**
 * Gibt alle Eintraege in einem Protokoll zurück.
 * Wenn das Protokoll nicht gefunden wurde, wird ein Fehler geworfen.
 */
export async function getAlleEintraege(
  protokollId: string
): Promise<EintragResource[]> {
  if (!protokollId) {
    throw new Error("Keine Id vorhanden um Einträge zu finden");
  }
  const eintragListe = await Eintrag.find({ protokoll: protokollId });
  if (!eintragListe.length) {
    // Rückgabe einer leeren Liste anstelle eines Fehlers
    return [];
  }
  const eintragResources: EintragResource[] = [];
  for await (let eintrag of eintragListe) {
    const ersteller = await Pfleger.findById(eintrag.ersteller).exec();
    const eintragPush = {
      id: eintrag.id,
      ersteller: String(eintrag.ersteller),
      erstellerName: ersteller?.name,
      protokoll: String(eintrag.protokoll),
      getraenk: eintrag.getraenk,
      menge: eintrag.menge,
      kommentar: eintrag.kommentar,
      createdAt: eintrag.createdAt
        ? dateToString(eintrag.createdAt)!
        : undefined,
    };
    eintragResources.push(eintragPush);
  }
  return eintragResources;
}

/**
 * Liefert die EintragResource mit angegebener ID.
 * Falls kein Eintrag gefunden wurde, wird ein Fehler geworfen.
 */
export async function getEintrag(id: string): Promise<EintragResource> {
  const eintrag = await Eintrag.findById(id).exec();
  if (eintrag) {
    const ersteller = await Pfleger.findById(eintrag.ersteller).exec();
    return {
      id: eintrag.id,
      ersteller: String(eintrag.ersteller),
      erstellerName: ersteller?.name,
      protokoll: String(eintrag.protokoll),
      getraenk: eintrag.getraenk,
      menge: eintrag.menge,
      kommentar: eintrag.kommentar,
      createdAt: eintrag.createdAt
        ? dateToString(eintrag.createdAt)!
        : undefined,
    };
  }
  throw new Error("Eintrag wurde nicht gefunden");
}

/**
 * Erzeugt eine Eintrag.
 * Daten, die berechnet werden aber in der gegebenen Ressource gesetzt sind, werden ignoriert.
 * Falls die Liste geschlossen (done) ist, wird ein Fehler wird geworfen.
 */
export async function createEintrag(
  eintragResource: EintragResource
): Promise<EintragResource> {
  const pfleger = await Pfleger.findById(eintragResource.ersteller).exec();
  if (!pfleger) {
    throw new Error(`No pfleger found with id ${eintragResource.ersteller}`);
  }
  const protokoll = await Protokoll.findById(eintragResource.protokoll).exec();
  if (!protokoll) {
    throw new Error(`No protokoll found with id ${eintragResource.protokoll}`);
  }
  if (protokoll.closed) {
    throw new Error(`Protokoll ${protokoll.id} is already closed`);
  }

  const eintrag = await Eintrag.create({
    getraenk: eintragResource.getraenk,
    menge: eintragResource.menge,
    kommentar: eintragResource.kommentar,
    ersteller: eintragResource.ersteller,
    protokoll: eintragResource.protokoll,
  });
  return {
    id: eintrag.id,
    getraenk: eintrag.getraenk,
    menge: eintrag.menge,
    kommentar: eintrag.kommentar,
    ersteller: pfleger.id,
    erstellerName: pfleger.name,
    createdAt: dateToString(eintrag.createdAt!),
    protokoll: protokoll.id,
  };
}

/**
 * Updated eine Eintrag. Es können nur Name, Quantity und Remarks geändert werden.
 * Aktuell können Eintrags nicht von einem Protokoll in einen anderen verschoben werden.
 * Auch kann der Creator nicht geändert werden.
 * Falls die Protokoll oder Creator geändert wurde, wird dies ignoriert.
 */
export async function updateEintrag(
  eintragResource: EintragResource
): Promise<EintragResource> {
  let updatingEintrag = await Eintrag.findById(eintragResource.id).exec();
  if (!updatingEintrag) throw new Error("Eintrag wurde nicht gefunden");

  updatingEintrag.getraenk = eintragResource.getraenk;
  updatingEintrag.menge = eintragResource.menge;
  updatingEintrag.kommentar = eintragResource.kommentar;

  let savedEintrag = await updatingEintrag.save();
  const ersteller = await Pfleger.findById(savedEintrag.ersteller).exec();
  return {
    id: savedEintrag.id,
    getraenk: savedEintrag.getraenk,
    menge: savedEintrag.menge,
    kommentar: savedEintrag.kommentar,
    ersteller: String(savedEintrag.ersteller),
    erstellerName: String(ersteller?.name),
    createdAt: dateToString(savedEintrag.createdAt!),
    protokoll: String(savedEintrag.protokoll),
  };
}

/**
 * Beim Löschen wird das Eintrag über die ID identifiziert.
 * Falls es nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 */
export async function deleteEintrag(id: string): Promise<void> {
  const eintrag = await Eintrag.findById(id).exec();
  if (!eintrag)
    throw new Error(
      "Das Protokolllement existiert nicht oder wurde bereits gelöscht"
    );

  await Eintrag.findById(id).deleteOne();
  const deleteted = await Eintrag.findById(id).exec();
  if (deleteted) throw new Error("Das Protokollelement existiert immer noch");
}
