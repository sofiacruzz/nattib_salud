import axios from 'axios';
import FormData from 'form-data';
import iconv from 'iconv-lite';

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
            responseType: 'arraybuffer', // ← importante
            data: data
        };

        const response = await axios(config);

        // Decodificar correctamente usando Latin-1
        const decoded = iconv.decode(response.data, 'latin1');
        const json = JSON.parse(decoded);

        // Función para limpiar y normalizar texto
        const limpiarTexto = (texto) => {
            if (!texto || typeof texto !== 'string') return '';
            return texto
                .toUpperCase()
                .replace(/'/g, '') // eliminar apóstrofes
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, ''); // quitar acentos
        };

        const json_response = json.items[0];

        if (json_response) {
            const cedulaJson = limpiarTexto(json_response.idCedula);
            const nombreJson = limpiarTexto(json_response.nombre);
            const universidadJson = limpiarTexto(json_response.desins);

            const cedulaInput = limpiarTexto(cedula.toString());
            const nombresInput = limpiarTexto(nombres);
            const universidadInput = limpiarTexto(universidad);

            if (
                cedulaInput === cedulaJson &&
                nombresInput === nombreJson &&
                universidadInput === universidadJson
            ) {
                console.log("✔ La cédula, nombre y universidad coinciden.");
                return true;
            } else {
                console.log("INFOO", `"${cedulaInput}"`, `"${nombresInput}"`, `"${universidadInput}"`);
                console.log("INFOO2", `"${cedulaJson}"`, `"${nombreJson}"`, `"${universidadJson}"`);
                console.log("✖ La cédula, el nombre o la universidad no coinciden.");
                return false;
            }
        } else {
            console.log("✖ Cédula no encontrada: el array 'items' está vacío.");
            return false;
        }
    } catch (error) {
        console.error('❌ Error al buscar la cédula:', error.message);
        return false;
    }
}

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
