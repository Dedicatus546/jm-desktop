<script setup lang="ts">
import { SubmitEventPromise } from 'vuetify'

import useSnackbar from '@/compositions/use-snack-bar'
import { Config } from '@type/index'
import { useConfigStore } from '@/stores/use-config-store'
import { trpcClient } from '@/apis'
import { error } from '@/utils/logger'

useTitle('设置 - 禁漫❤天堂')

const configStore = useConfigStore()

const formState = reactive<
  Omit<Config, 'windowInfoMap' | 'loginUserInfo' | 'autoLogin'> & {
    useProxy: boolean
  }
>({
  theme: 'light',
  apiUrl: '',
  apiUrlList: [],
  readMode: 'click',
  zoomFactor: 0,
  proxyInfo: null,
  currentShuntKey: null,
  useProxy: false,
})
const errorMsg = ref('')
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
    await configStore.updateConfigAction(formState)
    await trpcClient.notifyMessage.mutate({
      type: 'success',
      message: '保存成功',
    })
    await trpcClient.closeWindow.mutate()
  } catch (err) {
    errorMsg.value = (err as Error).message
    error('保存配置失败', e)
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
  } else {
    formState.proxyInfo = null
  }
}

onMounted(() => {
  formState.theme = configStore.state.theme
  formState.apiUrl = configStore.state.apiUrl
  formState.apiUrlList = configStore.state.apiUrlList
  formState.readMode = configStore.state.readMode
  formState.zoomFactor = configStore.state.zoomFactor
  formState.proxyInfo = configStore.state.proxyInfo
  formState.currentShuntKey = configStore.state.currentShuntKey
  formState.useProxy = !!formState.proxyInfo
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
              label="接口域名"
              placeholder="如果发现无法使用可以切换此处的域名"
              item-title="value"
              item-value="value"
              :items="formState.apiUrlList"
            >
              <template #menu-footer>
                <v-divider />
                <div class="wind-flex wind-items-center wind-p-3">
                  <app-refresh-api-btn />
                </div>
              </template>
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
          <v-col :cols="12" v-if="errorMsg">
            <v-alert :text="errorMsg" type="error" variant="tonal"></v-alert>
          </v-col>
          <v-col :cols="12">
            <v-btn variant="flat" size="large" block color="primary" type="submit"> 保存 </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>
