import { mkdir, open, writeFile } from 'node:fs/promises'
import { EOL } from 'node:os'
import { resolve } from 'node:path'
import { format as stringFormat } from 'node:util'

import { dataDir } from '@electron/shared/path'
import { exists } from '@electron/shared/utils'
import { format } from 'date-fns'

const loggerDir = resolve(dataDir, 'log')

if (!(await exists(loggerDir))) {
  await mkdir(loggerDir, {
    recursive: true,
  })
}

const infoLogPath = resolve(loggerDir, 'info.log')
const errorLogPath = resolve(loggerDir, 'error.log')
const warnLogPath = resolve(loggerDir, 'warn.log')

const [infoLogFd, errorLogFd, warnLogFd] = await Promise.all([
  open(infoLogPath, 'a'),
  open(errorLogPath, 'a'),
  open(warnLogPath, 'a'),
])

const getDatetime = () => {
  return format(new Date(), 'yyyy.MM.dd HH:mm:ss')
}

const logger = {
  async info(message?: any, ...optionalParams: any[]) {
    const datetime = getDatetime()
    const messageFormated = stringFormat(
      `[${datetime}] ${message}`,
      ...optionalParams,
    )
    console.info(messageFormated)
    await writeFile(infoLogFd, messageFormated)
    await writeFile(infoLogFd, EOL)
  },
  async error(message?: any, ...optionalParams: any[]) {
    const datetime = getDatetime()
    const messageFormated = stringFormat(
      `[${datetime}] ${message}`,
      ...optionalParams,
    )
    console.error(messageFormated)
    await writeFile(errorLogFd, messageFormated)
    await writeFile(errorLogFd, EOL)
  },
  async warn(message?: any, ...optionalParams: any[]) {
    const datetime = getDatetime()
    const messageFormated = stringFormat(
      `[${datetime}] ${message}`,
      ...optionalParams,
    )
    console.error(messageFormated)
    await writeFile(warnLogFd, messageFormated)
    await writeFile(warnLogFd, EOL)
  },
}

export type LoggerLevel = keyof typeof logger

export const createLogger = (...nameList: string[]) => {
  const prefix = nameList.map(item => `[${item}]`).join(' ')
  return {
    info(message?: any, ...optionalParams: any[]) {
      logger.info(`${prefix} ` + message, ...optionalParams)
    },
    error(message?: any, ...optionalParams: any[]) {
      logger.error(`${prefix} ` + message, ...optionalParams)
    },
    warn(message?: any, ...optionalParams: any[]) {
      logger.warn(`${prefix} ` + message, ...optionalParams)
    },
  }
}
