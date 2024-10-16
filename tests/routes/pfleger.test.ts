import supertest from "supertest";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";
import { parseCookies } from "restmatcher";
import { performAuthentication } from "../supertestWithAuth";
import { Gender } from "../../src/model/PflegerModel";


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
    admin: true,
    gender: Gender.Männlich,
    adress: "Behrensenstraße 14, 14059 Berlin",
    position: "Teamleader",
    birth: "1975-12-11",
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

  await performAuthentication("Hofrat Behrens", "HTestpass?23");
});

test("GET /api/pfleger/alle - Alle Pfleger abrufen", async () => {
  const testee = supertest(app);
  const response = await testee.get(`/api/pfleger/alle`);
  expect(response.statusCode).toBe(200);
  expect(response.body).toBeInstanceOf(Array);
});

//Anlauf zwei

// Positive GET Test - Get all Pfleger
test("GET /api/pfleger/alle - Alle Pfleger abrufen", async () => {
  const testee = supertest(app);
  const response = await testee.get(`/api/pfleger/alle`);
  expect(response.statusCode).toBe(200);
  expect(response.body).toBeInstanceOf(Array);
});

// Negative DELETE Test - Unauthorized
test("DELETE /api/pfleger/:id - Unauthorized", async () => {
  const testee = supertest(app);
  const response = await testee.delete(`/api/pfleger/${idBehrens}`);
  expect(response.statusCode).toBe(401);
  expect(response.body).toHaveProperty("error", "Unauthorized");
});
