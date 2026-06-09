import { dataDir } from '@electron/shared/path'
import { exists } from '@electron/shared/utils'
import { WindowId, WindowInfo, WindowInfoMap } from '@type/index'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import superjson from 'superjson'
import { state } from './state'

export const windowInfoMapFilepath = resolve(dataDir, 'window-info.json')

export const initWindowInfoMapFile = async () => {
  const isExists = await exists(windowInfoMapFilepath)
  if (isExists) {
    const str = await readFile(windowInfoMapFilepath, {
      encoding: 'utf-8',
    })
    const windowInfoMap = superjson.parse<WindowInfoMap>(str)
    state.windowInfoMap = windowInfoMap
  } else {
    await writeFile(windowInfoMapFilepath, superjson.stringify(state.windowInfoMap))
  }
}

export const getWindowInfo = (id: WindowId) => {
  return state.windowInfoMap.get(id)
}

export const updateWindowInfo = async (id: WindowId, windowInfo: Partial<WindowInfo>) => {
  const sourceWindowInfo = getWindowInfo(id)
  const targetWindowInfo = Object.assign({}, sourceWindowInfo, windowInfo) as WindowInfo
  state.windowInfoMap.set(id, targetWindowInfo)
  await writeFile(windowInfoMapFilepath, superjson.stringify(state.windowInfoMap))
}
