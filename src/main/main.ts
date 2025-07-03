/* eslint global-require: off, no-console: off, promise/always-return: off */

/*
Todo:
- Allow disabling of the inputs
- Debounce Slider/color picker input
- sass
*/

import { app } from 'electron';
import Logger from 'electron-log/main';
import { $errors, $init } from '../config/strings';
import ipc from './ipc';
import { ready, startup } from './startup';
const path = require('path');
const { spawn } = require('child_process');

let serverProcess: any = null;

function startPythonServer() {
  if (serverProcess) {
    serverProcess.kill('SIGINT');
    serverProcess = null;
  }

  const isDev = !app.isPackaged;
  const serverPath = isDev
    ? path.resolve(__dirname, '../../resources/server.exe') // resolve relative to current file
    : path.join(process.resourcesPath, 'server.exe');

  serverProcess = spawn(serverPath);

  serverProcess.stdout.on('data', (data) => {
    console.log(`Server stdout: ${data.toString()}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Server stderr: ${data.toString()}`);
  });

  serverProcess.on('exit', (code, signal) => {
    console.log(`Server exited with code ${code} and signal ${signal}`);
    serverProcess = null;
  });
}


// Initialize the timer
console.time(app.name);
console.timeLog(app.name, $init.app);

// Register ipcMain listeners
ipc.initialize();

// SETUP APP (runs after startup())
app
	.whenReady()
	.then(()=>{
		// Start the Python server
		startPythonServer();

		// Create the main window
		return ready();
	}) // <-- this is where the app is initialized
	.catch((error: Error) => {
		Logger.error($errors.prefix, error);
	});

// LAUNCH THE APP
startup();


app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill('SIGINT');
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (serverProcess) {
    serverProcess.kill('SIGINT');
  }
});

// See the idle() function in src/main/startup.ts
// it's called in the ipcMain.on(ipcChannels.RENDERER_READY) listener
// when the renderer process is ready
