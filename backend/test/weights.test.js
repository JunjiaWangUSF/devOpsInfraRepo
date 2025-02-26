import request from "supertest";
import { app, server, pool } from "../src/app.js"; // Adjust path if necessary

describe("Database Operations", () => {
  afterAll(async () => {
    if (server) {
      server.close();
    }
    // Properly end all pool connections after tests
    pool.end(() => {
      console.log("Pool has ended");
    });
  });

  test("should retrieve mock data from the database", async () => {
    const response = await request(app).get("/weights/test"); // Changed 'server' to 'app' if you don't export server conditionally
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).not.toHaveLength(0);
    const weightEntry = response.body.find(
      (entry) => entry.username === "test"
    );
    expect(weightEntry).toBeDefined();
  });
});
