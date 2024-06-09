import express from "express";
export const eintragRouter = express.Router();

import { createProtokoll } from "../../src/services/ProtokollService";
import { createPfleger } from "../../src/services/PflegerService";
import supertest from "supertest";
import app from "../../src/app";
import { createEintrag } from "../../src/services/EintragService";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let idBehrens: string;
let idProtokoll: string;

beforeEach(async () => {
  // Einen Pfleger erstellen
  const behrens = await createPfleger({
    name: "Hofrat Behrens",
    password: "yswexrdtcfzguhiFD5$&/",
    admin: false,
  });
  idBehrens = behrens.id!;

  // Ein Protokoll erstellen
  const protokoll = await createProtokoll({
    patient: "H. Castorp",
    datum: `01.11.1912`,
    ersteller: idBehrens,
    public: true,
  });
  idProtokoll = protokoll.id!;

  await performAuthentication("Hofrat Behrens","yswexrdtcfzguhiFD5$&/");
});

test("/api/eintrag/:id - Eintrag abrufen", async () => {
  const newEintrag = await createEintrag({
    getraenk: "Wasser",
    menge: 250,
    ersteller: idBehrens,
    protokoll: idProtokoll,
  });
  const testee = supertest(app);
  const response = await testee.get(`/api/eintrag/${newEintrag.id}`);
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty("id", newEintrag.id);
});

test("POST /api/eintrag - Neuen Eintrag erstellen", async () => {
  const newEintrag = {
    getraenk: "Tee",
    menge: 200,
    ersteller: idBehrens,
    protokoll: idProtokoll,
  };
  const testee = supertestWithAuth(app);
  const response = await testee.post("/api/eintrag").send(newEintrag);
  expect(response.statusCode).toBe(201);
  expect(response.body).toHaveProperty("id");
  expect(response.body).toHaveProperty("getraenk", "Tee");
});

/*
test("PUT /api/eintrag/:id - Eintrag aktualisieren", async () => {
  const newEintrag = await createEintrag({
    getraenk: "Kaffee",
    menge: 300,
    ersteller: idBehrens,
    protokoll: idProtokoll,
  });
  const updatedEintrag = {
    getraenk: "Kaffee",
    menge: 500,
    ersteller: idBehrens,
    protokoll: idProtokoll,
  };
  const testee = supertest(app);
  const response = await testee
    .put(`/api/eintrag/${newEintrag.id}`)
    .send(updatedEintrag);
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty("id", newEintrag.id);
  expect(response.body).toHaveProperty("menge", 500);
});
*/

test("DELETE /api/eintrag/:id - Eintrag löschen", async () => {
  const newEintrag = await createEintrag({
    getraenk: "Saft",
    menge: 150,
    ersteller: idBehrens,
    protokoll: idProtokoll,
  });
  const testee = supertestWithAuth(app);
  const response = await testee.delete(`/api/eintrag/${newEintrag.id}`);
  expect(response.statusCode).toBe(204);

  // Überprüfen, ob der Eintrag gelöscht wurde
  const getResponse = await testee.get(`/api/eintrag/${newEintrag.id}`);
  expect(getResponse.statusCode).toBe(404);
});

test("GET /api/eintrag/protokoll/:id - Alle Einträge eines Protokolls abrufen", async () => {
  await createEintrag({
    getraenk: "Wasser",
    menge: 200,
    ersteller: idBehrens,
    protokoll: idProtokoll,
  });
  await createEintrag({
    getraenk: "Tee",
    menge: 250,
    ersteller: idBehrens,
    protokoll: idProtokoll,
  });
  const testee = supertest(app);
  const response = await testee.get(`/api/eintrag/protokoll/${idProtokoll}`);
  expect(response.statusCode).toBe(200);
  expect(response.body).toBeInstanceOf(Array);
  expect(response.body.length).toBe(2);
});


//--- Runde 2

// Positive GET Test - Get Eintrag by ID
test("GET /api/eintrag/:id - Eintrag abrufen", async () => {
  const newEintrag = await createEintrag({
    getraenk: "Wasser",
    menge: 250,
    ersteller: idBehrens,
    protokoll: idProtokoll,
  });
  const testee = supertest(app);
  const response = await testee.get(`/api/eintrag/${newEintrag.id}`);
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty("id", newEintrag.id);
});

// Positive POST Test - Create Eintrag
test("POST /api/eintrag - Neuen Eintrag erstellen", async () => {
  const newEintrag = {
    getraenk: "Tee",
    menge: 200,
    ersteller: idBehrens,
    protokoll: idProtokoll,
  };
  const testee = supertestWithAuth(app);
  const response = await testee.post("/api/eintrag").send(newEintrag);
  expect(response.statusCode).toBe(201);
  expect(response.body).toHaveProperty("id");
  expect(response.body).toHaveProperty("getraenk", "Tee");
});

// Negative POST Test - Validation Error
test("POST /api/eintrag - Validation Error", async () => {
  const newEintrag = {
    // Invalid data (empty string for getraenk)
    getraenk: "",
    menge: 200,
    ersteller: idBehrens,
    protokoll: idProtokoll,
  };
  const testee = supertestWithAuth(app);
  const response = await testee.post("/api/eintrag").send(newEintrag);
  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty("errors");
});

// Positive PUT Test - Update Eintrag
test("PUT /api/eintrag/:id - Eintrag aktualisieren", async () => {
  const newEintrag = await createEintrag({
    getraenk: "Kaffee",
    menge: 300,
    ersteller: idBehrens,
    protokoll: idProtokoll,
  });
  const updatedEintrag = {
    getraenk: "Kaffee",
    menge: 500,
    ersteller: idBehrens,
    protokoll: idProtokoll,
  };
  const testee = supertestWithAuth(app);
  const response = await testee
    .put(`/api/eintrag/${newEintrag.id}`)
    .send(updatedEintrag);
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty("id", newEintrag.id);
  expect(response.body).toHaveProperty("menge", 500);
});

// Negative PUT Test - Mismatched ID
test("PUT /api/eintrag/:id - IDs do not match", async () => {
  const newEintrag = await createEintrag({
    getraenk: "Kaffee",
    menge: 300,
    ersteller: idBehrens,
    protokoll: idProtokoll,
  });
  const updatedEintrag = {
    getraenk: "Kaffee",
    menge: 500,
    ersteller: idBehrens,
    protokoll: idProtokoll,
  };
  const testee = supertestWithAuth(app);
  const response = await testee
    .put(`/api/eintrag/invalid-id`)
    .send(updatedEintrag);
  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty("errors");
});

// Positive DELETE Test - Delete Eintrag
test("DELETE /api/eintrag/:id - Eintrag löschen", async () => {
  const newEintrag = await createEintrag({
    getraenk: "Saft",
    menge: 150,
    ersteller: idBehrens,
    protokoll: idProtokoll,
  });
  const testee = supertestWithAuth(app);
  const response = await testee.delete(`/api/eintrag/${newEintrag.id}`);
  expect(response.statusCode).toBe(204);

  // Überprüfen, ob der Eintrag gelöscht wurde
  const getResponse = await testee.get(`/api/eintrag/${newEintrag.id}`);
  expect(getResponse.statusCode).toBe(404);
});

// Positive GET Test - Get Einträge by Protokoll ID
test("GET /api/eintrag/protokoll/:id - Alle Einträge eines Protokolls abrufen", async () => {
  await createEintrag({
    getraenk: "Wasser",
    menge: 200,
    ersteller: idBehrens,
    protokoll: idProtokoll,
  });
  await createEintrag({
    getraenk: "Tee",
    menge: 250,
    ersteller: idBehrens,
    protokoll: idProtokoll,
  });
  const testee = supertest(app);
  const response = await testee.get(`/api/eintrag/protokoll/${idProtokoll}`);
  expect(response.statusCode).toBe(200);
  expect(response.body).toBeInstanceOf(Array);
  expect(response.body.length).toBe(2);
});
