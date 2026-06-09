import '../common-style.ts'

import { createApp } from 'vue'
import { error } from '@/utils/logger.ts'
import { registerGlobalState } from '@/utils/resigter-global-state.ts'
import { normalizeError } from '@/utils'
import App from './App.vue'
import router from './router'
import { createVuetify } from '../create-vuetify.ts'

await registerGlobalState()

const vuetify = createVuetify()

const app = createApp(App)

app.config.errorHandler = (err) => {
  error(`[vue] ${normalizeError(err)}`)
}

app.config.performance = true

app.use(vuetify).use(createPinia()).use(router)

app.mount('#root')
