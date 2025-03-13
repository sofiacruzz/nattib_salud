document.addEventListener('DOMContentLoaded', async function () {
    console.log('DOM completamente cargado'); // Paso 1
    const medico_id = localStorage.getItem('medico_id');
    const paciente_id = localStorage.getItem('paciente_id');

    console.log('Medico ID:', medico_id); // Paso 2
    console.log('Paciente ID:', paciente_id); // Paso 3

    const apiUrl = `${API_URL}medico/pacientes/${medico_id}/${paciente_id}`;
    console.log('URL de la API:', apiUrl); // Paso 4

    try {
        console.log('Realizando solicitud...'); // Paso 5
        const response = await fetch(apiUrl);
        console.log('Respuesta de la API:', response); // Paso 6

        if (!response.ok) throw new Error('Error al obtener los datos');

        const data = await response.json();
        console.log('Datos de la API:', data); // Paso 7

        if (data.success) {
            const paciente = data.pacientes[0];
            document.getElementById('nombre').innerHTML = paciente.nombres;
            document.getElementById('fechaNacimiento').innerHTML = paciente.fecha_nac;
            document.getElementById('telefono').innerHTML = paciente.telefono;
            document.getElementById('direccion').innerHTML = paciente.direccion;
        } else {
            console.error('La API no devolvió datos exitosamente');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
