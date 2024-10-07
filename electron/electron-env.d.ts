/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import("electron").IpcRenderer & {
    minimizeWin: () => void;
    closeWin: () => void;
    infoLog: (msg: string) => void;
    errorLog: (err: string) => void;
    getConfig: () => Promise<{ apiUrl: string; downloadDir: string }>;
    updateConfig: (updatedConfig: any) => Promise<void>;
    selectFolder: () => Promise<string>;
    isDownload: (comicId: number) => Promise<boolean>;
    getDonwloadList: (
      page: number,
      pageSize: number,
    ) => Promise<{
      list: import("./db").DownloadItem[];
      total: number;
    }>;
    insertDownload: (args: {
      comicId: number;
      name: string;
      author: string;
    }) => Promise<boolean>;
    saveDownloadFile: (file: File) => Promise<void>;
  };
}

declare const ipcRenderer: Window["ipcRenderer"];
