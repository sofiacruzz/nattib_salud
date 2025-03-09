const CryptoJS = require('crypto-js');
const axios = require('axios');
const FormData = require('form-data');
const regex = require('../public/js/regex.js');
const env = require('dotenv').config();

// Función para validar un campo con su regex
function validarCampo(valor, regex, campo) {
    if (!regex.test(valor)) {
        return `El campo ${campo} no es válido.`;
    }
    return null;
}

// Función para buscar cédula
async function buscarCedula(cedula, nombres, universidad) {
    try {
        let data = new FormData();
        data.append('json', JSON.stringify({
            maxResult: "1000",
            nombre: "",
            paterno: "",
            materno: "",
            desins: "",
            idCedula: cedula
        }));

        let config = {
            method: 'post',
            url: 'https://www.cedulaprofesional.sep.gob.mx/cedula/buscaCedulaJson.action',
            headers: {
                ...data.getHeaders()
            },
            data: data
        };

        const response = await axios(config);
        console.log('Respuesta recibida:', response.data.items[0]);

        const json_response = response.data.items[0];
        if (json_response) {
            if (cedula.toString().toLowerCase() === json_response.idCedula.toString().toLowerCase() && 
                nombres.toLowerCase() === json_response.nombre.toLowerCase()) {
                console.log("La cédula y los nombres coinciden.");
                return true;
            } else {
                console.log("INFOO", `"${cedula}"`, `"${nombres}"`, `"${universidad}"`);
                console.log("INFOO2", `"${json_response.idCedula}"`, `"${json_response.nombre}"`, `"${json_response.desins}"`);
                console.log("La cédula o los nombres no coinciden.");
                return false;
            }
        } else {
            console.log("Cédula no encontrada: el array 'items' está vacío.");
            return false;
        }
    } catch (error) {
        console.error('Error al buscar la cédula:', error);
        return false;
    }
}

// Función para crear verificación en Verificamex
async function crearVerificacion() {
    let config = {
        method: 'post',
        url: 'https://api.verificamex.com/identity/v2/identity/sessions',
        headers: {
            accept: 'application/json',
            authorization: process.env.TOKEN_VERIFICAMEX
        },
        data: {
            "validations": ["INE"],
            "redirect_url": "https://nattib-salud.azurewebsites.net/"
        }
    };

    const response = await axios(config);
    const id = response.data.data.id;
    //console.log('Respuesta recibida verificamex:', response.data.data.id);
    return id;
}

module.exports = {
    validarCampo,
    buscarCedula,
    crearVerificacion
};