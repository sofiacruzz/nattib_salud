// db.js
const mysql = require('mysql2');
const fs = require('fs');
const connection = mysql.createConnection({
  /*host: 'localhost',
  user: 'root', // Cambia esto por tu usuario de MySQL
  password: '', // Cambia esto por tu contraseña de MySQL
  database: 'nattib_salud' // Cambia esto por el nombre de tu base de datos*/
  host:process.env.AZURE_MYSQL_HOST, 
  user:process.env.AZURE_MYSQL_USER,
  password: process.env.AZURE_MYSQL_PASSWORD, 
  database:'nattib_salud_db', 
  port:3306, 
  ssl:{ca:fs.readFileSync('DigiCertGlobalRootCA.crt.pem')}
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database');
});

module.exports = connection;