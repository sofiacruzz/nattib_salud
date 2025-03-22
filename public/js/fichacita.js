document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const id_consulta = urlParams.get('id_consulta');
    const id_paciente = urlParams.get('id_paciente');
    const medico_id = localStorage.getItem('medico_id');

    const apiUrl = `${API_URL}medico/pacientes/${medico_id}/${id_paciente}`;
    const apiUrlExpedientes = `${API_URL}medico/get/expedientes`;
    const apiUrlConsulta = `${API_URL}medico/get/consulta_medica`;

    //OBTENER INFORMACION PERSONAL DE PACIENTE
    async function fetchDataPaciente() {
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
                document.getElementById('fechaNacimiento').innerHTML = paciente.fecha_nac.split("T")[0];
                document.getElementById('telefono').innerHTML = paciente.telefono;
                document.getElementById('direccion').innerHTML = paciente.direccion;
            } else {
                console.error('La API no devolvió datos exitosamente');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    //OBTENER LA CONSULTA POR ID DE PACIENTE, ID MEDICO, ID CONSULTAS
    async function fetchDataConsulta() {
        try {
            // Crear la URL con los parámetros query
            const url = new URL(apiUrlConsulta);
            const params = { id_paciente, medico_id, id_consulta };
            url.search = new URLSearchParams(params).toString();
    
            const response = await fetch(url, {
                method: 'GET', 

            });
            console.log(url)
    
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
    
            const data = await response.json();  // Suponiendo que la respuesta es JSON
            const consulta = data.consulta[0];
            document.getElementById('pad').innerHTML = consulta.padecimiento;
            document.getElementById('exp_fisica').innerHTML = consulta.exploracion_fisica;
            document.getElementById('diag').innerHTML = consulta.diagnostico;
            document.getElementById('trat').innerHTML = consulta.tratamiento;
            document.getElementById('est_comp').innerHTML = consulta.estudios_comp;

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    async function fetchDataExpendiente() {
        try {
            // Crear la URL con los parámetros query
            const url = new URL(apiUrlExpedientes);
            const params = { id_paciente, medico_id, id_consulta };
            url.search = new URLSearchParams(params).toString();
    
            const response = await fetch(url, {
                method: 'GET',  // Mantenemos el método GET

            });
            console.log(url)
    
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
    
            const data = await response.json();  // Suponiendo que la respuesta es JSON
            const consulta = data.expedientes[0];
            document.getElementById('pat').innerHTML = consulta.antecedentes_pat;
            document.getElementById('no_pat').innerHTML = consulta.no_patologicos;


        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    

    fetchDataPaciente();
    fetchDataConsulta();
    fetchDataExpendiente();

})