function formatearFecha(date) {
    const dia = String(date.getDate()).padStart(2, '0'); // Asegura 2 dígitos para el día
    const mes = String(date.getMonth() + 1).padStart(2, '0'); // Asegura 2 dígitos para el mes
    const anio = date.getFullYear(); // Obtiene el año
    return `${anio}-${mes}-${dia}`; // Retorna la fecha en formato YYYY-MM-DD
}
function cerrarSesion() {
    localStorage.removeItem('token'); // o sessionStorage.removeItem('token')
    window.location.href = '/index.html'; // redirige al login
  }
  
document.getElementById('registrarPacienteForm').addEventListener('submit', async (event) =>{
      event.preventDefault();

      const nombres = document.getElementById('nombres').value;
      const apellidos = document.getElementById('apellidos').value;
      const fecha_nac = document.getElementById('fecha_nac').value;
      const telefono = document.getElementById('telefono').value;
      const curp = document.getElementById('curp').value;

      const token = localStorage.getItem('token');

      if(!token){
          alert('No se encontro el id del medico');
          return;
      }
      const fechaActual = new Date();
      const fechaformateada = formatearFecha(fechaActual);
      console.log('addfecha' ,fechaformateada);


      const response = await fetch(`${API_URL}medico/registrar-paciente`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ nombres, apellidos, fecha_nac, telefono, curp, fecha_registro: fechaformateada})
          });
      
      const data = await response.json();
      if (data.success){
        const pacienteId = data.paciente_id;
        window.location.href = `cardpaciente.html?id=${pacienteId}`;
      } else {
          alert('Error al registrar el paciente');
      }
      
});