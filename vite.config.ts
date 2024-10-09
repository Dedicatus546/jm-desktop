import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import vue from "@vitejs/plugin-vue";
import { theme } from "ant-design-vue";
import unocss from "unocss/vite";
import autoImport from "unplugin-auto-import/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import component from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import electron from "vite-plugin-electron/simple";
import vueDevTools from "vite-plugin-vue-devtools";

const { defaultAlgorithm, defaultSeed } = theme;

const mapToken = defaultAlgorithm(defaultSeed);

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    vue(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: "electron/main.ts",
        vite: {
          build: {
            rollupOptions: {
              // https://github.com/electron-vite/vite-plugin-electron/blob/main/README.zh-CN.md
              // Here are some C/C++ modules them can't be built properly.
              external: ["better-sqlite3"],
            },
          },
        },
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: join(__dirname, "electron/preload.ts"),
      },
      // Ployfill the Electron and Node.js API for Renderer process.
      // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer:
        process.env.NODE_ENV === "test"
          ? // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
            undefined
          : {},
    }),
    autoImport({
      imports: ["vue", "vue-router", "pinia", "@vueuse/core"],
      eslintrc: {
        enabled: true,
      },
    }),
    component({
      resolvers: [
        AntDesignVueResolver({
          resolveIcons: true,
          importStyle: "css-in-js",
        }),
      ],
    }),
    unocss(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@electron": resolve(__dirname, "electron"),
    },
  },
  server: {
    proxy: {
      "^/api": {
        target: "https://www.cdnxxx-proxy.xyz",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace("/api", ""),
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: mapToken,
      },
    },
  },
  envDir: resolve(__dirname, "env"),
});
