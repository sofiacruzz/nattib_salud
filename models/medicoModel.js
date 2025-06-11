import connection from "../db.js";
import CryptoJS from "crypto-js";
import dotenv from 'dotenv';

dotenv.config();

export default class MedicoModel {

    static async create({nombres, apellidos, curp, fecha_nac, universidad, cedula, email, pass_cifrada, id_verificamex, telefono, domicilio }) {
       
        return new Promise((resolve, reject) => {
            const id = crypto.randomUUID();
            const insertQuery = `
              INSERT INTO medicos (id, nombres, apellidos, curp, fecha_nac, universidad, cedula, email, contrasena, id_verificamex, telefono, domicilio)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
      
            const values = [id, nombres, apellidos, curp, fecha_nac, universidad, cedula, email, pass_cifrada, id_verificamex, telefono, domicilio];
      
            connection.query(insertQuery, values, (err) => {
              if (err) return reject(err);
              resolve(id);
            });
          });
      }
    
      static async findOneByEmail(email) {
        return new Promise((resolve, reject) => {
          const query = 'SELECT * FROM medicos WHERE email = ?';
          connection.query(query, [email], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) {
              return resolve(null); // <<< Aquí! Si no hay resultados, regreso null
            }
            resolve(results[0]);
          });
        });
      }
      
      
    static async login({ email, contrasena }) {
      return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM medicos WHERE email = ?', [email], (err, results) => {
          if (err) return reject(new Error(err));
          if (results.length == 0)
              {
                  return reject(new Error('Credenciales incorrectas'));
              }
          const medicoInfo = results[0];
          const clave = process.env.SECRET_KEY;
          const pass_decrypted = CryptoJS.AES.decrypt(medicoInfo.contrasena, clave).toString(CryptoJS.enc.Utf8);
          if(contrasena === pass_decrypted){
              const {contrasena: _, ...publicMedico} = medicoInfo
              resolve(publicMedico)
          }else{
              return reject(new Error('Credenciales incorrectas'))
          }
        });
      });
    }

    static async cambiar_status_cuenta({id}) {
      return new Promise((resolve, reject) => {
        const query = `
          UPDATE medicos 
          SET id_estado = ?
          WHERE id = ?`;
  
        connection.query(query, [3, id], (err) => {
          if (err) return reject(err);
          resolve({ success: true });
        });
      });
    }

    static async info({medico_id}) {
      return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM medicos WHERE id = ? ';
        connection.query(query, [medico_id], (err, results) => {
          if(err){
            console.error('Error en la consulta', err.stack);
            return reject(new Error('Hubo un error'))
          }
          resolve({ success: true, informacion: results});
        })
      });
    }
    static async pacientes({ medico_id }) {
      return new Promise((resolve, reject) => {
        console.log("model", medico_id)
        const query = 'SELECT * FROM pacientes WHERE medico_id = ? ';
        connection.query(query, [medico_id], (err, results) => {
          if(err){
            console.error('Error en la consulta', err.stack);
            return reject(new Error('Hubo un error'))
          }
          resolve({ success: true, pacientes: results});
        })
      });
    }

    static async registrarPaciente({ nombres, apellidos, fecha_nac, telefono, curp, medico_id }) {
      return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();
        console.log("model:",  nombres);
        const query = `INSERT INTO pacientes (id, nombres, apellidos, 
        fecha_nac, telefono, curp, medico_id, fecha_registro) VALUES 
        (?, ?, ?, ?, ?, ?, ?, CURDATE())`;
        connection.query(query, [id, nombres, apellidos, fecha_nac, telefono, curp, medico_id], (err, results) => {
          if(err){
            console.error('Error en la consulta', err.stack);
            return reject(new Error('Hubo un error'))
          }
          resolve({success: true,  paciente_id: id
        });
        })
      });
    }


    static async getPacienteByIdAndMedicoId({ paciente_id, medico_id }) {
      return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM pacientes WHERE id = ? AND medico_id = ?';
        connection.query(query, [paciente_id, medico_id], (err, results) => {
          if (err) return reject(err);
          resolve({ success: true, pacientes: results[0] });
        });
      });
    }
    

    static async createExpediente({ medico_id, id_paciente, ant_pat, no_pat }) {
      return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();
        const queryExpediente = `
          INSERT INTO expediente_info (id, id_paciente, medico_id, antecedentes_pat, no_patologicos, fecha_registro) 
          VALUES (?, ?, ?, ?, ?, CURDATE())
        `;
    
        connection.query(queryExpediente, [id, id_paciente, medico_id, ant_pat, no_pat], (err, result) => {
          if (err) {
            console.error('Error en la consulta', err.stack);
            return reject(new Error('Error en el servidor al crear expediente'));
          }
          resolve({ success: true});
        });
      });
    }

static async crearConsulta({ id_paciente, medico_id, pad, exp_fisica, diag, trat, est_comp }) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const query = `
      INSERT INTO consulta_ficha 
      (id, id_paciente, medico_id, padecimiento, exploracion_fisica, diagnostico, tratamiento, estudios_comp, fecha_registro) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`;

    connection.query(query, [id, id_paciente, medico_id, pad, exp_fisica, diag, trat, est_comp], (err) => {
      if (err) {
        return reject(err);
      } else {
        resolve({ success: true, id_consulta: id });
      }
    });
  });
}

  
    static async actualizarConsulta({ pad, exp_fisica, diag, trat, est_comp, id_consulta }) {
      return new Promise((resolve, reject) => {
        const query = `
          UPDATE consulta_ficha 
          SET padecimiento = ?, exploracion_fisica = ?, diagnostico = ?, tratamiento = ?, estudios_comp = ? 
          WHERE id = ?`;
  
        connection.query(query, [pad, exp_fisica, diag, trat, est_comp, id_consulta], (err) => {
          if (err) return reject(err);
          resolve({ success: true });
        });
      });
    }
    static async obtenerConsultas({ id_paciente, medico_id }) {
      return new Promise((resolve, reject) => {
          const query = `
              SELECT * 
              FROM consulta_ficha 
              WHERE id_paciente = ? AND medico_id = ?
          `;
          connection.query(query, [id_paciente, medico_id], (err, results) => {
              if (err) {
                  console.error('Error en la consulta:', err);
                  return reject(new Error('Hubo un error al obtener las consultas'));
              }
              resolve(results);
          });
      });
  }
  
  
  static async obtenerConsultaPorId({ id_paciente, medico_id, id }) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM consulta_ficha
            WHERE id_paciente = ? AND medico_id = ? AND id = ?
        `;
        connection.query(query, [id_paciente, medico_id, id], (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                return reject(new Error('Error al obtener la consulta'));
            }
            resolve(results);
        });
    });
}

  
    static async updateExpediente({ ant_pat, no_pat, id_expediente }) {
      return new Promise((resolve, reject) => {
        const query = `
          UPDATE expediente_info SET antecedentes_pat = ?, no_patologicos = ? WHERE id = ?`;
  
        connection.query(query, [ant_pat, no_pat, id_expediente], (err) => {
          if (err) {
            console.error('Error en la consulta:', err.stack);
            return reject(new Error('ERROR EN EL SERVIDOR'));
          }
          resolve({ success: true });
        });
      });
    }
  
    static async getExpedientesByPacienteAndMedico({ id_paciente, medico_id }) {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT * FROM expediente_info WHERE id_paciente = ? AND medico_id = ?`;
  
        connection.query(query, [id_paciente, medico_id], (err, results) => {
          if (err) {
            console.error('Error en la consulta:', err.stack);
            return reject(new Error('ERROR EN EL SERVIDOR'));
          }
          resolve({ success: true, expedientes: results });
        });
      });
    }
    

}

class Validation {
    static email (email){
        if (typeof email !== 'string') throw new Error('El correo debe ser un string');
    }
  }
  