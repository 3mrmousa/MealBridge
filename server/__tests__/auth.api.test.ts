import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../index.js";

describe("Auth API Endpoints", () => {
  //   it("should return 404 for unknown route", async () => {
  //     const res = await request(app).get("/api/auth/unknown");
  //     expect(res.status).toBe(404);
  //     expect(res.body.statusCode).toBe(404);
  //     expect(res.body.message).toBe("Route : /api/auth/unknown not found");
  //   });
  // ###########################################
  //   it("should send send register OTP", async () => {
  //     const res = await request(app).post("/api/auth/register/request").send({
  //       name: "Amr",
  //       email: "",
  //       password: "",
  //       phone: "01015052567",
  //       role: "DONOR",
  //     });
  //     console.log(res.body);
  //     expect(res.status).toBe(200);
  //     expect(res.body.status).toBe("success");
  //     expect(res.body.message).toBe(
  //       "OTP sent to email. Check your email or spam or try again after 10 minutes.",
  //     );
  //   });
  // ###########################################
  //   it("should not complete user register (wrong otp)", async () => {
  //     const res = await request(app).post("/api/auth/register/validate").send({
  //       email: "",
  //       otp: "339658",
  //     });
  //     console.log(res.body);
  //     expect(res.status).toBe(400);
  //     expect(res.body.status).toBe("fail");
  //     expect(res.body.message).toBe("Invalid or expired OTP");
  //   });
  // ###########################################
  //   it("should complete user register", async () => {
  //     const res = await request(app).post("/api/auth/register/validate").send({
  //       email: "",
  //       otp: "339624",
  //     });
  //     console.log(res.body);
  //     expect(res.status).toBe(200);
  //     expect(res.body.status).toBe("success");
  //     expect(res.body.message).toBe("Registration successful");
  //   });
  // #############################################
  //   let cookies: unknown;
  //   it("should login successfully", async () => {
  //     const res = await request(app).post("/api/auth/login").send({
  //       email: "",
  //       password: "",
  //     });
  //     console.log(res.body);
  //     // Save the cookies sent by the server to use in the next tests
  //     cookies = res.headers["set-cookie"];
  //     expect(res.status).toBe(200);
  //     expect(res.body.status).toBe("success");
  //     expect(res.body.message).toBe("Login successful");
  //   });
  //   it("should get Me", async () => {
  //     const res = await request(app)
  //       .get("/api/auth/me")
  //       .set("Cookie", cookies as string[]);
  //     expect(res.status).toBe(200);
  //     expect(res.body.status).toBe("success");
  //     expect(res.body.message).toBe("User fetched successfully");
  //   });
});
