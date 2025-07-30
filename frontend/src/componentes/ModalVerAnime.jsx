import React from 'react';

// Asegúrate de que API_URL se recibe como prop
// Si por alguna razón no se pasa, usamos 'http://localhost:3001' como fallback
export default function ModalVerAnime({ anime, onClose, onEdit, onDelete, API_URL }) {
  // Definimos API_URL si no viene como prop (para robustez)
  const effectiveApiUrl = API_URL || 'http://localhost:3001'; 

  // Si anime no está definido, no renderizamos el modal para evitar errores
  if (!anime) return null;

  // Array para mapear el número del día de la semana a su nombre
  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  // Esta es la funcion que define el Eliminar anime
      const handleInternalDelete = () => {
        // Llama a la función onDelete pasada desde App.jsx
        // y pásale el ID del anime seleccionado
        if (onDelete && anime._id) {
            onDelete(anime._id);
        }
    };

  // Estilos (ajustados para tema oscuro)
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,
  };

  const modalContentStyle = {
    backgroundColor: '#333', // Fondo oscuro
    padding: 25,
    borderRadius: 10,
    maxWidth: 700,
    width: '90%',
    boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
    overflowY: 'auto',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    position: 'relative',
    color: '#eee', // Color de texto principal
  };

  const actionButtonStyle = {
    background: 'rgba(255,255,255,0.1)', // Fondo semi-transparente para botones de acción
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '8px', // Aumentado el padding para mejor tacto
    borderRadius: '50%',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    color: '#eee', // Color de icono claro
  };

  const tagStyle = {
    backgroundColor: '#007bff', // Color de etiqueta para estado/puntuación
    padding: '5px 10px',
    borderRadius: '5px',
    fontSize: '0.9em',
    color: 'white', // Texto blanco en etiquetas
    fontWeight: 'bold',
  };

  const detailTextStyle = {
    color: '#bbb', // Color de texto para detalles
    lineHeight: 1.6,
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>

        {/* Botones de acción en la esquina superior derecha */}
        <div style={{ position: 'absolute', top: 15, right: 15, display: 'flex', gap: 10 }}>
          {/* Botón de Editar con icono de lápiz */}
          <button
            onClick={onEdit} // Usar onEdit
            style={{ ...actionButtonStyle, backgroundColor: '#ffc107', color: '#333' }} // Amarillo para editar
            title="Editar Anime"
          >
            ✏️
          </button>
          {/* Botón de Eliminar con icono de papelera */}
          <button
            onClick={handleInternalDelete} // Esta es la función que maneja la eliminación
            
            style={{ ...actionButtonStyle, backgroundColor: '#dc3545', color: 'white' }} // Rojo para eliminar
            title="Eliminar Anime"
          >
            🗑️
          </button>
          
          {/* Botón de cerrar */}
          <button
            onClick={onClose}
            style={{ ...actionButtonStyle, backgroundColor: '#6c757d', color: 'white' }} // Gris para cerrar
            title="Cerrar"
          >
            &times;
          </button>
        </div>

        {/* Contenido del Anime */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 40 }}>
          {anime.portada && (
            <img
              // Usamos effectiveApiUrl aquí
              src={anime.portada.startsWith('/anime_covers/') ? `${effectiveApiUrl}${anime.portada}` : anime.portada}
              alt={anime.titulo}
              style={{
                width: '180px',
                height: '250px',
                objectFit: 'cover',
                borderRadius: 8,
                flexShrink: 0
              }}
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/180x250/333333/FFFFFF?text=No+Image'; }}
            />
          )}
          <div style={{ flexGrow: 1 }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '2em', color: '#007bff' }}>{anime.titulo}</h2>
            <div style={{ display: 'flex', gap: 10, marginBottom: 15, flexWrap: 'wrap' }}>
              {anime.estado && <span style={tagStyle}>{anime.estado}</span>}
              {/* Usar anime.puntuacion en lugar de anime.calificacion */}
              {anime.puntuacion > 0 && <span style={tagStyle}>⭐ {anime.puntuacion}/10</span>}
              {anime.genero && <span style={tagStyle}>Género: {anime.genero}</span>}
            </div>
            <p style={detailTextStyle}>
              <strong>Descripción:</strong> {anime.descripcion || 'Sin descripción disponible.'}
            </p>
          </div>
        </div>

        {/* Detalles Adicionales */}
        <div style={{ borderTop: '1px solid #555', paddingTop: 20, marginTop: 10 }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#007bff' }}>Detalles</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', color: '#eee' }}>
            <div>
              <strong>Capítulos Vistos:</strong> {anime.capVistos !== undefined ? anime.capVistos : 'N/A'}
            </div>
            <div>
              <strong>Capítulos Totales:</strong> {anime.capTotales !== undefined ? anime.capTotales : 'N/A'}
            </div>
            {/* Detalles de Estreno */}
            <div>
              <strong>Fecha de Estreno:</strong> {anime.fechaEstreno ? new Date(anime.fechaEstreno).toLocaleDateString('es-ES') : 'N/A'}
            </div>
            <div>
              <strong>Día de Estreno:</strong> {anime.diaSemanaEstreno !== null ? diasSemana[anime.diaSemanaEstreno] : 'N/A'}
            </div>
            <div>
              <strong>Hora de Estreno:</strong> {anime.horaEstreno || 'N/A'}
            </div>
            {/* Detalles del Próximo Capítulo */}
            <div>
              <strong>Próximo Capítulo Fecha:</strong> {anime.initialRecurringChapterDate ? new Date(anime.initialRecurringChapterDate).toLocaleDateString('es-ES') : 'N/A'}
            </div>
            <div>
              <strong>Próximo Capítulo Número:</strong> {anime.numberOfRecurringChapters !== undefined ? anime.numberOfRecurringChapters : 'N/A'}
            </div>
            <div>
              <strong>Última Actualización:</strong> {anime.updatedAt ? new Date(anime.updatedAt).toLocaleDateString('es-ES') : 'N/A'}
            </div>
          </div>
        </div>

        {/* Notas del Usuario (si existen) */}
        {anime.notas && (
          <div style={{ borderTop: '1px solid #555', paddingTop: 20, marginTop: 10 }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#007bff' }}>Mis Notas</h3>
            <p style={detailTextStyle}>{anime.notas}</p>
          </div>
        )}
      </div>
    </div>
  );
}
