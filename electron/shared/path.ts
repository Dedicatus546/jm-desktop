import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { app } from 'electron'

import { exists } from './utils'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const appRoot = join(__dirname, '..')
export const distElectron = join(appRoot, 'dist-electron')
export const distRenderer = join(appRoot, 'dist')
export const publicDir = import.meta.env.DEV ? join(appRoot, 'public') : distRenderer
export const dataDir = import.meta.env.DEV
  ? join(appRoot, 'data')
  : join(dirname(app.getPath('exe')), 'data')

export const initDataDir = async () => {
  const isExist = await exists(dataDir)
  if (!isExist) {
    await mkdir(dataDir, {
      recursive: true,
    })
  }
}
