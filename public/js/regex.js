module.exports = {
    nombres: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, // Solo letras y espacios
    apellidos: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, // Solo letras y espacios
    curp: /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]{2}$/, // Formato CURP
    fecha_nac: /^\d{4}-\d{2}-\d{2}$/, // Formato de fecha (YYYY-MM-DD)
    universidad: /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/, // Letras, números y espacios
    cedula: /^\d+$/, // Solo números
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Formato de email
    contrasena: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/ // Mínimo 8 caracteres, una mayúscula, una minúscula y un número
  };