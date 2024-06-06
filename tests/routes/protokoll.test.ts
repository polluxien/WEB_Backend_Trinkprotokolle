// @ts-nocxheck

import supertest from "supertest";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";
import { createEintrag } from "../../src/services/EintragService";

let idBehrens: string;
let idProtokoll: string;

beforeEach(async () => {
  // create a pfleger
  const behrens = await createPfleger({
    name: "Hofrat Behrens",
    password: "geheim",
    admin: false,
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

test("/api/protokoll/:id/eintrage get, 5 Einträge", async () => {
  for (let i = 1; i <= 5; i++) {
    await createEintrag({
      menge: 50,
      getraenk: "BHTee",
      protokoll: idProtokoll,
      ersteller: idBehrens,
    });
  }
  const testee = supertest(app);
  const response = await testee.get(`/api/protokoll/${idProtokoll}/eintraege`);
  expect(response.statusCode).toBe(200);
  expect(response.body).toBeInstanceOf(Array);
  expect(response.body.length).toBe(5);
});

test("/api/protokoll/:id/eintrage get, keine Einträge", async () => {
  const testee = supertest(app);
  const response = await testee.get(`/api/protokoll/${idProtokoll}/eintraege`);
  expect(response.statusCode).toBe(200);
  expect(response.body).toBeInstanceOf(Array);
  expect(response.body.length).toBe(0);
});

test("/api/protokoll/:id/eintrage get, falsche Protokoll-ID", async () => {
  const testee = supertest(app);
  const response = await testee.get(`/api/protokoll/${idBehrens}/eintraege`);
  expect(response.statusCode).toBe(200);
});

test("GET /api/protokoll/:id - get specific protocol", async () => {
  const testee = supertest(app);
  const response = await testee.get(`/api/protokoll/${idProtokoll}`);
  expect(response.statusCode).toBe(200);
});

test("POST /api/protokoll - neues protocol", async () => {
  const testee = supertest(app);
  const newProtokoll = {
    patient: "J. Ziemssen",
    datum: "02.12.1912",
    ersteller: idBehrens,
    public: true,
    closed: false,
  };
  const response = await testee
    .post("/api/protokoll")
    .send(newProtokoll);
  expect(response.statusCode).toBe(201);
  expect(response.body).toHaveProperty("id");
  expect(response.body).toHaveProperty("patient", "J. Ziemssen");
});

/*
test("PUT /api/protokoll/:id - update protocol", async () => {
  const testee = supertest(app);
  const updatedProtokoll = {
    patient: "J. Ziemssen",
    datum: "03.12.1912",
    ersteller: idBehrens,
    public: false,
    closed: true,
  };
  const response = await testee
    .put(`/api/protokoll/${idProtokoll}`)
    .send(updatedProtokoll);
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty("id", idProtokoll);
  expect(response.body).toHaveProperty("patient", "J. Ziemssen");
});
*/

test("DELETE /api/protokoll/:id - delete protocol", async () => {
  const testee = supertest(app);
  const response = await testee.delete(`/api/protokoll/${idProtokoll}`);
  expect(response.statusCode).toBe(204);

  const getResponse = await testee.get(`/api/protokoll/${idProtokoll}`);
  expect(getResponse.statusCode).toBe(404);
});

test("GET /api/protokoll/:id/eintraege - get 5 entries", async () => {
  // Create 5 Einträge
  for (let i = 1; i <= 5; i++) {
    await createEintrag({
      getraenk: "BHTee",
      menge: i * 10,
      protokoll: idProtokoll,
      ersteller: idBehrens,
    });
  }
  const testee = supertest(app);
  const response = await testee.get(`/api/protokoll/${idProtokoll}/eintraege`);
  expect(response.statusCode).toBe(200);
  expect(response.body).toBeInstanceOf(Array);
  expect(response.body.length).toBe(5);
});

test("GET /api/protokoll/:id/eintraege - invalid protocol ID", async () => {
  const testee = supertest(app);
  const response = await testee.get(`/api/protokoll/45u775785/eintraege`);
  expect(response.statusCode).toBe(400);
});
