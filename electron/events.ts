import { Config, PrefetchData, User } from '@type/index'
import { EventEmitter } from 'node:events'

export interface EventEmitterMap {
  configUpdate: [config: Config, oldConfig: Config]
  prefetchDataUpdate: [prefetchData: PrefetchData]
  userUpdate: [user: User | null]
  messageNotify: [
    {
      type: 'primary' | 'success' | 'warning' | 'error'
      message: string
    },
  ]
}

export const ee = new EventEmitter<EventEmitterMap>()
