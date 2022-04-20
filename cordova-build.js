const path = require("path");
const fs = require("fs/promises");
const { build } = require("vite");
const buildSettings = require("./cordova-build.json");

module.exports = async (ctx) => {
  if (ctx.cmdLine.endsWith("cordova prepare")) {
    console.log("Skipping build hook for cordova prepare.");
    return;
  }
  if (process.platform != "linux") {
    delete buildSettings.electron.linux;
  }
  if (process.platform != "win32") {
    delete buildSettings.electron.windows;
  }
  if (process.platform != "darwin") {
    delete buildSettings.electron.mac;
  }
  await fs.writeFile("build.json", JSON.stringify(buildSettings));

  if (ctx.opts.platforms.includes("electron")) {
    // platforms/electron/www/cdv-electron-main.js
    // mainWindow = new BrowserWindow
    const cdvElectronMainPath = path.join(__dirname, "platforms", "electron", "www", "cdv-electron-main.js");
    let cdvElectronMain = await fs.readFile(cdvElectronMainPath, "utf8");
    cdvElectronMain = cdvElectronMain.replace(/(mainWindow = new BrowserWindow\(browserWindowOpts\);)/, "$1mainWindow.setMenuBarVisibility(false);");
    await fs.writeFile(cdvElectronMainPath, cdvElectronMain);
  }

  for (const wwwDir of ctx.opts.paths) {
    const platform = path.relative(path.join(__dirname, "platforms"), wwwDir).split(path.sep)[0];
    process.env.CORDOVA_PLATFORM = platform;
    const outDir = path.join(wwwDir, "musicociel");
    await fs.unlink(path.join(outDir, "../.gitdir"));
    await build({
      build: {
        emptyOutDir: true,
        outDir
      }
    });
  }
};
