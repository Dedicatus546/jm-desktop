import { dataDir } from '@main/shared/path'
import { exists } from '@main/shared/utils'
import { Config } from '@common/type'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import superjson from 'superjson'
import { state } from './state'
import { ee } from '@main/events'
import { clone } from 'radash'
import { DEFAULT_CONFIG } from '@common/constant'

export const configFilepath = resolve(dataDir, 'config.json')

const normalizeConfig = (config: Partial<Config>): Config => {
  return Object.assign({}, DEFAULT_CONFIG, config)
}

export const initConfigFile = async () => {
  const isExists = await exists(configFilepath)
  if (isExists) {
    const str = await readFile(configFilepath, {
      encoding: 'utf-8',
    })
    const config = superjson.parse<Partial<Config>>(str)
    state.config = normalizeConfig(config)
  } else {
    await writeFile(configFilepath, superjson.stringify(state.config))
  }
}

export const getConfig = () => {
  return state.config
}

export const saveConfig = async (newConfig: Partial<Config>) => {
  const oldConfig = clone(state.config)
  Object.assign(state.config, newConfig)
  await writeFile(configFilepath, superjson.stringify(state.config))
  ee.emit('configUpdate', clone(state.config), oldConfig)
}
