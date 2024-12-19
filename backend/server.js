require("dotenv").config(); // Cargar variables de entorno desde el archivo .env
const express = require("express");
const cors = require("cors");
const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");

const app = express();
app.use(cors());

// Configurar cliente de DynamoDB
const dynamoDBClient = new DynamoDBClient({
    region: "eu-west-3",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Endpoint para obtener mensajes
app.get("/messages", async (req, res) => {
    const params = {
        TableName: "Mensajes_LOGIC", 
    };

    try {
        const data = await dynamoDBClient.send(new ScanCommand(params));
        res.json(data.Items); // Enviar los mensajes al frontend
    } catch (error) {
        console.error("Error al obtener mensajes:", error);
        res.status(500).json({ error: "Error al obtener mensajes" });
    }
});

// Iniciar el servidor en el puerto 80 y en todas las interfaces
const PORT = 3001; // Puerto 80 para acceso HTTP
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
