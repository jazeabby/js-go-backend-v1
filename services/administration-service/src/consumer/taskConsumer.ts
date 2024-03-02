import { Kafka } from "kafkajs";
import { logger } from "../helpers/logger";
import { prisma } from "../helpers/prisma";

const KAFKA_URI = process.env["KAFKA_URI"] || "localhost:9092";

const kafka = new Kafka({
  clientId: "administration",
  brokers: [KAFKA_URI],
});

export const consumer = kafka.consumer({
    groupId:"tasks-service"
});

consumer.connect();

consumer.on("consumer.connect", () => {
  logger.success(`Kafka consumer connected to ${KAFKA_URI}`);
});

consumer.on("consumer.disconnect", () => {
  logger.warn("Kafka consumer disconnected.");
});

export const consumeMessage = async () => {
  try {
    const consumerSubscribeTopics = {
        topics: [
            "task.updated"
        ]
    }
    await consumer.subscribe(consumerSubscribeTopics).then( (message) => async function(message: string) {
        let task = JSON.parse(message);
        if (task.id && task.status) {

            const updateData = {
                status: task.status
            };
            try {
                await prisma.task.update({
                    where: { id: task.id },
                    data: updateData,
                });
            } catch (error) {
                logger.error(error);
            }
        }
    });
  } catch (error) {
    logger.error(error);
  }
};

process.on("SIGINT", async () => {
  logger.warn("Caught SIGINT signal, disconnecting Kafka consumer.");
  await consumer.disconnect();
});

process.on("SIGTERM", async () => {
  logger.warn("Caught SIGTERM signal, disconnecting Kafka consumer.");
  await consumer.disconnect();
});
