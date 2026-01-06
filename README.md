# MQTT Proof of Concept

A comprehensive MQTT implementation demonstrating publish/subscribe patterns, load balancing with shared subscriptions, and real-time messaging using EMQX broker.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Examples](#examples)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

## 🎯 Overview

This project demonstrates MQTT (Message Queuing Telemetry Transport) implementation with:

- **EMQX Broker**: Enterprise-grade MQTT broker running in Docker
- **Node.js Clients**: Publisher and consumer examples
- **Load Balancing**: Shared subscriptions for horizontal scaling
- **WebSocket Support**: MQTT over WebSocket for web applications

## ✨ Features

- ✅ **Docker-based EMQX broker** with web dashboard
- ✅ **Publisher/Subscriber pattern** implementation
- ✅ **Shared subscriptions** for load balancing
- ✅ **QoS Level 1** for reliable message delivery
- ✅ **WebSocket support** for browser compatibility
- ✅ **Multiple consumer instances** for scalability
- ✅ **Comprehensive documentation** and examples

## 🏗️ Architecture

```
┌─────────────┐
│  Publisher  │
│  (Node.js)  │
└──────┬──────┘
       │ Publishes to: device/1/data
       │ QoS: 1
       ▼
┌─────────────────────────────────┐
│       EMQX Broker               │
│   (Docker Container)            │
│                                 │
│  Ports:                         │
│  - 1883  (MQTT TCP)            │
│  - 8084  (WebSocket)           │
│  - 18083 (Dashboard)           │
└────────┬────────────────────────┘
         │ Distributes to shared group
         │ Topic: $share/group1/device/+/data
         │
    ┌────┴────┬────────┬────────┐
    ▼         ▼        ▼        ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│Consumer1│ │Consumer2│ │Consumer3│
│(Node.js)│ │(Node.js)│ │(Node.js)│
└─────────┘ └─────────┘ └─────────┘
```

## 📦 Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js** (v14 or higher) and **npm**
- Basic understanding of MQTT concepts (see [documentation](#documentation))

## 🚀 Quick Start

### 1. Start the EMQX Broker

```bash
# Clone or navigate to the project directory
cd <path_to_code_dir>/mqtt_poc

# Start EMQX broker
docker-compose up -d

# Verify it's running
docker ps
```

### 2. Access EMQX Dashboard

Open your browser: **http://localhost:18083**

- **Username**: `admin`
- **Password**: `Admin@123`

### 3. Install Node.js Dependencies

```bash
cd node_pub_sub
npm install
```

### 4. Run Publisher

```bash
# Terminal 1
node publisher.js
```

Output:
```
Published: {"seq":1}
Published: {"seq":2}
Published: {"seq":3}
...
```

### 5. Run Consumer(s)

```bash
# Terminal 2
node consumer.js
```

Output:
```
Connected: consumer-12345
Handled by consumer-12345: {"seq":1}
Handled by consumer-12345: {"seq":2}
...
```

**Optional**: Run multiple consumers to see load balancing:

```bash
# Terminal 3
node consumer.js

# Terminal 4
node consumer.js
```

Messages will be distributed among all consumers in the shared group!

## 📚 Documentation

This project includes comprehensive documentation:

### 1. [MQTT_DOCUMENTATION.md](./MQTT_DOCUMENTATION.md)

**Complete MQTT guide covering:**
- MQTT publish/subscribe pattern
- Architecture components (Publisher, Subscriber, Broker, Topics)
- Quality of Service (QoS) levels (0, 1, 2)
- Topics and wildcards (`+`, `#`)
- Local broker installation (Mosquitto, EMQX, HiveMQ)
- Configuration and security (Authentication, TLS/SSL)
- Testing tools and techniques
- Practical examples and code samples

### 2. [QUICK_START.md](./QUICK_START.md)

**Quick reference guide for:**
- Instant setup with Docker
- Running examples
- Common commands
- Basic troubleshooting

## 📁 Project Structure

```
mqtt_poc/
├── docker-compose.yml          # EMQX broker configuration
├── node_pub_sub/               # Node.js examples
│   ├── publisher.js            # Message publisher
│   ├── consumer.js             # Message consumer (with load balancing)
│   ├── package.json            # Node.js dependencies
│   └── package-lock.json
├── MQTT_DOCUMENTATION.md       # Comprehensive MQTT guide
├── QUICK_START.md              # Quick reference guide
└── README.md                   # This file
```

## 💡 Examples

### Publisher (publisher.js)

Publishes sequential messages to `device/1/data` every second with QoS 1.

```javascript
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
```

### Consumer (consumer.js)

Subscribes to `$share/group1/device/+/data` for load-balanced message consumption.

```javascript
const mqtt = require("mqtt");

const clientId = `consumer-${process.pid}`;

const client = mqtt.connect("ws://localhost:8084/mqtt", {
  clientId,
  clean: false  // Persistent session
});

client.on("connect", () => {
  console.log("Connected:", clientId);
  client.subscribe("$share/group1/device/+/data", { qos: 1 });
});

client.on("message", (topic, payload) => {
  console.log(`Handled by ${clientId}:`, payload.toString());
});
```

### Key Features Demonstrated

1. **Shared Subscriptions**: `$share/group1/device/+/data`
   - Multiple consumers share the workload
   - Messages are distributed evenly
   - Enables horizontal scaling

2. **Wildcards**: `device/+/data`
   - `+` matches any single level
   - Subscribes to all devices

3. **QoS Level 1**: `{ qos: 1 }`
   - At least once delivery
   - Messages are acknowledged
   - No message loss

4. **Persistent Sessions**: `clean: false`
   - Session state is maintained
   - Messages queued when offline
   - Subscriptions persist

## ⚙️ Configuration

### Docker Compose (docker-compose.yml)

```yaml
version: "3.8"

services:
  emqx:
    image: emqx/emqx
    container_name: emqx
    restart: unless-stopped
    ports:
      - "1883:1883"      # MQTT TCP
      - "8084:8083"      # MQTT WebSocket (mapped to 8084)
      - "18083:18083"    # Dashboard
    environment:
      EMQX_DASHBOARD__DEFAULT_USERNAME: admin
      EMQX_DASHBOARD__DEFAULT_PASSWORD: Admin@123
```

### Port Mapping

| Host Port | Container Port | Protocol | Description |
|-----------|----------------|----------|-------------|
| 1883 | 1883 | MQTT | Standard MQTT over TCP |
| 8084 | 8083 | WebSocket | MQTT over WebSocket |
| 18083 | 18083 | HTTP | EMQX Dashboard |

### Connection URLs

- **MQTT TCP**: `mqtt://localhost:1883`
- **MQTT WebSocket**: `ws://localhost:8084/mqtt`
- **Dashboard**: `http://localhost:18083`

## 🔧 Troubleshooting

### Broker Won't Start

```bash
# Check if ports are already in use
lsof -i :1883
lsof -i :8084
lsof -i :18083

# View broker logs
docker logs emqx

# Restart broker
docker-compose restart
```

### Can't Connect to Broker

1. Verify broker is running:
   ```bash
   docker ps | grep emqx
   ```

2. Check firewall settings

3. Verify correct connection URL:
   - WebSocket: `ws://localhost:8084/mqtt` (note the `/mqtt` path)
   - TCP: `mqtt://localhost:1883`

### Messages Not Received

1. **Check topic names** (case-sensitive!)
   - Publisher: `device/1/data`
   - Subscriber: `$share/group1/device/+/data`

2. **Verify QoS levels** match

3. **Check consumer is connected** before publishing

4. **Use MQTT Explorer** to debug:
   - Download: http://mqtt-explorer.com/
   - Connect to `localhost:1883`
   - View topics and messages

### Load Balancing Not Working

1. Ensure using **shared subscription**: `$share/group1/topic`

2. Use **different client IDs** for each consumer

3. Set **clean: false** for persistent sessions

4. Verify all consumers are in the **same group** (`group1`)

## 🛠️ Useful Commands

### Docker Commands

```bash
# Start broker
docker-compose up -d

# Stop broker
docker-compose down

# Restart broker
docker-compose restart

# View logs
docker logs -f emqx

# Check status
docker ps
```

### Testing with Mosquitto CLI

If you have Mosquitto installed:

```bash
# Subscribe to topic
mosquitto_sub -h localhost -p 1883 -t "device/+/data" -v

# Publish message
mosquitto_pub -h localhost -p 1883 -t "device/1/data" -m '{"test":true}'
```

### Node.js Commands

```bash
# Install dependencies
cd node_pub_sub
npm install

# Run publisher
node publisher.js

# Run consumer
node consumer.js
```

## 📊 Monitoring

### EMQX Dashboard

Access at **http://localhost:18083**

**Features:**
- Real-time connection monitoring
- Topic subscription viewer
- Message rate statistics
- Client management
- WebSocket testing tool

**Navigation:**
1. **Overview**: System metrics and statistics
2. **Connections**: Active client connections
3. **Topics**: Topic subscriptions and message flow
4. **Subscriptions**: Detailed subscription information
5. **WebSocket**: Built-in testing tool

## 🔐 Security Considerations

> [!WARNING]
> The current configuration uses **anonymous access** and **default credentials**. This is suitable for development and testing only.

### For Production:

1. **Enable Authentication**
   - Create user accounts
   - Use strong passwords
   - Disable anonymous access

2. **Enable TLS/SSL**
   - Generate certificates
   - Configure MQTTS (port 8883)
   - Use secure WebSocket (WSS)

3. **Configure ACLs**
   - Restrict topic access
   - Implement authorization rules
   - Use role-based access control

4. **Change Default Credentials**
   - Update dashboard password
   - Use environment variables
   - Don't commit credentials to git

See [MQTT_DOCUMENTATION.md](./MQTT_DOCUMENTATION.md#configuration-and-security) for detailed security setup.

## 📖 Resources

### Official Documentation

- **EMQX**: https://docs.emqx.com/
- **MQTT.js**: https://github.com/mqttjs/MQTT.js
- **MQTT Protocol**: https://mqtt.org/

### Tools

- **MQTT Explorer**: http://mqtt-explorer.com/ (GUI client)
- **MQTTX**: https://mqttx.app/ (Cross-platform client)
- **Mosquitto**: https://mosquitto.org/ (CLI tools)

### Learning Resources

- **HiveMQ MQTT Essentials**: https://www.hivemq.com/mqtt-essentials/
- **MQTT.org FAQ**: https://mqtt.org/faq/
- **EMQX Blog**: https://www.emqx.com/en/blog

## 🤝 Contributing

This is a proof of concept project. Feel free to:

- Add more examples
- Improve documentation
- Implement additional features
- Report issues

## 📝 License

This project is for educational and demonstration purposes.

---

## 🎓 Next Steps

1. ✅ **Understand the basics** - Read [MQTT_DOCUMENTATION.md](./MQTT_DOCUMENTATION.md)
2. ✅ **Run the examples** - Follow [QUICK_START.md](./QUICK_START.md)
3. 🔄 **Experiment with QoS levels** - Try QoS 0, 1, and 2
4. 🔄 **Implement retained messages** - Store last known state
5. 🔄 **Add authentication** - Secure your broker
6. 🔄 **Enable TLS/SSL** - Encrypt communications
7. 🔄 **Build a real application** - Apply what you've learned!

---

**Happy MQTT Learning! 🚀**

For questions or issues, refer to the [documentation](./MQTT_DOCUMENTATION.md) or check the [troubleshooting](#troubleshooting) section.
