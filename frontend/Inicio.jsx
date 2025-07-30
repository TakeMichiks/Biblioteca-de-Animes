// src/components/Inicio.jsx (o el archivo relevante)

// 1. Importaciones necesarias
import React, { useState, useEffect } from 'react'; // Para componentes React, estados y efectos secundarios
import axios from 'axios'; // Para hacer peticiones HTTP a tu backend
import Calendar from 'react-calendar'; // ¡El componente de calendario que instalamos!
import 'react-calendar/dist/Calendar.css'; // Los estilos por defecto del calendario (muy importantes)
import './Inicio.css'; // Vamos a crear este archivo para nuestros estilos personalizados

// Define la URL base de tu backend (¡asegúrate de que sea la correcta!)
const API_URL = 'http://localhost:3001';

// Tu componente funcional de Inicio
// Recibe `token` y `logout` como props, lo cual es muy bueno
const Inicio = ({ token, logout }) => {
    // Estados para guardar los datos
    const [latestAnimes, setLatestAnimes] = useState([]); // Para la lista de los últimos animes
    const [mensaje, setMensaje] = useState(''); // Para mostrar mensajes al usuario (éxito/error)
    const [calendarDate, setCalendarDate] = useState(new Date()); // Estado para la fecha seleccionada en el calendario. Inicialmente, es la fecha actual.

    // 2. useEffect para cargar los últimos animes cuando el componente se monta o el token cambia
    useEffect(() => {
        const fetchLatestAnimes = async () => {
            if (!token) { // Si no hay token, no podemos hacer la petición
                setMensaje('No hay token de autenticación. Por favor, inicia sesión.');
                return;
            }
            try {
                // Hacer la petición GET a tu backend para obtener los últimos animes
                const res = await axios.get(`${API_URL}/api/animes/latest`, {
                    headers: {
                        Authorization: `Bearer ${token}` // Envía el token en el encabezado
                    }
                });
                setLatestAnimes(res.data); // Guarda los animes obtenidos en el estado
                setMensaje(''); // Si todo sale bien, limpia cualquier mensaje anterior
            } catch (err) {
                console.error("Error al cargar los últimos animes:", err); // Muestra el error en la consola
                // Muestra un mensaje de error al usuario
                setMensaje(err.response?.data?.error || 'Error al cargar datos');
                // Si el error es 401 (no autorizado) o 403 (prohibido), desloguea al usuario
                if (err.response?.status === 401 || err.response?.status === 403) {
                    logout(); // Llama a la función de logout que pasas como prop
                }
            }
        };

        fetchLatestAnimes(); // Llama a la función de carga cuando el componente se monta
    }, [token, logout]); // Dependencias: la función se ejecuta de nuevo si `token` o `logout` cambian

    // 3. Función para manejar el cambio de fecha en el calendario
    const handleCalendarChange = (date) => {
        setCalendarDate(date); // Actualiza la fecha seleccionada en el estado
        console.log("Fecha seleccionada en el calendario:", date); // Puedes ver la fecha en la consola
        // Aquí podrías añadir lógica para filtrar animes, mostrar eventos, etc., basados en la fecha
    };

    // 4. Renderizado del componente (la parte visual)
    return (
        <div className="inicio-container">
            {/* Mostrar mensajes de éxito o error */}
            {mensaje && (
                <div className={`mensaje ${mensaje.includes('Error') ? 'error' : ''}`}>
                    {mensaje}
                </div>
            )}
            <h1 className="inicio-title">Bienvenido</h1>
            <p className="inicio-description">
                Selecciona una opción en la barra de navegación o explora tus últimos animes.
            </p>

            {/* Este div es el contenedor principal que dividirá el contenido en dos columnas */}
            <div className="content-layout">
                {/* Panel Izquierdo: Animes Recientes */}
                <div className="animes-panel">
                    <h2 className="section-title">Tus Últimos Animes Agregados</h2>
                    {latestAnimes.length === 0 ? (
                        <p>Aún no has agregado animes. ¡Dirígete a la Biblioteca para empezar!</p>
                    ) : (
                        <div className="anime-list">
                            {latestAnimes.map(anime => (
                                <div key={anime._id} className="anime-card">
                                    {/* Muestra la imagen de portada o un placeholder si no hay */}
                                    <img
                                        src={anime.portada || '/placeholder.jpg'} // Usa la URL de tu backend para las imágenes, o una imagen por defecto
                                        alt={anime.titulo}
                                        className="anime-cover"
                                        // Manejo de errores de imagen: si la imagen no carga, muestra un placeholder
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.jpg' }}
                                    />
                                    <h3 className="anime-title">{anime.titulo}</h3>
                                    <p className="anime-status">Estado: {anime.estado}</p>
                                    <p className="anime-chapters">Capítulos: {anime.capVistos} / {anime.capTotales}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Panel Derecho: Calendario */}
                <div className="calendar-panel">
                    <h2 className="section-title">Calendario</h2>
                    <Calendar
                        onChange={handleCalendarChange} // Cuando el usuario selecciona una fecha
                        value={calendarDate} // La fecha que el calendario debe mostrar como seleccionada
                        locale="es-ES" // Opcional: para que los nombres de los días y meses estén en español
                    />
                    {/* Aquí podrías agregar más contenido relacionado con el calendario, como eventos futuros */}
                </div>
            </div>
        </div>
    );
};

export default Inicio;