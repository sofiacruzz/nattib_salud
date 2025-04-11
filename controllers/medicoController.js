import CryptoJS from "crypto-js";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'
import MedicoModel from '../models/medicoModel.js'
dotenv.config();

 const registro = async(req, res) => {
    try {
        const { nombres, apellidos, curp, fecha_nac, universidad, 
            cedula, email, contrasena, id_verificamex, 
            telefono, domicilio } = req.body;
            if (!nombres || !apellidos || !curp || !universidad || !cedula || !email || !fecha_nac || !contrasena)
                return res.status(400).json('Los campos no pueden estar vacíos');
            
            const medicoExist = await MedicoModel.findOneByEmail(email);
            if(medicoExist){
                return res.status(409).json({msg:"Email existente"})
            }

            Validation.email(email)
            const clave = process.env.SECRET_KEY;
            const iv = CryptoJS.lib.WordArray.random(16);
            const pass_cifrada = CryptoJS.AES.encrypt(contrasena, clave, { iv }).toString();
            
            const newMedico = await MedicoModel.create({ nombres, apellidos, 
                curp, fecha_nac, universidad, cedula, email, pass_cifrada, 
                id_verificamex, telefono, domicilio })
            
            const token = jwt.sign({
                id: newMedico,
                nombres:nombres,
                email: email
        

            },
            process.env.SECRET_KEY,{
                expiresIn: "1h"
            }
        )

            return res.status(201).json({ uuid: newMedico,  token: token});
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error server'
        })
    }
}
 const login = async(req, res) => {
    try {
        const { email, contrasena } = req.body;

        if(!email || !contrasena){
            return res.status(400).json({
                error: "Todos los campos son obligatorios"
            })
        }

        const medicoExist = await MedicoModel.findOneByEmail(email);
        if(!medicoExist){
            return res.status(409).json({msg:"Email no registrado"})
        }
        const clave = process.env.SECRET_KEY;
        const pass_decrypted = CryptoJS.AES.decrypt(medicoExist.contrasena, clave).toString(CryptoJS.enc.Utf8);
        if(contrasena === pass_decrypted){
            const token = jwt.sign({
                medico_id: medicoExist.id,
                email: email
        

            },
            process.env.SECRET_KEY,{
                expiresIn: "1h"
            })
            return res.status(200).json({success: true, token: token})
        }else{
            return res.status(401).json({success: false, msg: 'Credenciales incorrectas'})
        }

        res.send({ medico });      
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
        const { nombres, apellidos, fecha_nac, telefono, direccion } = req.body;
        const { medico_id } = req;
        console.log(nombres)
        console.log(medico_id)
        const result = await MedicoModel.registrarPaciente({ nombres, apellidos, fecha_nac, telefono, direccion, medico_id })
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
        return res.json({ success: true, paciente: resultado });
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
        return res.json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error server'
        });
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