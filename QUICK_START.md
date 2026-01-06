# MQTT Quick Start Guide

This is a quick reference guide to get you started with MQTT in minutes.

## 🚀 Quick Setup (Using Docker)

### Start EMQX Broker

```bash
# Navigate to project directory
cd /opt/codebase/hawk/mqtt_poc

# Start the broker
docker-compose up -d

# Check if it's running
docker ps
```

### Access EMQX Dashboard

Open your browser and go to: **http://localhost:18083**

- **Username**: `admin`
- **Password**: `Admin@123`

## 📡 Available Ports

| Port | Protocol | Usage |
|------|----------|-------|
| 1883 | MQTT TCP | Standard MQTT connections |
| 8084 | WebSocket | MQTT over WebSocket (used in examples) |
| 18083 | HTTP | EMQX Dashboard |

## 💻 Running the Examples

### Install Dependencies

```bash
cd node_pub_sub
npm install
```

### Start Publisher

```bash
# Terminal 1
node publisher.js
```

This will publish messages to `device/1/data` every second.

### Start Consumer(s)

```bash
# Terminal 2
node consumer.js

# Terminal 3 (optional - for load balancing demo)
node consumer.js

# Terminal 4 (optional - for load balancing demo)
node consumer.js
```

Multiple consumers will share the workload using shared subscriptions (`$share/group1/device/+/data`).

## 🔍 Testing with Command Line

### Subscribe to a Topic

```bash
# Using mosquitto_sub (if installed)
mosquitto_sub -h localhost -p 1883 -t "device/+/data" -v

# Or use MQTT Explorer GUI tool
```

### Publish a Message

```bash
# Using mosquitto_pub (if installed)
mosquitto_pub -h localhost -p 1883 -t "device/1/data" -m '{"test": true}'
```

## 📊 Monitor in Dashboard

1. Open **http://localhost:18083**
2. Login with `admin` / `Admin@123`
3. Navigate to:
   - **Connections** - See active clients
   - **Topics** - View topic subscriptions
   - **WebSocket** - Test publish/subscribe

## 🛠️ Common Commands

### Stop the Broker

```bash
docker-compose down
```

### View Broker Logs

```bash
docker logs -f emqx
```

### Restart the Broker

```bash
docker-compose restart
```

## 📝 Code Examples

### Simple Publisher

```javascript
const mqtt = require("mqtt");

const client = mqtt.connect("ws://localhost:8084/mqtt");

client.on("connect", () => {
  console.log("Connected!");
  client.publish("test/topic", "Hello MQTT", { qos: 1 });
});
```

### Simple Subscriber

```javascript
const mqtt = require("mqtt");

const client = mqtt.connect("ws://localhost:8084/mqtt");

client.on("connect", () => {
  console.log("Connected!");
  client.subscribe("test/topic", { qos: 1 });
});

client.on("message", (topic, payload) => {
  console.log(`${topic}: ${payload.toString()}`);
});
```

## 🎯 Topic Examples

| Topic | Description |
|-------|-------------|
| `device/1/data` | Data from device 1 |
| `device/+/data` | Data from all devices (+ wildcard) |
| `device/#` | Everything under device (# wildcard) |
| `$share/group1/device/+/data` | Shared subscription for load balancing |

## 🔐 Security (Production)

For production, enable authentication:

1. Create password file
2. Update `docker-compose.yml` with auth settings
3. Use TLS/SSL for encryption
4. Disable anonymous access

See [MQTT_DOCUMENTATION.md](./MQTT_DOCUMENTATION.md) for detailed security setup.

## 📚 Next Steps

- Read the full [MQTT Documentation](./MQTT_DOCUMENTATION.md)
- Explore QoS levels (0, 1, 2)
- Learn about retained messages
- Implement request-response patterns
- Set up authentication and TLS

## 🐛 Troubleshooting

### Can't connect to broker?

```bash
# Check if broker is running
docker ps

# Check logs
docker logs emqx

# Restart broker
docker-compose restart
```

### Port already in use?

```bash
# Find process using port 1883
lsof -i :1883

# Or change ports in docker-compose.yml
```

### Messages not received?

- Check topic names (case-sensitive!)
- Verify subscriber is connected
- Check QoS levels match
- Use MQTT Explorer to debug

## 📖 Resources

- **Full Documentation**: [MQTT_DOCUMENTATION.md](./MQTT_DOCUMENTATION.md)
- **EMQX Docs**: https://docs.emqx.com/
- **MQTT.js Docs**: https://github.com/mqttjs/MQTT.js
- **MQTT Explorer**: http://mqtt-explorer.com/

---

**Happy MQTT-ing! 🎉**
