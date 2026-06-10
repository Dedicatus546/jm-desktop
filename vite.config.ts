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
        // NOTE: 如果使用 --no-sandbox 启动，则 @electron/devtron 无法安装
        onstart({ startup }) {
          startup(['.'])
        },
        entry: 'electron/main.ts',
        vite: {
          resolve: {
            alias: {
              '@main': resolve(import.meta.dirname, 'electron'),
              '@type/*': resolve(import.meta.dirname, 'type'),
            },
          },
          build: {
            sourcemap: true,
            rolldownOptions: {
              external: ['skia-canvas'],
            },
          },
        },
      },
      preload: {
        input: join(import.meta.dirname, 'electron/preload.ts'),
      },
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
      '@main': resolve(import.meta.dirname, 'electron'),
      '@type': resolve(import.meta.dirname, 'type'),
    },
  },
  build: {
    sourcemap: true,
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
