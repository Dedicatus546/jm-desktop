import './layer.css'
import 'swiper/swiper-bundle.css'
import 'typeface-roboto'
import 'virtual:uno.css'
import 'vuetify/styles/core'
import './style.css'

import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { Intersect } from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import App from './App.vue'
import { error } from './logger'
import router from './router'
import pinia from './store'
import { normalizeError } from './utils'
import { Config, LoginInfo, PrefetchData, User } from '@type/index'
import { trpcClient } from './apis'

declare global {
  // 定义你的状态结构
  interface AppState {
    config: Config
    prefetchData: PrefetchData
    user: User | null
    loginInfo: LoginInfo | null
  }

  // 这样直接写，可以让前端直接使用 `appState.config`
  const APP_STATE: AppState
  const WINDOW_ID: string

  // 这样写，可以让前端使用 `window.appState.config` 并且不报错
  interface Window {
    APP_STATE: AppState
    WINDOW_ID: string
  }
}

window.APP_STATE = await trpcClient.getState.query()
window.WINDOW_ID = await trpcClient.getWindowId.query()

console.log('appState', APP_STATE)

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#ff9800',
          'on-primary': '#ffffff',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#633b00',
          'on-primary': '#ffffff',
        },
      },
    },
  },
  directives: {
    Intersect,
  },
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...aliases,
    },
    sets: {
      mdi,
    },
  },
})

const app = createApp(App)

app.config.errorHandler = (err) => {
  error(`[vue] ${normalizeError(err)}`)
}

app.config.performance = true

app.use(vuetify).use(pinia).use(router)

app.mount('#root')
