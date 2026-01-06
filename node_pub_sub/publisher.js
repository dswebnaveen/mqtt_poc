const mqtt = require("mqtt");

const client = mqtt.connect("ws://localhost:8084/mqtt");

client.on("connect", () => {
  let i = 1;
  setInterval(() => {
    const msg = JSON.stringify({ seq: i++ });
    client.publish("device/1/data", msg, { qos: 1 });
    console.log("Published:", msg);
  }, 1000);
});
