document.getElementById('registrarPacienteForm').addEventListener('submit', async (event) =>{
      event.preventDefault();

      const nombres = document.getElementById('nombres').value;
      const apellidos = document.getElementById('apellidos').value;
      const fecha_nac = document.getElementById('fecha_nac').value;
      const telefono = document.getElementById('telefono').value;
      const direccion = document.getElementById('direccion').value;

      const medico_id = localStorage.getItem('medico_id');
      console.log("id", medico_id);

      if(!medico_id){
          alert('No se encontro el id del medico');
          return;
      }
      const response = await fetch(API_URL + 'medico/registrar-paciente', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nombres, apellidos, fecha_nac, telefono, direccion, medico_id })
          });
      
      const data = await response.json();
      if (data.success){
          alert('Paciente registrado con exito');
          window.location.href = 'dashboard.html';
      } else {
          alert('Error al registrar el paciente');
      }

});