// Función para inicializar un conjunto de campos editables
function inicializarFormulario(guardarBtn, textareas) {
    // Habilitar los textarea al inicio
    textareas.forEach(textarea => {
        textarea.disabled = false;
    });

    // Configurar visibilidad inicial de botones
    guardarBtn.style.display = 'inline-block';

    // Evento para "Guardar"
    guardarBtn.addEventListener('click', function () {
        textareas.forEach(textarea => textarea.disabled = true); // Deshabilitar campos
        guardarBtn.style.display = 'inline-block';
        cancelarBtn.style.display = 'none';
        editarBtn.style.display = 'inline-block';
    });

}

// Obtener elementos del primer conjunto (Expediente)
inicializarFormulario(
    document.getElementById('guardarBtn1'),
    document.querySelectorAll('.expediente_card textarea')
);

// Obtener elementos del segundo conjunto (Consulta médica)
inicializarFormulario(
    document.getElementById('guardarBtn2'),
    document.querySelectorAll('.consulta_card textarea')
);




document.addEventListener('DOMContentLoaded', async function () {
    console.log('DOM completamente cargado'); // Paso 1
    const token = localStorage.getItem('token');
    const urlParams = new URLSearchParams(window.location.search);
    const paciente_id = urlParams.get('id');
    /*const cita_id = urlParams.get('citId');
    const expediente_id = urlParams.get('expId');*/

    console.log('Paciente ID:', paciente_id); // Paso 3


    //CONSULTA PARA LA TABLA
    const apiUrlCitas = `${API_URL}medico/get/consultas_medicas`;
    async function fetchDataCitas() {
        try {
            const response = await fetch(apiUrlCitas, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`  // Enviar el token como parte del encabezado Authorization
        }
    });
            if (!response.ok) throw new Error('Error al obtener los datos');

            const data = await response.json();
            if (data.success) {
                consultasTable(data.consultas);
            } else {
                console.error('La API no devolvió datos exitosamente');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
  //Generador de tabla consultas
  function consultasTable(consultas) {
    var fecha_format_cons = "";
    const transformedDataConsultas = consultas.map(consulta => [
        fecha_format_cons = consulta.fecha_registro.split("T")[0], 
        `<button class="btn-ver-consulta" data-id="${consulta.id_consulta}">Ver</button>`
    ]);

    new DataTable('#citas_medicas', {
        searching: true,
        ordering:  false,
        responsive: false,
        layout: {
            topStart: null,
            bottomEnd: {
                paging: {
                    numbers: false,
                    previousNext: false,
                    firstLast: false


                }
            }
        },
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.1/i18n/es-ES.json'
        },
        columns: [
            { title: 'Fecha', className: "dt-head-center dt-body-center"},
            { title: 'Acciones', orderable: false, className: "dt-head-center dt-body-center" }
        ],
        data: transformedDataConsultas,
    });
    
}
    // Delegación de eventos para manejar los clics en los botones "Ver"
    document.querySelector("#citas_medicas").addEventListener("click", function (event) {
        if (event.target.classList.contains("btn-ver-consulta")) {
            const consultaId = event.target.getAttribute("data-id");
            window.location.href = `fichacita.html?id_consulta=${consultaId}&id_paciente=${paciente_id}`; // Redirigir con el ID en la URL
        }
    });




    const apiUrl = `${API_URL}medico/pacientes/:medico_id/:paciente_id`;
    console.log('URL de la API:', apiUrl); // Paso 4

    try {
        console.log('Realizando solicitud...'); // Paso 5
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`  // Enviar el token como parte del encabezado Authorization
            }
        });
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

// Logica para guardar la informacion de expediente
document.getElementById('guardarBtn1').addEventListener('click', async (event) => {
    event.preventDefault();
    const medico_id = localStorage.getItem('medico_id');
    const urlParams = new URLSearchParams(window.location.search);
    const paciente_id = urlParams.get('id');
    const ant_pat = document.getElementById('ant_patologicos_1').value;
    const no_ant_pat = document.getElementById('ant_nopatologicos_1').value;

    const apiUrl = `${API_URL}medico/create/expediente`; 

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',  
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // Enviar el token como parte del encabezado Authorization

            },
            body: JSON.stringify({ 
                id: paciente_id,
                ant_pat: ant_pat, 
                no_pat: no_ant_pat
            })
        });

        const data = await response.json();
        if (data.success) {
           document.getElementById('ant_patologicos_1').value = "";
            document.getElementById('ant_nopatologicos_1').value = "";
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
    const medico_id = localStorage.getItem('medico_id');
    const urlParams = new URLSearchParams(window.location.search);
    const paciente_id = urlParams.get('id');
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
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // Enviar el token como parte del encabezado Authorization

            },
            body: JSON.stringify({ 
                id: paciente_id,
                pad: padecimiento_actual_2, 
                exp_fisica: exploracion_fisica_2, 
                diag: diagnostico_2,
                trat: tratamiento_2,
                est_comp: estudios_complementarios_2            
            })
        });

        const data = await response.json();
        if (data.success) {
            document.getElementById('padecimiento_actual_2').value = "";
            document.getElementById('exploracion_fisica_2').value = "";
            document.getElementById('diagnostico_2').value = "";
            document.getElementById('tratamiento_2').value = "";
            document.getElementById('estudios_complementarios_2').value = "";
            alert('Consulta médica agregada correctamente');
            
        } else {
            alert('Error al agregar cita');
        }

    } catch (error) {
        console.log("Error: ", error);
    }
});


    fetchDataCitas();

});
