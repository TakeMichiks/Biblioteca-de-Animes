// testCreateAnime.js
const axios = require('axios');

const API_URL = 'http://localhost:3001/api/animes';

// Pega aquí un token válido obtenido de login
const token = 'mitokensecreto';

async function crearAnime() {
  const nuevoAnime = {
    titulo: "Prueba Anime",
    descripcion: "Descripción de prueba",
    portada: "https://example.com/imagen.jpg",
    episodios: 12,
    estado: "Viendo",
    calificacion: 5,
    notas: "Notas de prueba",
    capVistos: 3,
    capTotales: 12
  };

  try {
    const res = await axios.post(API_URL, nuevoAnime, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Anime creado:', res.data);
  } catch (error) {
    console.error('Error al crear anime:', error.response?.data || error.message);
  }
}

crearAnime();
