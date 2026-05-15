import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import superjson from 'superjson'

import { emitter } from '@electron/shared/mitt'
import { dataDir } from '@electron/shared/path'
import { exists } from '@electron/shared/utils'
import { clone } from 'radash'
import { Config } from '@type/index'
import { state } from './state'

export const configFilepath = resolve(dataDir, 'config.json')

export const initConfigFile = async () => {
  const isExists = await exists(configFilepath)
  if (isExists) {
    const str = await readFile(configFilepath, {
      encoding: 'utf-8',
    })
    const config = superjson.parse<Config>(str)
    state.config = config
  } else {
    await writeFile(configFilepath, superjson.stringify(state.config))
  }
}

export const getConfig = () => {
  return state.config
}

export const saveConfig = async (newConfig: Config) => {
  const oldConfig = state.config
  state.config = newConfig
  await writeFile(configFilepath, superjson.stringify(newConfig))
  // TODO
}
