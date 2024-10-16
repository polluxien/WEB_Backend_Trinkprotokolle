import dotenv from "dotenv";
dotenv.config();

import "restmatcher";
import supertest from "supertest";
import { createPfleger } from "../../src/services/PflegerService";
import { PflegerResource } from "../../src/Resources";
import app from "../../src/app";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";
import { Gender } from "../../src/model/PflegerModel";


let pomfrey: PflegerResource;

beforeEach(async () => {
  pomfrey = await createPfleger({
    name: "Poppy Pomfrey",
    password: "12345bcdABCD..;,.",
    admin: false,
    gender: Gender.Weiblich,
    adress: "Fuchsbau 7, 1010 London",
    position: "Teamleader",
    birth: "1975-12-11",
  });

  await performAuthentication("Poppy Pomfrey", "12345bcdABCD..;,.");
});

test("/api/pfleger GET /alle", async () => {
  const testee = supertest(app);
  const response = await testee.get("/api/pfleger/alle");

  expect(response.status).toBe(200);
});

test("/api/pfleger POST, fehlende Felder", async () => {
  const testee = supertest(app);
  const invalidPfleger = {
    password: "12345bcdABCD..;,.",
    admin: false,
  };
  const response = await testee.post("/api/pfleger").send(invalidPfleger);

  expect(response).toHaveValidationErrorsExactly({ status: "401" });
});

test("/api/pfleger POST, ungültiges Passwort", async () => {
  const testee = supertest(app);
  const invalidPfleger = {
    name: "Severus Snape",
    password: "weakpassword", // schwaches Passwort
  };
  const response = await testee.post("/api/pfleger").send(invalidPfleger);

  expect(response).toHaveValidationErrorsExactly({ status: "401" });
});

test("/api/pfleger PUT, verschiedene ID (params und body)", async () => {
  await performAuthentication("Poppy Pomfrey", "12345bcdABCD..;,.");
  const testee = supertestWithAuth(app);

  // Erstelle ein neues PflegerResource Objekt mit einer anderen ID
  const invalidPfleger: PflegerResource = {
    name: "Remus Lupin",
    password: "987654abcdABCD..;,.",
    admin: false,
    gender: Gender.Männlich,
    adress: "Behrensenstraße 14, 14059 Berlin",
    position: "Teamleader",
    birth: "1975-12-11",
  };
  const createdPfleger = await createPfleger(invalidPfleger);

  // Aktualisiere das PflegerResource Objekt mit der ID des erstellten Pflegers
  const update: PflegerResource = {
    ...pomfrey,
    id: createdPfleger.id,
    name: "Remus Lupin",
  };
  const response = await testee.put(`/api/pfleger/${pomfrey.id}`).send(update);

  // Erwarte, dass der Test die 400-Fehlerantwort zurückgibt
  expect(response.status).toBe(400);
});

test("/api/pfleger PUT, fehlende Felder", async () => {
  const testee = supertestWithAuth(app);
  const update = {
    admin: true,
  };
  const response = await testee.put(`/api/pfleger/${pomfrey.id}`).send(update);

  expect(response.status).toBe(400);
});

test("/api/pfleger DELETE, ungültige ID", async () => {
  const testee = supertestWithAuth(app);
  const response = await testee.delete(`/api/pfleger/1234`);

  expect(response).toHaveValidationErrorsExactly({
    status: "400",
    params: "id",
  });
});
