const { app, BrowserWindow, globalShortcut, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'), // Esta línea ha sido eliminada o comentada
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true, // La barra de menú se oculta por defecto
    menuBarVisible: false, // Asegura que no sea visible al inicio, incluso con Alt
  });

  const devURL = 'http://localhost:5173';
  mainWindow.loadURL(devURL);

  // Opcional: Descomenta para abrir las herramientas de desarrollo al inicio
  // mainWindow.webContents.openDevTools(); 

  // Registrar el atajo de teclado para alternar la barra de menú
  // Usamos 'Control+Shift+M' (o 'Command+Shift+M' en macOS) para evitar conflictos con F12
  globalShortcut.register('CommandOrControl+Shift+M', () => {
    const isVisible = mainWindow.isMenuBarVisible();
    mainWindow.setMenuBarVisibility(!isVisible);
    // También alternamos autoHideMenuBar para que el cambio sea persistente
    // Si la mostramos, deshabilitamos autoHideMenuBar. Si la ocultamos, la habilitamos.
    mainWindow.autoHideMenuBar = !isVisible; 
    console.log('Visibilidad de la barra de menú alternada por Ctrl+Shift+M. Visible:', !isVisible);
  });
}

app.whenReady().then(() => {
  console.log('App lista, creando ventana...');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Desregistrar todos los atajos globales cuando la aplicación se cierra
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
