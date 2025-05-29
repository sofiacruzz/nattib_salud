export function generarDefinicionPDF({ paciente, consulta, medico, edad }) {
  return {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    content: [
      {
        columns: [
          {
            width: '60%',
            stack: [
              { text: 'CLÍNICA MÉDICA INTEGRAL', style: 'headerClinica' },
              { text: 'Av. Principal 123, Col. Centro, CDMX\nTel: 555-123-4567', style: 'direccionClinica' }
            ]
          },
          {
            width: '40%',
            stack: [
              { text: 'RECETA MÉDICA', style: 'header' },
              { text: `Fecha: ${new Date().toLocaleDateString()}`, style: 'fecha' }
            ],
            alignment: 'right'
          }
        ],
        margin: [0, 0, 0, 15]
      },
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
                  { text: 'Nombre completo:', width: '30%', style: 'label' },
                  { text: `${paciente.nombres} ${paciente.apellidos || ''}`, width: '70%' }
                ]
              },
              {
                columns: [
                  { text: 'Edad:', width: '30%', style: 'label' },
                  { text: `${edad} años`, width: '20%' },
                  { text: 'Sexo:', width: '20%', style: 'label' },
                  { text: paciente.genero || 'No especificado', width: '30%' }
                ]
              }
            ]
          },
          {
            width: '50%',
            stack: [
              {
                columns: [
                  { text: 'Teléfono:', width: '30%', style: 'label' },
                  { text: paciente.telefono, width: '70%' }
                ]
              },
              {
                columns: [
                  { text: 'Dirección:', width: '30%', style: 'label' },
                  { text: paciente.direccion, width: '70%' }
                ]
              }
            ]
          }
        ],
        columnGap: 10,
        margin: [0, 0, 0, 15]
      },
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'PADECIMIENTO ACTUAL', style: 'subheader' },
              { text: consulta.padecimiento || consulta.pad || 'No especificado', margin: [0, 0, 0, 10] },
              { text: 'EXPLORACIÓN FÍSICA', style: 'subheader', margin: [0, 10, 0, 5] },
              { text: consulta.exploracion_fisica || consulta.exp_fisica || 'No especificada', margin: [0, 0, 0, 10] },
              { text: 'DIAGNÓSTICO', style: 'subheader', margin: [0, 10, 0, 5] },
              { text: consulta.diagnostico || consulta.diag || 'No especificado', margin: [0, 0, 0, 15] }
            ]
          },
          {
            width: '50%',
            stack: [
              { text: 'TRATAMIENTO', style: 'subheader' },
              {
                table: {
                  headerRows: 1,
                  widths: ['*', '15%', '15%', '15%', '10%', '15%'],
                  body: [
                    [
                      { text: 'Medicamento', style: 'tableHeader' },
                      { text: 'Dosis', style: 'tableHeader' },
                      { text: 'Presentación', style: 'tableHeader' },
                      { text: 'Frecuencia', style: 'tableHeader' },
                      { text: 'Vía', style: 'tableHeader' },
                      { text: 'Duración', style: 'tableHeader' }
                    ],
                    ...(consulta.tratamiento
                      ? consulta.tratamiento
                          .split('\n')
                          .filter(linea => linea.trim() !== '')
                          .map(linea => {
                            const partes = linea.split('|').map(part => part.trim());
                            return partes.length >= 6
                              ? partes.slice(0, 6)
                              : [...partes, ...Array(6 - partes.length).fill('')];
                          })
                      : [['No especificado', '', '', '', '', '']])
                  ]
                },
                layout: {
                  hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0),
                  vLineWidth: () => 0,
                  hLineColor: () => '#aaa'
                },
                margin: [0, 0, 0, 10]
              },
              { text: 'Indicaciones:', style: 'label' },
              { text: consulta.indicaciones || 'No especificadas', margin: [0, 0, 0, 15] },
              { text: 'ESTUDIOS COMPLEMENTARIOS', style: 'subheader', margin: [0, 10, 0, 5] },
              {
                ul: consulta.estudios_comp
                  ? consulta.estudios_comp.split('\n').filter(item => item.trim() !== '')
                  : ['No solicitados'],
                margin: [0, 0, 0, 15]
              }
            ]
          }
        ],
        columnGap: 15,
        margin: [0, 0, 0, 15]
      },
      {
        text: 'DATOS DEL MÉDICO TRATANTE',
        style: 'subheader'
      },
      {
        columns: [
          {
            width: '30%',
            stack: [
              { text: 'Nombre completo:', style: 'label' },
              { text: medico.nombre }
            ]
          },
          {
            width: '20%',
            stack: [
              { text: 'Cédula profesional:', style: 'label' },
              { text: medico.cedula }
            ]
          },
          {
            width: '25%',
            stack: [
              { text: 'Universidad:', style: 'label' },
              { text: medico.institucion }
            ]
          },
          {
            width: '25%',
            stack: [
              { text: 'Consultorio:', style: 'label' },
              { text: medico.domicilio }
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
              { text: 'Teléfono:', style: 'label' },
              { text: medico.telefono }
            ]
          },
          {
            width: '30%',
            stack: [
              { text: 'Correo electrónico:', style: 'label' },
              { text: medico.email || 'No especificado' }
            ]
          },
          { width: '50%', text: '' }
        ],
        columnGap: 10,
        margin: [0, 0, 0, 15]
      },
      {
        columns: [
          {
            width: '45%',
            stack: [
              { text: '', alignment: 'center' },
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }] },
              { text: medico.nombre, alignment: 'center', margin: [0, 5, 0, 0], italics: true }
            ]
          },
          { width: '10%', text: '' },
          {
            width: '45%',
            stack: [
              { text: '', alignment: 'center' },
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }] },
              {
                text: `${paciente.nombres} ${paciente.apellidos || ''}`,
                alignment: 'center',
                margin: [0, 5, 0, 0],
                italics: true
              }
            ]
          }
        ],
        margin: [0, 20, 0, 0]
      },
      {
        text: 'Documento válido únicamente con firma y sello del médico tratante. La presente receta cumple con lo establecido en el artículo 28 del Reglamento de Insumos para la Salud.',
        style: 'footer',
        alignment: 'center',
        margin: [0, 20, 0, 0]
      }
    ],
    styles: {
      headerClinica: { fontSize: 16, bold: true, color: '#0066cc' },
      direccionClinica: { fontSize: 10, color: '#666666' },
      header: { fontSize: 18, bold: true, color: '#0066cc' },
      fecha: { fontSize: 11, bold: true },
      subheader: { fontSize: 14, bold: true, color: '#0066cc', margin: [0, 10, 0, 5] },
      label: { bold: true, fontSize: 11 },
      tableHeader: { bold: true, fontSize: 10, color: '#ffffff', fillColor: '#0066cc', margin: [0, 3, 0, 3] },
      footer: { fontSize: 9, italics: true, color: '#666666' }
    },
    defaultStyle: { fontSize: 11, lineHeight: 1.2 }
  };
}
