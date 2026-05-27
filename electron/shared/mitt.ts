import mitt from 'mitt'
import { Config } from '@type/index'

export const emitter = mitt<{
  configChange: [newConfig: Config, oldConfig: Config | undefined]
}>()
