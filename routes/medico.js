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
    connection.beginTransaction((err) => {
        if (err) {
            console.error('Error starting transaction:', err.stack);
            return res.status(500).json({ success: false, message: 'Error starting transaction' });
        }
    
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
            } else {
                connection.commit((err) => {
                    if (err) {
                        return connection.rollback(() => {
                            console.error('Error committing transaction:', err.stack);
                            res.status(500).json({ success: false, message: 'Error committing transaction' });
                        });
                    }
                    res.status(200).json({
                        success: true,
                        message: 'Paciente registrado exitosamente',
                        paciente_id: resultsPaciente.insertId
                    });
                });
            }
        });
    });    
 
});

/*
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
            });*/
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
// Crear expediente paciente
router.post('/create/expediente', (req, res) => {
    const {id_paciente, medico_id, ant_pat, no_pat} = req.body;
    const queryExpediente = `
    INSERT INTO expediente_info (id_paciente, medico_id, antecedentes_pat, no_patologicos, fecha_registro) 
    VALUES (?, ?, ?, ?, CURDATE())`;
    
    connection.query(queryExpediente, [id_paciente, medico_id, ant_pat, no_pat], (err) => {
        if (err) {
            console.error('Error en la consulta', err.stack);
            return res.status(500).json({ success: false, message: 'ERROR EN EL SERVIDOR' });
        }
        res.status(200).json({ success: true });
    });
});

// Crear consulta médica paciente
router.post('/create/consulta_medica', (req, res) => {
    const { id_paciente, medico_id, pad, exp_fisica, diag, trat, est_comp} = req.body;
    const queryCita = `
    INSERT INTO consulta_ficha (id_paciente, medico_id, padecimiento, exploracion_fisica, diagnostico, tratamiento, estudios_comp, fecha_registro) 
    VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`;
    
    connection.query(queryCita, [id_paciente, medico_id, pad, exp_fisica, diag, trat, est_comp], (err) => {
        if (err) {
            console.error('Error en la consulta', err.stack);
            return res.status(500).json({ success: false, message: 'ERROR EN EL SERVIDOR' });
        }
        res.status(200).json({ success: true });
    });
});


//Actualizar expediente paciente
router.put('/update/expediente', (req, res)=>{
    const { ant_pat, no_pat, id_expediente } = req.body;
    const queryExpediente = `
    UPDATE expediente_info SET antecedentes_pat = ?, no_patologicos = ? WHERE id_expediente = ?`;
    connection.query(queryExpediente,[ant_pat,no_pat, id_expediente], (err)=>{
        if(err){
            console.error('Error en la consulta', err.stack);
            return res.status(500).json({success: false, message: 'ERROR EN EL SERVIDOR'});
        }
        res.status(200).json({success: true});
    })

});
//Actualizar consulta medica paciente
router.put('/update/consulta_medica', (req, res)=>{
    const { pad, exp_fisica, diag, trat, est_comp, id_consulta } = req.body;
    const queryCita = `
    UPDATE consulta_ficha SET padecimiento = ?, exploracion_fisica = ?, diagnostico = ?, tratamiento = ?
    , estudios_comp = ? WHERE id_consulta = ? `;
    connection.query(queryCita,[pad,exp_fisica,diag,trat,est_comp, id_consulta], (err)=>{
        if(err){
            console.error('Error en la consulta', err.stack);
            return res.status(500).json({success: false, message: 'ERROR EN EL SERVIDOR'});
        }
        res.status(200).json({success: true});
    })
});


//Obtener consultas medicas de paciente por su id y por el id medico
router.get('/get/consultas_medicas', (req, res) => {
    const { id_paciente, medico_id } = req.query; // Cambiado de req.body a req.query

    if (!id_paciente || !medico_id) {
        return res.status(400).json({ success: false, message: 'Faltan parámetros' });
    }

    const query = `
        SELECT * FROM consulta_ficha WHERE id_paciente = ? AND medico_id = ?
    `;

    connection.query(query, [id_paciente, medico_id], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err.stack);
            return res.status(500).json({ success: false, message: 'ERROR EN EL SERVIDOR' });
        }
        res.status(200).json({ success: true, consultas: results });
    });
});

//Obtener consulta medica de paciente por su id y por el id medico y por el id de consulta
router.get('/get/consulta_medica', (req, res) => {
    const { id_paciente, medico_id, id_consulta } = req.query; // Cambiado de req.body a req.query

    if (!id_paciente || !medico_id || !id_consulta) {
        return res.status(400).json({ success: false, message: 'Faltan parámetros' });
    }

    const query = `
        SELECT * FROM consulta_ficha WHERE id_paciente = ? AND medico_id = ? AND id_consulta = ?
    `;

    connection.query(query, [id_paciente, medico_id, id_consulta], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err.stack);
            return res.status(500).json({ success: false, message: 'ERROR EN EL SERVIDOR' });
        }
        res.status(200).json({ success: true, consulta: results });
    });
});

//Obtener expedientes de paciente por su id y por el id medico
router.get('/get/expedientes', (req, res) => {
    const { id_paciente, medico_id } = req.query; // Cambiado de req.body a req.query

    if (!id_paciente || !medico_id) {
        return res.status(400).json({ success: false, message: 'Faltan parámetros' });
    }

    const query = `
        SELECT * FROM expediente_info WHERE id_paciente = ? AND medico_id = ?
    `;

    connection.query(query, [id_paciente, medico_id], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err.stack);
            return res.status(500).json({ success: false, message: 'ERROR EN EL SERVIDOR' });
        }
        res.status(200).json({ success: true, expedientes: results });
    });
});



module.exports = router;