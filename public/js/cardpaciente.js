function openForm() {
    document.getElementById("myForm").style.display = "block";
}
function closeForm() {
    document.getElementById("myForm").style.display = "none";
}// Función para inicializar un conjunto de campos editables
function inicializarFormulario(guardarBtn, cancelarBtn, editarBtn, textareas) {
    // Habilitar los textarea al inicio
    textareas.forEach(textarea => {
        textarea.disabled = false;
    });

    // Configurar visibilidad inicial de botones
    guardarBtn.style.display = 'inline-block';
    cancelarBtn.style.display = 'inline-block';
    editarBtn.style.display = 'none';

    // Evento para "Guardar"
    guardarBtn.addEventListener('click', function () {
        textareas.forEach(textarea => textarea.disabled = true); // Deshabilitar campos
        guardarBtn.style.display = 'none';
        cancelarBtn.style.display = 'none';
        editarBtn.style.display = 'inline-block';
    });

    // Evento para "Cancelar"
    cancelarBtn.addEventListener('click', function () {
        textareas.forEach(textarea => textarea.disabled = true); // Deshabilitar campos
        guardarBtn.style.display = 'none';
        cancelarBtn.style.display = 'none';
        editarBtn.style.display = 'inline-block';
    });

    // Evento para "Editar"
    editarBtn.addEventListener('click', function () {
        textareas.forEach(textarea => textarea.disabled = false); // Habilitar campos
        guardarBtn.style.display = 'inline-block';
        cancelarBtn.style.display = 'inline-block';
        editarBtn.style.display = 'none';
    });
}

// Obtener elementos del primer conjunto (Expediente)
inicializarFormulario(
    document.getElementById('guardarBtn1'),
    document.getElementById('cancelarBtn1'),
    document.getElementById('editarBtn1'),
    document.querySelectorAll('.expediente_card textarea')
);

// Obtener elementos del segundo conjunto (Consulta médica)
inicializarFormulario(
    document.getElementById('guardarBtn2'),
    document.getElementById('cancelarBtn2'),
    document.getElementById('editarBtn2'),
    document.querySelectorAll('.consulta_card textarea')
);




document.addEventListener('DOMContentLoaded', async function () {
    console.log('DOM completamente cargado'); // Paso 1
    const medico_id = localStorage.getItem('medico_id');
    const urlParams = new URLSearchParams(window.location.search);
    const paciente_id = urlParams.get('id');
    /*const cita_id = urlParams.get('citId');
    const expediente_id = urlParams.get('expId');*/

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

// Logica para guardar la informacion de expediente
document.getElementById('guardarBtn1').addEventListener('click', async (event) => {
    event.preventDefault();

    const ant_pat = document.getElementById('ant_patologicos_1').value;
    const no_ant_pat = document.getElementById('ant_nopatologicos_1').value;

    const apiUrl = `${API_URL}medico/create/expediente`; 

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',  
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                ant_pat: ant_pat, 
                no_pat: no_ant_pat
            })
        });

        const data = await response.json();
        if (data.success) {
            alert('Expediente agregado correctamente');
        } else {
            alert('Error al agregar expediente');
        }

    } catch (error) {
        console.log("Error: ", error);
    }
});

// Logica para guardar la informacion de consulta
document.getElementById('guardarBtn2').addEventListener('click', async (event) => {
    event.preventDefault();

    const padecimiento_actual_2 = document.getElementById('padecimiento_actual_2').value;
    const exploracion_fisica_2 = document.getElementById('exploracion_fisica_2').value;
    const diagnostico_2 = document.getElementById('diagnostico_2').value;
    const tratamiento_2 = document.getElementById('tratamiento_2').value;
    const estudios_complementarios_2 = document.getElementById('estudios_complementarios_2').value;

    const apiUrl = `${API_URL}medico/create/consulta_medica`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                pad: padecimiento_actual_2, 
                exp_fisica: exploracion_fisica_2, 
                diag: diagnostico_2,
                trat: tratamiento_2,
                est_comp: estudios_complementarios_2            
            })
        });

        const data = await response.json();
        if (data.success) {
            alert('Consulta médica agregada correctamente');
        } else {
            alert('Error al agregar cita');
        }

    } catch (error) {
        console.log("Error: ", error);
    }
});

});
