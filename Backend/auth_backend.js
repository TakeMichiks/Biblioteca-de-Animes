const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const archiver = require('archiver'); // Importar la librería archiver

require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3001;
const SECRET = process.env.JWT_SECRET || 'mitokensecreto';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/animesdb';

const UPLOADS_DIR = path.join(__dirname, 'public', 'anime_covers');

// Asegúrate de que el directorio de subidas existe
fs.ensureDir(UPLOADS_DIR)
  .then(() => console.log(`✅ Directorio de subidas creado/verificado: ${UPLOADS_DIR}`))
  .catch(err => console.error('❌ Error al crear directorio de subidas:', err));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde /public/anime_covers
app.use('/anime_covers', express.static(UPLOADS_DIR));
// Servir otros archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error MongoDB:', err));

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String
});

const animeSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: String,
  genero: String,
  estado: { type: String, enum: ['Viendo', 'Completado', 'Pendiente', 'Abandonado'], default: 'Pendiente' },
  capVistos: { type: Number, default: 0 },
  capTotales: { type: Number, default: 0 },
  puntuacion: { type: Number, min: 0, max: 10, default: 0 },
  portada: { type: String, default: null }, 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fechaEstreno: { type: Date, default: null },
  diaSemanaEstreno: { type: Number, min: 0, max: 6, default: null },
  horaEstreno: { type: String, default: null },
  
  initialRecurringChapterDate: { type: Date, default: null },
  numberOfRecurringChapters: { type: Number, default: 0, min: 0 },

}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Anime = mongoose.model('Anime', animeSchema);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
    req.userId = user.id;
    next();
  });
};

app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y password son requeridos' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Este email ya está registrado' }); 
    }
    res.status(500).json({ error: 'Error al registrar usuario: ' + err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y password son requeridos' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Credenciales inválidas' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión: ' + err.message });
  }
});

app.post('/api/animes', authenticateToken, upload.single('portadaFile'), async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      genero,
      estado,
      capVistos,
      capTotales,
      puntuacion,
      portada: urlPortada,
      fechaEstreno,
      diaSemanaEstreno,
      horaEstreno,
      initialRecurringChapterDate,
      numberOfRecurringChapters
    } = req.body;

    const userId = req.userId;
    let finalPortadaUrl = null;

    if (req.file) {
      finalPortadaUrl = `/anime_covers/${req.file.filename}`;
    } else if (urlPortada) {
      if (urlPortada.startsWith('http://') || urlPortada.startsWith('https://')) {
        try {
          const response = await axios.get(urlPortada, { responseType: 'arraybuffer' });
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(new URL(urlPortada).pathname) || '.jpg'}`;
          const filePath = path.join(UPLOADS_DIR, fileName);
          await fs.writeFile(filePath, response.data);
          finalPortadaUrl = `/anime_covers/${fileName}`;
        } catch (downloadErr) {
          console.warn(`Advertencia: No se pudo descargar la imagen de ${urlPortada}. Se guardará la URL original.`, downloadErr.message);
          finalPortadaUrl = urlPortada;
        }
      } else if (urlPortada.startsWith('/anime_covers/')) {
        finalPortadaUrl = urlPortada;
      }
    }

    const nuevoAnime = new Anime({
      userId: userId,
      titulo,
      descripcion,
      genero,
      estado,
      capVistos: capVistos !== undefined && capVistos !== '' ? Number(capVistos) : undefined,
      capTotales: capTotales !== undefined && capTotales !== '' ? Number(capTotales) : undefined,
      puntuacion: puntuacion !== undefined && puntuacion !== '' ? Number(puntuacion) : undefined,
      portada: finalPortadaUrl,
      fechaEstreno: fechaEstreno ? new Date(fechaEstreno) : null,
      diaSemanaEstreno: diaSemanaEstreno !== undefined && diaSemanaEstreno !== '' ? Number(diaSemanaEstreno) : null,
      horaEstreno: horaEstreno !== undefined && horaEstreno !== '' ? horaEstreno : null,
      
      initialRecurringChapterDate: initialRecurringChapterDate ? new Date(initialRecurringChapterDate) : null,
      numberOfRecurringChapters: numberOfRecurringChapters !== undefined && numberOfRecurringChapters !== '' ? Number(numberOfRecurringChapters) : 0
    });

    const animeGuardado = await nuevoAnime.save();

    const MAX_ANIMES = 10;
    const animeCount = await Anime.countDocuments({ userId: userId });

    if (animeCount > MAX_ANIMES) {
      const oldestAnime = await Anime.findOne({ userId: userId })
        .sort({ createdAt: 1 });

      if (oldestAnime) {
        if (oldestAnime.portada && oldestAnime.portada.startsWith('/anime_covers/')) {
          const imagePath = path.join(UPLOADS_DIR, path.basename(oldestAnime.portada));
          fs.remove(imagePath)
            .then(() => console.log(`✅ Imagen local del anime antiguo eliminada: ${imagePath}`))
            .catch(err => console.warn(`Advertencia: No se pudo eliminar la imagen local del anime antiguo ${imagePath}:`, err));
        }
        await Anime.findByIdAndDelete(oldestAnime._id);
        console.log(`✅ Anime antiguo "${oldestAnime.titulo}" eliminado para el usuario ${userId}`);
      }
    }

    res.status(201).json(animeGuardado);
  } catch (err) {
    console.error("Error al crear anime:", err);
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Error de subida: ${err.message}` });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Error de validación: ' + err.message, details: err.errors });
    }
    res.status(500).json({ error: 'Error al crear anime: ' + err.message });
  }
});

app.get('/api/animes', authenticateToken, async (req, res) => {
  try {
    const animes = await Anime.find({ userId: req.userId });
    res.json(animes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener animes: ' + err.message });
  }
});

app.get('/api/animes/latest', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const latestAnimes = await Anime.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(latestAnimes);
  } catch (err) {
    console.error("Error al obtener los últimos animes:", err);
    res.status(500).json({ error: 'Error al obtener los últimos animes: ' + err.message });
  }
});

app.post('/api/animes/import', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const importedAnimes = req.body.animes;

    if (!Array.isArray(importedAnimes)) {
      return res.status(400).json({ error: 'El cuerpo de la solicitud debe ser un array de animes.' });
    }

    let importedCount = 0;
    let skippedCount = 0;
    let errors = [];

    for (const animeData of importedAnimes) {
      const animeToSave = {
        userId: userId,
        titulo: animeData.titulo,
        descripcion: animeData.descripcion || '',
        genero: animeData.genero || '',
        estado: animeData.estado || 'Pendiente',
        puntuacion: animeData.puntuacion !== undefined && animeData.puntuacion !== '' ? Number(animeData.puntuacion) : 0,
        capVistos: animeData.capVistos !== undefined && animeData.capVistos !== '' ? Number(animeData.capVistos) : 0,
        capTotales: animeData.capTotales !== undefined && animeData.capTotales !== '' ? Number(animeData.capTotales) : 0,
        portada: animeData.portada || null, 
        fechaEstreno: animeData.fechaEstreno ? new Date(animeData.fechaEstreno) : null,
        diaSemanaEstreno: animeData.diaSemanaEstreno !== undefined && animeData.diaSemanaEstreno !== null ? Number(animeData.diaSemanaEstreno) : null,
        horaEstreno: animeData.horaEstreno || null,
        initialRecurringChapterDate: animeData.initialRecurringChapterDate ? new Date(animeData.initialRecurringChapterDate) : null,
        numberOfRecurringChapters: animeData.numberOfRecurringChapters !== undefined && animeData.numberOfRecurringChapters !== null ? Number(animeData.numberOfRecurringChapters) : 0
      };

      try {
        const existingAnime = await Anime.findOne({ userId: userId, titulo: animeToSave.titulo });

        if (existingAnime) {
          skippedCount++;
        } else {
          const newAnime = new Anime(animeToSave);
          await newAnime.save();
          importedCount++;
        }
      } catch (saveError) {
        console.error(`Error al importar anime "${animeData.titulo || 'Desconocido'}":`, saveError);
        errors.push({ title: animeData.titulo, error: saveError.message });
      }
    }

    res.status(200).json({
      message: 'Importación completada.',
      importedCount,
      skippedCount,
      errors
    });

  } catch (error) {
    console.error("Error general en la importación de animes:", error);
    res.status(500).json({ error: 'Error interno del servidor al importar animes.' });
  }
});

// Ruta de exportación modificada para generar un archivo ZIP
app.get('/api/animes/export', authenticateToken, async (req, res) => {
  try {
    const animes = await Anime.find({ userId: req.userId });

    // Formatear los datos de los animes para el JSON
    const formattedAnimes = animes.map(anime => {
      const obj = anime.toObject();
      if (obj.fechaEstreno) {
        obj.fechaEstreno = obj.fechaEstreno.toISOString().split('T')[0];
      }
      if (obj.initialRecurringChapterDate) {
        obj.initialRecurringChapterDate = obj.initialRecurringChapterDate.toISOString().split('T')[0];
      }
      return obj;
    });

    // Crear un archivo ZIP
    const archive = archiver('zip', {
      zlib: { level: 9 } // Nivel de compresión
    });

    // Configurar encabezados de respuesta para la descarga del ZIP
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=animes_backup.zip');

    // Pipe el archivo al response
    archive.pipe(res);

    // Añadir el archivo JSON al ZIP
    archive.append(JSON.stringify(formattedAnimes, null, 2), { name: 'animes_backup.json' });

    // Añadir las imágenes de portada al ZIP
    for (const anime of animes) {
      if (anime.portada && anime.portada.startsWith('/anime_covers/')) {
        const imageFileName = path.basename(anime.portada);
        const imagePath = path.join(UPLOADS_DIR, imageFileName);

        // Verificar si el archivo de imagen existe antes de añadirlo
        if (fs.existsSync(imagePath)) {
          archive.file(imagePath, { name: `anime_covers/${imageFileName}` });
        } else {
          console.warn(`Advertencia: La imagen local ${imagePath} no se encontró para el anime "${anime.titulo}". No se incluirá en el ZIP.`);
        }
      }
    }

    // Finalizar el archivo ZIP
    archive.finalize();

  } catch (err) {
    console.error("Error al exportar animes:", err);
    res.status(500).json({ error: 'Error al exportar animes: ' + err.message });
  }
});


app.put('/api/animes/:id', authenticateToken, upload.single('portadaFile'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      genero,
      estado,
      capVistos,
      capTotales,
      puntuacion,
      portada: urlPortada,
      fechaEstreno,
      diaSemanaEstreno,
      horaEstreno,
      initialRecurringChapterDate,
      numberOfRecurringChapters
    } = req.body;
    
    let finalPortadaUrl = null;

    const currentAnime = await Anime.findById(id);
    if (!currentAnime || currentAnime.userId.toString() !== req.userId.toString()) {
      return res.status(404).json({ error: 'Anime no encontrado o no autorizado' });
    }

    if (req.file) {
      if (currentAnime.portada && currentAnime.portada.startsWith('/anime_covers/')) {
        const oldImagePath = path.join(UPLOADS_DIR, path.basename(currentAnime.portada));
        fs.remove(oldImagePath)
          .then(() => console.log(`✅ Imagen local antigua eliminada: ${oldImagePath}`))
          .catch(err => console.warn(`Advertencia: No se pudo eliminar la imagen local antigua ${oldImagePath}:`, err));
      }
      finalPortadaUrl = `/anime_covers/${req.file.filename}`;
    } else if (urlPortada) {
      if (urlPortada.startsWith('http://') || urlPortada.startsWith('https://')) {
        if (currentAnime.portada && currentAnime.portada.startsWith('/anime_covers/')) {
          const oldImagePath = path.join(UPLOADS_DIR, path.basename(currentAnime.portada));
          fs.remove(oldImagePath)
            .then(() => console.log(`✅ Imagen local antigua eliminada: ${oldImagePath}`))
            .catch(err => console.warn(`Advertencia: No se pudo eliminar la imagen local antigua ${oldImagePath}:`, err));
        }
        try {
          const response = await axios.get(urlPortada, { responseType: 'arraybuffer' });
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(new URL(urlPortada).pathname) || '.jpg'}`;
          const filePath = path.join(UPLOADS_DIR, fileName);
          await fs.writeFile(filePath, response.data);
          finalPortadaUrl = `/anime_covers/${fileName}`;
        } catch (downloadErr) {
          console.warn(`Advertencia: No se pudo descargar la imagen de ${urlPortada}. Se guardará la URL original.`, downloadErr.message);
          finalPortadaUrl = urlPortada;
        }
      } else if (urlPortada.startsWith('/anime_covers/')) {
        finalPortadaUrl = urlPortada;
      } else {
        if (currentAnime.portada && currentAnime.portada.startsWith('/anime_covers/')) {
            const oldImagePath = path.join(UPLOADS_DIR, path.basename(currentAnime.portada));
            fs.remove(oldImagePath)
                .then(() => console.log(`✅ Imagen local eliminada por vaciado: ${oldImagePath}`))
                .catch(err => console.warn(`Advertencia: No se pudo eliminar la imagen local al vaciar ${oldImagePath}:`, err));
        }
        finalPortadaUrl = null;
      }
    } else {
      if (currentAnime.portada && currentAnime.portada.startsWith('/anime_covers/')) {
        const oldImagePath = path.join(UPLOADS_DIR, path.basename(currentAnime.portada));
        fs.remove(oldImagePath)
          .then(() => console.log(`✅ Imagen local eliminada por vaciado: ${oldImagePath}`))
          .catch(err => console.warn(`Advertencia: No se pudo eliminar la imagen local al vaciar ${oldImagePath}:`, err));
      }
      finalPortadaUrl = null;
    }

    const updateData = {
      titulo,
      descripcion,
      genero,
      estado,
      capVistos: capVistos !== undefined && capVistos !== '' ? Number(capVistos) : undefined,
      capTotales: capTotales !== undefined && capTotales !== '' ? Number(capTotales) : undefined,
      puntuacion: puntuacion !== undefined && puntuacion !== '' ? Number(puntuacion) : undefined,
      portada: finalPortadaUrl,
      fechaEstreno: fechaEstreno ? new Date(fechaEstreno) : null,
      diaSemanaEstreno: diaSemanaEstreno !== undefined && diaSemanaEstreno !== '' ? Number(diaSemanaEstreno) : null,
      horaEstreno: horaEstreno !== undefined && horaEstreno !== '' ? horaEstreno : null,

      initialRecurringChapterDate: initialRecurringChapterDate ? new Date(initialRecurringChapterDate) : null,
      numberOfRecurringChapters: numberOfRecurringChapters !== undefined && numberOfRecurringChapters !== '' ? Number(numberOfRecurringChapters) : 0
    };

    const updatedAnime = await Anime.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedAnime) return res.status(404).json({ error: 'Anime no encontrado o no autorizado' });
    res.json(updatedAnime);
  } catch (err) {
    console.error("Error al actualizar anime:", err);
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Error de subida: ${err.message}` });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Error de validación: ' + err.message, details: err.errors });
    }
    res.status(500).json({ error: 'Error al actualizar anime: ' + err.message });
  }
});


app.delete('/api/animes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAnime = await Anime.findOneAndDelete({ _id: id, userId: req.userId });

    if (!deletedAnime) return res.status(404).json({ error: 'Anime no encontrado o no autorizado' });

    if (deletedAnime.portada && deletedAnime.portada.startsWith('/anime_covers/')) {
      const imagePath = path.join(UPLOADS_DIR, path.basename(deletedAnime.portada));
      fs.remove(imagePath)
        .then(() => console.log(`✅ Imagen local eliminada: ${imagePath}`))
        .catch(err => console.warn(`Advertencia: No se pudo eliminar la imagen local ${imagePath}:`, err));
    }

    res.json({ message: 'Anime eliminado con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar anime: ' + err.message });
  }
});

app.get('/api/scrape', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: 'Query requerido' });
  try {
    const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
    const { data: html } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(html);
    const images = [];
    $('img').each((i, img) => {
      const src = $(img).attr('src');
      if (src && (src.startsWith('http://') || src.startsWith('https://'))) images.push(src);
    });
    res.json({ imageUrl: images[0] || null });
  } catch (error) {
    console.error("Error al hacer scraping de imágenes:", error);
    res.status(500).json({ error: 'Error al buscar imágenes' });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
