// istanbul ignore file

import { Gender, PflegerResource, ProtokollResource } from "./Resources";
import { logger } from "./logger";
import { Eintrag } from "./model/EintragModel";
import { Pfleger } from "./model/PflegerModel";
import { Protokoll } from "./model/ProtokollModel";
import { createEintrag } from "./services/EintragService";
import { createPfleger } from "./services/PflegerService";
import { createProtokoll } from "./services/ProtokollService";

/**
 * Erzeugt einen Benutzer "Behrens" und ein paar vom ihm angelegte Protokolle mit Einträgen.
 * Diese Funktion benötigen wir später zu Testzwecken im Frontend.
 */

export async function prefillDB(): Promise<{
  pflegerMicha: PflegerResource;
  pflegerLisa: PflegerResource;
  pflegerToni: PflegerResource;
  protokolle: ProtokollResource[];
}> {
  await Pfleger.syncIndexes();
  await Protokoll.syncIndexes();
  await Eintrag.syncIndexes();

  function logPflegerInfo(name: string, admin: boolean) {
    logger.info(
      `Prefill DB with test data, ${
        admin ? "ADMIN" : ""
      } pfleger: ${name}, password: 123_abc_ABC`
    );
  }

  const pflegerMicha = await createPfleger({
    name: "Micha",
    password: "123_abc_ABC",
    admin: true,
    gender: Gender.Männlich,
    adress: "Behrensenstraße 14, 14059 Berlin",
    position: "Abteilungsleiter",
    birth: "4.10.1975",
  });

  const pflegerLisa = await createPfleger({
    name: "Lisa",
    password: "123_abc_ABC",
    admin: true,
    gender: Gender.Weiblich,
    adress: "Prinzenalle 33, 13359 Berlin",
    position: "Ambulante Pflegerin",
    birth: "12.11.1983",
  });

  const pflegerToni = await createPfleger({
    name: "Toni",
    password: "123_abc_ABC",
    admin: false,
    gender: Gender.KeineAngabe,
    adress: "Prinzenalle 33, 13359 Berlin",
    position: "Praktikant",
    birth: "07.03.2001",
  });

  const protokolle: ProtokollResource[] = [];
  const itemsPerList = [
    [1, 4, 2, 0],
    [3, 5, 7],
  ];
  const patienten = [
    "Sabrina Kurz",
    "Clawdia Müller",
    "Uhmut Thiel",
    "Tobias Reiß",
  ];
  const datumPostfix = [".10.2023", ".11.2023", ".03.2023", ".07.2023"];
  const publicValue = [true, false];
  const getraenke = ["Kaffee", "Tee", "Sekt", "Limo", "Wasser"];
  const mengen = [150, 180, 200, 300];
  const pflegerList: PflegerResource[] = [
    pflegerToni,
    pflegerMicha,
    pflegerLisa,
  ];

  for (let y = 0; y < pflegerList.length; y++) {
    for (let k = 0; k < 2; k++) {
      for (let i = 0; i < itemsPerList[k].length; i++) {
        const protokoll = await createProtokoll({
          patient: patienten[k],
          datum: i + 1 + datumPostfix[k],
          public: publicValue[k],
          ersteller: pflegerList[y].id!,
          closed: false,
          gesamtMenge: 989898,
        });
        let gesamtMenge = 0;
        for (let m = 0; m < itemsPerList[k][i]; m++) {
          const eintrag = await createEintrag({
            getraenk: getraenke[m % getraenke.length],
            menge: mengen[m % mengen.length],
            protokoll: protokoll.id!,
            ersteller: pflegerList[y].id!,
          });
          gesamtMenge += eintrag.menge;
        }
        protokolle.push({ ...protokoll, gesamtMenge: gesamtMenge });
      }
    }
    logPflegerInfo(pflegerList[y].name, pflegerList[y].admin);
  }
  return { pflegerMicha, pflegerLisa, pflegerToni, protokolle };
}
