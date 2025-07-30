import React, { useState } from 'react';
import axios from 'axios';

export default function ModalAgregarAnime({ onClose, onAnimeAdded, token, API_URL, onMessage }) {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [genero, setGenero] = useState('');
    const [estado, setEstado] = useState('Pendiente');
    const [capVistos, setCapVistos] = useState(0);
    const [capTotales, setCapTotales] = useState(0);
    const [puntuacion, setPuntuacion] = useState(0);
    const [portadaFile, setPortadaFile] = useState(null);
    const [portadaUrl, setPortadaUrl] = useState('');

    // Estados para el calendario y detalles de emisión
    const [fechaEstreno, setFechaEstreno] = useState(''); // Usaremos string YYYY-MM-DD para el input type="date"
    const [horaEstreno, setHoraEstreno] = useState(''); // Usaremos string para el input type="time"

    // NUEVOS ESTADOS PARA LA RECURRENCIA DE CAPÍTULOS
    const [initialRecurringChapterDate, setInitialRecurringChapterDate] = useState(''); // Fecha del primer capítulo recurrente
    const [numberOfRecurringChapters, setNumberOfRecurringChapters] = useState(0); // Número de repeticiones semanales


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

        if (portadaFile) {
            formData.append('portadaFile', portadaFile);
        } else {
            formData.append('portada', portadaUrl);
        }

        // Añadir campos de emisión
        if (fechaEstreno) {
            formData.append('fechaEstreno', fechaEstreno);
            const dateObj = new Date(fechaEstreno);
            if (!isNaN(dateObj.getTime())) { // Asegurarse de que sea una fecha válida antes de obtener el día
                formData.append('diaSemanaEstreno', dateObj.getDay());
            }
            // Si la fecha no es válida, 'diaSemanaEstreno' no se añade al formData, permitiendo que el backend use null.
        }

        if (horaEstreno) formData.append('horaEstreno', horaEstreno);

        // Añadir campos de recurrencia
        if (initialRecurringChapterDate) {
            formData.append('initialRecurringChapterDate', initialRecurringChapterDate);
        }
        formData.append('numberOfRecurringChapters', numberOfRecurringChapters);


        try {
            const response = await axios.post(`${API_URL}/api/animes`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            onAnimeAdded(response.data); // Llama a la función para actualizar la lista en App.jsx
            onMessage('Anime agregado con éxito!'); // Envía mensaje a App.jsx
            onClose(); // Cierra el modal
        } catch (error) {
            console.error("Error al agregar anime:", error.response ? error.response.data : error.message);
            onMessage(`Error al agregar anime: ${error.response ? (error.response.data.error || 'Error desconocido') : error.message}`);
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

    // Estilos para el modal (pueden ir en un archivo CSS o definirse aquí)
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
        height: '40px', // Asegura una altura consistente con los inputs
        appearance: 'none', // Quita el estilo por defecto del navegador en algunos casos
        paddingRight: '30px', // Espacio para la flecha personalizada si se añade
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
                <h2>Agregar Nuevo Anime</h2>
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

                    {/* ****** CAMPOS DE EMISIÓN ****** */}
                    <h3 style={{ marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid #555', paddingBottom: '5px' }}>Detalles de Emisión</h3>
                    <label>Fecha de Estreno (Primer Capítulo):</label>
                    <input
                        type="date"
                        value={fechaEstreno}
                        onChange={(e) => setFechaEstreno(e.target.value)}
                        style={modalInputStyle}
                    />
                    {/* diaSemanaEstreno ya no es un input directo, se calcula en handleSubmit */}
                    <label>Hora de Estreno:</label>
                    <input
                        type="time"
                        value={horaEstreno}
                        onChange={(e) => setHoraEstreno(e.target.value)}
                        style={modalInputStyle}
                    />

                    {/* ****** CAMPOS DE RECURRENCIA DE CAPÍTULOS ****** */}
                    <h3 style={{ marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid #555', paddingBottom: '5px' }}>Capítulos Recurrentes</h3>
                    <label>Fecha del Primer Capítulo Recurrente:</label>
                    <input
                        type="date"
                        value={initialRecurringChapterDate}
                        onChange={(e) => setInitialRecurringChapterDate(e.target.value)}
                        style={modalInputStyle}
                    />
                    <label>Número de Repeticiones Semanales:</label>
                    <input
                        type="number"
                        value={numberOfRecurringChapters}
                        onChange={(e) => setNumberOfRecurringChapters(Math.max(0, parseInt(e.target.value) || 0))}
                        style={modalInputStyle}
                        min="0"
                    />


                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <button type="submit" style={primaryButtonStyle}>Agregar</button>
                        <button type="button" onClick={onClose} style={secondaryButtonStyle}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
