import { DownloadItem } from '@common/type'
import mitt from 'mitt'

export const emitter = mitt<{
  RefreshCompleteDownloadList: void
  DownloadSuccess: DownloadItem
}>()
