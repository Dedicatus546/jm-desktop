<script setup lang="ts">
import { useRequest } from 'alova/client'
import { SubmitEventPromise } from 'vuetify'

import { loginApi } from '@/apis'
import useUserStore from '@/stores/use-user-store'
import { useConfigStore } from '@/stores/use-config-store'
import { trpcClient } from '@/trpc'

const userStore = useUserStore()
const configStore = useConfigStore()

const formState = reactive({
  username: '',
  password: '',
  autoLogin: false,
})
const errorMsg = ref('')

const { loading, data, onSuccess, onError, send } = useRequest(
  () =>
    loginApi({
      username: formState.username,
      password: formState.password,
    }),
  {
    immediate: false,
  },
)

const submit = async (e: SubmitEventPromise) => {
  const res = await e
  errorMsg.value = ''
  if (!res.valid) {
    const { errors } = res
    const [error] = errors
    errorMsg.value = error.errorMessages[0]
    return
  }
  send()
}

onSuccess(async () => {
  await userStore.updateUserAction(data.value.data)
  await trpcClient.notifyMessage.mutate({
    type: 'success',
    message: '登录成功',
  })
  if (formState.autoLogin) {
    const encryptStr = await trpcClient.encryptLoginUser.query({
      username: formState.username,
      password: formState.password,
    })
    await configStore.updateConfigAction({
      loginUserInfo: encryptStr,
    })
  } else {
    await configStore.updateConfigAction({
      loginUserInfo: '',
    })
  }
  await trpcClient.closeWindow.mutate()
  // TODO 这里可能需要聚焦到主窗口
})

onError((e) => {
  const err = e.error
  errorMsg.value = (err as Error).message
})
</script>

<template>
  <app-provider>
    <v-app-bar color="primary" class="app-region-drag">
      <v-app-bar-title>登录</v-app-bar-title>
      <template #append>
        <div class="app-region-nodrag">
          <v-btn flat icon @click="trpcClient.minimizeWindow.mutate()">
            <v-icon>
              <i-mdi-minus />
            </v-icon>
          </v-btn>
          <v-btn flat icon @click="trpcClient.closeWindow.mutate()">
            <v-icon>
              <i-mdi-close />
            </v-icon>
          </v-btn>
        </div>
      </template>
    </v-app-bar>
    <v-main>
      <div
        class="wind-h-full wind-w-full wind-overflow-y-auto wind-p-4 wind-pb-0"
        style="height: calc(100vh - var(--v-layout-top, 0px) - 76px)"
      >
        <v-form validate-on="submit" :disabled="loading" @submit.prevent="submit">
          <v-row gap="5">
            <v-col :cols="12" class="wind-mb-4">
              <div class="wind-select-none wind-h-full wind-flex wind-justify-center">
                <img
                  src="@/assets/logo.png"
                  draggable="false"
                  class="wind-w-2/3 app-region-nodrag"
                  alt="禁漫天堂"
                />
              </div>
            </v-col>
            <v-col :cols="12">
              <v-text-field
                hide-details
                size="small"
                color="primary"
                variant="outlined"
                v-model:model-value="formState.username"
                label="用户名"
                placeholder="请输入用户名"
                :rules="[(value) => !!value || '用户名不能为空']"
              ></v-text-field>
            </v-col>
            <v-col :cols="12" class="wind-mt-4">
              <v-text-field
                hide-details
                color="primary"
                variant="outlined"
                v-model:model-value="formState.password"
                label="密码"
                placeholder="请输入密码"
                type="password"
                :rules="[(value) => !!value || '密码不能为空']"
              ></v-text-field>
            </v-col>
            <v-col :cols="12">
              <v-checkbox
                size="small"
                v-model:model-value="formState.autoLogin"
                hide-details
                label="自动登录"
              ></v-checkbox>
            </v-col>
            <v-col :cols="12">
              <v-alert border="start" color="warning">
                <template #text>
                  <div class="wind-py-1 wind-flex wind-flex-col wind-gap-1 wind-text-sm">
                    <div>
                      1.自动登录会使用对称加密的方式将你的账号和密码写在本地，如果不希望这么做请勿开启。
                    </div>
                    <div>
                      2.建议在官方web站上修改密码（比如通过谷歌生成随机密码）后再开启此功能。
                    </div>
                  </div>
                </template>
              </v-alert>
            </v-col>
            <v-col :cols="12" class="wind-mb-2" v-if="errorMsg">
              <v-alert border="start" color="error" variant="tonal">
                <template #text>
                  <div class="wind-text-truncate" :title="errorMsg">
                    {{ errorMsg }}
                  </div>
                </template>
              </v-alert>
            </v-col>
            <div class="wind-absolute wind-bottom-0 wind-left-0 wind-right-0 wind-p-4">
              <v-btn
                variant="flat"
                size="large"
                :loading="loading"
                type="submit"
                block
                color="primary"
              >
                登录
              </v-btn>
            </div>
          </v-row>
        </v-form>
      </div>
    </v-main>
  </app-provider>
</template>

<style scoped></style>
