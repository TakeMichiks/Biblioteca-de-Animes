import React, { useState } from 'react';
import axios from 'axios';

export default function ModalEditarAnime({ onClose, onAnimeUpdated, token, API_URL, onMessage, anime = {} }) {
    // Usar encadenamiento opcional y coalescencia nula para manejar valores undefined
    // La prop 'anime' ahora tiene un valor por defecto de {}
    const [titulo, setTitulo] = useState(anime.titulo ?? '');
    const [descripcion, setDescripcion] = useState(anime.descripcion ?? '');
    const [genero, setGenero] = useState(anime.genero ?? '');
    const [estado, setEstado] = useState(anime.estado ?? 'Pendiente'); // Asumiendo 'Pendiente' como default para estado
    const [capVistos, setCapVistos] = useState(anime.capVistos ?? 0);
    const [capTotales, setCapTotales] = useState(anime.capTotales ?? 0);
    const [puntuacion, setPuntuacion] = useState(anime.puntuacion ?? 0);
    const [portadaFile, setPortadaFile] = useState(null);
    const [portadaUrl, setPortadaUrl] = useState(anime.portada ?? ''); // Mantener la URL existente o vacío

    // NUEVOS ESTADOS PARA EL CALENDARIO, CON VALORES INICIALES DEL ANIME A EDITAR
    const [fechaEstreno, setFechaEstreno] = useState(anime.fechaEstreno ? new Date(anime.fechaEstreno).toISOString().split('T')[0] : '');
    const [diaSemanaEstreno, setDiaSemanaEstreno] = useState(String(anime.diaSemanaEstreno ?? '')); // Convertir a string, si es null/undefined, será ''
    const [horaEstreno, setHoraEstreno] = useState(anime.horaEstreno ?? '');
    // NUEVOS ESTADOS PARA EL PRÓXIMO CAPÍTULO
    const [proximoCapituloFecha, setProximoCapituloFecha] = useState(anime.proximoCapituloFecha ? new Date(anime.proximoCapituloFecha).toISOString().split('T')[0] : '');
    const [proximoCapituloNumero, setProximoCapituloNumero] = useState(String(anime.proximoCapituloNumero ?? '')); // Convertir a string, si es null/undefined, será ''


    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descripcion', descripcion);
        formData.append('genero', genero);
        formData.append('estado', estado);
        formData.append('capVistos', capVistos);
        formData.append('capTotales', capTotales);
        formData.append('puntuacion', puntuacion);

        // Si se seleccionó un nuevo archivo, o si la URL de la portada se cambió/borró
        if (portadaFile) {
            formData.append('portadaFile', portadaFile);
        } else {
            // Si portadaUrl está vacío, se envía como cadena vacía para que el backend la borre
            formData.append('portada', portadaUrl);
        }

        // AÑADIR NUEVOS CAMPOS AL FormData
        // Solo añadir si tienen un valor para evitar enviar cadenas vacías al backend que podrían causar problemas
        if (fechaEstreno) formData.append('fechaEstreno', fechaEstreno);
        if (diaSemanaEstreno !== '') formData.append('diaSemanaEstreno', diaSemanaEstreno); // Envía solo si tiene un valor
        if (horaEstreno) formData.append('horaEstreno', horaEstreno);
        // FIX: Se asume que estos campos en el backend son 'initialRecurringChapterDate' y 'numberOfRecurringChapters'
        // Si los nombres en el backend son 'proximoCapituloFecha' y 'proximoCapituloNumero', por favor, avísame para ajustar.
        if (proximoCapituloFecha) formData.append('initialRecurringChapterDate', proximoCapituloFecha);
        if (proximoCapituloNumero !== '') formData.append('numberOfRecurringChapters', proximoCapituloNumero);


        try {
            const response = await axios.put(`${API_URL}/api/animes/${anime._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            onAnimeUpdated(response.data);
            onClose();
        } catch (error) {
            console.error("Error al actualizar anime:", error.response ? error.response.data : error.message);
            onMessage(`Error al actualizar anime: ${error.response ? (error.response.data.error || 'Error desconocido') : error.message}`);
        }
    };

    const handleSearchImage = async () => {
        if (!titulo.trim()) {
            onMessage('Por favor, ingresa un título para buscar una portada.');
            return;
        }
        try {
            const { data } = await axios.get(`${API_URL}/api/scrape?query=${encodeURIComponent(titulo + ' anime cover')}`);
            if (data.imageUrl) {
                setPortadaUrl(data.imageUrl);
                setPortadaFile(null); // Asegúrate de limpiar el archivo si se usa una URL
            } else {
                onMessage('No se encontraron imágenes para el título proporcionado.');
            }
        } catch (error) {
            console.error("Error al buscar imagen:", error);
            onMessage('Error al buscar imagen online.');
        }
    };

    // Estilos para el modal
    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    };

    const modalContentStyle = {
        backgroundColor: '#333',
        padding: '30px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
        color: '#eee',
        maxHeight: '80vh',
        overflowY: 'auto', // Permite scroll si el contenido es muy largo
    };

    const modalInputStyle = {
        width: 'calc(100% - 20px)',
        padding: '10px',
        marginBottom: '15px',
        border: '1px solid #555',
        borderRadius: '4px',
        backgroundColor: '#444',
        color: '#eee',
        boxSizing: 'border-box',
    };

    const modalSelectStyle = {
        ...modalInputStyle,
        height: '40px',
        appearance: 'none',
        paddingRight: '30px',
    };

    const buttonStyle = {
        padding: '10px 15px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.2s',
    };

    const primaryButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#28a745',
        color: 'white',
        marginRight: '10px',
        '&:hover': {
            backgroundColor: '#218838',
        },
    };

    const secondaryButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#6c757d',
        color: 'white',
        '&:hover': {
            backgroundColor: '#5a6268',
        },
    };


    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <h2>Editar Anime</h2>
                <form onSubmit={handleSubmit}>
                    <label>Título:</label>
                    <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} style={modalInputStyle} required />

                    <label>Descripción:</label>
                    <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={{ ...modalInputStyle, minHeight: '80px' }}></textarea>

                    <label>Género:</label>
                    <input type="text" value={genero} onChange={(e) => setGenero(e.target.value)} style={modalInputStyle} />

                    <label>Estado:</label>
                    <select value={estado} onChange={(e) => setEstado(e.target.value)} style={modalSelectStyle}>
                        <option value="Viendo">Viendo</option>
                        <option value="Completado">Completado</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Abandonado">Abandonado</option>
                    </select>

                    <label>Capítulos Vistos:</label>
                    <input type="number" value={capVistos} onChange={(e) => setCapVistos(Number(e.target.value))} style={modalInputStyle} min="0" />

                    <label>Capítulos Totales:</label>
                    <input type="number" value={capTotales} onChange={(e) => setCapTotales(Number(e.target.value))} style={modalInputStyle} min="0" />

                    <label>Puntuación (1-10):</label>
                    <input type="number" value={puntuacion} onChange={(e) => setPuntuacion(Number(e.target.value))} style={modalInputStyle} min="0" max="10" />

                    {/* Sección de Portada */}
                    <label style={{ display: 'block', marginTop: '10px' }}>Portada del Anime:</label>
                    <input type="file" onChange={e => { setPortadaFile(e.target.files[0]); setPortadaUrl(''); }} style={{ ...modalInputStyle, border: 'none', backgroundColor: 'transparent', color: '#eee' }} />
                    <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                        <span style={{ margin: '0 10px', color: '#bbb' }}>O</span>
                        <input type="text" placeholder="URL de la Portada" value={portadaUrl} onChange={e => { setPortadaUrl(e.target.value); setPortadaFile(null); }} style={{ ...modalInputStyle, flexGrow: 1, margin: 0 }} />
                        <button type="button" onClick={handleSearchImage} style={{ ...buttonStyle, backgroundColor: '#17a2b8', marginLeft: '10px' }}>Buscar Online</button>
                    </div>

                    {portadaUrl && <img src={portadaUrl.startsWith('/anime_covers/') ? `${API_URL}${portadaUrl}` : portadaUrl} alt="Portada Preview" style={{ maxWidth: '100%', height: 'auto', borderRadius: '5px', marginTop: '10px' }} />}

                    {/* ****** NUEVOS CAMPOS DEL CALENDARIO ****** */}
                    <h3 style={{ marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid #555', paddingBottom: '5px' }}>Detalles de Emisión</h3>
                    <label>Fecha de Estreno:</label>
                    <input
                        type="date"
                        value={fechaEstreno}
                        onChange={(e) => setFechaEstreno(e.target.value)}
                        style={modalInputStyle}
                    />

                    <label>Día de la Semana de Estreno:</label>
                    <select
                        value={diaSemanaEstreno}
                        onChange={(e) => setDiaSemanaEstreno(e.target.value)}
                        style={modalSelectStyle}
                    >
                        <option value="">Selecciona un día</option>
                        <option value="0">Domingo</option>
                        <option value="1">Lunes</option>
                        <option value="2">Martes</option>
                        <option value="3">Miércoles</option>
                        <option value="4">Jueves</option>
                        <option value="5">Viernes</option>
                        <option value="6">Sábado</option>
                    </select>

                    <label>Hora de Estreno:</label>
                    <input
                        type="time"
                        value={horaEstreno}
                        onChange={(e) => setHoraEstreno(e.target.value)}
                        style={modalInputStyle}
                    />

                    {/* ****** NUEVOS CAMPOS PARA EL PRÓXIMO CAPÍTULO ****** */}
                    <h3 style={{ marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid #555', paddingBottom: '5px' }}>Próximo Capítulo</h3>
                    <label>Fecha Próximo Capítulo:</label>
                    <input
                        type="date"
                        value={proximoCapituloFecha}
                        onChange={(e) => setProximoCapituloFecha(e.target.value)}
                        style={modalInputStyle}
                    />
                    <label>Número Próximo Capítulo:</label>
                    <input
                        type="number"
                        value={proximoCapituloNumero}
                        onChange={(e) => setProximoCapituloNumero(e.target.value)}
                        style={modalInputStyle}
                        min="0"
                    />


                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <button type="submit" style={primaryButtonStyle}>Guardar Cambios</button>
                        <button type="button" onClick={onClose} style={secondaryButtonStyle}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
