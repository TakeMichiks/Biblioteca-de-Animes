const express = require('express');
const router = express.Router();
const Anime = require('../models/Anime');  // Nos falta crearlo, te lo paso abajo

// Crear un anime
router.post('/', async (req, res) => {
  try {
    const anime = new Anime(req.body);
    console.log(anime.proximoCapituloFecha)
    await anime.save();
    res.status(201).json(anime);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear anime' });
  }
});

// Obtener todos los animes
router.get('/', async (req, res) => {
  try {
    const animes = await Anime.find();
    res.json(animes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener animes' });
  }
});

// Obtener un anime por ID
router.get('/:id', async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);
    if (!anime) return res.status(404).json({ error: 'Anime no encontrado' });
    res.json(anime);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener anime' });
  }
});

// Actualizar un anime
router.put('/:id', async (req, res) => {
  try {
    const anime = await Anime.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!anime) return res.status(404).json({ error: 'Anime no encontrado' });
    res.json(anime);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar anime' });
  }
});

// Eliminar un anime
router.delete('/:id', async (req, res) => {
  try {
    const anime = await Anime.findByIdAndDelete(req.params.id);
    if (!anime) return res.status(404).json({ error: 'Anime no encontrado' });
    res.json({ message: 'Anime eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar anime' });
  }
});

module.exports = router;
