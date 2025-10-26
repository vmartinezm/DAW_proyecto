import mysql from 'mysql';
import dotenv from 'dotenv';

// Cargar variables de entorno **antes de crear la conexión**
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

console.log('DB_NAME:', process.env.DB_NAME);

// Conectar a la base de datos
connection.connect(err => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos MySQL establecida.');
});

export default connection;
