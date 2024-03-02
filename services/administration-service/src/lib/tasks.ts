import { prisma } from "../helpers/prisma";
import { logger } from "../helpers/logger";
import type { Task } from "@prisma/client";
import { sendMessage } from "../helpers/kafka";

export const createTask = async (
  userId: string,
  description: string
): Promise<{
  task: Task;
}> => {

  logger.log(`Creating task for the user with id`);
  const task = await prisma.task.create({
    data: {
      description: description,
      userId: userId,
      status: "PENDING",
    }
  });
  logger.log(`Created task for user with id `);

  await sendMessage("task.created", task);
  return { task };
};
