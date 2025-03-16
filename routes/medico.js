const express = require('express');
const bodyParser = require('body-parser');
const connection = require('../db.js');
const env = require('dotenv').config();
const CryptoJS = require('crypto-js');
const regex = require('../public/js/regex.js');
const axios = require('axios');
const FormData = require('form-data');
const router = express.Router();
const { validarCampo, buscarCedula, crearVerificacion } = require('../utils/helpers.js');

// Endpoint de registro de Médicos
router.post('/registro', async (req, res) => {
    console.log('Datos recibidos:', req.body); // Verifica los datos recibidos
    const { nombres, apellidos, curp, fecha_nac, universidad, cedula, email, contrasena } = req.body;

    // Validación de campos obligatorios
    if (!nombres || !apellidos || !curp || !universidad || !cedula || !email || !fecha_nac || !contrasena) {
        return res.status(400).send('Todos los campos son requeridos');
    }

    const cedulaValida = await buscarCedula(cedula, nombres, universidad);
    if (!cedulaValida) {
        return res.status(400).send('La cédula es incorrecta o no coinciden los datos');
    }
    const id_verificamex = await crearVerificacion();
    const url_verificamex = "https://app.verificamex.com/verification/" + id_verificamex;
    console.log("URL VERIFICAMEX" , url_verificamex);


    const errores = [];
    errores.push(validarCampo(nombres, regex.nombres, 'nombres'));
    errores.push(validarCampo(apellidos, regex.apellidos, 'apellidos'));
    errores.push(validarCampo(curp, regex.curp, 'CURP'));
    errores.push(validarCampo(fecha_nac, regex.fecha_nac, 'fecha de nacimiento'));
    errores.push(validarCampo(universidad, regex.universidad, 'universidad'));
    errores.push(validarCampo(cedula, regex.cedula, 'cédula'));
    errores.push(validarCampo(email, regex.email, 'email'));
    errores.push(validarCampo(contrasena, regex.contrasena, 'contraseña'));

    // Filtrar errores (eliminar valores nulos)
    const mensajesError = errores.filter(error => error !== null);

    // Si hay errores, devolverlos
    if (mensajesError.length > 0) {
        return res.status(400).send(mensajesError.join('\n'));
    }

    // Función de encriptación de contraseña con crypto-js
    const clave = process.env.SECRET_KEY;
    const iv = CryptoJS.lib.WordArray.random(16);
    const pass_cifrada = CryptoJS.AES.encrypt(contrasena, clave, { iv }).toString();

    // Consulta SQL ajustada para coincidir con las columnas de la tabla
    const query = `
        INSERT INTO medicos (nombres, apellidos, curp, fecha_nac, universidad, cedula, email, contrasena, id_verificamex)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)
    `;

    // Valores a insertar
    const values = [nombres, apellidos, curp, fecha_nac, universidad, cedula, email, pass_cifrada, id_verificamex];

    // Depuración: Imprime la consulta y los valores
    console.log('Consulta SQL:', query);
    console.log('Valores a insertar:', values);

    // Ejecutar la consulta
    connection.query(query, values, async (err, results) => {
        if (err) {
            console.error('Error inserting data:', err.stack);
            return res.status(500).json({ success: false, message: 'Error inserting data' });
        }
        // Si no hay errores, enviar una respuesta de éxito
        res.status(200).json({ success: true, message: 'Registro exitoso', id: results.insertId, url: url_verificamex});
    });
});


// Traer pacientes de medicos
router.get('/pacientes/:medico_id', (req, res) => {
    const medico_id = req.params.medico_id;

    const query = 'SELECT * FROM pacientes WHERE medico_id = ?';
    connection.query(query, [medico_id], (err, results) => {
      if(err){
        console.error('Error en la consulta', err.stack);
        return res.status(500).json({success: false, message: 'ERROR EN EL SERVIDOR'});
      }
      res.status(200).json({ success: true, pacientes: results });
    })
});


//REGISTRO PACIENTES 
router.post('/registrar-paciente', (req, res) => {
    const { nombres, apellidos, fecha_nac, telefono, direccion, medico_id } = req.body;

    // Iniciar una transacción para asegurar la atomicidad
    connection.beginTransaction((err) => {
        if (err) {
            console.error('Error starting transaction:', err.stack);
            return res.status(500).json({ success: false, message: 'Error starting transaction' });
        }

        // 1. Insertar el paciente
        const queryPaciente = `
            INSERT INTO pacientes (nombres, apellidos, fecha_nac, telefono, direccion, medico_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const valuesPaciente = [nombres, apellidos, fecha_nac, telefono, direccion, medico_id];

        connection.query(queryPaciente, valuesPaciente, (err, resultsPaciente) => {
            if (err) {
                return connection.rollback(() => {
                    console.error('Error inserting paciente:', err.stack);
                    res.status(500).json({ success: false, message: 'Error inserting paciente' });
                });
            }

            const id_paciente = resultsPaciente.insertId; // ID del paciente recién creado

            // 2. Crear un expediente vacío para el paciente
            const queryExpediente = `
                INSERT INTO expediente_info (id_paciente, medico_id, antecedentes_pat, no_patologicos, fecha_registro)
                VALUES (?, ?, '', '', CURDATE())
            `;
            const valuesExpediente = [id_paciente, medico_id];

            connection.query(queryExpediente, valuesExpediente, (err, resultsExpediente) => {
                if (err) {
                    return connection.rollback(() => {
                        console.error('Error inserting expediente:', err.stack);
                        res.status(500).json({ success: false, message: 'Error inserting expediente' });
                    });
                }

                const expedienteId = resultsExpediente.insertId; // ID del expediente recién creado

                // 3. Crear una cita médica vacía para el paciente
                const queryCita = `
                    INSERT INTO consulta_ficha (id_paciente, medico_id, padecimiento, exploracion_fisica, diagnostico, tratamiento, estudios_comp, fecha_registro)
                    VALUES (?, ?, '', '','','','',CURDATE())
                `;
                const valuesCita = [id_paciente, medico_id];

                connection.query(queryCita, valuesCita, (err, resultsCita) => {
                    if (err) {
                        return connection.rollback(() => {
                            console.error('Error inserting cita medica:', err.stack);
                            res.status(500).json({ success: false, message: 'Error inserting cita medica' });
                        });
                    }

                    const citaId = resultsCita.insertId; // ID de la cita médica recién creada

                    // Confirmar la transacción
                    connection.commit((err) => {
                        if (err) {
                            return connection.rollback(() => {
                                console.error('Error committing transaction:', err.stack);
                                res.status(500).json({ success: false, message: 'Error committing transaction' });
                            });
                        }

                        // Respuesta exitosa con los IDs generados
                        res.status(200).json({
                            success: true,
                            message: 'Paciente, expediente y cita médica registrados exitosamente',
                            paciente_id: id_paciente,
                            expediente_id: expedienteId,
                            cita_id: citaId
                        });
                    });
                });
            });
        });
    });
});
//VER CARD PACIENTE 
router.get('/pacientes/:medico_id/:paciente_id', (req, res)=>{
    const paciente_id = req.params.paciente_id;
    const medico_id = req.params.medico_id;
const query = 'SELECT * FROM pacientes WHERE medico_id =? AND id_pacientes =?';
connection.query(query,[medico_id,paciente_id], (err, results) =>{
    if(err){
        console.error('Error en la consulta', err.stack);
        return res.status(500).json({success: false, message: 'ERROR EN EL SERVIDOR'});
      }
      res.status(200).json({ success: true, pacientes: results });
})
});
//Guardar expediente paciente
router.post('/save/expediente', (req, res)=>{
    //poner el req body
    const query = `
    INSERT INTO expediente_info (antecedentes_pat, no_patologicos)`;

});
//Guardar consulta medica paciente
router.post('/save/consulta_medica', (req, res)=>{
    //poner el req body
    const query = `
    INSERT INTO expediente_info (antecedentes_pat, no_patologicos)`;

});



module.exports = router;