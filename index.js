import express from 'express'
import medicoRouter from './routes/medicoRoute.js'
import fs from 'fs'
import path from 'path';
import url from 'url';  

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true}))

app.use('/medico', medicoRouter)

// Servir archivos estáticos desde /public
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));



// Abre directamente al index.html
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
const PORT = process.env.PORT || 3000;


app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
})