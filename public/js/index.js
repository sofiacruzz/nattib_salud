// Función para registrar un médico - index.html
async function registrarMedico() {
    const data = {
        nombres: document.querySelector('input[name="nombres"]').value,
        apellidos: document.querySelector('input[name="apellidos"]').value,
        curp: document.querySelector('input[name="curp"]').value,
        fecha_nac: document.querySelector('input[name="fechanac"]').value,
        universidad: document.querySelector('input[name="universidad"]').value,
        cedula: document.querySelector('input[name="cedula"]').value,
        email: document.querySelector('input[name="email"]').value,
        contrasena: document.querySelector('input[name="pswd"]').value
    };

    console.log('Datos a enviar:', data);

    try {
        const response = await fetch(API_URL + 'medico/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Error en la solicitud: ' + response.statusText);

        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData);

        if (responseData.success) {
            window.location.href = responseData.url;
        } else {
            alert('Error en el registro: ' + responseData.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error en la solicitud');
    }
}

// Función para manejar el login - index.html
async function login(event) {
    event.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(API_URL + 'auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('medico_id', data.user.id);
            window.location.href = 'dashboard.html';
        } else {
            alert("Ups, parece que algo está mal");
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Asignar eventos a los botones del index.html
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('registrarBtn')) {
        document.getElementById('registrarBtn').addEventListener('click', registrarMedico);
    }

    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', login);
    }
});
