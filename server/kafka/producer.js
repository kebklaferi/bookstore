import { Kafka } from "kafkajs";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { v4 as uuidv4 } from "uuid";

// 1️⃣ Kafka connection
const kafka = new Kafka({
  clientId: "bookstore-backend",
  brokers: ["kafka-broker:29092"],
});

// 2️⃣ Producer
export const producer = kafka.producer();

// 3️⃣ Schema Registry
const registry = new SchemaRegistry({
  host: "http://schema-registry:8081",
});

// 4️⃣ Schema subject
const subject = "user-action-events-value";

// 🔑 Schema ID stored at module level
let schemaId;

// 5️⃣ Init producer (setup ONLY)
export async function initProducer() {
  schemaId = await registry.getLatestSchemaId(subject);

  await producer.connect();

  console.log("Kafka producer connected");
  console.log("Using schema ID:", schemaId);
}

// 6️⃣ Send event
export async function sendUserAction(userId, actionType, bookId = null) {
  if (!schemaId) {
    throw new Error("Producer not initialized. Call initProducer() first.");
  }

  const event = {
    event_id: uuidv4(),
    user_id: String(userId),
    action_type: actionType,
    book_id: bookId,
    action_time: Date.now(), // matches Avro long / timestamp-millis
  };

  const encodedValue = await registry.encode(schemaId, event);

  await producer.send({
    topic: "user-actions-events",
    messages: [
      {
        key: String(userId),
        value: encodedValue,
      },
    ],
  });

  console.log("Event sent:", event);
}
