import supertest from "supertest";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";
import { parseCookies } from "restmatcher";
import { performAuthentication } from "../supertestWithAuth";

let idBehrens: string;
let idProtokoll: string;

//Hilfsfunktion welche einlogt und JWT token gibt
async function getJWTToken() {
  const loginData = { name: "Hofrat Behrens", password: "Testpass?23" };
  const response = await supertest(app).post("/api/login").send(loginData);
  return response.body.token;
}

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

//Alten Tests ohne validation
/*

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

*/

test("POST /api/pfleger - Pfleger erstellen", async () => {
  const testee = supertest(app);
  const newPfleger = {
    name: "Neuer Pfleger",
    password: "Testpass!99",
    admin: false,
  };
  const token = await getJWTToken();
  const response = await testee
    .post("/api/pfleger")
    .set("Authorization", `Bearer ${token}`)
    .send(newPfleger);
  expect(response.statusCode).toBe(201);
  //expect(response.body).toHaveProperty("id");
  expect(response.body).toHaveProperty("name", "Neuer Pfleger");
});

test("DELETE /api/pfleger/:id - Pfleger löschen", async () => {
  const testee = supertest(app);
  const token = await getJWTToken();
  const response = await testee
    .delete(`/api/pfleger/${idBehrens}`)
    .set("Authorization", `Bearer ${token}`);
  expect(response.statusCode).toBe(204);

  // Überprüfen, ob der Pfleger gelöscht wurde
  const getResponse = await testee
    .get(`/api/pfleger/${idBehrens}`)
    .set("Authorization", `Bearer ${token}`);
  expect(getResponse.statusCode).toBe(404);
});

test("PUT /api/pfleger/:id - Pfleger aktualisieren aber Pflegerid exestiert nicht", async () => {
  const testee = supertest(app);
  const token = await getJWTToken();
  const updatedPfleger = {
    name: "Geänderter Pfleger",
    admin: true,
  };
  const response = await testee
    .put(`/api/pfleger/${123345678}`)
    .set('Authorization', `Bearer ${token}`)
    .send(updatedPfleger);
  expect(response.statusCode).toBe(400);
});

//Anlauf zwei

// Positive GET Test - Get all Pfleger
test("GET /api/pfleger/alle - Alle Pfleger abrufen", async () => {
  const testee = supertest(app);
  const response = await testee.get(`/api/pfleger/alle`);
  expect(response.statusCode).toBe(200);
  expect(response.body).toBeInstanceOf(Array);
});

// Positive POST Test - Create Pfleger
test("POST /api/pfleger - Pfleger erstellen", async () => {
  const testee = supertest(app);
  const newPfleger = {
    name: "Neuer Pfleger",
    password: "Testpass!99",
    admin: false,
  };
  const token = await getJWTToken();
  const response = await testee
    .post("/api/pfleger")
    .set("Authorization", `Bearer ${token}`)
    .send(newPfleger);
  expect(response.statusCode).toBe(201);
  expect(response.body).toHaveProperty("name", "Neuer Pfleger");
});

// Negative POST Test - Validation Error
test("POST /api/pfleger - Validation Error", async () => {
  const testee = supertest(app);
  const newPfleger = {
    name: "NP",
    password: "short",
    admin: false,
  };
  const token = await getJWTToken();
  const response = await testee
    .post("/api/pfleger")
    .set("Authorization", `Bearer ${token}`)
    .send(newPfleger);
  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty("errors");
});

// Positive DELETE Test - Delete Pfleger
test("DELETE /api/pfleger/:id - Pfleger löschen", async () => {
  const testee = supertest(app);
  const token = await getJWTToken();
  const response = await testee
    .delete(`/api/pfleger/${idBehrens}`)
    .set("Authorization", `Bearer ${token}`);
  expect(response.statusCode).toBe(204);

  // Überprüfen, ob der Pfleger gelöscht wurde
  const getResponse = await testee
    .get(`/api/pfleger/${idBehrens}`)
    .set("Authorization", `Bearer ${token}`);
  expect(getResponse.statusCode).toBe(404);
});

// Negative DELETE Test - Invalid ID
test("DELETE /api/pfleger/:id - Invalid ID", async () => {
  const testee = supertest(app);
  const token = await getJWTToken();
  const response = await testee
    .delete(`/api/pfleger/invalid-id`)
    .set("Authorization", `Bearer ${token}`);
  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty("errors");
});

// Positive PUT Test - Update Pfleger
test("PUT /api/pfleger/:id - Pfleger aktualisieren", async () => {
  const testee = supertest(app);
  const token = await getJWTToken();
  const updatedPfleger = {
    id: idBehrens,
    name: "Geänderter Pfleger",
    admin: true,
  };
  const response = await testee
    .put(`/api/pfleger/${idBehrens}`)
    .set("Authorization", `Bearer ${token}`)
    .send(updatedPfleger);
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty("name", "Geänderter Pfleger");
  expect(response.body).toHaveProperty("admin", true);
});

// Negative PUT Test - Mismatched ID
test("PUT /api/pfleger/:id - IDs do not match", async () => {
  const testee = supertest(app);
  const token = await getJWTToken();
  const updatedPfleger = {
    id: "another-id",
    name: "Geänderter Pfleger",
    admin: true,
  };
  const response = await testee
    .put(`/api/pfleger/${idBehrens}`)
    .set("Authorization", `Bearer ${token}`)
    .send(updatedPfleger);
  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty("errors");
  expect(response.body.errors).toEqual(expect.arrayContaining([
    expect.objectContaining({ msg: "IDs do not match" })
  ]));
});

// Negative PUT Test - Validation Error
test("PUT /api/pfleger/:id - Validation Error", async () => {
  const testee = supertest(app);
  const token = await getJWTToken();
  const updatedPfleger = {
    id: idBehrens,
    name: "NP",
    admin: true,
  };
  const response = await testee
    .put(`/api/pfleger/${idBehrens}`)
    .set("Authorization", `Bearer ${token}`)
    .send(updatedPfleger);
  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty("errors");
});

// Negative DELETE Test - Unauthorized
test("DELETE /api/pfleger/:id - Unauthorized", async () => {
  const testee = supertest(app);
  const response = await testee
    .delete(`/api/pfleger/${idBehrens}`);
  expect(response.statusCode).toBe(401);
  expect(response.body).toHaveProperty("error", "Unauthorized");
});
