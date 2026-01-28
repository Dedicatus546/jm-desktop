import { xhrRequestAdapter } from '@alova/adapter-xhr'
import { createAlova } from 'alova'
import { useRequest } from 'alova/client'
import vueHook from 'alova/vue'

import { createLogger } from '@/logger'
import useAppStore from '@/stores/use-app-store'
import { useDownloadStore } from '@/stores/use-download-store'
import useUserStore from '@/stores/use-user-store'

import { getCategoryListApi, getSettingApi, getWeekListApi, loginApi } from './ajax'
import { trpcClient } from './ipc'

const { info, error, warn } = createLogger('api')

const ts = Math.floor(Date.now() / 1000)
const version = '1.8.0'
const token = '185Hcomic3PAPP7R'
const tokenHash = (await trpcClient.md5.query(`${ts}${token}`)).toLowerCase()

// const decode = (data: string) => {
//   return JSON.parse(
//     CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(tokenHash), {
//       mode: CryptoJS.mode.ECB,
//     }).toString(CryptoJS.enc.Utf8),
//   );
// };

let baseURL = ''
if (import.meta.env.DEV) {
  baseURL = '/api'
}
else {
  const port = await trpcClient.getProxyServerPort.query()
  baseURL = `http://localhost:${port}/api`
}

info('baseURL: ', baseURL)

const initSetting = async () => {
  const appStore = useAppStore()
  const { data, send } = useRequest(() => getSettingApi())
  try {
    await send()
    appStore.updateSettingAction(data.value.data)
  }
  catch (e) {
    error(e)
    throw new Error('读取网址设置失败')
  }
}

const initConfig = async () => {
  const appStore = useAppStore()
  info('开始读取本地配置文件')
  try {
    const config = await trpcClient.getConfig.query()
    appStore.updateConfigAction(config)
    info('读取本地配置文件成功')
    if (appStore.setting.shuntList.length > 0) {
      if (
      // 第一次启动未选择图源
        appStore.config.currentShuntKey === undefined
        // 接口的图源列表可能发生变化，回退到第一个图源
        || appStore.setting.shuntList.every(
          item => item.key !== appStore.config.currentShuntKey,
        )
      ) {
        info('检测到未选择图源，默认选择第一个')
        appStore.updateConfigAction(
          {
            currentShuntKey: appStore.setting.shuntList[0].key,
          },
          true,
        )
      }
    }
  }
  catch (e) {
    error('读取本地配置文件失败，原因', e)
    throw new Error('读取本地配置文件失败')
  }
}

const autoLogin = async () => {
  const userStore = useUserStore()
  const appStore = useAppStore()
  let username = '',
    password = ''
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
    import.meta.env.DEV
      && import.meta.env.VITE_AUTO_LOGIN_DEV === '1'
      && import.meta.env.VITE_LOGIN_USERNAME
      && import.meta.env.VITE_LOGIN_PASSWORD
  ) {
    info('检测到开发环境且配置了自动登录开关以及用户信息，使用该信息登录')
    username = import.meta.env.VITE_LOGIN_USERNAME
    password = import.meta.env.VITE_LOGIN_PASSWORD
  }
  else if (appStore.config.loginUserInfo) {
    info('检测到本地配置中开启了自动登录，使用本地配置中的用户信息')
    const loginInfo = await trpcClient.decryptLoginUser.query(
      appStore.config.loginUserInfo,
    )
    username = loginInfo.username
    password = loginInfo.password
  }
  else {
    warn('未读取到相应的用户信息，跳过自动登录')
    return
  }
  try {
    await send(username, password)
    userStore.updateUserInfoAction(data.value.data)
    userStore.updateLoginInfoAction(username, password)
    info('自动登录成功')
  }
  catch (e) {
    error('自动登录失败，跳过自动登录，原因：', e)
  }
}

const initDownload = async () => {
  const downloadStore = useDownloadStore()
  info('开始初始化下载任务')
  try {
    await downloadStore.initAction()
    info('初始化下载任务成功')
  }
  catch (e) {
    error('初始化下载任务失败，原因', e)
    throw new Error('初始化下载任务失败')
  }
}

const initData = async () => {
  const appStore = useAppStore()
  const {
    data: weekData,
    send: weekSend,
  } = useRequest(() => getWeekListApi(), {
    immediate: false,
  })

  const {
    data: categoryData,
    send: categorySend,
  } = useRequest(() => getCategoryListApi(), {
    immediate: false,
  })
  info('初始化全局数据')
  try {
    await Promise.all([
      weekSend(),
      categorySend(),
    ])
    Object.assign(appStore.data, {
      weekCategoryList: weekData.value.data.categoryList,
      weekTypeList: weekData.value.data.typeList,
    })
    Object.assign(appStore.data, {
      categoryTagList: categoryData.value.data.tagTypeList,
      categoryCategoryList: categoryData.value.data.categoryList,
    })
    info('初始化全局数据成功')
  }
  catch (e) {
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
    const appStore = useAppStore()
    // method.config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    method.config.headers.tokenparam = `${ts},${version}`
    method.config.headers.token = tokenHash
    // 设置 20 分钟缓存
    if (method.type === 'GET') {
      method.config.cacheFor = 1000 * 60 * 20
    }
    if (!appStore.isInit) {
      if (!initPromise) {
        try {
          const { promise, resolve } = Promise.withResolvers<void>()
          initPromise = promise
          ;(async () => {
            await initSetting()
            await initConfig()
            await autoLogin()
            await initDownload()
            await initData()
            resolve()
          })()
          await initPromise
          appStore.isInit = true
        }
        finally {
          initPromise = undefined
        }
      }
      else {
        const url = method.url
        if (!['setting', 'login', 'week', 'categories'].includes(url)) {
          await initPromise
        }
      }
    }
  },
  responded: {
    async onSuccess(response, method) {
      if (response.status >= 400) {
        const errorMsg = response.data.errorMsg ?? response.statusText
        error(method.url, response.status, errorMsg)
        throw new Error(errorMsg)
      }
      info(method.url, response.status)
      if (
        // 下载接口
        method.url.includes('dl_comic_zip')
        // jm 的阅读页是返回 html 填充的，必须解析 html 来获取相关数据
        || method.url.includes('chapter_view_template')
      ) {
        return response.data
      }
      const json = response.data
      if (json.code !== 200) {
        throw new Error(json.errorMsg)
      }
      json.data = JSON.parse(
        await trpcClient.decodeHttpData.query({
          data: json.data,
          key: tokenHash,
        }),
      )
      info(method.url, '解密成功')
      if (import.meta.env.DEV) {
        console.log(method.url, '解密成功', json)
      }
      return json
    },
  },
})

export default http
