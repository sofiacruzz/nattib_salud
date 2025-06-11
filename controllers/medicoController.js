import CryptoJS from "crypto-js";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'
import MedicoModel from '../models/medicoModel.js'
import { validarCampo, regex, crearVerificacion, buscarCedula, check_verificamex } from '../services/medicoService.js';
import { generarDefinicionPDF } from '../utils/pdf/generador.js';
import { calcularEdad } from '../utils/helpers.js';
import pdfMake from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';
import { BlobServiceClient } from '@azure/storage-blob';

dotenv.config();


const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'nana';

const registro = async (req, res) => {
    try {
        let { nombres, apellidos, curp, fecha_nac, universidad, cedula, email, contrasena, telefono, domicilio } = req.body;
        nombres = nombres.toUpperCase().replace(/'/g, '');
        apellidos = apellidos.toUpperCase().replace(/'/g, '');

        if (!nombres || !apellidos || !curp || !universidad || !cedula || !email || !fecha_nac || !contrasena) {
            return res.status(400).json({ msg: 'Todos los campos son requeridos' });
        }

        const errores = [];
        errores.push(validarCampo(nombres, regex.nombres, 'nombres'));
        errores.push(validarCampo(apellidos, regex.apellidos, 'apellidos'));
        errores.push(validarCampo(curp, regex.curp, 'CURP'));
        errores.push(validarCampo(fecha_nac, regex.fecha_nac, 'fecha de nacimiento'));
        errores.push(validarCampo(universidad, regex.universidad, 'universidad'));
        errores.push(validarCampo(cedula, regex.cedula, 'cédula'));
        errores.push(validarCampo(email, regex.email, 'email'));
        errores.push(validarCampo(contrasena, regex.contrasena, 'contraseña'));

        const mensajesError = errores.filter(e => e !== null);
        if (mensajesError.length > 0) {
            return res.status(400).json({ errores: mensajesError });
        }

        const medicoExist = await MedicoModel.findOneByEmail(email);
        if (medicoExist) {
            return res.status(409).json({ msg: "Email existente" });
        }

        const cedulaValida = await buscarCedula(cedula, nombres, universidad);
        if (!cedulaValida) {
            return res.status(400).json({ msg: 'La cédula es incorrecta o no coinciden los datos a registrar' });
        }

        const id_verificamex = await crearVerificacion();
        const url_verificamex = "https://app.verificamex.com/verification/" + id_verificamex;
        const clave = process.env.SECRET_KEY;
        const iv = CryptoJS.lib.WordArray.random(16);
        const pass_cifrada = CryptoJS.AES.encrypt(contrasena, clave, { iv }).toString();

        const newMedico = await MedicoModel.create({
            nombres, apellidos, curp, fecha_nac, universidad,
            cedula, email, pass_cifrada, id_verificamex, telefono, domicilio
        });


        return res.status(201).json({ success: true, uuid: newMedico, url: url_verificamex});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Error del servidor' });
    }
};
 const login = async(req, res) => {
    try {
        const { email, contrasena } = req.body;

        if(!email || !contrasena){
            return res.status(400).json({
                error: "Todos los campos son obligatorios"
            })
        }

        const medicoExist = await MedicoModel.findOneByEmail(email);
        if (!medicoExist) {
            return res.status(409).json({ msg: "Email no registrado" });
        }
        
        // Primero, revisar el status
        if (medicoExist.id_estado === 1) {
            const { status, result} = await check_verificamex(medicoExist.id_verificamex);
            if(status == "OPEN"){
                console.log("open", status)
                const link = 'https://app.verificamex.com/verification/'+ medicoExist.id_verificamex;
                return res.status(401).json({ success: 'pending', msg:  link});
            }else if(status == "FAILED"){
                return res.status(401).json({ msg: "Lo sentimos no pudimos verificar tu identidad." });
            }else if(status == "FINISHED" && result > 98){
                console.log("finished", status)
                try {
                    const result = await MedicoModel.cambiar_status_cuenta({ id: medicoExist.id });
                    const clave = process.env.SECRET_KEY;
                    const pass_decrypted = CryptoJS.AES.decrypt(medicoExist.contrasena, clave).toString(CryptoJS.enc.Utf8);
                    
                    if (contrasena === pass_decrypted) {
                        const token = jwt.sign(
                            {
                                medico_id: medicoExist.id,
                                email: email
                            },
                            process.env.SECRET_KEY,
                            { expiresIn: "1h" }
                        );
                        return res.status(200).json({ success: true, token: token });
                    } else {
                        return res.status(401).json({ success: false, msg: 'Credenciales incorrectas' });
                    }                    
                } catch (error) {
                    console.error("Error updating status:", error);
                }                
                
            }
            return res.status(401).json({ msg: "Registro en validacion, intente mas tarde." });
        }else if (medicoExist.id_estado == 3) {
                    const clave = process.env.SECRET_KEY;
                    const pass_decrypted = CryptoJS.AES.decrypt(medicoExist.contrasena, clave).toString(CryptoJS.enc.Utf8);
                    
                    if (contrasena === pass_decrypted) {
                        const token = jwt.sign(
                            {
                                medico_id: medicoExist.id,
                                email: email
                            },
                            process.env.SECRET_KEY,
                            { expiresIn: "1h" }
                        );
                        return res.status(200).json({ success: true, token: token });
                    } else {
                        return res.status(401).json({ success: false, msg: 'Credenciales incorrectas' });
                    }                    
            }

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error server'
        })
    }
}

const info= async(req, res) => {
    try {
        const { medico_id } = req;
        console.log("controller", medico_id)
        const info = await MedicoModel.info({medico_id})
        return res.json(info)
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error server'
        })
    }
}
//lista pacientes por medico
const pacientes= async(req, res) => {
    try {
        const { medico_id } = req;
        console.log("controller", medico_id)
        const listadoPacientes = await MedicoModel.pacientes({medico_id})
        return res.json(listadoPacientes)
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error server'
        })
    }
}
const registrarPacientes= async(req, res) => {
    try {
        const { nombres, apellidos, fecha_nac, telefono, curp } = req.body;
        const { medico_id } = req;
        console.log(nombres)
        console.log(medico_id)
        const result = await MedicoModel.registrarPaciente({ nombres, apellidos, fecha_nac, telefono, curp, medico_id })
        return res.json(result)
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error server'
        })
    }
}
const getPacienteByIdAndMedicoId = async (req, res) => {
    try {
        const { paciente_id } = req.params;
        const { medico_id } = req; // Este viene del token (middleware)

        const resultado = await MedicoModel.getPacienteByIdAndMedicoId({ paciente_id, medico_id });
        return res.json(resultado);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error en el servidor'
        });
    }
};


const crearConsulta = async(req, res) => {
    try {
    const { id_paciente, pad, exp_fisica, diag, trat, est_comp } = req.body;
    const { medico_id } = req;
    const result = await MedicoModel.crearConsulta({ id_paciente, medico_id, pad, exp_fisica, diag, trat, est_comp });
    const consultaId = result.id_consulta; 
    console.log(consultaId)
    // 2. Obtener info de paciente y médico
    const paciente = await MedicoModel.getPacienteByIdAndMedicoId(id_paciente, medico_id); // crea esta función
    
    const medico = await MedicoModel.info(medico_id); // crea esta función
    const edad = calcularEdad(paciente.fecha_nac); // función auxiliar

    const consulta = { pad, exp_fisica, diag, tratamiento: trat, estudios_comp: est_comp };

    // 3. Generar definición PDF
    const docDefinition = generarDefinicionPDF({ paciente, consulta, medico, edad });

    // 4. Crear buffer del PDF
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    const pdfBuffer = await new Promise((resolve, reject) => {
      pdfDocGenerator.getBuffer(buffer => resolve(buffer));
    });

    // 5. Subir a Azure
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    const blobName = `${consultaId}.pdf`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(pdfBuffer, {
      blobHTTPHeaders: { blobContentType: "application/pdf" }
    });

    // 6. Enviar respuesta
    return res.json({
      success: true,
      id: consultaId,
      pdfUrl: blockBlobClient.url
    });

  } catch (error) {
    console.error('Error al crear receta:', error);
    return res.status(500).json({ success: false, msg: 'Error en el servidor' });
  }
}

const createExpediente = async(req, res) => {
    try {
        const { id_paciente, ant_pat, no_pat } = req.body;
        const { medico_id } = req;
        const result = await MedicoModel.createExpediente({ medico_id, id_paciente, ant_pat, no_pat });
        return res.json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error server'
        });
    }
}

const actualizarConsulta = async(req, res) => {
    try {
        const { pad, exp_fisica, diag, trat, est_comp, id_consulta } = req.body;
        const result = await MedicoModel.actualizarConsulta({ pad, exp_fisica, diag, trat, est_comp, id_consulta });
        return res.json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error server'
        });
    }
}

const obtenerConsultas = async (req, res) => {
    try {
        const { id_paciente } = req.query;
        const { medico_id } = req; // del token

        const consultas = await MedicoModel.obtenerConsultas({ id_paciente, medico_id });
        return res.json({ success: true, consultas });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: 'Error server'
        });
    }
};


const obtenerConsultaPorId = async(req, res) => {
    try {
        const { id_paciente, id } = req.query; // id es id_consulta
        const { medico_id } = req; // llega desde el token

        const consulta = await MedicoModel.obtenerConsultaPorId({ id_paciente, medico_id, id });

        return res.json({ consulta });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error server'
        });
    }
}

const updateExpediente = async(req, res) => {
    try {
        const { ant_pat, no_pat, id_expediente } = req.body;
        const result = await MedicoModel.updateExpediente({ ant_pat, no_pat, id_expediente });
        return res.json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error server'
        });
    }
}

const getExpedientesByPacienteAndMedico = async(req, res) => {
    try {
        const { id_paciente } = req.query;
        const { medico_id } = req;
        const expedientes = await MedicoModel.getExpedientesByPacienteAndMedico({ id_paciente, medico_id });
        return res.json(expedientes);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error server'
        });
    }
}


class Validation {
    static email (email){
        if (typeof email !== 'string') throw new Error('El correo debe ser un string');
    }
  }
  
export const MedicoController ={
    login,
    info,
    registro,
    pacientes,
    registrarPacientes,
    getPacienteByIdAndMedicoId,
    crearConsulta,
    createExpediente,
    actualizarConsulta,
    obtenerConsultas,
    obtenerConsultaPorId,
    updateExpediente,
    getExpedientesByPacienteAndMedico

}