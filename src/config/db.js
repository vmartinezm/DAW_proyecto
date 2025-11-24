/**
 * @file db.js
 * @description Configuración y conexión a MySQL. Este módulo exporta una única conexión reutilizable en toda la aplicación.
 */

// Importar dependencias
import mysql from "mysql";
import dotenv from "dotenv";

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Crear la conexión a MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Conectar a MySQL
connection.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar a MySQL:", err);
    return;
  }
  console.log("✅ Conexión a MySQL establecida.");
});

// Exportar la conexión para su uso en otros módulos
export default connection;