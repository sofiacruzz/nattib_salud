// db.js
const mysql = require('mysql2');
const fs = require('fs');
const connection = mysql.createConnection({
  /*host: 'localhost',
  user: 'root', // Cambia esto por tu usuario de MySQL
  password: '', // Cambia esto por tu contraseña de MySQL
  database: 'nattib_salud' // Cambia esto por el nombre de tu base de datos*/
  host:AZURE_MYSQL_HOST, 
  user:AZURE_MYSQL_USER,
  password: AZURE_MYSQL_PASSWORD, 
  database:'nattib_salud_db', 
  port:AZURE_MYSQL_PORT, 
  ssl:AZURE_MYSQL_SSL
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database');
});

module.exports = connection;