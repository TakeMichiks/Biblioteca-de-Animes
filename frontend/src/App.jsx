import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ModalAgregarAnime from './componentes/ModalAgregarAnime';
import ModalEditarAnime from './componentes/ModalEditarAnime';
import ModalVerAnime from './componentes/ModalVerAnime';
import ModalCambiarColor from './componentes/ModalCambiarColor'; // Importa el nuevo modal

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// ********************************************
// ***** ESTILOS CON VARIABLES CSS PARA TEMAS *****
// ********************************************

const appStyles = `
    body { /* Asegura que el margen predeterminado del navegador sea 0 */
        margin: 0;
    }
    :root {
        /* Colores base para el tema oscuro (por defecto) */
        --bg-primary: #222;
        --bg-secondary: #333;
        --bg-tertiary: #444;
        --text-primary: #eee;
        --text-secondary: #bbb;
        --accent-blue: #007bff;
        --accent-yellow: #ffc107;
        --accent-red: #dc3545;
        --accent-green: #28a745;
        --accent-cyan: #17a2b8;
        --border-color: #444; /* Borde oscuro */
        --input-bg: #444;
        --input-border: #555; /* Borde de input oscuro */
        --calendar-bg: #2b2b2b;
        --calendar-border: #555;
        --calendar-nav-color: #fff;
        --calendar-weekday-color: #aaa;
        --calendar-tile-hover: #666;
        --calendar-tile-disabled: #3a3a3a;
        --calendar-now-bg: #007bff;
        --calendar-now-hover: #0056b3;
        --calendar-active-bg: #0056b3;
        --calendar-active-hover: #004494;
        --highlight-date-bg: #ffc107;
        --highlight-date-text: #333;
        --highlight-date-hover: #e0a800;
        --highlight-sunday-bg: #007bff;
        --highlight-sunday-text: white;
        --box-shadow-dark: 0 4px 8px rgba(0,0,0,0.3);
        --box-shadow-light: 0 4px 8px rgba(0,0,0,0.1);
    }

    /* Tema claro: sobrescribe las variables CSS */
    .light-theme {
        --bg-primary: #f0f2f5; /* Fondo principal claro */
        --bg-secondary: #ffffff; /* Fondo de tarjetas/paneles claro */
        --bg-tertiary: #e9ecef; /* Fondo de elementos secundarios claro */
        --text-primary: #333; /* Texto principal oscuro */
        --text-secondary: #666; /* Texto secundario gris */
        --accent-blue: #0056b3; /* Azul más oscuro para contraste */
        --accent-yellow: #ffc107; /* Amarillo se mantiene */
        --accent-red: #c82333; /* Rojo más oscuro */
        --accent-green: #218838; /* Verde más oscuro */
        --accent-cyan: #138496; /* Cian más oscuro */
        --border-color: #bbb; /* Borde gris más oscuro para tema claro */
        --input-bg: #f8f9fa; /* Fondo de input claro */
        --input-border: #ccc; /* Borde de input gris más oscuro para tema claro */
        --calendar-bg: #ffffff;
        --calendar-border: #ccc;
        --calendar-nav-color: #333;
        --calendar-weekday-color: #666;
        --calendar-tile-hover: #e9ecef;
        --calendar-tile-disabled: #f0f0f0;
        --calendar-now-bg: #007bff;
        --calendar-now-hover: #0056b3;
        --calendar-active-bg: #0056b3;
        --calendar-active-hover: #004494;
        --highlight-date-bg: #ffecb3; /* Amarillo más suave */
        --highlight-date-text: #333;
        --highlight-date-hover: #ffe08a;
        --highlight-sunday-bg: #e0f2ff; /* Azul más suave */
        --highlight-sunday-text: #0056b3;
        --box-shadow-dark: 0 4px 8px rgba(0,0,0,0.1); /* Sombra más suave */
        --box-shadow-light: 0 4px 8px rgba(0,0,0,0.05);
    }

    /* Estilos generales de la aplicación usando variables */
    .app-container {
        margin: auto;
        padding: 20px;
        font-family: 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        background-color: var(--bg-primary); /* Usa variable */
        color: var(--text-primary); /* Usa variable */
        min-height: 100vh;
        transition: background-color 0.3s ease, color 0.3s ease;
    }
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid var(--border-color); /* Usa variable */
    }
    .header-title {
        margin: 0;
        font-size: 2.5em;
        color: var(--accent-blue); /* Usa variable */
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1); /* Sombra más suave */
    }
    .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background-color: var(--bg-secondary); /* Usa variable */
        border-radius: 8px;
        box-shadow: var(--box-shadow-dark); /* Usa variable */
        margin-bottom: 20px;
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }
    .navbar-brand {
        font-size: 1.8rem;
        font-weight: bold;
        color: var(--accent-blue); /* Usa variable */
    }
    .navbar-links {
        display: flex;
        align-items: center;
    }
    .nav-item {
        cursor: pointer;
        padding: 10px 15px;
        margin: 0 5px;
        font-size: 1.1rem;
        font-weight: 500;
        color: var(--text-secondary); /* Usa variable */
        border-bottom: 3px solid transparent;
        transition: color 0.3s ease, border-bottom 0.3s ease;
    }
    .nav-item-active {
        color: var(--accent-blue); /* Usa variable */
        border-bottom: 3px solid var(--accent-blue); /* Usa variable */
        font-weight: bold;
    }
    .logout-button {
        margin-left: auto;
        padding: 8px 15px;
        border-radius: 5px;
        border: 1px solid var(--accent-red); /* Usa variable */
        background-color: var(--accent-red); /* Usa variable */
        color: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.3s ease, border-color 0.3s ease;
    }
    .button-container {
        display: flex;
        gap: 10px;
    }
    .button {
        padding: 10px 15px;
        border-radius: 5px;
        border: none;
        cursor: pointer;
        font-size: 1em;
        transition: background-color 0.2s;
        background-color: var(--accent-blue); /* Usa variable */
        color: white;
    }
    .anime-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;
        padding: 20px 0;
    }
    .anime-card {
        background-color: var(--bg-secondary); /* Usa variable */
        border-radius: 8px;
        box-shadow: var(--box-shadow-dark); /* Usa variable */
        overflow: hidden;
        transition: transform 0.2s, box-shadow 0.2s, background-color 0.3s ease;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .anime-card-image {
        width: 100%;
        height: 250px;
        object-fit: cover;
        border-bottom: 1px solid var(--border-color); /* Usa variable */
    }
    .anime-card-content {
        padding: 15px;
        flex-grow: 1;
    }
    .anime-card-title {
        font-size: 1.2em;
        margin: 0 0 10px 0;
        color: var(--accent-blue); /* Usa variable */
    }
    .anime-card-details {
        font-size: 0.9em;
        color: var(--text-secondary); /* Usa variable */
        margin-bottom: 5px;
    }
    .anime-card-status {
        font-size: 0.9em;
        color: var(--text-secondary); /* Usa variable */
        margin-bottom: 5px;
    }
    .anime-card-actions {
        display: flex;
        justify-content: space-between;
        padding: 15px;
        border-top: 1px solid var(--border-color); /* Usa variable */
        background-color: var(--bg-tertiary); /* Usa variable */
        transition: background-color 0.3s ease;
    }
    .action-button {
        padding: 8px 12px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        font-size: 0.85em;
        transition: background-color 0.2s;
    }
    .edit-button {
        background-color: var(--accent-yellow); /* Usa variable */
        color: var(--text-primary); /* Usa variable */
    }
    .edit-button:hover {
        background-color: var(--highlight-date-hover); /* Usa variable */
    }
    .delete-button {
        background-color: var(--accent-red); /* Usa variable */
        color: white;
    }
    .delete-button:hover {
        background-color: #c82333; /* Hardcoded, but fine for specific hover */
    }
    .view-button {
        background-color: var(--accent-cyan); /* Usa variable */
        color: white;
    }
    .view-button:hover {
        background-color: #138496; /* Hardcoded, but fine for specific hover */
    }
    .login-register-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: var(--bg-primary); /* Usa variable */
        color: var(--text-primary); /* Usa variable */
        transition: background-color 0.3s ease, color 0.3s ease;
    }
    .login-register-form {
        background-color: var(--bg-secondary); /* Usa variable */
        padding: 30px;
        border-radius: 10px;
        box-shadow: var(--box-shadow-dark); /* Usa variable */
        width: 300px;
        text-align: center;
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }
    .login-register-input {
        padding: 10px;
        border-radius: 5px;
        border: 1px solid var(--input-border); /* Usa variable */
        background-color: var(--input-bg); /* Usa variable */
        color: var(--text-primary); /* Usa variable */
        margin-bottom: 15px;
        width: calc(100% - 20px);
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }
    .login-register-button {
        padding: 10px 15px;
        border-radius: 5px;
        border: none;
        cursor: pointer;
        font-size: 1em;
        width: 48%;
    }
    .login-register-primary-button {
        background-color: var(--accent-blue); /* Usa variable */
        color: white;
    }
    .login-register-secondary-button {
        background-color: var(--bg-tertiary); /* Usa variable */
        color: var(--text-primary); /* Usa variable */
        margin-left: 4%;
        transition: background-color 0.3s ease, color 0.3s ease;
    }
    .inicio-content-layout {
        display: flex;
        flex-direction: row;
        gap: 20px;
        flex-wrap: wrap;
        justify-content: center;
        padding: 20px 0;
    }
    @media (max-width: 768px) {
        .inicio-content-layout {
            flex-direction: column;
            align-items: center;
        }
    }
    .animes-panel {
        flex: 2;
        min-width: 300px;
        background-color: var(--bg-secondary); /* Usa variable */
        padding: 20px;
        border-radius: 8px;
        box-shadow: var(--box-shadow-dark); /* Usa variable */
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }
    @media (max-width: 768px) {
        .animes-panel {
            width: 100%;
            max-width: unset;
        }
    }
    .calendar-panel {
        flex: 1;
        min-width: 350px;
        max-width: 350px;
        background-color: var(--bg-secondary); /* Usa variable */
        padding: 20px;
        border-radius: 8px;
        box-shadow: var(--box-shadow-dark); /* Usa variable */
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }
    @media (max-width: 768px) {
        .calendar-panel {
            width: 100%;
            max-width: unset;
        }
    }
    .selected-date-animes-list {
        margin-top: 20px;
        width: 100%;
    }
    .selected-date-animes-list h3 {
        border-bottom: 1px solid var(--border-color); /* Usa variable */
        padding-bottom: 10px;
        margin-bottom: 15px;
        color: var(--text-primary); /* Usa variable */
        transition: color 0.3s ease, border-color 0.3s ease;
    }
    .selected-date-anime-item {
        background-color: var(--bg-tertiary); /* Usa variable */
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: background-color 0.3s ease;
    }
    .selected-date-anime-image {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 4px;
    }
    .selected-date-anime-info {
        flex-grow: 1;
    }
    .selected-date-anime-title {
        margin: 0;
        font-size: 1em;
        color: var(--accent-blue); /* Usa variable */
    }
    .selected-date-anime-type {
        margin: 0;
        font-size: 0.8em;
        color: var(--text-secondary); /* Usa variable */
    }
    .settings-panel {
        background-color: var(--bg-secondary); /* Usa variable */
        padding: 30px;
        border-radius: 10px;
        box-shadow: var(--box-shadow-dark); /* Usa variable */
        max-width: 600px;
        margin: 40px auto;
        color: var(--text-primary); /* Usa variable */
        transition: background-color 0.3s ease, box-shadow 0.3s ease, color 0.3s ease;
    }
    .settings-title {
        text-align: center;
        color: var(--accent-blue); /* Usa variable */
        margin-bottom: 25px;
        font-size: 2em;
    }
    .settings-section {
        background-color: var(--bg-tertiary); /* Usa variable */
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        transition: background-color 0.3s ease;
    }
    .settings-section-title {
        color: var(--text-primary); /* Usa variable */
        border-bottom: 1px solid var(--border-color); /* Usa variable */
        padding-bottom: 10px;
        margin-bottom: 15px;
        transition: color 0.3s ease, border-color 0.3s ease;
    }
    .settings-description {
        color: var(--text-secondary); /* Usa variable */
        margin-bottom: 15px;
        font-size: 0.9em;
    }
    .settings-input {
        width: 100%;
        padding: 10px;
        margin-bottom: 15px;
        border-radius: 5px;
        border: 1px solid var(--input-border); /* Usa variable */
        background-color: var(--input-bg); /* Usa variable */
        color: var(--text-primary); /* Usa variable */
        box-sizing: border-box;
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }
    .settings-button-action {
        padding: 10px 20px;
        border-radius: 5px;
        border: none;
        background-color: var(--accent-green); /* Usa variable */
        color: white;
        cursor: pointer;
        font-size: 1em;
        margin-top: 10px;
        transition: background-color 0.2s;
        display: block;
        width: 100%;
    }
    .settings-button-back {
        padding: 10px 15px;
        border-radius: 5px;
        border: none;
        cursor: pointer;
        font-size: 1em;
        transition: background-color 0.2s;
        background-color: var(--bg-tertiary); /* Usa variable */
        color: var(--text-primary); /* Usa variable */
        margin-top: 20px;
    }
    .filter-button {
        cursor: pointer;
        padding: 8px 15px;
        border-radius: 20px;
        border: 1px solid var(--input-border); /* Usa variable */
        background-color: var(--bg-tertiary); /* Usa variable */
        color: var(--text-primary); /* Usa variable */
        font-weight: normal;
        transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
    }
    .filter-button-active {
        background-color: var(--accent-blue); /* Usa variable */
        color: white;
        font-weight: bold;
        border: 1px solid var(--accent-blue); /* Usa variable */
    }
    .message-box {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--bg-secondary); /* Usa variable */
        color: var(--text-primary); /* Usa variable */
        padding: 10px 20px;
        border-radius: 8px;
        box-shadow: var(--box-shadow-dark); /* Usa variable */
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
    }
    .message-box button {
        background: none;
        border: none;
        color: var(--text-secondary); /* Usa variable */
        cursor: pointer;
        font-size: 1.2em;
    }

    /* Calendar styles using variables */
    .react-calendar-dark {
        width: 100%;
        max-width: 350px;
        background: var(--calendar-bg); /* Usa variable */
        border: 1px solid var(--calendar-border); /* Usa variable */
        border-radius: 8px;
        font-family: 'Inter', sans-serif;
        line-height: 1.125em;
        color: var(--text-primary); /* Usa variable */
        transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
    }

    .react-calendar-dark .react-calendar__navigation button {
        color: var(--calendar-nav-color); /* Usa variable */
        min-width: 44px;
        background: none;
        font-size: 1.5em;
        transition: background-color 0.3s ease;
    }

    .react-calendar-dark .react-calendar__navigation button:enabled:hover,
    .react-calendar-dark .react-calendar__navigation button:enabled:focus {
        background-color: var(--calendar-tile-hover); /* Usa variable */
    }

    .react-calendar-dark .react-calendar__navigation button:disabled {
        background-color: var(--calendar-tile-disabled); /* Usa variable */
    }

    .react-calendar-dark .react-calendar__month-view__weekdays {
        text-align: center;
        text-transform: uppercase;
        font-weight: bold;
        font-size: 0.75em;
        color: var(--calendar-weekday-color); /* Usa variable */
    }

    .react-calendar-dark .react-calendar__month-view__days__day {
        color: var(--text-primary); /* Usa variable */
    }

    .react-calendar-dark .react-calendar__tile {
        background: none;
        height: 3em;
        color: var(--text-primary); /* Usa variable */
        transition: background-color 0.3s ease, color 0.3s ease;
        border-radius: 4px;
    }

    .react-calendar-dark .react-calendar__tile:enabled:hover,
    .react-calendar-dark .react-calendar__tile:enabled:focus {
        background-color: var(--calendar-tile-hover); /* Usa variable */
        color: var(--text-primary); /* Usa variable */
    }

    .react-calendar-dark .react-calendar__tile:disabled {
        background-color: var(--calendar-tile-disabled); /* Usa variable */
        color: var(--text-secondary); /* Usa variable */
    }

    .react-calendar-dark .react-calendar__tile--now {
        background: var(--calendar-now-bg); /* Usa variable */
        color: white;
    }

    .react-calendar-dark .react-calendar__tile--now:enabled:hover,
    .react-calendar-dark .react-calendar__tile--now:enabled:focus {
        background: var(--calendar-now-hover); /* Usa variable */
    }

    .react-calendar-dark .react-calendar__tile--active {
        background: var(--calendar-active-bg); /* Usa variable */
        color: white;
    }

    .react-calendar-dark .react-calendar__tile--active:enabled:hover,
    .react-calendar-dark .react-calendar__tile--active:enabled:focus {
        background: var(--calendar-active-hover); /* Usa variable */
    }

    .react-calendar-dark .react-calendar__month-view__days__day.highlight-sunday {
        background-color: var(--highlight-sunday-bg) !important; /* Usa variable */
        color: var(--highlight-sunday-text) !important; /* Usa variable */
        font-weight: bold;
    }

    .react-calendar-dark .react-calendar__tile.highlight-date {
        background-color: var(--highlight-date-bg) !important; /* Usa variable */
        color: var(--highlight-date-text) !important; /* Usa variable */
        font-weight: bold;
    }

    .react-calendar-dark .react-calendar__tile--active.highlight-date,
    .react-calendar-dark .react-calendar__tile--now.highlight-date {
        background-color: var(--highlight-date-bg) !important; /* Usa variable */
        color: var(--highlight-date-text) !important; /* Usa variable */
    }

    .react-calendar-dark .react-calendar__tile:enabled:hover.highlight-date,
    .react-calendar-dark .react-calendar__tile:enabled:focus.highlight-date {
        background-color: var(--highlight-date-hover) !important; /* Usa variable */
        color: var(--highlight-date-text) !important; /* Usa variable */
    }

    .react-calendar-dark .highlight-sunday.highlight-date {
        background-color: #20c997 !important; /* Color específico para domingos con lanzamientos */
        color: white !important;
    }
`;


const estados = ["Viendo", "Completado", "Pendiente", "Abandonado"];

function Mensaje({ texto, onClose }) {
    if (!texto) return null;
    return (
        <div className="message-box">
            <span>{texto}</span>
            <button onClick={onClose}>&times;</button>
        </div>
    );
}

export default function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [animes, setAnimes] = useState([]);
    const [latestAnimes, setLatestAnimes] = useState([]);
    const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
    const [modalVerAbierto, setModalVerAbierto] = useState(false);
    const [modalCambiarColorAbierto, setModalCambiarColorAbierto] = useState(false); // Estado para controlar el modal de cambio de color
    const [animeSeleccionado, setAnimeSeleccionado] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('Todos');

    // Estado para el tema, inicializado desde localStorage
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    // Efecto para aplicar la clase del tema al contenedor principal (document.documentElement o app-container)
    useEffect(() => {
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.classList.remove('dark-theme', 'light-theme');
            appContainer.classList.add(`${theme}-theme`);
        }
    }, [theme]);


    const [selectedDate, setSelectedDate] = useState(new Date());
    const [highlightedDates, setHighlightedDates] = useState([]);
    const [selectedDateAnimes, setSelectedDateAnimes] = useState([]);

    const contarPorEstado = (estado) => animes.filter(a => a.estado === estado).length;

    useEffect(() => {
        if (token) {
            fetchAnimes();
        } else {
            setAnimes([]);
            setLatestAnimes([]);
            setHighlightedDates([]);
            setSelectedDateAnimes([]);
        }
    }, [token]);

    useEffect(() => {
        updateSelectedDateAnimes();
    }, [selectedDate, animes]);

    const calculateAllRecurringDates = (initialDate, repetitions) => {
        const dates = [];
        if (!initialDate || repetitions <= 0) return dates;

        const startDate = new Date(initialDate);
        for (let i = 0; i < repetitions; i++) {
            const nextDate = new Date(startDate);
            nextDate.setDate(startDate.getDate() + (i * 7));
            dates.push(nextDate);
        }
        return dates;
    };

    const fetchAnimes = async () => {
        try {
            const animesRes = await axios.get(`${API_URL}/api/animes`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const processedAnimes = animesRes.data.map(anime => {
                const initialRecurringDate = anime.initialRecurringChapterDate ? new Date(anime.initialRecurringChapterDate) : null;
                const recurringDates = calculateAllRecurringDates(initialRecurringDate, anime.numberOfRecurringChapters);
                return {
                    ...anime,
                    _id: anime._id,
                    calculatedRecurringDates: recurringDates,
                };
            });

            setAnimes(processedAnimes);
            updateHighlightedDates(processedAnimes);

            const latestRes = await axios.get(`${API_URL}/api/animes/latest`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const processedLatestAnimes = latestRes.data.map(anime => {
                const initialRecurringDate = anime.initialRecurringChapterDate ? new Date(anime.initialRecurringChapterDate) : null;
                const recurringDates = calculateAllRecurringDates(initialRecurringDate, anime.numberOfRecurringChapters);
                return {
                    ...anime,
                    _id: anime._id,
                    calculatedRecurringDates: recurringDates,
                };
            });
            setLatestAnimes(processedLatestAnimes);

        } catch (error) {
            console.error("Error al obtener animes:", error);
            if (error.response && error.response.status === 401) {
                setMensaje('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
                setToken(null);
                localStorage.removeItem('token');
            } else {
                setMensaje('Error al cargar animes.');
            }
        }
    };

    const updateHighlightedDates = (currentAnimes) => {
        const datesToHighlight = new Set();
        currentAnimes.forEach(anime => {
            if (anime.fechaEstreno) {
                const date = new Date(anime.fechaEstreno);
                if (!isNaN(date.getTime())) {
                    datesToHighlight.add(date.toDateString());
                }
            }
            if (anime.calculatedRecurringDates && Array.isArray(anime.calculatedRecurringDates)) {
                anime.calculatedRecurringDates.forEach(date => {
                    if (date instanceof Date && !isNaN(date.getTime())) {
                        datesToHighlight.add(date.toDateString());
                    }
                });
            }
        });
        setHighlightedDates(Array.from(datesToHighlight));
    };

    const updateSelectedDateAnimes = () => {
        const selectedDateString = selectedDate.toDateString();
        const animesForSelectedDate = animes.filter(anime => {
            const isEstreno = anime.fechaEstreno && new Date(anime.fechaEstreno).toDateString() === selectedDateString;
            const isRecurringChapter = anime.calculatedRecurringDates && anime.calculatedRecurringDates.some(
                chapDate => chapDate.toDateString() === selectedDateString
            );
            return isEstreno || isRecurringChapter;
        });
        setSelectedDateAnimes(animesForSelectedDate);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateString = date.toDateString();
            const classes = [];
            if (date.getDay() === 0) {
                classes.push('highlight-sunday');
            }
            if (highlightedDates.includes(dateString)) {
                classes.push('highlight-date');
            }
            return classes.join(' ');
        }
        return null;
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dayAnimes = animes.filter(anime => {
                const isEstreno = anime.fechaEstreno && new Date(anime.fechaEstreno).toDateString() === date.toDateString();
                const isRecurringChapter = anime.calculatedRecurringDates && anime.calculatedRecurringDates.some(
                    chapDate => chapDate.toDateString() === date.toDateString()
                );
                return isEstreno || isRecurringChapter;
            });

            return (
                <div>
                    {dayAnimes.length > 0 && (
                        <div style={{ fontSize: '0.6em', marginTop: '3px', lineHeight: '1.2' }}>
                            {dayAnimes.map(anime => {
                                const isEstreno = anime.fechaEstreno && new Date(anime.fechaEstreno).toDateString() === date.toDateString();
                                const isRecurringChapter = anime.calculatedRecurringDates && anime.calculatedRecurringDates.some(
                                    chapDate => chapDate.toDateString() === date.toDateString()
                                );
                                return (
                                    <div key={anime._id + date.getTime()} style={{ color: 'var(--accent-blue)', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {anime.titulo}
                                        {isEstreno && " (E)"}
                                        {isRecurringChapter && " (PC)"}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };


    const handleLoginRegister = async (e) => {
        e.preventDefault();
        try {
            const endpoint = isRegister ? 'register' : 'login';
            const response = await axios.post(`${API_URL}/api/${endpoint}`, { email, password });
            setToken(response.data.token);
            localStorage.setItem('token', response.data.token);
            setMensaje(`¡${isRegister ? 'Registro' : 'Inicio de sesión'} exitoso!`);
            setEmail('');
            setPassword('');
            setActivePage('inicio');
        } catch (error) {
            console.error("Error al registrar/iniciar sesión:", error.response?.data || error.message);
            setMensaje(error.response?.data?.error || `Error al ${isRegister ? 'registrar' : 'iniciar sesión'}.`);
        }
    };

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('token');
        setAnimes([]);
        setLatestAnimes([]);
        setMensaje('Sesión cerrada.');
        setHighlightedDates([]);
        setSelectedDateAnimes([]);
    };

    const handleAnimeAdded = () => {
        fetchAnimes();
        setModalAgregarAbierto(false);
    };

    const handleAnimeUpdated = (updatedAnime) => {
        console.log('[App.jsx] Anime actualizado recibido:', updatedAnime);
        setMensaje('Anime actualizado con éxito!');
        fetchAnimes();
        setModalEditarAbierto(false);
        setAnimeSeleccionado(updatedAnime);
    };

    const handleDeleteAnime = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este anime?')) {
            try {
                await axios.delete(`${API_URL}/api/animes/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMensaje('Anime eliminado con éxito.');
                setModalVerAbierto(false); // Cierra el modal de ver si estaba abierto
                fetchAnimes(); // Vuelve a cargar la lista de animes
            } catch (error) {
                console.error("Error al eliminar anime:", error);
                setMensaje('Error al eliminar anime.');
            }
        }
    };

    const exportAnimes = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/animes/export`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'animes_backup.zip');
            document.body.appendChild(link);
            link.click();
            link.remove();
            setMensaje('Animes exportados con éxito como archivo ZIP.');
        } catch (error) {
            console.error("Error al exportar animes:", error.response ? error.response.data : error.message);
            setMensaje('Error al exportar animes.');
        }
    };

    const importAnimes = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            setMensaje('Por favor, selecciona un archivo JSON.');
            return;
        }

        if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
            setMensaje('Por favor, selecciona el archivo JSON (animes_backup.json) dentro del ZIP, no el archivo ZIP completo.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedAnimes = JSON.parse(e.target.result);
                if (!Array.isArray(importedAnimes) || importedAnimes.some(a => !a.titulo)) {
                    setMensaje('El archivo JSON no tiene el formato esperado (array de animes).');
                    return;
                }

                const response = await axios.post(`${API_URL}/api/animes/import`, { animes: importedAnimes }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                setMensaje(response.data.message || 'Animes importados con éxito.');
                fetchAnimes();
            } catch (error) {
                console.error("Error al importar animes:", error.response ? error.response.data : error.message);
                setMensaje(error.response?.data?.error || 'Error al importar animes. Asegúrate de que el archivo es un JSON válido.');
            }
        };
        reader.readAsText(file);
    };

    const [activePage, setActivePage] = useState('inicio');

    const filteredAnimes = animes.filter(anime => {
        const matchesSearchTerm = anime.titulo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEstado = filterEstado === 'Todos' || anime.estado === filterEstado;
        return matchesSearchTerm && matchesEstado;
    });

    // Función para alternar el tema
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme); // Guarda la preferencia en localStorage
    };


    if (!token) {
        return (
            <div className={`login-register-container ${theme}-theme`}> {/* Aplica la clase del tema aquí */}
                <form onSubmit={handleLoginRegister} className="login-register-form">
                    <h2>{isRegister ? 'Registro' : 'Iniciar Sesión'}</h2>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="login-register-input"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-register-input"
                        required
                    />
                    <button type="submit" className="login-register-button login-register-primary-button">
                        {isRegister ? 'Registrarse' : 'Iniciar Sesión'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsRegister(!isRegister)}
                        className="login-register-button login-register-secondary-button"
                    >
                        {isRegister ? 'Ya tengo una cuenta' : 'Crear una cuenta nueva'}
                    </button>
                    <Mensaje texto={mensaje} onClose={() => setMensaje('')} />
                </form>
            </div>
        );
    }

    return (
        <div className={`app-container ${theme}-theme`}> {/* Aplica la clase del tema aquí */}
            <style>{appStyles}</style>
            <nav className="navbar">
                <div className="navbar-brand">AnimeApp</div>
                <div className="navbar-links">
                    <span
                        className={activePage === 'inicio' ? 'nav-item nav-item-active' : 'nav-item'}
                        onClick={() => setActivePage('inicio')}
                    >
                        Inicio
                    </span>
                    <span
                        className={activePage === 'biblioteca' ? 'nav-item nav-item-active' : 'nav-item'}
                        onClick={() => setActivePage('biblioteca')}
                    >
                        Biblioteca
                    </span>
                    <span
                        className={activePage === 'ajustes' ? 'nav-item nav-item-active' : 'nav-item'}
                        onClick={() => setActivePage('ajustes')}
                    >
                        Ajustes
                    </span>
                    <button onClick={handleLogout} className="logout-button">
                        Cerrar sesión
                    </button>
                </div>
            </nav>

            {activePage === 'inicio' && (
                <div className="inicio-content-layout">
                    <div className="animes-panel" style={{ maxWidth: 'calc(100% - 370px)' }}>
                        <h2 className="header-title">Tus Últimos Animes Agregados</h2>
                        {latestAnimes.length > 0 ? (
                            <div className="anime-grid">
                                {latestAnimes.map(a => (
                                    <div key={a._id} className="anime-card">
                                        <img
                                            src={a.portada && a.portada.startsWith('/anime_covers/') ? `${API_URL}${a.portada}` : a.portada || 'https://placehold.co/200x250/333333/FFFFFF?text=No+Image'}
                                            alt={a.titulo}
                                            className="anime-card-image"
                                            onClick={() => {
                                                console.log('[App.jsx] Anime seleccionado para VER:', a);
                                                setAnimeSeleccionado(a);
                                                setModalVerAbierto(true);
                                            }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x250/333333/FFFFFF?text=No+Image'; }}
                                        />
                                        <div className="anime-card-content">
                                            <h3 className="anime-card-title">{a.titulo}</h3>
                                            <p className="anime-card-status">Estado: {a.estado}</p>
                                            <p className="anime-card-status">Capítulos: {a.capVistos} / {a.capTotales}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Aún no has agregado animes. ¡Dirígete a la Biblioteca para empezar!</p>
                        )}
                    </div>

                    <div className="calendar-panel">
                        <h2 className="header-title">Calendario de Animes</h2>
                        <Calendar
                            onChange={handleDateChange}
                            value={selectedDate}
                            locale="es-ES"
                            className="react-calendar-dark"
                            tileClassName={tileClassName}
                            tileContent={tileContent}
                        />

                        <div className="selected-date-animes-list">
                            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px', color: 'var(--text-primary)' }}>
                                Animes para {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}:
                            </h3>
                            {selectedDateAnimes.length > 0 ? (
                                selectedDateAnimes.map(anime => {
                                    const isEstreno = anime.fechaEstreno && new Date(anime.fechaEstreno).toDateString() === selectedDate.toDateString();
                                    const isRecurringChapter = anime.calculatedRecurringDates && anime.calculatedRecurringDates.some(
                                        chapDate => chapDate.toDateString() === selectedDate.toDateString()
                                    );
                                    return (
                                        <div key={anime._id} className="selected-date-anime-item">
                                            <img
                                                src={anime.portada ? (anime.portada.startsWith('/anime_covers/') ? `${API_URL}${anime.portada}` : anime.portada) : 'https://placehold.co/50x50/333333/FFFFFF?text=No+Image'}
                                                alt={anime.titulo}
                                                className="selected-date-anime-image"
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/333333/FFFFFF?text=No+Image'; }}
                                            />
                                            <div className="selected-date-anime-info">
                                                <p className="selected-date-anime-title">{anime.titulo}</p>
                                                <p className="selected-date-anime-type">
                                                    {isEstreno && "Estreno"}
                                                    {isEstreno && isRecurringChapter && " y "}
                                                    {isRecurringChapter && "Próx. Cap."}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    console.log('[App.jsx] Anime seleccionado para VER desde calendario:', anime);
                                                    setAnimeSeleccionado(anime);
                                                    setModalVerAbierto(true);
                                                }}
                                                className="action-button view-button"
                                            >
                                                Ver
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No hay animes para esta fecha.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activePage === 'biblioteca' && (
                <div className="app-container">
                    <header className="header">
                        <h1 className="header-title">Mi Biblioteca de Animes</h1>
                        <button onClick={() => setModalAgregarAbierto(true)} className="button">
                            Agregar Nuevo Anime
                        </button>
                    </header>

                    <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Buscar por título..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="settings-input" style={{ width: 'auto', flexGrow: 1, marginBottom: 0 }}
                        />
                        {estados.map(estado => (
                            <button
                                key={estado}
                                onClick={() => setFilterEstado(estado)}
                                className={filterEstado === estado ? 'filter-button filter-button-active' : 'filter-button'}
                            >
                                {estado} ({contarPorEstado(estado)})
                            </button>
                        ))}
                        <button
                            onClick={() => setFilterEstado('Todos')}
                            className={filterEstado === 'Todos' ? 'filter-button filter-button-active' : 'filter-button'}
                        >
                            Todos ({animes.length})
                        </button>
                    </div>

                    <div className="anime-grid">
                        {filteredAnimes.length > 0 ? (
                            filteredAnimes.map(anime => (
                                <div
                                    key={anime._id}
                                    className="anime-card"
                                >
                                    <img
                                        src={anime.portada ? (anime.portada.startsWith('/anime_covers/') ? `${API_URL}${anime.portada}` : anime.portada) : 'https://placehold.co/200x250/333333/FFFFFF?text=No+Image'}
                                        alt={anime.titulo}
                                        className="anime-card-image"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x250/333333/FFFFFF?text=No+Image'; }}
                                        onClick={() => {
                                            console.log('[App.jsx] Anime seleccionado para VER desde biblioteca:', anime);
                                            setAnimeSeleccionado(anime);
                                            setModalVerAbierto(true);
                                        }}
                                    />
                                    <div className="anime-card-content" onClick={() => { setAnimeSeleccionado(anime); setModalVerAbierto(true); }}>
                                        <h3 className="anime-card-title">{anime.titulo}</h3>
                                        <p className="anime-card-details">Tipo: {anime.genero}</p>
                                        <p className="anime-card-status">Estado: {anime.estado}</p>
                                        <p className="anime-card-details">Capítulos: {anime.capVistos} / {anime.capTotales}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay animes que coincidan con tus criterios de búsqueda o filtro.</p>
                        )}
                    </div>
                </div>
            )}

            {activePage === 'ajustes' && (
                <div className="settings-panel">
                    <h2 className="settings-title">Ajustes</h2>

                    <div className="settings-section">
                        <h3 className="settings-section-title">Gestionar Datos</h3>
                        <p className="settings-description">Exporta tus animes como un archivo ZIP que contiene los datos JSON y las imágenes de portada.</p>
                        <button onClick={exportAnimes} className="settings-button-action">Exportar Animes</button>
                        <p className="settings-description" style={{ marginTop: '15px' }}>Para importar, selecciona el archivo `animes_backup.json` que se encuentra *dentro* del archivo ZIP exportado.</p>
                        <input
                            type="file"
                            accept="application/json"
                            onChange={importAnimes}
                            className="settings-input" style={{ display: 'block', marginTop: '15px' }}
                        />
                    </div>

                    <div className="settings-section">
                        <h3 className="settings-section-title">Apariencia</h3>
                        <p className="settings-description">Cambia el tema de la aplicación entre oscuro y claro.</p>
                        <button onClick={() => setModalCambiarColorAbierto(true)} className="settings-button-action">
                            Abrir Selector de Tema
                        </button>
                    </div>

                    <button onClick={() => setActivePage('inicio')} className="settings-button-back">Volver a Inicio</button>
                </div>
            )}

            {modalAgregarAbierto && (
                <ModalAgregarAnime
                    onClose={() => setModalAgregarAbierto(false)}
                    onAnimeAdded={handleAnimeAdded}
                    token={token}
                    API_URL={API_URL}
                    onMessage={setMensaje}
                    theme={theme} // Pasa el tema al modal
                />
            )}

            {modalEditarAbierto && (
                <>
                    {console.log('[App.jsx] Abriendo ModalEditarAnime con anime:', animeSeleccionado)}
                    <ModalEditarAnime
                        anime={animeSeleccionado}
                        onClose={() => setModalEditarAbierto(false)}
                        onAnimeUpdated={handleAnimeUpdated}
                        token={token}
                        API_URL={API_URL}
                        theme={theme} // Pasa el tema al modal
                    />
                </>
            )}

            {modalVerAbierto && ( // <-- Este bloque faltaba en tu código anterior
                <ModalVerAnime
                    anime={animeSeleccionado}
                    onClose={() => setModalVerAbierto(false)}
                    onEdit={() => {
                        console.log('[App.jsx] onEdit llamado desde ModalVerAnime. Anime actual:', animeSeleccionado);
                        setModalEditarAbierto(true);
                        setModalVerAbierto(false);
                    }}
                    onDelete={handleDeleteAnime}
                    API_URL={API_URL}
                    theme={theme} // Pasa el tema al modal
                />
            )}

            {modalCambiarColorAbierto && (
                <ModalCambiarColor
                    onClose={() => setModalCambiarColorAbierto(false)}
                    onToggleTheme={toggleTheme} // Pasa la función para cambiar el tema
                    theme={theme} // Pasa el tema actual para que el modal sepa qué texto mostrar
                />
            )}

            <Mensaje texto={mensaje} onClose={() => setMensaje(null)} />
        </div>
    );
}
