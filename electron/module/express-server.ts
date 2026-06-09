import { Server } from 'node:http'
import { AddressInfo } from 'node:net'

import { distRenderer } from '@main/shared/path'
import { resolveProxyUrl } from '@main/shared/utils'
import cors from 'cors'
import Express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { HttpsProxyAgent } from 'https-proxy-agent'

import { getConfig } from './config'
import { createLogger } from './logger'
import { VITE_DEV_SERVER_URL } from '@main/env'

const { info, error, warn } = createLogger('express-server')

let expressServer: Server | undefined
let expressServerInitPromise: Promise<void> | undefined
let proxyMiddleware: ReturnType<typeof createProxyMiddleware> | undefined = undefined
let target = ''

export const getExpressServerPort = async () => {
  if (!expressServer) {
    warn('没有获取到 server 实例，无法获取端口')
    return -1
  }
  await expressServerInitPromise
  const address = expressServer.address() as AddressInfo
  return address.port
}

export const closeExpressServer = async () => {
  return new Promise<void>((resolve, reject) => {
    expressServer?.close((err) => {
      if (err) {
        reject(err)
        return
      }
      expressServer = undefined
      expressServerInitPromise = undefined
      resolve()
    })
  })
}

const getExpressInstance = async () => {
  const express = Express()
  express.use(
    cors({
      // https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Headers/Access-Control-Max-Age
      // 结果可被缓存的最大秒数，以无符号非负整数表示。Firefox 上限为 24 小时（86400 秒）。Chromium（76 版本之前）上限为 10 分钟（600 秒）
      // Chromium（从 76 版本开始）上限为 2 小时（7200 秒）。默认值为 5 秒。
      // 缓存 2 小时，防止频繁发送预检请求
      maxAge: 60 * 60 * 2,
    }),
  )
  info('设置 distRenderer：%s 为静态目录', distRenderer)
  express.use('/', Express.static(distRenderer))

  info('设置 /api 转发')
  updateTarget()
  express.use('/api', (req, res, next) => {
    if (proxyMiddleware === undefined) {
      updateProxyMiddleware()
    }
    proxyMiddleware!(req, res, next)
  })

  return express
}

export const startExpressServer = async () => {
  const express = await getExpressInstance()
  const { promise, resolve, reject } = Promise.withResolvers<void>()
  const devServerUrl = VITE_DEV_SERVER_URL
  const startPort = devServerUrl ? 6174 : 0
  const server = express.listen(startPort, async (e) => {
    if (e) {
      error('express 启动错误，原因：%s', e.message + '\n' + e.stack)
      reject(error)
    }
    info('server 启动成功')
    resolve()
  })
  expressServerInitPromise = promise
  await promise
  expressServer = server

  const port = await getExpressServerPort()
  info('server 端口为 %d', port)
}

export const updateProxyMiddleware = () => {
  const config = getConfig()
  let agent: HttpsProxyAgent<string> | undefined
  const proxyUrl = resolveProxyUrl(config.proxyInfo)
  if (proxyUrl) {
    info('代理已设置，地址：%s', proxyUrl)
    agent = new HttpsProxyAgent(proxyUrl)
  } else {
    info('代理未设置')
  }

  proxyMiddleware = createProxyMiddleware({
    target,
    agent,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/api': '',
    },
    router() {
      return target
    },
  })
}

export const updateTarget = () => {
  const config = getConfig()
  info('apiUrl 已设置，地址：%s', config.apiUrl)
  target = config.apiUrl
}

startExpressServer()
