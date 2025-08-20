async function registrarMedico() {
    const errorContainer = document.getElementById('error-messages');
    errorContainer.innerHTML = ''; // Limpiar errores previos

    
    const data = {
        nombres: document.querySelector('input[name="nombres"]').value.toUpperCase(),
        apellidos: document.querySelector('input[name="apellidos"]').value.toUpperCase(),
        curp: document.querySelector('input[name="curp"]').value,
        fecha_nac: document.querySelector('input[name="fechanac"]').value,
        universidad: document.querySelector('input[name="universidad"]').value.toUpperCase(),
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
        const response = await fetch(`${API_URL}medico/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData);

        if (response.ok && responseData.success) {
            errorContainer.innerHTML = `<br><p style="color: green;">✅ Registro Exitoso. Inicia sesion para continuar.</p>`;
            //window.location.href = responseData.url;
        } else {
            if (Array.isArray(responseData.errores)) {
                responseData.errores.forEach(err => {
                    const p = document.createElement('p');
                    p.textContent = err;
                    errorContainer.appendChild(p);
                });
            } else if (responseData.msg) {
                errorContainer.innerHTML = `<p>${responseData.msg}</p>`;
            } else {
                errorContainer.innerHTML = `<p>${responseData.msg}</p>`;
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
    const errorMessage = document.getElementById('errorMessage');
    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('medico/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email:usuario, contrasena:password })
        });

        const data = await response.json();

        if (data.success == true) {
            localStorage.setItem('token', data.token);
            window.location.href = 'dashboard.html';
        } else if(data.success == 'pending'){
            window.location.assign(data.msg);
        }else{
            errorMessage.textContent = data.msg || 'Error al iniciar sesión';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function preValidacion() {
    const info_message_validacion = document.getElementById('info-message-validate');
    info_message_validacion.innerHTML = '';
    
    const data = {
        nombres: document.querySelector('input[name="nombres"]').value.toUpperCase(),
        apellidos: document.querySelector('input[name="apellidos"]').value.toUpperCase(),
        curp: document.querySelector('input[name="curp"]').value,
        universidad: document.querySelector('input[name="universidad"]').value.toUpperCase(),
        cedula: document.querySelector('input[name="cedula"]').value
    };


    console.log('Datos a enviar:', data);

    try {
        const response = await fetch(`${API_URL}medico/prevalidacion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData);

        if (responseData.msg == "Datos validos") {
            info_message_validacion.innerHTML = `<p style="color: green;">✅ ${responseData.msg}</p>`;
        } else {
            if (Array.isArray(responseData.errores)) {
                responseData.errores.forEach(err => {
                    const p = document.createElement('p');
                    p.textContent = err;
                    info_message_validacion.appendChild(p);
                });
            } else if (responseData.msg) {
                info_message_validacion.innerHTML = `<p style="color: red;">❌ ${responseData.msg}</p>`;
            } else {
                info_message_validacion.innerHTML = `<p style="color: red;">❌ Error desconocido en la validación.</p>`;
            }
        }
    } catch (error) {
        console.error('Error:', error);
        info_message_validacion.innerHTML = '<p>Error al conectar con el servidor.</p>';
    }
}


// Asignar eventos a los botones del index.html
document.addEventListener('DOMContentLoaded', function () {
    
    const toUpperNoAccents = (text) => {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    };

    const fields = ['nombres', 'apellidos', 'universidad', 'curp'];
    fields.forEach(fieldName => {
        const input = document.querySelector(`input[name="${fieldName}"]`);
        if (input) {
            input.addEventListener('input', function () {
                this.value = toUpperNoAccents(this.value);
            });
        }
    });

    //Logica de prevalidacion de cedula
        const validarBtn = document.getElementById('validarCedulaBtn');
    const camposRequeridos = ['nombres', 'apellidos', 'universidad', 'cedula'];

        const verificarCampos = () => {
            const todosLlenos = camposRequeridos.every(name => {
                const input = document.querySelector(`input[name="${name}"]`);
                return input && input.value.trim() !== '';
            });

            if (todosLlenos) {
                validarBtn.style.display = 'inline-block'; // Mostrar el botón
                validarBtn.disabled = false;
            } else {
                validarBtn.style.display = 'none'; // Ocultar el botón
                validarBtn.disabled = true;
            }
        };
    // Escucha cambios en los campos requeridos
    camposRequeridos.forEach(name => {
        const input = document.querySelector(`input[name="${name}"]`);
        if (input) {
            input.addEventListener('input', verificarCampos);
        }
    });

    // Aquí puedes agregar lo que hará el botón cuando se presione
    validarBtn.addEventListener('click', function () {
        preValidacion();
    });

    // Eventos ya existentes
    if (document.getElementById('registrarBtn')) {
        document.getElementById('registrarBtn').addEventListener('click', registrarMedico);
    }

    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', login);
    }

});
