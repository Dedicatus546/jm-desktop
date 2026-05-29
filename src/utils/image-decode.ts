// jm 的从 220980 之后的图都经过混淆
// 需要通过 canvas 重绘
import { trpcClient } from '@/apis'
import { info } from '@/utils/logger'

import { getLoadedImage } from '.'

const isGif = (src: string): boolean => {
  return src.endsWith('.gif')
}

const seedMap = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
const getSeed = async (comicId: number, pageStr: string) => {
  const key = comicId + pageStr
  const keyMd5 = await trpcClient.md5.query(key)
  let charCodeOfLastChar = keyMd5[keyMd5.length - 1].charCodeAt(0)
  // window.atob("MjY4ODUw")
  const left = 268850
  // window.atob("NDIxOTI1")
  const right = 421925
  if (comicId >= left && comicId <= right) {
    charCodeOfLastChar = charCodeOfLastChar % 10
  } else if (comicId >= right + 1) {
    charCodeOfLastChar = charCodeOfLastChar % 8
  }
  return seedMap[charCodeOfLastChar] ?? 10 // 默认 seed
}

const decodeSrcMap = new Map<string, string>()
const decodePromiseMap = new Map<string, Promise<string>>()
export const decodeImage = async (
  src: string,
  comicId: number,
  scrambleId: number,
  speed: string,
) => {
  info(
    '开始解密地址 %s 图片，所属 comicId 为 %s ，scrambleId 为 %s ， speed 为 %s 。',
    src,
    comicId,
    scrambleId,
    speed,
  )
  if (comicId < scrambleId) {
    info('comicId 小于 scrambleId ，跳过解密')
  }
  if (isGif(src)) {
    info('gif 格式，跳过解密')
  }
  if (speed === '1') {
    info('speed 参数为 1 ，跳过解密')
  }
  if (comicId < scrambleId || isGif(src) || speed === '1') {
    return src
  }
  const key = comicId + '-' + src.substring(src.lastIndexOf('/') + 1, src.lastIndexOf('.'))
  info('全局解密 promise map key ：%s', key)
  if (decodeSrcMap.has(key)) {
    const src = decodeSrcMap.get(key)!
    info('在 map 中存在数据，已解密过，直接返回解密后的 src ：%s', src)
    return src
  }
  // 确保只有一个 promise 被加载
  if (decodePromiseMap.has(key)) {
    return decodePromiseMap.get(key)!
  }
  const page = src.substring(src.lastIndexOf('/') + 1, src.lastIndexOf('.'))
  const img = await getLoadedImage(src)
  const { naturalHeight, naturalWidth } = img
  const canvas = document.createElement('canvas')
  canvas.width = naturalWidth
  canvas.height = naturalHeight
  const ctx = canvas.getContext('2d')
  const seed = await getSeed(comicId, page)
  const remainder = naturalHeight % seed
  // 源图片被切成多行然后乱序
  for (let i = 0; i < seed; i++) {
    let height = Math.floor(naturalHeight / seed)
    let dy = height * i
    const sy = naturalHeight - height * (i + 1) - remainder
    if (i == 0) {
      height = height + remainder
    } else {
      dy = dy + remainder
    }
    ctx?.drawImage(
      img,
      // 源图位置
      0,
      sy, // source Y
      naturalWidth,
      height,
      // 目标位置
      0,
      dy, // dest Y
      naturalWidth,
      height,
    )
  }
  const promise = new Promise<string>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], page + '.webp', {
            type: 'image/webp',
          })
          const decodeUrl = URL.createObjectURL(file)
          decodeSrcMap.set(key, decodeUrl)
          resolve(decodeUrl)
        } else {
          reject("canvas not output a blob by invoking 'toBlob' method.")
        }
      },
      'image/webp',
      1,
    )
  })
  decodePromiseMap.set(key, promise)
  promise.then(() => decodePromiseMap.delete(key))
  return promise
}
