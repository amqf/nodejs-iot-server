# IoT Server - Node.js Version

## O que é?

Um servidor para receber dados de dispositivos IoT via MQTT e transmitir esses dados para clientes WebSocket em tempo real.

## Funcionalidades

- **Recepção de Dados MQTT**: Conecta-se a um broker MQTT e inscreve-se em tópicos para receber dados de dispositivos IoT.
- **Broadcast via WebSocket**: Envia os dados recebidos para clientes WebSocket conectados em tempo real.
- **Rota POST para MQTT (Para Desenvolvimento)**: Recebe dados via POST e publica em tópicos MQTT. **A principal forma de envio de dados é através do MQTT broker.**

## Configuração

### Arquivo de Configuração

Crie um arquivo chamado `config.iotws` com o seguinte formato:

```
IOT MQTT ROUTER <string>
SHOULD SUBSCRIBE MQTT TOPICS <lista separada por vírgula>
FROM MQTT BROKER SERVER <url>
BROADCASTING DATA TO WEBSOCKET SERVER <url>
```

**Exemplo:**

```
IOT MQTT ROUTER MyRouter1
SHOULD SUBSCRIBE MQTT TOPICS topic1, topic2, topic3
FROM MQTT BROKER SERVER mqtt://localhost:1883
BROADCASTING DATA TO WEBSOCKET SERVER ws://localhost:8081
```

### Variáveis de Ambiente

O arquivo `config.iotws` deve estar na mesma pasta que o `server.js`.

### Instalação

1. Clone o repositório:

   ```bash
   git clone <URL do repositório>
   ```

2. Navegue para o diretório do projeto:

   ```bash
   cd <nome do diretório>
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

### Execução

1. Inicie o servidor:

   ```bash
   node server.js
   ```

   O servidor Express estará disponível em `http://localhost:3000`.

2. **Endpoint POST (Para Desenvolvimento)**:

   Utilize a rota POST para enviar dados para um tópico MQTT para fins de teste apenas. O endpoint é `http://localhost:3000/mqtt` e o corpo da requisição deve estar em JSON:

   ```json
   {
     "topic": "nome/do/topico",
     "message": "mensagem a ser publicada"
   }
   ```

   **Nota:** O principal canal de entrada de dados é o broker MQTT. A rota HTTP é oferecida apenas para facilitar testes de desenvolvimento.

3. **WebSocket**:

   Conecte-se ao WebSocket na URL configurada (por exemplo, `ws://localhost:8081`) para receber dados em tempo real.

## Exemplo de Uso

### Enviar Dados via POST

```bash
curl -X POST http://localhost:3000/mqtt \
     -H "Content-Type: application/json" \
     -d '{"topic": "topic1", "message": "Hello World!"}'
```

### Conectar ao WebSocket

Use um cliente WebSocket para se conectar à URL configurada e receber mensagens.

## Troubleshooting

- **Porta 8081**: Se a porta 8081 estiver ocupada, libere-a com:

  ```bash
  sudo kill $(lsof -i :8081 | awk 'NR>1 {print $2}')
  ```

- **Erro de Conexão MQTT**: Verifique a URL do broker MQTT no arquivo `config.iotws`.

---

Se precisar de mais alguma coisa ou ajustes adicionais, estou à disposição!