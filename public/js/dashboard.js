document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    
    // Si no existe el token, redirige a la página de login
    if (!token) {
        window.location.href = "index.html"; // Redirige si no hay sesión iniciada
        return;
    }

    // La URL de la API (ajustada para incluir el token en los encabezados)
    const apiUrl = `${API_URL}medico/pacientes`;

    async function fetchData() {
        try {
            // Hacer la solicitud con el token en el encabezado Authorization
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`  // Enviar el token como parte del encabezado Authorization
                }
            });

            // Verificar si la respuesta es exitosa
            if (!response.ok) throw new Error('Error al obtener los datos');

            // Parsear la respuesta JSON
            const data = await response.json();
            if (data.success) {
                populateTable(data);  // Llenar la tabla con los datos obtenidos
            } else {
                console.error('La API no devolvió datos exitosamente');
            }
        } catch (error) {
            console.error('Error:', error);  // Manejo de errores en la solicitud
        }
    }

    function calcularEdad(fechaNacimiento) {
        const nacimiento = new Date(fechaNacimiento);
        const hoy = new Date();
        
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--; // Ajusta si aún no ha cumplido años este año
        }
        
        return edad;
    }

    function populateTable(data) {
        const transformedData = data.pacientes.map(paciente => [
            paciente.nombres +''+ paciente.apellidos,
            calcularEdad(paciente.fecha_nac),  // Nombre completo
            paciente.telefono,  // Teléfono o cualquier otro campo
            paciente.fecha_registro ? paciente.fecha_registro : 'No registrado',  // Fecha de registro, si está disponible
            paciente.id
        ]);
        console.log(transformedData);

        // Asegurarse de que el número de columnas coincide con los datos
        new DataTable('#myTable', {
            responsive: true,
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.1/i18n/es-ES.json'
            },
            buttons: [
                {
                    extend: 'copy',
                    text: '<i class="fa fa-clipboard"></i>',
                    titleAttr: 'Copiar',
                    className: ''
                },
                {
                    extend: 'pdf', 
                    text: '<i class="fa fa-file-pdf-o" aria-hidden="true"></i>', 
                    orientation: 'landscape', 
                    pageSize: 'A4',
                },
                {
                    extend: 'excel',
                    text: '<i class="fa fa-file-excel-o" aria-hidden="true"></i>',
                    titleAttr: 'Excel',
                    className: ''
                },

            ],
            layout: {
                topStart: 'buttons'
            },
            columns: [
                { title: 'Nombre del paciente'},   
                { title: 'Edad'},   
                { title: 'Telefono'},   
                { title: 'Fecha de registro'},   
                { 
                    title: 'Acciones',
                    render: function(data, type, row) {
                        return `<button class="btn-editar" data-id="${data}">Ver ficha</button>`;
                    }
                }
            ],
            data: transformedData,
        });
    }
    window.verFicha = function(pacienteId) {
        window.location.href = `cardinfo.html?id=${pacienteId}`;
    };
    
    fetchData();
});
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('btn-editar')) {
        const id = event.target.getAttribute('data-id');
        window.location.href = `cardpaciente.html?id=${id}`;
    }
});