import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import superjson from 'superjson'
import log from 'electron-log/main'

import { dataDir } from '@main/shared/path'
import { exists } from '@main/shared/utils'
import { DownloadItem } from '@common/type'
import { state } from './state'
import { ee } from '@main/events'

export const downloadDir = resolve(dataDir, 'download')
export const downloadFilepath = resolve(dataDir, 'download-db.json')

export const initDownloadFile = async () => {
  let isExists = await exists(downloadDir)
  if (!isExists) {
    await mkdir(downloadDir, {
      recursive: true,
    })
  }
  isExists = await exists(downloadFilepath)
  if (!isExists) {
    await writeFile(downloadFilepath, superjson.stringify(state.downloadList))
  } else {
    const str = await readFile(downloadFilepath, {
      encoding: 'utf-8',
    })
    state.downloadList = superjson.parse<Array<DownloadItem>>(str)
  }
}

export const getDonwloadList = () => {
  return state.downloadList
}

export const saveDownloadList = async (list: Array<DownloadItem>) => {
  state.downloadList = list
  await writeFile(downloadFilepath, superjson.stringify(state.downloadList), {
    encoding: 'utf-8',
  })
  ee.emit('downloadUpdate', state.downloadList)
}

export const updateDownloadItem = async (
  comicId: DownloadItem['comicId'],
  _item: Partial<Omit<DownloadItem, 'comicId'>>,
) => {
  const item = state.downloadList.find((a) => a.comicId === comicId)
  if (!item) {
    log.warn('未知的本子信息', superjson.stringify(_item))
    return
  }
  Object.assign(item, _item)
  await writeFile(downloadFilepath, superjson.stringify(state.downloadList), {
    encoding: 'utf-8',
  })
  ee.emit('downloadUpdate', state.downloadList)
}

export const addDownloadItem = async (query: {
  comicId: number
  comicName: string
  chapterName: string
  picUrlList: Array<string>
  scrambleId: number
  speed: string
}) => {
  const item = state.downloadList.find((a) => a.comicId === query.comicId)
  if (item) {
    log.warn('本子已存在下载中', superjson.stringify(query))
    return
  }
  const newItem: DownloadItem = {
    ...query,
    filepath: '',
    status: 'pending',
    percent: 0,
    createTime: Date.now(),
  }
  state.downloadList.unshift(newItem)
  await writeFile(downloadFilepath, superjson.stringify(state.downloadList), {
    encoding: 'utf-8',
  })
  ee.emit('downloadUpdate', state.downloadList)
  return newItem
}
