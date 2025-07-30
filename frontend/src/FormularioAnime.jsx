import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

export default function FormularioAnime() {
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    portada: '',
    episodios: 0,
    estado: '',
    calificacion: 0,
    notas: '',
    capVistos: 0,
    capTotales: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Debes iniciar sesión');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/animes`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ Anime guardado:', response.data);
      alert('Anime guardado correctamente');
      // Limpiar formulario si quieres:
      setForm({
        titulo: '',
        descripcion: '',
        portada: '',
        episodios: 0,
        estado: '',
        calificacion: 0,
        notas: '',
        capVistos: 0,
        capTotales: 0
      });
    } catch (err) {
      console.error('❌ Error al guardar anime:', err.response ? err.response.data : err);
      alert('Error al crear anime');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Agregar Nuevo Anime</h2>
      
      <input type="text" name="titulo" placeholder="Título" value={form.titulo} onChange={handleChange} required />
      <input type="text" name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} />
      <input type="text" name="portada" placeholder="URL de portada" value={form.portada} onChange={handleChange} />
      <input type="number" name="episodios" placeholder="Episodios" value={form.episodios} onChange={handleChange} />
      <input type="text" name="estado" placeholder="Estado (Viendo, Completado...)" value={form.estado} onChange={handleChange} />
      <input type="number" name="calificacion" placeholder="Calificación" value={form.calificacion} onChange={handleChange} />
      <textarea name="notas" placeholder="Notas" value={form.notas} onChange={handleChange}></textarea>
      <input type="number" name="capVistos" placeholder="Capítulos Vistos" value={form.capVistos} onChange={handleChange} />
      <input type="number" name="capTotales" placeholder="Capítulos Totales" value={form.capTotales} onChange={handleChange} />
      
      <button type="submit">Guardar Anime</button>
    </form>
  );
}
