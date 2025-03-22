document.addEventListener('DOMContentLoaded', function () {
    const medico_id = localStorage.getItem('medico_id');
    const urlParams = new URLSearchParams(window.location.search);
    const paciente_id = urlParams.get('id');

    if (!medico_id) {
        window.location.href = "index.html"; // Redirige si no hay sesión iniciada
        return;
    }
    const apiUrlPaciente = `${API_URL}medico/pacientes/${medico_id}/${paciente_id}`;
    const apiUrlCitas = `${API_URL}medico/get/consultas_medicas?id_paciente=${paciente_id}&medico_id=${medico_id}`;
    const apiUrlExpedientes = `${API_URL}medico/get/expedientes?id_paciente=${paciente_id}&medico_id=${medico_id}`;
    
    async function fetchDataPaciente() {
        try {
            const response = await fetch(apiUrlPaciente);    
            if (!response.ok) throw new Error('Error al obtener los datos');
            const data = await response.json();
    
            if (data.success) {
                const paciente = data.pacientes[0];
                const ed = convertirEdad(paciente.fecha_nac.split("T")[0])
                document.getElementById('nombre').innerHTML = paciente.nombres + ' ' +paciente.apellidos;
                document.getElementById('edad').innerHTML =ed;
                document.getElementById('fechaNacimiento').innerHTML = paciente.fecha_nac.split("T")[0];
                document.getElementById('telefono').innerHTML = paciente.telefono;
                document.getElementById('direccion').innerHTML = paciente.direccion ? paciente.direccion : 'Sin dato';
            } else {
                console.error('La API no devolvió datos exitosamente');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    function convertirEdad(fechaNacimiento){
        const nacimiento = new Date(fechaNacimiento);
        const hoy = new Date();

        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        const dia = hoy.getDate() - nacimiento.getDate();

        // Restar un año si aún no ha cumplido años este año
        if (mes < 0 || (mes === 0 && dia < 0)) {
            edad--;
        }

        return edad;
    }
    
    async function fetchDataCitas() {
        try {
            const response = await fetch(apiUrlCitas);
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
    async function fetchDataExpedientes() {
        try {
            const response = await fetch(apiUrlExpedientes);
            if (!response.ok) throw new Error('Error al obtener los datos');

            const data = await response.json();
            if (data.success) {
                expedientesTable(data.expedientes);
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
            responsive: true,
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
    //Generador de tabla expediente
    function expedientesTable(expedientes) {
        var fecha_format_exp = "";
        const transformedDataExpedientes = expedientes.map(expediente => [
            fecha_format_exp = expediente.fecha_registro.split("T")[0], 
            `<button class="btn-ver-expediente" data-id="${expediente.id_expediente}">Ver</button>`
        ]);

        new DataTable('#expedientes_medicos', {
            searching: true,
            ordering:  false,
            responsive: true,
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
            columnDefs: [
                {
                    targets: -1,
                    className: 'dt-body-compact'
                }
              ],
            columns: [
                { title: 'Fecha', className: "dt-head-center dt-body-center"},
                { title: 'Acciones', orderable: false, className: "dt-head-center dt-body-center" }
            ],
            data: transformedDataExpedientes,
        });
    }

    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('btn-ver-consulta')) {
            const consultaId = event.target.getAttribute('data-id');
            window.location.href = `cardinfo.html?id=${consultaId}`;
        }else if(event.target.classList.contains('btn-ver-expediente')){
            const expedienteId = event.target.getAttribute('data-id');
            window.location.href = `cardinfo.html?id=${expedienteId}`;
        }
    });
    fetchDataPaciente();
    fetchDataCitas();
    fetchDataExpedientes();
});
