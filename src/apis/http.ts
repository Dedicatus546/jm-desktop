import { xhrRequestAdapter } from '@alova/adapter-xhr'
import { createAlova } from 'alova'
import { useRequest } from 'alova/client'
import vueHook from 'alova/vue'

import { createLogger } from '@/logger'
import { useDownloadStore } from '@/stores/use-download-store'
import useUserStore from '@/stores/use-user-store'

import { getCategoryListApi, getSettingApi, getWeekListApi, loginApi } from './ajax'
import { trpcClient } from './ipc'
import { useConfigStore } from '@/stores/use-config-store'
import { usePrefetchDataStore } from '@/stores/use-prefetch-data-store'

const { info, error, warn } = createLogger('api')

const ts = Math.floor(Date.now() / 1000)
const version = '1.8.2'
const token = '185Hcomic3PAPP7R'
const tokenHash = (await trpcClient.md5.query(`${ts}${token}`)).toLowerCase()

let baseURL = ''
if (import.meta.env.DEV) {
  baseURL = '/api'
} else {
  const port = await trpcClient.getProxyServerPort.query()
  baseURL = `http://localhost:${port}/api`
}

info('baseURL: ', baseURL)

const initConfig = async () => {
  const prefetchDataStore = usePrefetchDataStore()
  const configStore = useConfigStore()
  try {
    if (prefetchDataStore.state.shuntList.length > 0) {
      if (
        // 第一次启动未选择图源
        configStore.state.currentShuntKey === undefined ||
        // 接口的图源列表可能发生变化，回退到第一个图源
        prefetchDataStore.state.shuntList.every(
          (item) => item.key !== configStore.state.currentShuntKey,
        )
      ) {
        info('检测到未选择图源，默认选择第一个')
        await configStore.updateConfigAction({
          currentShuntKey: prefetchDataStore.state.shuntList[0].key,
        })
      }
    }
  } catch (e) {
    error('读取本地配置文件失败，原因', e)
    throw new Error('读取本地配置文件失败')
  }
}

const autoLogin = async () => {
  const userStore = useUserStore()
  const configStore = useConfigStore()
  let username = ''
  let password = ''
  const { send, data } = useRequest(
    (username: string, password: string) =>
      loginApi({
        username,
        password,
      }),
    {
      immediate: false,
    },
  )

  // 开发环境下读 env 直接登录，该 env 为 .local ，不上传仓库
  info('开始处理自动登录')
  if (
    import.meta.env.DEV &&
    import.meta.env.VITE_AUTO_LOGIN_DEV === '1' &&
    import.meta.env.VITE_LOGIN_USERNAME &&
    import.meta.env.VITE_LOGIN_PASSWORD
  ) {
    info('检测到开发环境且配置了自动登录开关以及用户信息，使用该信息登录')
    username = import.meta.env.VITE_LOGIN_USERNAME
    password = import.meta.env.VITE_LOGIN_PASSWORD
  } else if (configStore.state.loginUserInfo) {
    info('检测到本地配置中开启了自动登录，使用本地配置中的用户信息')
    const loginInfo = await trpcClient.decryptLoginUser.query(configStore.state.loginUserInfo)
    username = loginInfo.username
    password = loginInfo.password
  } else {
    warn('未读取到相应的用户信息，跳过自动登录')
    return
  }
  try {
    await send(username, password)
    userStore.updateUserAction(data.value.data)
    info('自动登录成功')
  } catch (e) {
    error('自动登录失败，跳过自动登录，原因：', e)
  }
}

const initDownload = async () => {
  const downloadStore = useDownloadStore()
  info('开始初始化下载任务')
  try {
    await downloadStore.initAction()
    info('初始化下载任务成功')
  } catch (e) {
    error('初始化下载任务失败，原因', e)
    throw new Error('初始化下载任务失败')
  }
}

const initPrefetchData = async () => {
  const prefetchDataStore = usePrefetchDataStore()
  const { data: settingData, send: settingSend } = useRequest(() => getSettingApi())
  const { data: weekData, send: weekSend } = useRequest(() => getWeekListApi(), {
    immediate: false,
  })
  const { data: categoryData, send: categorySend } = useRequest(() => getCategoryListApi(), {
    immediate: false,
  })
  try {
    await Promise.all([settingSend(), weekSend(), categorySend()])
    await prefetchDataStore.updatePrefetchDataAction({
      imgHost: settingData.value.data.imgHost,
      shuntList: settingData.value.data.shuntList,
      weekCategoryList: weekData.value.data.categoryList,
      weekTypeList: weekData.value.data.typeList,
      categoryTagList: categoryData.value.data.tagTypeList,
      categoryCategoryList: categoryData.value.data.categoryList,
    })
    info('初始化全局数据成功')
  } catch (e) {
    error('初始化全局数据失败，原因', e)
    throw new Error('初始化全局数据失败')
  }
}

let initPromise: Promise<any> | undefined

const http = createAlova({
  statesHook: vueHook,
  requestAdapter: xhrRequestAdapter({}),
  baseURL,
  async beforeRequest(method) {
    const prefetchDataStore = usePrefetchDataStore()
    // method.config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    method.config.headers.tokenparam = `${ts},${version}`
    method.config.headers.token = tokenHash
    // 设置 20 分钟缓存
    if (method.type === 'GET') {
      method.config.cacheFor = 1000 * 60 * 20
    }
    if (!prefetchDataStore.isInit && WINDOW_ID === 'main') {
      if (!initPromise) {
        try {
          const { promise, resolve, reject } = Promise.withResolvers<void>()
          initPromise = promise
          ;(async () => {
            try {
              await initPrefetchData()
              await initConfig()
              await autoLogin()
              await initDownload()
              resolve()
            } catch (e) {
              reject(e)
            }
          })()
          await initPromise
          prefetchDataStore.isInit = true
        } finally {
          initPromise = undefined
        }
      }
    }
  },
  responded: {
    async onSuccess(response, method) {
      if (response.status >= 400) {
        const errorMsg = response.data.errorMsg ?? '网络开小差了，请稍后再试'
        error('网络开小差了，请稍后再试', {
          url: method.url,
          output: {
            status: response.status,
            errorMsg,
          },
        })
        throw new Error(errorMsg)
      }
      info(method.url, response.status)
      if (
        // 下载接口
        method.url.includes('dl_comic_zip') ||
        // jm 的阅读页是返回 html 填充的，必须解析 html 来获取相关数据
        method.url.includes('chapter_view_template')
      ) {
        return response.data
      }
      const json = response.data
      if (json.code !== 200) {
        throw new Error(json.errorMsg)
      }
      let parsedStr = ''
      try {
        parsedStr = await trpcClient.decodeHttpData.query({
          data: json.data,
          key: tokenHash,
        })
      } catch (e) {
        error('Trpc 解析请求返回结果失败', {
          url: method.url,
          input: {
            data: json.data,
            tokenHash,
          },
        })
        throw new Error('Trpc 解析请求返回结果失败', {
          cause: e,
        })
      }
      try {
        json.data = JSON.parse(parsedStr)
      } catch (e) {
        error('JSON 反序列化失败', {
          url: method.url,
          input: parsedStr,
        })
        throw new Error('JSON 反序列化失败', {
          cause: e,
        })
      }
      info(method.url, '解密成功')
      if (import.meta.env.DEV) {
        console.log(method.url, '解密成功', json)
      }
      return json
    },
  },
})

export default http
