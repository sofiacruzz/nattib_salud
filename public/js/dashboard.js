document.addEventListener('DOMContentLoaded', function () {
    const medico_id = localStorage.getItem('medico_id');
    if (!medico_id) {
        window.location.href = "index.html"; // Redirige si no hay sesión iniciada
        return;
    }

    const apiUrl = `${API_URL}medico/pacientes/${medico_id}`;

    async function fetchData() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Error al obtener los datos');

            const data = await response.json();
            if (data.success) {
                populateTable(data.pacientes);
            } else {
                console.error('La API no devolvió datos exitosamente');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }


    function populateTable(pacientes) {
        const tbody = document.querySelector('#myTable tbody');
        tbody.innerHTML = ''; // Limpiar el contenido previo

        pacientes.forEach(paciente => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${paciente.nombres}</td>
                <td>${paciente.apellidos}</td>
                <td>${paciente.telefono}</td>
                <td>${paciente.fecha_registro}</td>
                <td> <button class="btn-redirigir" data-id="${paciente.id_pacientes}"> BOTON </button> </td>
            `;
            tbody.appendChild(row);
        });
        const botones = document.querySelectorAll('.btn-redirigir');
        botones.forEach(boton => {
            boton.addEventListener('click', () => {
                const pacienteId = boton.getAttribute('data-id'); // Obtener el ID del paciente
                localStorage.setItem('paciente_id', pacienteId); // Guardar el ID en localStorage
                console.log('ID del paciente guardado:', pacienteId);
                redirigir(pacienteId);
            });
        });
    }

    function redirigir(pacienteId) {
        window.location.href = `cardpaciente.html`;
    }

    fetchData();
});
