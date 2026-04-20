import './layer.css'
import 'swiper/swiper-bundle.css'
import 'typeface-roboto'
import 'virtual:uno.css'
import 'vuetify/styles/core'
import './style.css'

import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { Intersect } from 'vuetify/directives'
import App from './App.vue'
import { error } from './logger'
import router from './router'
import pinia from './store'
import { normalizeError } from './utils'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

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
