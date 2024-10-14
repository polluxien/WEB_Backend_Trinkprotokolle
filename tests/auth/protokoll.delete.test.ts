import dotenv from "dotenv";
dotenv.config();

import "restmatcher";
import supertest from "supertest";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";
import { Gender } from "../../src/model/PflegerModel"

let idBehrens: string;
let idProtokoll: string;

beforeEach(async () => {
  const behrens = await createPfleger({
    name: "Hofrat Behrens",
    password: "Geheim1234..!",
    admin: false,
    gender: Gender.Männlich,
    adress: "Behrensenstraße 14, 14059 Berlin",
    position: "Teamleader",
    birth: new Date("1975-12-11"),
  });
  idBehrens = behrens.id!;
  const protokoll = await createProtokoll({
    patient: "H. Castorp",
    datum: `01.11.1912`,
    ersteller: idBehrens,
    public: true,
  });
  idProtokoll = protokoll.id!;
});

test("/api/protokoll DELETE, Positivtest (mit Authentifizierung)", async () => {
  await performAuthentication("Hofrat Behrens", "Geheim1234..!");
  const testee = supertestWithAuth(app);
  const response = await testee.delete(`/api/protokoll/${idProtokoll}`);
  expect(response).statusCode(204);
});

test("/api/protokoll DELETE, Negativtest (ohne Authentifizierung)", async () => {
  const testee = supertest(app);
  const response = await testee.delete(`/api/protokoll/${idProtokoll}`);
  expect(response).statusCode(401);
});
