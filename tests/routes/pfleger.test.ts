import supertest from "supertest";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";
import { PflegerResource } from "../../src/Resources";

let idBehrens: string;
let idProtokoll: string;

beforeEach(async () => {
  // Pfleger erstellen
  const behrens = await createPfleger({
    name: "Hofrat Behrens",
    password: "Testpass?23",
    admin: false,
  });
  idBehrens = behrens.id!;
  // Protokoll erstellen
  const protokoll = await createProtokoll({
    patient: "H. Castorp",
    datum: `01.11.1912`,
    ersteller: idBehrens,
    public: true,
  });
  idProtokoll = protokoll.id!;
});

test("GET /api/pfleger/alle - Alle Pfleger abrufen", async () => {
  const testee = supertest(app);
  const response = await testee.get(`/api/pfleger/alle`);
  expect(response.statusCode).toBe(200);
  expect(response.body).toBeInstanceOf(Array);
});

test("POST /api/pfleger - Pfleger erstellen", async () => {
  const testee = supertest(app);
  const newPfleger = {
    name: "Neuer Pfleger",
    password: "Testpass!99",
    admin: false,
  };
  const response = await testee.post("/api/pfleger").send(newPfleger);
  expect(response.statusCode).toBe(201);
  //expect(response.body).toHaveProperty("id");
  expect(response.body).toHaveProperty("name", "Neuer Pfleger");
});

test("DELETE /api/pfleger/:id - Pfleger löschen", async () => {
  const testee = supertest(app);
  const response = await testee.delete(`/api/pfleger/${idBehrens}`);
  expect(response.statusCode).toBe(204);

  // Überprüfen, ob der Pfleger gelöscht wurde
  const getResponse = await testee.get(`/api/pfleger/${idBehrens}`);
  expect(getResponse.statusCode).toBe(404);
});

test("PUT /api/pfleger/:id - Pfleger aktualisieren aber Pflegerid exestiert nicht", async () => {
  const testee = supertest(app);
  const updatedPfleger = {
    name: "Geänderter Pfleger",
    admin: true,
  };
  const response = await testee
    .put(`/api/pfleger/${123345678}`)
    .send(updatedPfleger);
  expect(response.statusCode).toBe(400);
});

