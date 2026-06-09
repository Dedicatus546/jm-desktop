// src/shared/trpc.ts
import { initTRPC } from '@trpc/server'
import { WindowId } from '@type/index'
import { type BrowserWindow } from 'electron'
import superjson from 'superjson'

interface Context {
  win: BrowserWindow
  winId: WindowId
  // 可以添加更多依赖...
}

// 初始化 tRPC
export const trpc = initTRPC.context<Context>().create({
  transformer: superjson,
})
