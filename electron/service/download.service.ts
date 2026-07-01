import { downloadDir, updateDownloadItem } from '@main/module/download'
import { decodeImage } from '@main/shared/decode-image'
import { net } from 'electron'
import log from 'electron-log/main'
import { join, resolve } from 'node:path'
import pLimit from 'p-limit'
import nameSanitizer from 'sanitize-filename'
// @ts-expect-error 缺少 type 类型文件
import { ZipArchive } from 'archiver'
import { ee } from '@main/events'
import { exists } from '@main/shared/utils'
import { mkdir } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { state } from '@main/module/state'
import { DownloadItem } from '@common/type'

const downloadCountPool = pLimit(2)

export const downloadService = async (comicId: DownloadItem['comicId']) => {
  downloadCountPool(async () => {
    const logger = log.scope('download')
    const downloadList = state.downloadList
    const item = downloadList.findLast((item) => item.comicId === comicId)
    if (!item) {
      logger.warn('%d 不存在下载任务中', comicId)
      return
    }
    logger.info('%d 开始处理下载', item.comicId)
    await updateDownloadItem(item.comicId, {
      percent: 0,
      status: 'downloading',
      filepath: '',
    })
    const dirname = `${item.comicName}`
    const dirnameSanitizer = nameSanitizer(dirname)
    const filename = `[${item.comicId}] ${item.chapterName}.zip`
    const filenameSanitizer = nameSanitizer(filename)
    const dirpath = resolve(downloadDir, dirnameSanitizer)
    const relativeFilepath = join(dirnameSanitizer, filenameSanitizer)
    const filepath = resolve(downloadDir, dirnameSanitizer, filenameSanitizer)
    logger.info('%d 标准化下载文件路径 %s', item.comicId, filepath)
    let complete = 0
    const total = item.picUrlList.length
    const downloadPicPool = pLimit(2 * 2)
    const list = item.picUrlList.map((url) =>
      downloadPicPool(async () => {
        const res = await net.fetch(url, {
          method: 'GET',
        })
        const arrayBuffer = await res.arrayBuffer()
        logger.info('%d 已获取 %s 图片 arrayBuffer 数据', item.comicId, url)
        const decodeArrayBuffer = await decodeImage(url, arrayBuffer, item.comicId)
        logger.info('%d 已解密 %s 图片数据', item.comicId, url)
        complete++
        return decodeArrayBuffer
      }),
    )
    const racePromiseList = list.map((p) => {
      type P<T> = {
        promise: Promise<P<T>>
        buffer: T
      }
      const { resolve, promise } = Promise.withResolvers<P<Buffer<ArrayBufferLike>>>()
      p.then((buffer) =>
        resolve({
          promise,
          buffer,
        }),
      )
      return promise
    })
    while (racePromiseList.length > 0) {
      const completed = await Promise.race(racePromiseList)
      const idx = racePromiseList.indexOf(completed.promise)
      racePromiseList.splice(idx, 1)
      await updateDownloadItem(item.comicId, {
        percent: complete / total,
        status: 'downloading',
        filepath: '',
      })
      ee.emit('downloadUpdate', state.downloadList)
    }
    const arrayBufferList = await Promise.all(list)
    logger.info('%d 所有图片下载完成', item.comicId)
    const archive = new ZipArchive('zip', {
      zlib: { level: 9 },
    })
    arrayBufferList.forEach((arrayBuffer, index) => {
      archive.append(Buffer.from(arrayBuffer), {
        name: `${index + 1}.webp`,
      })
    })
    if (!(await exists(dirpath))) {
      await mkdir(dirpath, {
        recursive: true,
      })
    }
    const output = createWriteStream(filepath)
    archive.pipe(output)
    await archive.finalize()
    logger.info('%d 所有图片压缩完成，文件路径为 %s', item.comicId, filepath)
    await updateDownloadItem(item.comicId, {
      percent: 1,
      status: 'complete',
      filepath: relativeFilepath,
    })
    ee.emit('downloadComplete', item)
  })
}
