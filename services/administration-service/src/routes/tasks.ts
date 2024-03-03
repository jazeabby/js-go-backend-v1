import express from "express";
import { z } from "zod";
import { isAuthenticatedMiddleware } from "./auth";
import { AuthenticationError } from "../helpers/errors";
import { prisma } from "../helpers/prisma";
import { logger } from "../helpers/logger";
import { createTask } from "../lib/tasks";

export const tasksRouter = express.Router();

// Get all tasks for current user
tasksRouter.get("/", isAuthenticatedMiddleware, async (req, res, next) => {
  if (!req.user) return next(new AuthenticationError());

  const tasks = await prisma.task.findMany({
    where: { userId: req.user.id },
    select: { id: true, description: true, status:true, createdAt: true, updatedAt: true },
  });

  return res.send(tasks);
});

// Create task
tasksRouter.post("/", isAuthenticatedMiddleware, async (req, res, next) => {
  if (!req.user) return next(new AuthenticationError());

  const body = req.body;

  try {
    const { description } = z
      .object({
        description: z.string()
      })
      .parse(body);

    // const id = req.user.id;
    logger.log(`Created task for user with id ${req.user.id}`);
    // logger.log(`Created task for user with id ${req.user.id}`);

    const task = await createTask(req.user.id, description);

    return res.status(201).send(task);
  } catch (error) {
    return next(error);
  }
});
