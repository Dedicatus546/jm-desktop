import { execSync } from 'node:child_process'
import { join, resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'
import { transformerDirectives } from 'unocss'
import unocss from 'unocss/vite'
import autoImport from 'unplugin-auto-import/vite'
import { Vuetify3Resolver } from 'unplugin-vue-components/resolvers'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import component from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import electronSimple from 'vite-plugin-electron/simple'
import vueDevTools from 'vite-plugin-vue-devtools'

const envDir = resolve(import.meta.dirname, 'env')
const currentCommitHash = execSync('git rev-parse HEAD').toString().substring(0, 8)

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __COMIT_HASH__: JSON.stringify(currentCommitHash),
  },
  envDir,
  base: '/',
  plugins: [
    vue(),
    electronSimple({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: 'electron/main.ts',
        vite: {
          resolve: {
            alias: {
              '@electron': resolve(import.meta.dirname, 'electron'),
              '@type/*': resolve(import.meta.dirname, 'type'),
            },
          },
          build: {
            target: 'esnext',
            rolldownOptions: {
              // 关键，这样才会生成 var __require = /* @__PURE__ */ createRequire(import.meta.url); 垫片
              platform: 'node',
              // https://github.com/electron-vite/vite-plugin-electron/blob/main/README.zh-CN.md
              // Here are some C/C++ modules them can't be built properly.
              external: ['skia-canvas'],
            },
          },
        },
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: join(import.meta.dirname, 'electron/preload.ts'),
      },
      // Ployfill the Electron and Node.js API for Renderer process.
      // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer:
        process.env.NODE_ENV === 'test'
          ? // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
            undefined
          : {},
    }),
    autoImport({
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
      eslintrc: {
        enabled: true,
      },
    }),
    Icons(),
    component({
      resolvers: [Vuetify3Resolver(), IconsResolver()],
    }),
    unocss({
      transformers: [
        transformerDirectives({
          applyVariable: ['--at-apply', '--uno-apply', '--uno'],
        }),
      ],
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
      '@electron': resolve(import.meta.dirname, 'electron'),
      '@type': resolve(import.meta.dirname, 'type'),
    },
  },
  build: {
    rolldownOptions: {
      input: {
        home: resolve(import.meta.dirname, 'home.html'),
        login: resolve(import.meta.dirname, 'login.html'),
        setting: resolve(import.meta.dirname, 'setting.html'),
        sign: resolve(import.meta.dirname, 'sign.html'),
        about: resolve(import.meta.dirname, 'about.html'),
      },
    },
  },
  server: {
    // 由于 jm 的接口以 cookie 形式来验证用户登录，所以这里我们在开发下只能做一层转发
    // 生产下不受影响，由 electron 侧提供服务器来供访问
    proxy: {
      '^/api': {
        target: 'http://localhost:6174',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
