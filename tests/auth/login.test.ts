// must be imported before any other imports
import dotenv from "dotenv";
dotenv.config();

import { parseCookies } from "restmatcher";
import supertest from "supertest";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { verifyPasswordAndCreateJWT } from "../../src/services/JWTService";

beforeEach(async () => {
    await createPfleger({
      name: "John",
      password: "1234abcdABCD..;,.",
      admin: false,
    });
  });

/**
 * Eigentlich sind das hier sogar 5 Tests!
 */
test(`/api/login POST, Positivtest`, async () => {
    const testee = supertest(app);
    const loginData = { name: "John", password: "1234abcdABCD..;,." };
    const response = parseCookies(await testee.post(`/api/login`).send(loginData));
    expect(response).statusCode("2*")

    // added by parseCookies, similar to express middleware cookieParser
    expect(response).toHaveProperty("cookies"); // added by parseCookies
    expect(response.cookies).toHaveProperty("access_token"); // the cookie with the JWT
    const token = response.cookies.access_token;
    expect(token).toBeDefined();
        
    // added by parseCookies, array with raw cookies, i.e. with all options and value
    expect(response).toHaveProperty("cookiesRaw");
    const rawCookie = response.cookiesRaw.find(c=>c.name === "access_token");
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
    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.headers['set-cookie'][0]).toContain("access_token");
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
    expect(response.body).toHaveProperty("message", "Cookie erfolgreich gelöscht!");
  });
  
  test("/api/login DELETE, Negativtest", async () => {
    const testee = supertest(app);
    const response = await testee.delete("/api/login");
    
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error", "Unauthorized");
  });