// jm 的从 220980 之后的图都经过混淆
// 需要通过 canvas 重绘

// node 端的解密逻辑
// 由于缺少原生 canvas ，这里需要使用 skia-canvas 的 canvas 实现库
// 需要在 vite.config.ts 里把这个依赖排除掉，不然打包报错
import { createHash } from 'node:crypto'

import { Canvas, Image } from 'skia-canvas'

const hash = (input: string) => {
  return createHash('md5').update(input).digest('hex')
}

export const needDecode = (comicId: number): boolean => {
  return comicId > 220980
}

const seedMap = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
const getSeed = async (comicId: number, pageStr: string) => {
  const key = comicId + pageStr
  const keyMd5 = hash(key)
  let charCodeOfLastChar = keyMd5[keyMd5.length - 1].charCodeAt(0)
  // window.atob("MjY4ODUw")
  const left = 268850
  // window.atob("NDIxOTI1")
  const right = 421925
  if (comicId >= left && comicId <= right) {
    charCodeOfLastChar = charCodeOfLastChar % 10
  }
  else if (comicId >= right + 1) {
    charCodeOfLastChar = charCodeOfLastChar % 8
  }
  return seedMap[charCodeOfLastChar] ?? 10 // 默认 seed
}

const decodeSrcMap = new Map<string, Buffer>()
const decodePromiseMap = new Map<string, Promise<Buffer>>()
export const decodeImage = async (
  src: string,
  arrayBuffer: ArrayBuffer,
  comicId: number,
) => {
  const key
    = comicId
      + '-'
      + src.substring(src.lastIndexOf('/') + 1, src.lastIndexOf('.'))
  if (decodeSrcMap.has(key)) {
    return decodeSrcMap.get(key)!
  }
  // 确保只有一个 promise 被加载
  if (decodePromiseMap.has(key)) {
    return decodePromiseMap.get(key)!
  }
  const buffer = Buffer.from(arrayBuffer)
  const page = src.substring(src.lastIndexOf('/') + 1, src.lastIndexOf('.'))
  const img = new Image()
  img.src = buffer
  await img.decode()
  const { height: naturalHeight, width: naturalWidth } = img
  const canvas = new Canvas()
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
    }
    else {
      dy = dy + remainder
    }
    const image = new Image()
    image.src = buffer
    ctx?.drawImage(
      image,
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
  const promise = canvas.toBuffer('webp')
  decodePromiseMap.set(key, promise)
  const outputBuffer = await promise
  decodeSrcMap.set(key, outputBuffer)
  decodePromiseMap.delete(key)
  return outputBuffer
}
