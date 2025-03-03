// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  /*host: 'localhost',
  user: 'root', // Cambia esto por tu usuario de MySQL
  password: '', // Cambia esto por tu contraseña de MySQL
  database: 'nattib_salud' // Cambia esto por el nombre de tu base de datos*/
  host:"nattib-salud-server.mysql.database.azure.com", 
  user:"qisbhtsron",
  password:"{your_password}", 
  database:"{your_database}", 
  port:3306, 
  ssl:{ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database');
});

module.exports = connection;