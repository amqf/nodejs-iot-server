const express = require('express');
const WebSocket = require('ws');
const mqtt = require('mqtt');
const cors = require('cors');
const { default: parseConfig } = require('./config.js');

// Configuração e inicialização
const config = parseConfig('config.iotws');
const httpPort = 3000; // Porta para o servidor HTTP

// Inicializar cliente MQTT
const mqttClient = mqtt.connect(config.brokerUrl);

mqttClient.on('connect', () => {
    console.log(`Connected to MQTT broker ${config.brokerUrl}`);
    config.topics.forEach(topic => mqttClient.subscribe(topic, err => {
        if (err) {
            console.error(`Failed to subscribe to topic ${topic}:`, err);
        } else {
            console.log(`Subscribed to topic ${topic}`);
        }
    }));
});

mqttClient.on('message', (topic, message) => {
    console.log(`Received message on topic ${topic}: ${message.toString()}`);
    // Encaminhe a mensagem para o WebSocket Server
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ topic, message: message.toString() }));
        }
    });
});

// Inicializar servidor Express
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.post('/publish', (req, res) => {
    const { topic, value } = req.body;
    if (config.topics.includes(topic)) {
        mqttClient.publish(topic, value, err => {
            if (err) {
                res.status(500).send('Failed to publish message');
            } else {
                res.status(200).send('Message published');
            }
        });
    } else {
        res.status(400).send('Invalid topic');
    }
});

app.listen(httpPort, () => {
    console.log(`HTTP Server is running on http://localhost:${httpPort}`);
});

// Inicializar servidor WebSocket
const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', (ws) => {
  console.log('Client connected');
});

wss.on('connection', ws => {
    console.log('WebSocket client connected');
    ws.on('message', (message) => {
      console.log(`Received message => ${message}`);
      ws.send(JSON.stringify({ topic: 'exampleTopic', message: 'exampleMessage' }));
    });

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});

console.log(`WebSocket Server is running on ws://localhost:8081`);
