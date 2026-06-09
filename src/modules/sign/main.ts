import '../common-style.ts'

import { createApp } from 'vue'
import { createVuetify } from '../create-vuetify.ts'
import App from './App.vue'
import { error } from '@/utils/logger.ts'
import { normalizeError } from '@/utils'
import { registerGlobalState } from '@/utils/resigter-global-state.ts'

await registerGlobalState()

const vuetify = createVuetify()

const app = createApp(App)

app.config.errorHandler = (err) => {
  error(`[vue] ${normalizeError(err)}`)
}

app.config.performance = true

app.use(vuetify).use(createPinia())

app.mount('#root')
