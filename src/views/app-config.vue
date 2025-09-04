<script setup lang="ts">
import { Config } from '@electron/module/config'
import { clone } from 'radash'
import { SubmitEventPromise } from 'vuetify'

import { trpcClient } from '@/apis/ipc'
import useSnackbar from '@/compositions/use-snack-bar'
import useAppStore from '@/stores/use-app-store.ts'

const appStore = useAppStore()

const formState = reactive<
  Omit<Config, 'windowInfo' | 'loginUserInfo' | 'autoLogin'> & {
    useProxy: boolean
  }
>({
  theme: 'light',
  apiUrl: '',
  apiUrlList: [],
  readMode: 'click',
  zoomFactor: 0,
  proxyInfo: undefined,
  useProxy: false,
})

const getConfig = async () => {
  try {
    const config = await trpcClient.getConfig.query()
    await appStore.updateConfigAction(config)
    Object.assign(formState, clone(appStore.config))
    if (formState.proxyInfo) {
      formState.useProxy = true
    }
    else {
      formState.useProxy = false
    }
  }
  catch (e) {
    console.error('读取配置文件失败', e)
  }
}

const snackbar = useSnackbar()
const submit = async (e: SubmitEventPromise) => {
  const res = await e
  if (!res.valid) {
    const { errors } = res
    const [error] = errors
    snackbar.error(error.errorMessages[0])
    return
  }
  try {
    await appStore.updateConfigAction(formState, true)
    snackbar.success('更新成功')
  }
  catch (e) {
    console.error('保存配置失败', e)
  }
}

const onUseProxyChange = (useProxy: boolean) => {
  formState.useProxy = useProxy
  if (formState.useProxy) {
    formState.proxyInfo = {
      host: '',
      port: 0,
      username: '',
      password: '',
    }
  }
  else {
    formState.proxyInfo = undefined
  }
}

onMounted(() => {
  getConfig()
})
</script>

<template>
  <v-card title="软件设置">
    <v-card-text>
      <v-form validate-on="submit" @submit.prevent="submit">
        <v-row>
          <v-col :cols="12">
            <v-select
              variant="outlined"
              color="primary"
              v-model:model-value="formState.theme"
              hide-details
              label="主题设置"
              item-title="title"
              item-value="value"
              :items="[
                { title: '自动', value: 'auto' },
                { title: '日间模式', value: 'light' },
                { title: '夜间模式', value: 'dark' },
              ]"
            >
            </v-select>
          </v-col>
          <v-col :cols="12">
            <v-select
              variant="outlined"
              color="primary"
              v-model:model-value="formState.apiUrl"
              hide-details
              label="代理域名"
              placeholder="如果发现无法使用可以切换此处的域名"
              item-title="value"
              item-value="value"
              :items="formState.apiUrlList"
            >
            </v-select>
          </v-col>
          <v-col :cols="12">
            <v-select
              variant="outlined"
              color="primary"
              hide-details
              v-model:model-value="formState.readMode"
              label="阅读模式"
              item-title="text"
              item-value="value"
              :items="[
                {
                  value: 'scroll',
                  text: '竖向滚动',
                },
                {
                  value: 'click',
                  text: '按钮切换',
                },
              ]"
            ></v-select>
          </v-col>
          <v-col :cols="12">
            <v-number-input
              hide-details
              variant="outlined"
              color="primary"
              v-model:model-value="formState.zoomFactor"
              label="缩放等级"
              :min="1"
              :max="2"
              :step="0.1"
              :precision="1"
              placeholder="系统默认缩放情况下 2k 可尝试 1.4 ，4k 可尝试 1.8"
            ></v-number-input>
          </v-col>
          <v-col :cols="12">
            <v-select
              variant="outlined"
              color="primary"
              hide-details
              :model-value="formState.useProxy"
              label="代理设置"
              item-title="text"
              item-value="value"
              :items="[
                {
                  value: false,
                  text: '不使用代理',
                },
                {
                  value: true,
                  text: '使用 HTTP 代理',
                },
              ]"
              @update:model-value="onUseProxyChange"
            ></v-select>
          </v-col>
          <template v-if="formState.useProxy && formState.proxyInfo">
            <v-col :cols="6">
              <v-text-field
                variant="outlined"
                color="primary"
                hide-details
                v-model:model-value="formState.proxyInfo.host"
                label="IP"
                placeholder="一般为 127.0.0.1"
                :rules="[(value?: string) => !!value || 'IP 不能为空']"
              ></v-text-field>
            </v-col>
            <v-col :cols="6">
              <v-number-input
                variant="outlined"
                color="primary"
                hide-details
                v-model:model-value="formState.proxyInfo.port"
                label="端口"
                placeholder="V2rayN 为 10809"
                :min="0"
                :max="65535"
                :step="1"
                :precision="0"
                :rules="[(value?: number) => !!value || '端口不能为空']"
              ></v-number-input>
            </v-col>
            <v-col :cols="6">
              <v-text-field
                hide-details
                variant="outlined"
                color="primary"
                v-model:model-value="formState.proxyInfo.username"
                label="用户名"
                placeholder="一般为空"
              ></v-text-field>
            </v-col>
            <v-col :cols="6">
              <v-text-field
                hide-details
                variant="outlined"
                color="primary"
                v-model:model-value="formState.proxyInfo.password"
                label="密码"
                placeholder="一般为空"
              ></v-text-field>
            </v-col>
          </template>
          <v-col :cols="12">
            <v-btn
              variant="flat"
              size="large"
              block
              color="primary"
              type="submit"
            >
              保存
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>
