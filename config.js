const fs = require('fs');

// Função para parsear o arquivo de configuração
exports.default = function parseConfig(configPath) {
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