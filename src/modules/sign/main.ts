import '../common-style'

import { createApp } from 'vue'
import { createVuetify } from '../create-vuetify'
import App from './App.vue'
import { log } from '@/utils/logger'
import { normalizeError } from '@/utils'
import { registerGlobalState } from '@/utils/resigter-global-state'

const { error } = log
await registerGlobalState()
const vuetify = createVuetify()
const app = createApp(App)

app.config.errorHandler = (err) => {
  error(`[vue] ${normalizeError(err)}`)
}

app.config.performance = true

app.use(vuetify).use(createPinia())

app.mount('#root')
