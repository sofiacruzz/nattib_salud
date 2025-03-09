require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;


// Middleware para parsear JSON
app.use(express.json());

// Rutas de la API
app.use('/auth', require('./routes/auth'));
app.use('/medico', require('./routes/medico'));

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

//Abre directamente al index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});
// Ruta dinámica para servir archivos HTML dentro de /public/html/
app.get('/:page', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'html', req.params.page);

    // Verifica si el archivo existe antes de enviarlo
    if (fs.existsSync(filePath)) {
        res.sendFile(path.resolve(filePath));
    } else {
        res.status(404).json({ error: 'Página no encontrada' });
    }
});

// Middleware para manejar errores 404
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware para manejar errores internos
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
