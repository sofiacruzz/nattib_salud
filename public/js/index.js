async function registrarMedico() {
    const errorContainer = document.getElementById('error-messages');
    errorContainer.innerHTML = ''; // Limpiar errores previos

    const data = {
        nombres: document.querySelector('input[name="nombres"]').value,
        apellidos: document.querySelector('input[name="apellidos"]').value,
        curp: document.querySelector('input[name="curp"]').value,
        fecha_nac: document.querySelector('input[name="fechanac"]').value,
        universidad: document.querySelector('input[name="universidad"]').value,
        cedula: document.querySelector('input[name="cedula"]').value,
        email: document.querySelector('input[name="email"]').value,
        contrasena: document.querySelector('input[name="pswd"]').value,
        repeatcontrasena: document.querySelector('input[name="repeatcontrasena"]').value
    };

    // Validación básica en frontend
    if (data.contrasena !== data.repeatcontrasena) {
        errorContainer.innerHTML = '<p>Las contraseñas no coinciden.</p>';
        return;
    }

    if (!document.getElementById('terms').checked) {
        errorContainer.innerHTML = '<p>Debes aceptar los términos y condiciones.</p>';
        return;
    }

    console.log('Datos a enviar:', data);

    try {
        const response = await fetch(API_URL + 'medico/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData);

        if (response.ok && responseData.success) {
            window.location.href = responseData.url;
        } else {
            if (Array.isArray(responseData.errores)) {
                responseData.errores.forEach(err => {
                    const p = document.createElement('p');
                    p.textContent = err;
                    errorContainer.appendChild(p);
                });
            } else if (responseData.message) {
                errorContainer.innerHTML = `<p>${responseData.message}</p>`;
            } else {
                errorContainer.innerHTML = '<p>Ha ocurrido un error desconocido.</p>';
            }
        }
    } catch (error) {
        console.error('Error:', error);
        errorContainer.innerHTML = '<p>Error al conectar con el servidor.</p>';
    }
}


// Función para manejar el login - index.html
async function login(event) {
    event.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('medico/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email:usuario, contrasena:password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
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
