import { Kafka } from "kafkajs";
import { logger } from "../helpers/logger";
import { prisma } from "../helpers/prisma";

const KAFKA_URI = process.env["KAFKA_URI"] || "localhost:9092";

const kafka = new Kafka({
  clientId: "administration",
  brokers: [KAFKA_URI],
});

async function init() {
  const consumer = kafka.consumer({ groupId: "tasks-service-2" });
  await consumer.connect();

  await consumer.subscribe({ topics: ["task.updated"], fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      console.log(
        `[${topic}]: PART:${partition}:`,
        message.value.toString()
      );
      let messageValue = message.value?.toString() ?? "";
        let task = JSON.parse(messageValue);
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
    },
  });

  process.on("SIGINT", async () => {
    logger.warn("Caught SIGINT signal, disconnecting Kafka consumer.");
    await consumer.disconnect();
  });

  process.on("SIGTERM", async () => {
    logger.warn("Caught SIGTERM signal, disconnecting Kafka consumer.");
    await consumer.disconnect();
  });
}

init();