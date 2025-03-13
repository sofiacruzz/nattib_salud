const express = require('express');
const connection = require('../db.js');
const env = require('dotenv').config();
const CryptoJS = require('crypto-js');
const axios = require('axios');
const FormData = require('form-data');
const router = express.Router();


// Endpoint para login del médico
router.post('/login', (req, res) => {
    const { usuario, password } = req.body;
    console.log('login', req.body);

    if(!usuario || !password){
      return res.status(400).json({ success: false, message: 'Correo y contraseñas son requeridos'});
    }
    const query = 'SELECT * FROM medicos WHERE email = ?';
    connection.query(query, [usuario], (err, results) =>{
      if (err) {
        console.error('ERROR EN LA CONSULTA', err.stack);
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
      }
      if(results.length == 0){
        return res.status(401).json({success:false, message: "Correo o contraseña incorrecta"});
      }
      const user = results[0];
        // Descifra la contraseña almacenada
        const clave = process.env.SECRET_KEY;
        const pass_decrypted = CryptoJS.AES.decrypt(user.contrasena, clave).toString(CryptoJS.enc.Utf8);
        if(password == pass_decrypted){
          return res.status(200).json({success: true, message: 'Login exitoso', user:{ id: user.id, nombres: user.nombres, email: user.email}
            
          });
        } else{
          return res.status(401).json({success: false, message: 'correo o contraseña incorrectos'});
        }
    }

    )
});
module.exports = router;