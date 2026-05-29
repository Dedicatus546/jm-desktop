<script setup lang="ts">
import { useRequest } from 'alova/client'
import { SubmitEventPromise } from 'vuetify'

import { loginApi, trpcClient } from '@/apis'
import useUserStore from '@/stores/use-user-store'
import { useConfigStore } from '@/stores/use-config-store'

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
    // const { errors } = res
    // const [error] = errors
    // errorMsg.value = error.errorMessages[0]
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
  await trpcClient.closeWin.mutate()
})

onError((e) => {
  const err = e.error
  errorMsg.value = (err as Error).message
})

const close = () => {
  trpcClient.closeWin.mutate()
}
</script>

<template>
  <app-provider>
    <v-main>
      <div class="wind-size-full wind-flex wind-flex-col wind-gap-12">
        <header class="wind-p-4 wind-pb-0 app-region-drag wind-flex wind-justify-end wind-z-9999">
          <div class="app-region-nodrag">
            <v-btn density="comfortable" flat icon @click="close()">
              <v-icon>
                <i-mdi-close />
              </v-icon>
            </v-btn>
          </div>
        </header>
        <div class="wind-overflow-y-auto wind-flex-grow-1 wind-p-4 wind-pt-0 wind-h-0 wind-flex">
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
                  density="compact"
                  size="small"
                  color="primary"
                  variant="outlined"
                  v-model:model-value="formState.username"
                  label="用户名"
                  placeholder="请输入用户名"
                  :rules="[(value) => !!value || '用户名不能为空']"
                ></v-text-field>
              </v-col>
              <v-col :cols="12">
                <v-text-field
                  density="compact"
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
                  density="compact"
                  size="small"
                  v-model:model-value="formState.autoLogin"
                  hide-details
                  label="自动登录"
                ></v-checkbox>
              </v-col>
              <v-col :cols="12" class="wind-mb-2">
                <v-alert border="start" density="compact" color="warning">
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
                <v-alert
                  border="start"
                  density="compact"
                  :text="errorMsg"
                  color="error"
                  variant="tonal"
                ></v-alert>
              </v-col>
              <v-col :cols="12">
                <v-btn variant="flat" :loading="loading" type="submit" block color="primary">
                  登录
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </div>
      </div>
    </v-main>
  </app-provider>
</template>

<style scoped></style>
