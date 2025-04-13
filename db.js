// db.js
import mysql from 'mysql';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.AZURE_MYSQL_HOST,
  user: process.env.AZURE_MYSQL_USER,
  password: process.env.AZURE_MYSQL_PASSWORD,
  database: 'nattib_salud_db',
  port: 3306,
  ssl: {
    ca: fs.readFileSync(new URL('DigiCertGlobalRootCA.crt.pem', import.meta.url)),
    rejectUnauthorized: false
  }
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database');
});

export default connection;
