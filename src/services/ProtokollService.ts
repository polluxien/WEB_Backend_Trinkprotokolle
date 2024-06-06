import { ProtokollResource } from "../Resources";
import { Eintrag } from "../model/EintragModel";
import { Pfleger } from "../model/PflegerModel";
import { Protokoll } from "../model/ProtokollModel";
import { dateToString, stringToDate } from "./ServiceHelper";

/**
 * Gibt alle Protokolls zurück, die für einen Pfleger sichtbar sind. Dies sind:
 * - alle öffentlichen (public) Protokolls
 * - alle eigenen Protokolls, dies ist natürlich nur möglich, wenn die pflegerId angegeben ist.
 */
export async function getAlleProtokolle(
  pflegerId?: string
): Promise<ProtokollResource[]> {
  let protoPfleger: any[] = [];
  if (pflegerId)
    protoPfleger = await Protokoll.find({ ersteller: pflegerId }).exec();

  const publicListe = await Protokoll.find({ public: true }).exec();

  const uniqueProtokolle = new Map();
  for (const proto of protoPfleger) {
    uniqueProtokolle.set(proto.id.toString(), proto);
  }

  for (const proto of publicListe) {
    if (!uniqueProtokolle.has(proto.id.toString())) {
      uniqueProtokolle.set(proto.id.toString(), proto);
    }
  }

  const ersteller = pflegerId ? await Pfleger.findById(pflegerId).exec() : null;
  const protokollResources: ProtokollResource[] = [];
  for (let proto of uniqueProtokolle.values()) {
    const menge = await gesammtMenge(proto.id);
    const protoPush = {
      ersteller: proto.ersteller.toString(),
      erstellerName: ersteller ? ersteller.name : undefined,
      gesammtMenge: menge,
      patient: proto.patient,
      datum: dateToString(proto.datum),
      public: proto.public,
      closed: proto.closed,
      updatedAt: dateToString(proto.updatedAt),
      id: proto.id,
    };
    protokollResources.push(protoPush);
  }
  return protokollResources;
}

/**
 * Liefer die Protokoll mit angegebener ID.
 * Falls keine Protokoll gefunden wurde, wird ein Fehler geworfen.
 */
export async function getProtokoll(id: string): Promise<ProtokollResource> {
  const proto = await Protokoll.findById(id).exec();
  if (proto != null) {
    const ersteller = await Pfleger.findById(proto.ersteller).exec();
    const menge = await gesammtMenge(proto.id);
    return {
      ersteller: proto.ersteller.toString(),
      erstellerName: ersteller?.name,
      patient: proto.patient,
      datum: dateToString(proto.datum),
      gesamtMenge: menge ? menge : 0,
      public: proto.public,
      closed: proto.closed,
      updatedAt: dateToString(proto.updatedAt!),
      id: proto.id,
    };
  }
  throw new Error("Protokoll wurde nicht gefunden");
}

/**
 * Erzeugt das Protokoll.
 */
export async function createProtokoll(
  protokollResource: ProtokollResource
): Promise<ProtokollResource> {
  const pfleger = await Pfleger.findById(protokollResource.ersteller).exec();
  if (!pfleger) {
    throw new Error(
      `Kein Pfleger gefunden mit id ${protokollResource.ersteller}`
    );
  }
  const ersteller = await Pfleger.findById(protokollResource.ersteller).exec();
  const proto = await Protokoll.create({
    patient: protokollResource.patient,
    datum: stringToDate(protokollResource.datum),
    public: protokollResource.public,
    closed: protokollResource.closed,
    ersteller: protokollResource.ersteller,
  });
  const protoBack: ProtokollResource = {
    ersteller: proto.ersteller.toString(),
    erstellerName: ersteller?.name,
    gesamtMenge: 0,
    patient: proto.patient,
    datum: dateToString(proto.datum),
    public: proto.public,
    closed: proto.closed,
    updatedAt: dateToString(proto.updatedAt!),
    id: proto.id,
  };
  return protoBack;
}

/**
 * Ändert die Daten einer Protokoll.
 */
export async function updateProtokoll(
  protokollResource: ProtokollResource
): Promise<ProtokollResource> {
  let updatingproto = await Protokoll.findById(protokollResource.id).exec();
  if (!updatingproto) throw new Error("Prototokoll wurde nicht gefunden");

  updatingproto.patient = protokollResource.patient;
  updatingproto.datum = stringToDate(protokollResource.datum);
  updatingproto.public = !!protokollResource.public;
  updatingproto.closed = !!protokollResource.closed;
  updatingproto.updatedAt = new Date();
  const savedEintrag = await updatingproto.save();

  const ersteller = await Pfleger.findById(protokollResource.ersteller).exec();
  const menge = await gesammtMenge(savedEintrag.id);
  return {
    ersteller: savedEintrag.ersteller.toString(),
    erstellerName: ersteller?.name,
    patient: savedEintrag.patient,
    datum: dateToString(savedEintrag.datum!),
    gesamtMenge: menge ? menge : 0,
    public: savedEintrag.public,
    closed: savedEintrag.closed,
    updatedAt: dateToString(savedEintrag.updatedAt!),
    id: savedEintrag.id,
  };
}

/**
 * Beim Löschen wird die Protokoll über die ID identifiziert.
 * Falls keine Protokoll nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 * Wenn die Protokoll gelöscht wird, müssen auch alle zugehörigen Eintrags gelöscht werden.
 */
export async function deleteProtokoll(id: string): Promise<void> {
  const proto = await Protokoll.findById(id).exec();
  if (!proto)
    throw new Error(
      "Das Protokolllement existiert nicht oder wurde bereits gelöscht"
    );

  await Protokoll.findById(id).deleteOne();
  await Eintrag.deleteMany({ ersteller: id });
  const deleteted = await Protokoll.findById(id).exec();
  if (deleteted) throw new Error("Das Protokollelement existiert immer noch");
}

async function gesammtMenge(protoID: string): Promise<number> {
  const eintragList = await Eintrag.find({ protokoll: protoID });
  let gesamt = 0;
  for (let i = 0; i < eintragList.length; i++) {
    if (eintragList[i].menge !== undefined) gesamt += eintragList[i].menge;
  }
  return gesamt;
}
