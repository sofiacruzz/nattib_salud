function openForm() {
    const modal = document.getElementById("myForm");
    modal.classList.add("show");
      document.body.style.overflow = 'hidden';

}

function closeForm() {
    const modal = document.getElementById("myForm");
    modal.classList.remove("show");
      document.body.style.overflow = '';

}
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = "password";
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Inicializa Pikaday
const picker = new Pikaday({
    field: document.getElementById('fecha_nac'),
    format: 'YYYY-MM-DD',
    toString(date, format) {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    },
    i18n: {
        previousMonth: 'Mes anterior',
        nextMonth: 'Siguiente mes',
        months: [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ],
        weekdays: [
            'Domingo', 'Lunes', 'Martes', 'Miércoles',
            'Jueves', 'Viernes', 'Sábado'
        ],
        weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    },
    minDate: new Date(1900, 0, 1),
    maxDate: new Date(),
    yearRange: [1900, new Date().getFullYear()]
});
