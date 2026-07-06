import { router as commonRouter } from './common.router'
import { router as DownloadRouter } from './download.router'
import { router as proxyServerRouter } from './proxy-server.router'
import { router as windowRouter } from './window.router'
import { router as stateRouter } from './state.router'
import { trpc } from './trpc'

export const router = trpc.router({
  ...commonRouter,
  ...proxyServerRouter,
  ...DownloadRouter,
  ...windowRouter,
  ...stateRouter,
})

// 导出 Router 类型
export type Router = typeof router
