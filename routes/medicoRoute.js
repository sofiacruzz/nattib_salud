import { Router } from 'express';
import  { MedicoController }  from '../controllers/medicoController.js';
import { verifyToken } from '../middlewares/jwtMiddleware.js';

const router = Router();

// Endpoint de registro de Médicos
router.post('/registro', MedicoController.registro)
router.post('/login', MedicoController.login)
router.get('/pacientes', verifyToken, MedicoController.pacientes)
router.post('/registrar-paciente', verifyToken, MedicoController.registrarPacientes)
router.get('/pacientes/:medico_id/:paciente_id', verifyToken, MedicoController.getPacienteByIdAndMedicoId)
router.post('/create/expediente', verifyToken, MedicoController.createExpediente)
router.post('/create/consulta_medica', verifyToken, MedicoController.crearConsulta)
router.put('/update/expediente', verifyToken, MedicoController.updateExpediente)
router.put('/update/consulta_medica', verifyToken, MedicoController.actualizarConsulta)
router.get('/get/consultas_medicas', verifyToken, MedicoController.obtenerConsultas)
router.get('/get/consulta_medica', verifyToken, MedicoController.obtenerConsultaPorId)
router.get('/get/expedientes', verifyToken, MedicoController.getExpedientesByPacienteAndMedico)
export default router;