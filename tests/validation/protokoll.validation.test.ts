import dotenv from "dotenv";
dotenv.config();

import "restmatcher";
import supertest from "supertest";
import { PflegerResource, ProtokollResource } from "../../src/Resources";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";

let pomfrey: PflegerResource;
let fredsProtokoll: ProtokollResource;

beforeEach(async () => {
  pomfrey = await createPfleger({
    name: "Poppy Pomfrey",
    password: "12345bcdABCD..;,.",
    admin: false,
  });
  fredsProtokoll = await createProtokoll({
    patient: "Fred Weasly",
    datum: "01.10.2023",
    public: true,
    closed: false,
    ersteller: pomfrey.id!,
  });
});

test("/api/protokoll GET, ungültige ID", async () => {
  const testee = supertest(app);
  const response = await testee.get(`/api/protokoll/1234`);

  expect(response).toHaveValidationErrorsExactly({
    status: "400",
    params: "id",
  });
});

test("/api/protokoll PUT, verschiedene ID (params und body)", async () => {
  const testee = supertest(app);
  const invalidProtokollID = pomfrey.id!;
  const update: ProtokollResource = {
    ...fredsProtokoll,
    id: invalidProtokollID,
    patient: "George Weasly",
  };
  const response = await testee
    .put(`/api/protokoll/${fredsProtokoll.id}`)
    .send(update);

  expect(response).toHaveValidationErrorsExactly({
    status: "400",
    params: "id",
    body: "id",
  });
});

test("/api/protokoll POST, fehlende Felder", async () => {
  const testee = supertest(app);
  const invalidProtokoll = {
    datum: "01.10.2023",
    public: true,
    closed: false,
    ersteller: pomfrey.id!,
  };
  const response = await testee.post("/api/protokoll").send(invalidProtokoll);

  expect(response).toHaveValidationErrorsExactly({
    status: "400",
    body: "patient",
  });
});

test("/api/protokoll POST, ungültige Datentypen", async () => {
  const testee = supertest(app);
  const invalidProtokoll = {
    patient: 123,
    datum: "01.10.2023",
    public: "true",
    closed: "false",
    ersteller: "not-a-valid-id",
  };
  const response = await testee.post("/api/protokoll").send(invalidProtokoll);

  expect(response.status).toBe(400);
});

test("/api/protokoll PUT, ungültige Länge des Patientenfeldes", async () => {
  const testee = supertest(app);
  const update: ProtokollResource = {
    ...fredsProtokoll,
    patient: "a".repeat(101), // ungültige Länge
  };
  const response = await testee
    .put(`/api/protokoll/${fredsProtokoll.id}`)
    .send(update);

  expect(response).toHaveValidationErrorsExactly({
    status: "400",
    body: "patient",
  });
});

test("/api/protokoll DELETE, ungültige ID", async () => {
  const testee = supertest(app);
  const response = await testee.delete(`/api/protokoll/1234`);

  expect(response).toHaveValidationErrorsExactly({
    status: "400",
    params: "id",
  });
});

test("/api/protokoll GET /:id/eintraege, ungültige ID", async () => {
  const testee = supertest(app);
  const response = await testee.get(`/api/protokoll/1234/eintraege`);

  expect(response).toHaveValidationErrorsExactly({
    status: "400",
    params: "id",
  });
});

test("/api/protokoll POST, gültiges Protokoll", async () => {
  const testee = supertest(app);
  const validProtokoll = {
    patient: "Harry Potter",
    datum: "01.11.2023",
    public: true,
    closed: false,
    ersteller: pomfrey.id!,
  };
  const response = await testee.post("/api/protokoll").send(validProtokoll);

  expect(response.status).toBe(201);
  expect(response.body).toMatchObject(validProtokoll);
});

test("/api/protokoll PUT, gültiges Protokoll", async () => {
  const testee = supertest(app);
  const update: ProtokollResource = {
    ...fredsProtokoll,
    patient: "George Weasly",
  };
  const response = await testee
    .put(`/api/protokoll/${fredsProtokoll.id}`)
    .send(update);

  expect(response.status).toBe(200);
  expect(response.body.patient).toBe("George Weasly");
});
