const fs = require('fs');
const express = require('express');
const WebSocket = require('ws');
const mqtt = require('mqtt');
const cors = require('cors');

// Função para parsear o arquivo de configuração
function parseConfig(configPath) {
    const config = {
        routerName: '',       // Para armazenar o nome do roteador IOT
        topics: [],           // Para armazenar a lista de tópicos MQTT
        brokerUrl: '',        // Para armazenar a URL do broker MQTT
        wsUrl: ''             // Para armazenar a URL do servidor WebSocket
    };

    const fileContent = fs.readFileSync(configPath, 'utf8');
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);

    // Regex patterns
    const routerPattern = /^IOT MQTT ROUTER (.+)$/;
    const topicsPattern = /^SHOULD SUBSCRIBE MQTT TOPICS (.+)$/;
    const brokerPattern = /^FROM MQTT BROKER SERVER (.+)$/;
    const wsPattern = /^BROADCASTING DATA TO WEBSOCKET SERVER (.+)$/;

    lines.forEach(line => {
        let match;

        if (match = line.match(routerPattern)) {
            config.routerName = match[1].trim();
        } else if (match = line.match(topicsPattern)) {
            config.topics = match[1].split(',').map(topic => topic.trim());
        } else if (match = line.match(brokerPattern)) {
            config.brokerUrl = match[1].trim();
        } else if (match = line.match(wsPattern)) {
            config.wsUrl = match[1].trim();
        } else {
            console.warn(`Unrecognized config line: ${line}`);
        }
    });

    return config;
}

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
