import '@/style/layer.css'
import '@/style/scroller.css'
import 'swiper/swiper-bundle.css'
import 'typeface-roboto'
import 'virtual:uno.css'
import 'vuetify/styles'

import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { Intersect } from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import App from './App.vue'
import { error } from '@/utils/logger.ts'
import { normalizeError } from '@/utils'
import { registerGlobalState } from '@/utils/resigter-global-state.ts'

await registerGlobalState()

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

app.use(vuetify).use(createPinia())

app.mount('#root')
