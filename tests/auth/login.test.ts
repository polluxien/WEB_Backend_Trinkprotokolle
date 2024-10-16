// must be imported before any other imports
import dotenv from "dotenv";
dotenv.config();

import { parseCookies } from "restmatcher";
import supertest from "supertest";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { verifyPasswordAndCreateJWT } from "../../src/services/JWTService";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

import { Gender } from "../../src/model/PflegerModel";

beforeEach(async () => {
  await createPfleger({
    name: "John",
    password: "1234abcdABCD..;,.",
    admin: false,
    gender: Gender.Männlich,
    adress: "Behrensenstraße 14, 14059 Berlin",
    position: "Teamleader",
    birth: "1975-12-11",
  });
  await performAuthentication("John", "1234abcdABCD..;,.");
});

/**
 * Eigentlich sind das hier sogar 5 Tests!
 */
test(`/api/login POST, Positivtest`, async () => {
  const testee = supertest(app);
  const loginData = { name: "John", password: "1234abcdABCD..;,." };
  const response = parseCookies(
    await testee.post(`/api/login`).send(loginData)
  );
  expect(response).statusCode("2*");

  // added by parseCookies, similar to express middleware cookieParser
  expect(response).toHaveProperty("cookies"); // added by parseCookies
  expect(response.cookies).toHaveProperty("access_token"); // the cookie with the JWT
  const token = response.cookies.access_token;
  expect(token).toBeDefined();

  // added by parseCookies, array with raw cookies, i.e. with all options and value
  expect(response).toHaveProperty("cookiesRaw");
  const rawCookie = response.cookiesRaw.find((c) => c.name === "access_token");
  expect(rawCookie?.httpOnly).toBe(true);
  expect(rawCookie?.sameSite).toBe("None");
  expect(rawCookie?.secure).toBe(true);
});

//--- eigene Tests ------------------------------

test("/api/login POST, Positivtest", async () => {
  const testee = supertest(app);
  const loginData = { name: "John", password: "1234abcdABCD..;,." };
  const response = await testee.post("/api/login").send(loginData);

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty("token");
  expect(response.body).toHaveProperty("user");
  expect(response.headers["set-cookie"]).toBeDefined();
  expect(response.headers["set-cookie"][0]).toContain("access_token");
});

test("/api/login POST, Negativtest", async () => {
  const testee = supertest(app);
  const loginData = { name: "InvalidUser", password: "InvalidPassword" };
  const response = await testee.post("/api/login").send(loginData);

  expect(response.status).toBe(401);
  expect(response.body).toHaveProperty("error");
});

test("/api/login GET, Positivtest", async () => {
  const testee = supertest(app);
  const token = await verifyPasswordAndCreateJWT("John", "1234abcdABCD..;,.");
  const response = await testee
    .get("/api/login")
    .set("Cookie", [`access_token=${token}`]);

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty("id");
  expect(response.body).toHaveProperty("role");
  expect(response.body).toHaveProperty("exp");
});

test("/api/login GET, Negativtest", async () => {
  const testee = supertest(app);
  const response = await testee.get("/api/login");

  expect(response.status).toBe(200);
  expect(response.body).toBe(false);
});

test("/api/login DELETE, Positivtest", async () => {
  const testee = supertest(app);
  const token = await verifyPasswordAndCreateJWT("John", "1234abcdABCD..;,.");
  const response = await testee
    .delete("/api/login")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty(
    "message",
    "Cookie erfolgreich gelöscht!"
  );
});

test("/api/login DELETE, Negativtest", async () => {
  const testee = supertest(app);
  const response = await testee.delete("/api/login");

  expect(response.status).toBe(401);
  expect(response.body).toHaveProperty("error", "Unauthorized");
});

// Positive POST Test
test(`/api/login POST, Positivtest`, async () => {
  const testee = supertest(app);
  const loginData = { name: "John", password: "1234abcdABCD..;,." };
  const response = parseCookies(
    await testee.post(`/api/login`).send(loginData)
  );
  expect(response).statusCode("2*");

  expect(response).toHaveProperty("cookies");
  expect(response.cookies).toHaveProperty("access_token");
  const token = response.cookies.access_token;
  expect(token).toBeDefined();

  expect(response).toHaveProperty("cookiesRaw");
  const rawCookie = response.cookiesRaw.find((c) => c.name === "access_token");
  expect(rawCookie?.httpOnly).toBe(true);
  expect(rawCookie?.sameSite).toBe("None");
  expect(rawCookie?.secure).toBe(true);
});

// Negative POST Test - Invalid credentials
test("/api/login POST, Negativtest", async () => {
  const testee = supertest(app);
  const loginData = { name: "InvalidUser", password: "InvalidPassword" };
  const response = await testee.post("/api/login").send(loginData);

  expect(response.status).toBe(401);
  expect(response.body).toHaveProperty("error", "Unauthorized");
});

// Negative POST Test - Validation error
test("/api/login POST, Validation Error", async () => {
  const testee = supertest(app);
  const loginData = { name: "", password: "" };
  const response = await testee.post("/api/login").send(loginData);

  expect(response.status).toBe(400);
  expect(response.body).toHaveProperty("errors");
  expect(response.body.errors).toHaveLength(2); // 2 validation errors
});

// Positive GET Test
test("/api/login GET, Positivtest", async () => {
  const testee = supertest(app);
  const token = await verifyPasswordAndCreateJWT("John", "1234abcdABCD..;,.");
  const response = await testee
    .get("/api/login")
    .set("Cookie", [`access_token=${token}`]);

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty("id");
  expect(response.body).toHaveProperty("role");
  expect(response.body).toHaveProperty("exp");
});

// Negative GET Test - Keinn token
test("/api/login GET, Negativtest", async () => {
  const testee = supertest(app);
  const response = await testee.get("/api/login");

  expect(response.status).toBe(200);
  expect(response.body).toBe(false);
});

// Positive DELETE Test
test("/api/login DELETE, Positivtest", async () => {
  const token = await verifyPasswordAndCreateJWT("John", "1234abcdABCD..;,.");
  await performAuthentication("John", "1234abcdABCD..;,.");
  const testee = supertestWithAuth(app);
  const response = await testee
    .delete("/api/login")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty(
    "message",
    "Cookie erfolgreich gelöscht!"
  );
});

// Negative DELETE Test - noo token
test("/api/login DELETE, Negativtest", async () => {
  const testee = supertest(app);
  const response = await testee.delete("/api/login");

  expect(response.status).toBe(401);
  expect(response.body).toHaveProperty("error", "Unauthorized");
});

// Negative DELETE Test - Invalid token
test("/api/login DELETE, Invalid Token", async () => {
  const testee = supertest(app);
  const response = await testee
    .delete("/api/login")
    .set("Authorization", "Bearer invalidtoken");

  expect(response.status).toBe(401);
});
