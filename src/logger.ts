import { trpcClient } from './apis/ipc'

const rendererName = 'renderer'

export const createLogger = (...nameList: string[]) => {
  return (['info', 'error', 'warn'] as const)
    .map((type) => {
      return {
        type,
        fn(message?: any, ...optionalParams: any[]) {
          trpcClient.logger.mutate({
            nameList: [rendererName, ...nameList],
            type,
            msg: [message, ...optionalParams],
          })
          if (import.meta.env.DEV) {
            console[type](message, ...optionalParams)
          }
        },
      }
    })
    .reduce(
      (logger, item) => {
        logger[item.type] = item.fn
        return logger
      },
      {} as {
        info: (message?: any, ...optionalParams: any[]) => void
        warn: (message?: any, ...optionalParams: any[]) => void
        error: (message?: any, ...optionalParams: any[]) => void
      },
    )
}

export const { info, warn, error } = createLogger()
