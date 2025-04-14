// db.js
import mysql from 'mysql';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const serverCa = [fs.readFileSync("DigiCertGlobalRootCA.crt.pem", "utf8")];

var connection = mysql.createConnection({
  host: process.env.AZURE_MYSQL_HOST,
  user: process.env.AZURE_MYSQL_USER,
  password: process.env.AZURE_MYSQL_PASSWORD,
  database: 'inhera-database',
  port: 3306,
  ssl: {
    ca: serverCa  }
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database');
});

export default connection;
