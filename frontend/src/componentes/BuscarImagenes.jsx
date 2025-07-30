import React, { useState } from 'react';
import axios from 'axios';

export default function BuscarImagenes({ onSelectImage }) {
  const [query, setQuery] = useState('');
  const [imagenes, setImagenes] = useState([]);
  const [error, setError] = useState('');

  const buscar = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Escribe algo para buscar');
      return;
    }
    try {
      const { data } = await axios.get(`http://localhost:3001/api/scrape?query=${encodeURIComponent(query)}`);
      setImagenes(data.images || []);
      setError('');
    } catch {
      setError('Error al buscar imágenes');
    }
  };

  return (
    <div>
      <form onSubmit={buscar} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Buscar imágenes..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ padding: 8, width: '70%', marginRight: 10 }}
        />
        <button type="submit">Buscar</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {imagenes.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`resultado ${i}`}
            onClick={() => onSelectImage(img)}
            style={{
              cursor: 'pointer',
              width: 150,
              height: 100,
              objectFit: 'cover',
              borderRadius: 6,
              border: img === onSelectImage ? '3px solid blue' : '1px solid #ccc'
            }}
          />
        ))}
      </div>
    </div>
  );
}
