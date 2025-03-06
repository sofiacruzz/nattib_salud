function openForm() {
    document.getElementById("myForm").style.display = "block";
}

function closeForm() {
    document.getElementById("myForm").style.display = "none";
}

// Inicializa Pikaday
const picker = new Pikaday({
    field: document.getElementById('fecha_nac'), // Asocia Pikaday al input
    format: 'YYYY-MM-DD', // Formato de fecha
    toString(date, format) {
        // Personaliza cómo se muestra la fecha en el input
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
    }
});