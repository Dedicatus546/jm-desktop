import { Config, PrefetchData, User } from '@type/index'
import { EventEmitter } from 'node:events'

export const ee = new EventEmitter<{
  configUpdate: [config: Config]
  prefetchDataUpdate: [prefetchData: PrefetchData]
  userUpdate: [user: User | null]
}>()
