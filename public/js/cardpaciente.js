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
    });

}

async function generarPDFConsulta(consultaId, pacienteId) {
    const token = localStorage.getItem('token');
    const apiUrlPaciente = `${API_URL}medico/pacientes/${pacienteId}`;
    const apiUrlConsulta = `${API_URL}medico/get/consulta_medica?id_paciente=${pacienteId}&id=${consultaId}`;
    const apiUrlMedico = `${API_URL}medico/info`; // Tu endpoint para información del médico

    try {
        // Obtener datos del paciente
        const responsePaciente = await fetch(apiUrlPaciente, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`  // Enviar el token como parte del encabezado Authorization
            }
        });
        if (!responsePaciente.ok) throw new Error('Error al obtener datos del paciente');
        const dataPaciente = await responsePaciente.json();
        const paciente = dataPaciente.paciente;

        // Obtener datos de la consulta
        const responseConsulta = await fetch(apiUrlConsulta, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`  // Enviar el token como parte del encabezado Authorization
            }
        });
        if (!responseConsulta.ok) throw new Error('Error al obtener datos de la consulta');
        const dataConsulta = await responseConsulta.json();
        
        if (!dataConsulta.consulta || dataConsulta.consulta.length === 0) {
            throw new Error('No se encontraron datos de la consulta');
        }
        
        const consulta = dataConsulta.consulta[0];

        // Obtener datos del médico desde tu endpoint
        const responseMedico = await fetch(apiUrlMedico, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`  // Enviar el token como parte del encabezado Authorization
            }
        });
        if (!responseMedico.ok) throw new Error('Error al obtener datos del médico');
        const dataMedico = await responseMedico.json();
        
        if (!dataMedico.success || !dataMedico.informacion || dataMedico.informacion.length === 0) {
            throw new Error('No se encontraron datos del médico');
        }
        
        const medico = dataMedico.informacion[0];
        const medicoNombreCompleto = `${medico.nombres} ${medico.apellidos}`;
        const medicoCedula = medico.cedula;
        const medicoInstitucion = medico.universidad;
        const medicoTelefono = medico.telefono;
        // Asumiendo que tienes el domicilio en otra tabla o campo
        const medicoDomicilio = medico.domicilio || 'Consultorio no especificado'; 

        // Calcular edad
        const fechaNac = new Date(medico.fecha_nac.split("T")[0]);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const m = hoy.getMonth() - fechaNac.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
        }

        // Definición del documento PDF en formato horizontal
        var dd = {
            pageSize: 'A4',
            pageOrientation: 'landscape',
            content: [
                // Encabezado con datos de la clínica y médico
                {
                    columns: [
                        {
                            width: '60%',
                            stack: [
                                {text: 'CLÍNICA MÉDICA INTEGRAL', style: 'headerClinica'},
                                {text: 'Av. Principal 123, Col. Centro, CDMX\nTel: 555-123-4567', style: 'direccionClinica'}
                            ]
                        },
                        {
                            width: '40%',
                            stack: [
                                {text: 'RECETA MÉDICA', style: 'header'},
                                {text: `Fecha: ${new Date().toLocaleDateString()}`, style: 'fecha'}
                            ],
                            alignment: 'right'
                        }
                    ],
                    margin: [0, 0, 0, 15]
                },
                
                // Datos del paciente
                {
                    text: 'DATOS DEL PACIENTE',
                    style: 'subheader'
                },
                {
                    columns: [
                        {
                            width: '50%',
                            stack: [
                                {
                                    columns: [
                                        {text: 'Nombre completo:', width: '30%', style: 'label'},
                                        {text: paciente.nombres + ' ' + (paciente.apellidos || ''), width: '70%'}
                                    ]
                                },
                                {
                                    columns: [
                                        {text: 'Edad:', width: '30%', style: 'label'},
                                        {text: `${edad} años`, width: '20%'},
                                        {text: 'Sexo:', width: '20%', style: 'label'},
                                        {text: paciente.genero || 'No especificado', width: '30%'}
                                    ]
                                }
                            ]
                        },
                        {
                            width: '50%',
                            stack: [
                                {
                                    columns: [
                                        {text: 'Teléfono:', width: '30%', style: 'label'},
                                        {text: paciente.telefono, width: '70%'}
                                    ]
                                },
                                {
                                    columns: [
                                        {text: 'Dirección:', width: '30%', style: 'label'},
                                        {text: paciente.direccion, width: '70%'}
                                    ]
                                }
                            ]
                        }
                    ],
                    columnGap: 10,
                    margin: [0, 0, 0, 15]
                },
                
                // Sección clínica en dos columnas
                {
                    columns: [
                        // Columna izquierda: Padecimiento, exploración y diagnóstico
                        {
                            width: '50%',
                            stack: [
                                {text: 'PADECIMIENTO ACTUAL', style: 'subheader'},
                                {text: consulta.padecimiento || consulta.pad || 'No especificado', margin: [0, 0, 0, 10]},
                                
                                {text: 'EXPLORACIÓN FÍSICA', style: 'subheader', margin: [0, 10, 0, 5]},
                                {text: consulta.exploracion_fisica || consulta.exp_fisica || 'No especificada', margin: [0, 0, 0, 10]},
                                
                                {text: 'DIAGNÓSTICO', style: 'subheader', margin: [0, 10, 0, 5]},
                                {text: consulta.diagnostico || consulta.diag || 'No especificado', margin: [0, 0, 0, 15]}
                            ]
                        },
                        // Columna derecha: Tratamiento y estudios
                        {
                            width: '50%',
                            stack: [
                                {text: 'TRATAMIENTO', style: 'subheader'},
                                {
                                    table: {
                                        headerRows: 1,
                                        widths: ['*', '15%', '15%', '15%', '10%', '15%'],
                                        body: [
                                            [
                                                {text: 'Medicamento', style: 'tableHeader'},
                                                {text: 'Dosis', style: 'tableHeader'},
                                                {text: 'Presentación', style: 'tableHeader'},
                                                {text: 'Frecuencia', style: 'tableHeader'},
                                                {text: 'Vía', style: 'tableHeader'},
                                                {text: 'Duración', style: 'tableHeader'}
                                            ],
                                            ...(consulta.tratamiento ? 
                                                consulta.tratamiento.split('\n')
                                                    .filter(linea => linea.trim() !== '')
                                                    .map(linea => {
                                                        const partes = linea.split('|').map(part => part.trim());
                                                        return partes.length >= 6 ? partes.slice(0, 6) : [...partes, ...Array(6 - partes.length).fill('')];
                                                    }) : 
                                                [['No especificado', '', '', '', '', '']])
                                        ]
                                    },
                                    layout: {
                                        hLineWidth: function(i, node) { return (i === 0 || i === node.table.body.length) ? 1 : 0; },
                                        vLineWidth: function(i, node) { return 0; },
                                        hLineColor: function(i, node) { return '#aaa'; }
                                    },
                                    margin: [0, 0, 0, 10]
                                },
                                {text: 'Indicaciones:', style: 'label'},
                                {text: consulta.indicaciones || 'No especificadas', margin: [0, 0, 0, 15]},
                                
                                {text: 'ESTUDIOS COMPLEMENTARIOS', style: 'subheader', margin: [0, 10, 0, 5]},
                                {
                                    ul: consulta.estudios_comp ? 
                                        consulta.estudios_comp.split('\n').filter(item => item.trim() !== '') : 
                                        ['No solicitados'],
                                    margin: [0, 0, 0, 15]
                                }
                            ]
                        }
                    ],
                    columnGap: 15,
                    margin: [0, 0, 0, 15]
                },
                
                // Datos obligatorios del médico
                {
                    text: 'DATOS DEL MÉDICO TRATANTE',
                    style: 'subheader'
                },
                {
                    columns: [
                        {
                            width: '30%',
                            stack: [
                                {text: 'Nombre completo:', style: 'label'},
                                {text: medicoNombreCompleto}
                            ]
                        },
                        {
                            width: '20%',
                            stack: [
                                {text: 'Cédula profesional:', style: 'label'},
                                {text: medicoCedula}
                            ]
                        },
                        {
                            width: '25%',
                            stack: [
                                {text: 'Universidad:', style: 'label'},
                                {text: medicoInstitucion}
                            ]
                        },
                        {
                            width: '25%',
                            stack: [
                                {text: 'Consultorio:', style: 'label'},
                                {text: medicoDomicilio}
                            ]
                        }
                    ],
                    columnGap: 10,
                    margin: [0, 0, 0, 10]
                },
                {
                    columns: [
                        {
                            width: '20%',
                            stack: [
                                {text: 'Teléfono:', style: 'label'},
                                {text: medicoTelefono}
                            ]
                        },
                        {
                            width: '30%',
                            stack: [
                                {text: 'Correo electrónico:', style: 'label'},
                                {text: medico.email || 'No especificado'}
                            ]
                        },
                        {
                            width: '50%',
                            text: ''
                        }
                    ],
                    columnGap: 10,
                    margin: [0, 0, 0, 15]
                },
                
                // Firmas
                {
                    columns: [
                        {
                            width: '45%',
                            stack: [
                                {text: '', alignment: 'center'},
                                {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }]},
                                {text: medicoNombreCompleto, alignment: 'center', margin: [0, 5, 0, 0], italics: true}
                            ]
                        },
                        {
                            width: '10%',
                            text: ''
                        },
                        {
                            width: '45%',
                            stack: [
                                {text: '', alignment: 'center'},
                                {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }]},
                                {text: paciente.nombres + ' ' + (paciente.apellidos || ''), alignment: 'center', margin: [0, 5, 0, 0], italics: true}
                            ]
                        }
                    ],
                    margin: [0, 20, 0, 0]
                },
                
                // Pie de página con texto legal
                {
                    text: 'Documento válido únicamente con firma y sello del médico tratante. La presente receta cumple con lo establecido en el artículo 28 del Reglamento de Insumos para la Salud.',
                    style: 'footer',
                    alignment: 'center',
                    margin: [0, 20, 0, 0]
                }
            ],
            
            // Estilos
            styles: {
                headerClinica: {
                    fontSize: 16,
                    bold: true,
                    color: '#0066cc'
                },
                direccionClinica: {
                    fontSize: 10,
                    color: '#666666'
                },
                header: {
                    fontSize: 18,
                    bold: true,
                    color: '#0066cc'
                },
                fecha: {
                    fontSize: 11,
                    bold: true
                },
                subheader: {
                    fontSize: 14,
                    bold: true,
                    color: '#0066cc',
                    margin: [0, 10, 0, 5]
                },
                label: {
                    bold: true,
                    fontSize: 11
                },
                tableHeader: {
                    bold: true,
                    fontSize: 10,
                    color: '#ffffff',
                    fillColor: '#0066cc',
                    margin: [0, 3, 0, 3]
                },
                footer: {
                    fontSize: 9,
                    italics: true,
                    color: '#666666'
                }
            },
            defaultStyle: {
                fontSize: 11,
                lineHeight: 1.2
            }
        };

        // Generar el PDF
        pdfMake.createPdf(dd).download(`Receta_${paciente.nombres.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
        console.error('Error al generar el PDF:', error);
        alert('Ocurrió un error al generar el PDF: ' + error.message);
    }
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
    const apiUrlCitas = `${API_URL}medico/get/consultas_medicas?id_paciente=${paciente_id}`;   
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
    const transformedDataConsultas = consultas.map(consulta => {
        const fecha = consulta.fecha_registro?.split("T")[0] || 'Fecha no disponible';
        const idConsulta = consulta.id ?? '';
        
        // Aquí está la corrección clave - usando template string correctamente
        const botones = `
            <button class="btn-ver-consulta" data-id="${idConsulta}">Ver</button>
            <button class="btn-pdf-consulta" data-id="${idConsulta}">PDF</button>
        `;
        
        return [fecha, botones];
    });

    new DataTable('#citas_medicas', {
        searching: true,
        ordering: false,
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
            { title: 'Fecha', className: "dt-head-center dt-body-center" },
            { 
                title: 'Acciones', 
                orderable: false, 
                className: "dt-head-center dt-body-center"
            }
        ],
        data: transformedDataConsultas,
    });
}
    // Delegación de eventos para manejar los clics en los botones "Ver"
    document.querySelector("#citas_medicas").addEventListener("click", function (event) {
        const paciente_id = urlParams.get('id');
        if (event.target.classList.contains("btn-ver-consulta")) {
            const consultaId = event.target.getAttribute("data-id");
            window.location.href = `fichacita.html?id_consulta=${consultaId}&id_paciente=${paciente_id}`; // Redirigir con el ID en la URL
        }
        if (event.target.classList.contains("btn-pdf-consulta")) {
            const consultaId = event.target.getAttribute("data-id");
            generarPDFConsulta(consultaId, paciente_id);
        }
    });




    const apiUrl = `${API_URL}medico/pacientes/${paciente_id}`;
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
            const paciente = data.paciente;
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
                id_paciente: paciente_id,
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
                id_paciente: paciente_id,
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
