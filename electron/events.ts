import { Config, DownloadItem, PrefetchData, User } from '@common/type'
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
  downloadUpdate: [list: Array<DownloadItem>]
  downloadComplete: [DownloadItem]
  downloadProgressUpdate: [
    item: {
      comicId: number
      percent: number
      status: DownloadItem['status']
      filepath: string
    },
  ]
}

export const ee = new EventEmitter<EventEmitterMap>()
