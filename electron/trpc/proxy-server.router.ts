import { getExpressServerPort } from '@main/module/express-server'

import { trpc } from './trpc'

const getProxyServerPortRpc = trpc.procedure.query(async () => {
  return getExpressServerPort()
})

export const router = {
  getProxyServerPort: getProxyServerPortRpc,
}
