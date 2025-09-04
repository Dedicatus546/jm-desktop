import { Config } from '@electron/module/config'
import mitt from 'mitt'

export const emitter = mitt<{
  configChange: [newConfig: Config, oldConfig: Config]
}>()
