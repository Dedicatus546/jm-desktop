// 由于这里 exposeElectronTRPC 会打包进来（只是一个简单的函数），并且只使用了沙盒下受限的导出：
// var exposeElectronTRPC = () => {
//   electron.contextBridge.exposeInMainWorld("electronTRPC", {
//     sendMessage: (operation) => electron.ipcRenderer.send(ELECTRON_TRPC_CHANNEL, operation),
//     onMessage: (callback) => electron.ipcRenderer.on(ELECTRON_TRPC_CHANNEL, (_event, args) => callback(args))
//   });
// };
// 受限导出包含：https://www.electronjs.org/zh/docs/latest/tutorial/sandbox#preload-%E8%84%9A%E6%9C%AC

// 所以这里在 vite.config.ts 中要去除 vite-electron-plugin 的默认的 --no-sandbox 启动选项，它会影响 chrome 插件安装
// 比如 @electron/devtron 在禁用沙盒情况下并不会报错，但是控制台不显示 tab
// 只有去除 --no-sandbox 才能显示

// 但限制是 preload.ts 就只能使用受限的导出，因为沙盒下该文件并没有完整的 node api 支持。

import { exposeElectronTRPC } from 'trpc-electron-fork/main'

process.once('loaded', () => {
  exposeElectronTRPC()
})
