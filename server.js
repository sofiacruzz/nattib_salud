const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connection = require('./db');
const env = require('dotenv').config();
const CryptoJS = require('crypto-js');
const regex = require('./public/js/regex.js');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const port = process.env.PORT || 3000;


app.use(cors({
    origin: 'http://127.0.0.1:5500' // Permite solo este origen
}));
app.use(bodyParser.json());
app.use(express.static('public'));

// Función para validar un campo con su regex
function validarCampo(valor, regex, campo) {
    if (!regex.test(valor)) {
        return `El campo ${campo} no es válido.`;
    }
    return null;
}

// Endpoint de registro de Médicos
app.post('/registro', async (req, res) => {
    console.log('Datos recibidos:', req.body); // Verifica los datos recibidos
    const { nombres, apellidos, curp, fecha_nac, universidad, cedula, email, contrasena } = req.body;

    // Validación de campos obligatorios
    if (!nombres || !apellidos || !curp || !universidad || !cedula || !email || !fecha_nac || !contrasena) {
        return res.status(400).send('Todos los campos son requeridos');
    }

    const cedulaValida = await buscarCedula(cedula, nombres);
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

// Función para buscar cédula
async function buscarCedula(cedula, nombres) {
    try {
        let data = new FormData();
        data.append('json', JSON.stringify({
            maxResult: "1000",
            nombre: "",
            paterno: "",
            materno: "",
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
        if (json_response != "") {
            if (cedula === json_response.idCedula && nombres === json_response.nombre) {
                console.log("La cédula y los nombres coinciden.");
                return true;
            } else {
               console.log("INFOO", cedula, nombres);
                console.log("La cédula o los nombres no coinciden.");
                console.log("INFOO2", json_response.idCedula, json_response.nombre);

                return true; //CAMBIARLEEEEE
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

async function crearVerificacion(){
  let config = {
    method: 'post',
    url : 'https://api.verificamex.com/identity/v2/identity/sessions',
    headers: {
      accept : 'application/json',
      authorization : 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiM2FlYWU2MGZjMjc5OWRmNTFkZmI1ZGFiYTQ1ZTY4NjQ4Yzg4ODA0NWFkODAyNmFhY2I4NGY5MDIzMDVmNjNlZDg2OTNiYTFiMTI3ZWFkNTEiLCJpYXQiOjE3NDA5NjY4NTcuNjM4OTk5LCJuYmYiOjE3NDA5NjY4NTcuNjM5MDMsImV4cCI6MTc3MjUwMjg1Ny42MjcyMzMsInN1YiI6IjQ5MjkiLCJzY29wZXMiOltdfQ.dFoZY5f9bQ25LZk5AjNQXF5KE569UIl9eY_f6gZVFcr9p-HKD_0a5DXsvWRh77uM5XjyWSifBRP3Td4lC14_Nv9ziX9EhpKQXEhcp48293y0iHlTCZx8pn89GhoxHI7In0gKOiFHzWS7fWtojWazfd_lSEhDJIOKGmyxXLQbF9q1KKqIQALFUjEm68yeD-HQ-MVddJXY95JACXW--glWxxObVXUiGa-PkK9sqob_fCgOWP1err-v5YgBNHcraKltKmjqDSPsw-ec5aheyg31n8gCn7Edpx5qVSTK7VHI8uX2std05wWs5d_W31DRx7C2bmK2ghYxTFerSo76rFQBOix0GorbEQLjrcPatCoRGlKPnGxO1vjKE7fpLiwJ_2Py2Q7ZF6Gs1c5XxijCN1zDBGCewc34JEBBymvZ2NFwLWNIJLS8AxcS6JHFaBzf4hGXrocnrRgZi4YFnmHvGj3jQhdh-a678ptB0gC_vKpf0tDgwjLZ170STUTjvFN5Y4qrvOlMLrQYQX7apZy4O6OCCHsWPuX_BnEWmch73xc1AxWju-ScjpWBRHoy0w8hA2fOp7QBFaF1CMrv2fLeFEsxMTCwBzBR-jNKECu8aBksoQiyxQ4cysP44Hf75jJP8OG7wy_nMokdzyZqdLbuplKZ6ue3qCjkBkgEydSPPES3Wl4'
    },
    data: {
      "validations": ["INE"],
      "redirect_url": "http://127.0.0.1:5500"
  
  }
  }
  const response = await axios(config);
  const id = response.data.data.id;
  console.log('Respuesta recibida verificamex:', response.data.data.id);
  return id;

}

// Endpoint para login del médico
app.post('/login', (req, res) => {
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

// Endpoint para obtener la información del médico por correo
app.get('/pacientes/:medico_id', (req, res) => {
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

//REGISTRO PACIENTES 
app.post('/registrar-paciente', (req, res) => {
  const {nombres, apellidos, fecha_nac, telefono, direccion, medico_id} = req.body;

  const query = `
        INSERT INTO pacientes (nombres, apellidos, fecha_nac, telefono, direccion, medico_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [nombres, apellidos, fecha_nac, telefono, direccion, medico_id];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err.stack);
            return res.status(500).json({ success: false, message: 'Error inserting data' });
        }
        res.status(200).json({ success: true, message: 'Paciente registrado exitosamente', id: results.insertId });
    });
});