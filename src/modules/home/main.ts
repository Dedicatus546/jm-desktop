import '../common-style'

import { createApp } from 'vue'
import { registerGlobalState } from '@/utils/resigter-global-state'
import { normalizeError } from '@/utils'
import App from './App.vue'
import router from './router'
import { createVuetify } from '../create-vuetify'
import { log } from '@/utils/logger'

const { error } = log

await registerGlobalState()

const vuetify = createVuetify()

const app = createApp(App)

app.config.errorHandler = (err) => {
  error(`[vue] ${normalizeError(err)}`)
}

app.config.performance = true

app.use(vuetify).use(createPinia()).use(router)

app.mount('#root')
