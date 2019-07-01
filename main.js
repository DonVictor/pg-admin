
const {app, BrowserWindow, dialog, Menu} = require('electron');
const {glob} = require('glob');
const {readFileSync} = require('fs');

let mainWindow;
function createWindow (launchInfo) {
  mainWindow = new BrowserWindow({
    title: 'mat-pg-admin-4',
    icon: 'img/elephant.png',
    width: 800,
    height: 600,
    "skip-taskbar": false,
    "auto-hide-menu-bar": false,
    "enable-larger-than-screen": false,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      devTools : true
    }
  });
  if (process.platform === 'darwin') {
    // Create our menu entries so that we can use MAC shortcuts
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {
        label: 'App',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'pasteandmatchstyle' },
          { role: 'delete' },
          { role: 'selectall' },
          { role: 'close' }
        ]
      }
    ]));
  }

  mainWindow.webContents.on('did-finish-load', function() {
    mainWindow.webContents.insertCSS('.pg-navbar .navbar-brand .app-icon{ -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; -webkit-app-region: drag;');
  });


  //mainWindow.webContents.openDevTools({mode: 'detach'});
  let addr_path = app.getPath('home')+"/.pgAdmin4*.addr";

  glob(addr_path, {}, (err, files) => {

    if( err || files.length == 0 ){
      dialog.showMessageBox(mainWindow, {
        message: 'Primero debes abrir PG Admin. ('+process.platform+')',
        buttons: ['Salir'],
        defaultId: 0
      });
      //mainWindow.close();
      return false;
    }
    mainWindow.loadURL( readFileSync(files[0], "utf8") );
    mainWindow.on('closed', function () {
      mainWindow = null;
      if (process.platform !== 'darwin') app.quit();
    });

    mainWindow.webContents.on('will-prevent-unload', (event) => {
      let choice = dialog.showMessageBox(mainWindow, {
        type: 'question',
        buttons: ['Salir', 'Cancelar'],
        title: 'Estás seguro que deseas salir?',
        message: 'Perderás los ultimos cambios que no has guardado.',
        defaultId: 0,
        cancelId: 1
      })
      let leave = (choice === 0)
      if (leave) {
        event.preventDefault()
      }
    })
  })

};

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
})

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
