import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDatabase, disconnectDatabase } from "../src/config/database";
import app from "../src/app";
import { taskRepository } from "../src/repositories/task.repository";

describe("Phase 4: Request Validation, Centralized Error Handling, and API Reliability", () => {
  let mongoServer: MongoMemoryServer;
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    // 1. Isolate database using in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    await connectDatabase();

    // 2. Start HTTP server on ephemeral port for end-to-end HTTP testing
    await new Promise<void>((resolve) => {
      server = app.listen(0, "127.0.0.1", () => {
        const addr = server.address() as { port: number };
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    await disconnectDatabase();
    await mongoServer.stop();
  });

  // Test 1: Creating a valid task
  test("1. Creating a valid task trims title and returns 201", async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "  Clean and Trimmed Title  " }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.data);
    assert.equal(body.data.title, "Clean and Trimmed Title");
    assert.equal(body.data.completed, false);
    assert.ok(body.data.id);
  });

  // Test 2: Creating a task with an empty title
  test("2. Creating a task with an empty title returns 400", async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "     " }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.message, "A non-empty character only title is required");
  });

  // Test 3: Creating a task with a missing title
  test("3. Creating a task with a missing title returns 400", async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.message, "A non-empty character only title is required");
  });

  // Test 4: Sending a title with the wrong data type
  test("4. Sending a title with wrong data type returns 400", async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: 12345 }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.message, "A non-empty character only title is required");
  });

  // Test 5: Retrieving an existing task
  test("5. Retrieving an existing task returns 200", async () => {
    // Create task first
    const createRes = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Task to retrieve" }),
    });
    const created = await createRes.json();
    const taskId = created.data.id;

    // Retrieve
    const getRes = await fetch(`${baseUrl}/api/v1/tasks/${taskId}`);
    assert.equal(getRes.status, 200);
    const getBody = await getRes.json();
    assert.equal(getBody.data.id, taskId);
    assert.equal(getBody.data.title, "Task to retrieve");
  });

  // Test 6: Retrieving a nonexistent task
  test("6. Retrieving a nonexistent task returns 404", async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await fetch(`${baseUrl}/api/v1/tasks/${nonExistentId}`);

    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.message, "Task not found");
  });

  // Test 7: Sending a malformed MongoDB ObjectId
  test("7. Sending a malformed MongoDB ObjectId returns 400 instead of 404", async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks/not-a-valid-id-123`);

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.message, "Invalid task ID format");
  });

  // Test 8: Updating a task with invalid data
  test("8. Updating a task with invalid data returns 400", async () => {
    // Create task first
    const createRes = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Task to update" }),
    });
    const created = await createRes.json();
    const taskId = created.data.id;

    // Missing completed field
    const res1 = await fetch(`${baseUrl}/api/v1/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Valid Title" }),
    });
    assert.equal(res1.status, 400);
    const body1 = await res1.json();
    assert.equal(body1.success, false);

    // Empty title
    const res2 = await fetch(`${baseUrl}/api/v1/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "   ", completed: true }),
    });
    assert.equal(res2.status, 400);
    const body2 = await res2.json();
    assert.equal(body2.success, false);

    // Non-boolean completed
    const res3 = await fetch(`${baseUrl}/api/v1/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Valid Title", completed: "yes" }),
    });
    assert.equal(res3.status, 400);
    const body3 = await res3.json();
    assert.equal(body3.success, false);
  });

  // Test 9: Completing a task
  test("9. Completing a task returns 200 with completed: true", async () => {
    const createRes = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Task to complete" }),
    });
    const created = await createRes.json();
    const taskId = created.data.id;

    const res = await fetch(`${baseUrl}/api/v1/tasks/${taskId}/complete`, {
      method: "PATCH",
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.id, taskId);
    assert.equal(body.data.completed, true);
  });

  // Test 10: Deleting a task
  test("10. Deleting a task returns 204 with no content", async () => {
    const createRes = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Task to delete" }),
    });
    const created = await createRes.json();
    const taskId = created.data.id;

    const deleteRes = await fetch(`${baseUrl}/api/v1/tasks/${taskId}`, {
      method: "DELETE",
    });
    assert.equal(deleteRes.status, 204);
    assert.equal(await deleteRes.text(), "");

    // Subsequent retrieval returns 404
    const getRes = await fetch(`${baseUrl}/api/v1/tasks/${taskId}`);
    assert.equal(getRes.status, 404);
  });

  // Test 11: Requesting an unknown route
  test("11. Requesting an unknown route returns 404", async () => {
    const res = await fetch(`${baseUrl}/api/v1/nonexistent-route-path`);

    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.error.message.includes("not found"));
  });

  // Test 12: Sending malformed JSON
  test("12. Sending malformed JSON returns 400 with clean error message", async () => {
    const res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "this is not { valid json",
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.message, "Malformed JSON payload");
  });

  // Test 13: Handling an unexpected error
  test("13. Handling unexpected server error returns 500 without leaking stack trace", async () => {
    const originalFindAll = taskRepository.findAll;
    taskRepository.findAll = async () => {
      throw new Error("Sensitive internal database connection error");
    };

    try {
      const res = await fetch(`${baseUrl}/api/v1/tasks`);
      assert.equal(res.status, 500);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error.message, "Internal server error");
      assert.equal(body.stack, undefined);
      assert.equal(body.error.stack, undefined);
    } finally {
      taskRepository.findAll = originalFindAll;
    }
  });
});
