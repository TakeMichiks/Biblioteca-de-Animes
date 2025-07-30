import React from 'react';

export default function ModalCambiarColor({ onClose, onToggleTheme, theme }) {
    // Estilos para el modal usando variables CSS
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
        zIndex: 1050, // Un z-index ligeramente más bajo que otros modales si es necesario
    };

    const modalContentStyle = {
        backgroundColor: 'var(--bg-secondary)', // Usa la variable de fondo secundario
        padding: '30px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '400px',
        boxShadow: 'var(--box-shadow-dark)', // Usa la variable de sombra
        color: 'var(--text-primary)', // Usa la variable de texto principal
        maxHeight: '80vh',
        overflowY: 'auto',
        transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
        textAlign: 'center',
    };

    const buttonStyle = {
        padding: '10px 20px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.2s',
        backgroundColor: 'var(--accent-blue)', // Color principal para el botón
        color: 'white',
        marginTop: '20px',
        width: '100%',
    };

    const closeButtonStyle = {
        ...buttonStyle,
        backgroundColor: 'var(--bg-tertiary)', // Color neutro para el botón de cerrar
        color: 'var(--text-primary)',
        marginTop: '10px',
    };

    return (
        <div style={modalOverlayStyle}>
            {/* Aplica la clase del tema al contenido del modal para que herede las variables */}
            <div style={modalContentStyle} className={`${theme}-theme`}>
                <h2 style={{ marginBottom: '20px', color: 'var(--accent-blue)' }}>Cambiar Tema</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Selecciona el tema de la aplicación:</p>
                <button onClick={onToggleTheme} style={buttonStyle}>
                    Cambiar a Tema {theme === 'dark' ? 'Claro' : 'Oscuro'}
                </button>
                <button onClick={onClose} style={closeButtonStyle}>
                    Cerrar
                </button>
            </div>
        </div>
    );
}
