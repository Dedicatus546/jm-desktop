import { DownloadItem } from '@electron/module/download'
import mitt from 'mitt'

export const emitter = mitt<{
  RefreshCompleteDownloadList: void
  DownloadSuccess: DownloadItem
}>()
