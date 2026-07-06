import log from 'electron-log/main'
import { format } from 'date-fns'
import { dataDir } from '@main/shared/path'
import { resolve } from 'node:path'

const loggerDir = resolve(dataDir, 'log')
const date = format(new Date(), 'yyyy-MM-dd')

export const initLog = () => {
  log.transports.file.level = 'debug'
  log.transports.file.resolvePathFn = () => resolve(loggerDir, `${date}.log`)
  log.initialize()
}
