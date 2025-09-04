<script setup lang="ts">
import { useRequest } from 'alova/client'
import { SubmitEventPromise } from 'vuetify'

import { loginApi, trpcClient } from '@/apis'
import useSnackbar from '@/compositions/use-snack-bar'
import useAppStore from '@/stores/use-app-store'
import useUserStore from '@/stores/use-user-store'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const formState = reactive({
  username: '',
  password: '',
  autoLogin: false,
})

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
  if (!res.valid) {
    const { errors } = res
    const [error] = errors
    snackbar.error(error.errorMessages[0])
    return
  }
  send()
}

const snackbar = useSnackbar()

onSuccess(async () => {
  snackbar.primary('登录成功')
  userStore.updateUserInfoAction(data.value.data)
  userStore.updateLoginInfoAction(formState.username, formState.password)
  if (formState.autoLogin) {
    const encryptStr = await trpcClient.encryptLoginUser.query({
      username: formState.username,
      password: formState.password,
    })
    appStore.updateConfigAction(
      {
        loginUserInfo: encryptStr,
        autoLogin: true,
      },
      true,
    )
  }
  else {
    appStore.updateConfigAction(
      {
        loginUserInfo: '',
        autoLogin: false,
      },
      true,
    )
  }
  router.replace({ name: 'PERSON' })
})

onError((e) => {
  snackbar.error((e.error as Error).message)
})
</script>

<template>
  <v-card title="登录到">
    <v-card-text>
      <v-form validate-on="submit" :disabled="loading" @submit.prevent="submit">
        <v-row>
          <v-col :cols="12">
            <v-text-field
              variant="outlined"
              hide-details
              v-model:model-value="formState.username"
              label="用户名"
              placeholder="请输入用户名"
              :rules="[(value) => !!value || '用户名不能为空']"
            ></v-text-field>
          </v-col>
          <v-col :cols="12">
            <v-text-field
              variant="outlined"
              hide-details
              v-model:model-value="formState.password"
              label="密码"
              placeholder="请输入密码"
              type="password"
              :rules="[(value) => !!value || '密码不能为空']"
            ></v-text-field>
          </v-col>
          <v-col :cols="12">
            <v-checkbox
              v-model:model-value="formState.autoLogin"
              density="compact"
              hide-details
              label="自动登录"
            ></v-checkbox>
          </v-col>
          <v-col :cols="12">
            <v-alert
              border="start"
              density="compact"
              title="警告"
              type="warning"
            >
              <template #text>
                <div class="wind-py-2 wind-flex wind-flex-col wind-gap-2">
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
          <v-col :cols="12">
            <v-btn
              variant="flat"
              :loading="loading"
              type="submit"
              size="large"
              block
              color="primary"
            >
              登录
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>
