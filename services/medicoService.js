import axios from 'axios';
import FormData from 'form-data';

export const regex = {
    nombres: /^[a-zA-Z\s]{2,50}$/,
    apellidos: /^[a-zA-Z\s]{2,50}$/,
    curp: /^[A-Z]{4}\d{6}[HM][A-Z]{2}[A-Z]{3}[0-9A-Z]{2}$/,
    fecha_nac: /^\d{4}-\d{2}-\d{2}$/,
    universidad: /^.{2,100}$/,
    cedula: /^\d{7,8}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    contrasena: /^.{6,30}$/
};

export function validarCampo(valor, regex, campo) {
    if (!regex.test(valor)) {
        return `El campo ${campo} no es válido.`;
    }
    return null;
}

/*export async function buscarCedula(cedula, nombres, universidad) {
    try {
        const data = new FormData();
        data.append('json', JSON.stringify({
            maxResult: "1000",
            nombre: "",
            paterno: "",
            materno: "",
            desins: "",
            idCedula: cedula
        }));

        const config = {
            method: 'post',
            url: 'https://www.cedulaprofesional.sep.gob.mx/cedula/buscaCedulaJson.action',
            headers: { ...data.getHeaders() },
            data
        };

        const response = await axios(config);
        const json_response = response.data.items[0];

        return json_response &&
            cedula.toLowerCase() === json_response.idCedula.toLowerCase().trim() &&
            nombres.toLowerCase() === json_response.nombre.toLowerCase().trim();

    } catch (error) {
        console.error('Error al buscar la cédula:', error);
        return false;
    }
}*/

export async function crearVerificacion() {
    const config = {
        method: 'post',
        url: 'https://api.verificamex.com/identity/v2/identity/sessions',
        headers: {
            accept: 'application/json',
            authorization: 'Bearer '+ process.env.TOKEN_VERIFICAMEX
        },
        data: {
            validations: ["INE"],
            redirect_url: "https://inherasalud.com/"
        }
    };

    const response = await axios(config);
    return response.data.data.id;
}

export async function check_verificamex(id) {
    const config = {
        method: 'get',
        url: 'https://api.verificamex.com/v2/identity/sessions/'+id,
        headers: {
            authorization: 'Bearer '+ process.env.TOKEN_VERIFICAMEX
        }
    };

    const response = await axios(config);
    //console.log(response)
    return {
        status: response.data.data.status,
        result: response.data.data.result 
    };}
