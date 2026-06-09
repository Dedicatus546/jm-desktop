import { DownloadItem } from '@main/module/download'
import mitt from 'mitt'

export const emitter = mitt<{
  RefreshCompleteDownloadList: void
  DownloadSuccess: DownloadItem
}>()
