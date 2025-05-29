// utils/helpers.js

import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

export function validarCampo(valor, regex, campo) {
    if (!regex.test(valor)) {
        return `El campo ${campo} no es válido.`;
    }
    return null;
}

export function calcularEdad(fechaNacimiento) {
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }

    return edad;
}

export async function buscarCedula(cedula, nombres, universidad) {
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
        const json_response = response.data.items[0];

        if (json_response) {
            const universidadResponse = json_response.universidad.toUpperCase().replace(/'/g, '');
            if (
                cedula.toLowerCase() === json_response.idCedula.toLowerCase() &&
                nombres.toLowerCase() === json_response.nombre.toLowerCase() &&
                universidad.toLowerCase() === universidadResponse
            ) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error al buscar la cédula:', error);
        return false;
    }
}

export async function crearVerificacion() {
    const config = {
        method: 'post',
        url: 'https://api.verificamex.com/identity/v2/identity/sessions',
        headers: {
            accept: 'application/json',
            authorization: process.env.TOKEN_VERIFICAMEX
        },
        data: {
            validations: ["INE"],
            redirect_url: "https://nattib-salud.azurewebsites.net/"
        }
    };

    const response = await axios(config);
    return response.data.data.id;
}
