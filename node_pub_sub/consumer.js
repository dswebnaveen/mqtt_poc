const mqtt = require("mqtt");

const clientId = `consumer-${process.pid}`;

const client = mqtt.connect("ws://localhost:8084/mqtt", {
  clientId,
  clean: false
});

client.on("connect", () => {
  console.log("Connected:", clientId);
  client.subscribe("$share/group1/device/+/data", { qos: 1 });
});

client.on("message", (topic, payload) => {
  console.log(`Handled by ${clientId}:`, payload.toString());
});
