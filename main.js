
const {app, BrowserWindow, dialog} = require('electron');
const {glob} = require('glob');
const {readFileSync} = require('fs');

let mainWindow;
function createWindow (launchInfo) {
  mainWindow = new BrowserWindow({
    title: 'MAT PG Admin',
    icon: 'img/favicon.ico',
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      devTools : true 
    }
  });

  //mainWindow.webContents.openDevTools({mode: 'detach'})  
  let addr_path = "/Users/Victor\ Palma/.pgAdmin4*.addr";
  if( process.platform === 'linux' ){
    addr_path = "/home/donvictor/.pgAdmin4*.addr";
  }
  glob(addr_path, {}, (err, files) => {

    //mainWindow.webContents.executeJavaScript("console.log('err', "+JSON.stringify(err)+")");
    //mainWindow.webContents.executeJavaScript("console.log('files', "+JSON.stringify(files)+")");
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
        message: 'Perderas los ultimos cambios que no has guardado.',
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
