const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Modelo User con email y password
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middlewares/authMiddleware');
const Anime = require('../models/Anime');

// Registro (pública)
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password requeridos' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Email ya registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });

    await user.save();

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('Error en /register:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login (pública)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password requeridos' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token });
  } catch (error) {
    console.error('Error en /login:', error);
    res.status(500).json({ error: 'Error en login' });
  }
});

// Rutas protegidas (requieren token)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const animes = await Anime.find({ userId: req.userId }); // Filtrar animes del usuario logueado
    res.json(animes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener animes' });
  }
});

// Otras rutas protegidas aquí...
// router.post('/', authMiddleware, ...)
// router.put('/:id', authMiddleware, ...)
// router.delete('/:id', authMiddleware, ...)

module.exports = router;
