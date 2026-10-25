import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDatabase, disconnectDatabase } from "../src/config/database";
import { taskService } from "../src/services/task.service";
import { taskRepository } from "../src/repositories/task.repository";

describe("Database Configuration", () => {
  test("connectDatabase throws clear error if MONGODB_URI is not set", async () => {
    const originalUri = process.env.MONGODB_URI;
    delete process.env.MONGODB_URI;

    await assert.rejects(
      async () => {
        await connectDatabase();
      },
      {
        name: "Error",
        message: "MONGODB_URI is not configured in environment variables",
      }
    );

    if (originalUri) {
      process.env.MONGODB_URI = originalUri;
    }
  });
});

describe("Phase 3: MongoDB + Mongoose TaskFlow", () => {
  let mongoServer: MongoMemoryServer;
  let mongoUri: string;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    await connectDatabase();
  });

  after(async () => {
    await disconnectDatabase();
    await mongoServer.stop();
  });

  test("Create operation with validation", async () => {
    // Valid creation
    const task = await taskService.createTask("Learn MongoDB with Mongoose");
    assert.ok(task.id, "Task should have an id");
    assert.equal(typeof task.id, "string");
    assert.equal(task.title, "Learn MongoDB with Mongoose");
    assert.equal(task.completed, false);
    assert.ok(task.createdAt, "Task should have createdAt");
    assert.ok(task.updatedAt, "Task should have updatedAt");

    // Invalid title (empty / whitespace)
    await assert.rejects(
      async () => {
        await taskService.createTask("   ");
      },
      { message: "A non-empty character only title is required" }
    );

    // Invalid title type
    await assert.rejects(
      async () => {
        await taskService.createTask(12345);
      },
      { message: "A non-empty character only title is required" }
    );
  });

  test("Read operations (getAllTasks and getTaskById)", async () => {
    const created = await taskService.createTask("Task to Read");
    const all = await taskService.getAllTasks();
    assert.ok(Array.isArray(all));
    assert.ok(all.length >= 1);
    assert.ok(all.some((t) => t.id === created.id));

    const found = await taskService.getTaskById(created.id);
    assert.ok(found);
    assert.equal(found?.id, created.id);
    assert.equal(found?.title, "Task to Read");
  });

  test("Malformed IDs and missing task handling", async () => {
    // Malformed ID
    const malformedResult = await taskService.getTaskById("invalid-id-123");
    assert.equal(malformedResult, null);

    // Non-existent but valid ObjectId
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const missingResult = await taskService.getTaskById(nonExistentId);
    assert.equal(missingResult, null);

    // Malformed ID on update
    const malformedUpdate = await taskService.updateTask("bad-id", "Title", false);
    assert.equal(malformedUpdate, null);

    // Missing ID on update
    const missingUpdate = await taskService.updateTask(nonExistentId, "Title", false);
    assert.equal(missingUpdate, null);

    // Malformed ID on complete
    const malformedComplete = await taskService.completeTask("bad-id");
    assert.equal(malformedComplete, null);

    // Missing ID on complete
    const missingComplete = await taskService.completeTask(nonExistentId);
    assert.equal(missingComplete, null);

    // Malformed ID on delete
    const malformedDelete = await taskService.deleteTask("bad-id");
    assert.equal(malformedDelete, false);

    // Missing ID on delete
    const missingDelete = await taskService.deleteTask(nonExistentId);
    assert.equal(missingDelete, false);
  });

  test("Update operation with validation", async () => {
    const created = await taskService.createTask("Initial Task");

    const updated = await taskService.updateTask(created.id, "Updated Task Title", true);
    assert.ok(updated);
    assert.equal(updated?.id, created.id);
    assert.equal(updated?.title, "Updated Task Title");
    assert.equal(updated?.completed, true);

    // Validation failure on empty title
    await assert.rejects(
      async () => {
        await taskService.updateTask(created.id, "   ", true);
      },
      { message: "A non-empty title and boolean completed value are required" }
    );

    // Validation failure on non-boolean completed
    await assert.rejects(
      async () => {
        await taskService.updateTask(created.id, "Valid Title", "not-a-boolean" as unknown as boolean);
      },
      { message: "A non-empty title and boolean completed value are required" }
    );
  });

  test("Patch complete operation", async () => {
    const created = await taskService.createTask("Task to complete");
    assert.equal(created.completed, false);

    const completed = await taskService.completeTask(created.id);
    assert.ok(completed);
    assert.equal(completed?.completed, true);
  });

  test("Delete operation", async () => {
    const created = await taskService.createTask("Task to Delete");

    const deleted = await taskService.deleteTask(created.id);
    assert.equal(deleted, true);

    const check = await taskService.getTaskById(created.id);
    assert.equal(check, null);
  });

  test("Persistence across database reconnections (simulating server restarts)", async () => {
    // 1. Create a task
    const persistedTask = await taskService.createTask("Persistent across restart");
    const taskId = persistedTask.id;

    // 2. Disconnect database (server stops)
    await disconnectDatabase();

    // 3. Reconnect to the same MongoDB instance (server starts)
    await connectDatabase();

    // 4. Verify task still exists and data matches
    const retrieved = await taskService.getTaskById(taskId);
    assert.ok(retrieved, "Task should still exist after reconnection");
    assert.equal(retrieved?.id, taskId);
    assert.equal(retrieved?.title, "Persistent across restart");
    assert.equal(retrieved?.completed, false);
  });
});
