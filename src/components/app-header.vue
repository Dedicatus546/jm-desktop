<script setup lang="ts">
import { trpcClient } from '@/apis'
import useSnackbar from '@/compositions/use-snack-bar'
import { useConfigStore } from '@/stores/use-config-store'
import useUserStore from '@/stores/use-user-store'

const snackbar = useSnackbar()
const configStore = useConfigStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

onKeyStroke(
  'Escape',
  () => {
    if (route.name !== 'CONFIG') {
      router.back()
    }
  },
  {
    dedupe: true,
  },
)

const logout = async () => {
  await userStore.updateUserAction(null)
  await configStore.updateConfigAction({
    loginUserInfo: '',
  })
  if (route.name === 'PERSON') {
    toHome()
  }
  snackbar.success('退出成功')
}

const minimizeWin = () => {
  trpcClient.minimizeWindow.mutate()
}

const closeWin = () => {
  trpcClient.closeWindow.mutate()
}

const toHome = () => {
  if (['CONFIG', 'LOGIN'].every((item) => route.name !== item)) {
    router.push({
      name: 'HOME',
    })
  }
}
</script>

<template>
  <v-app-bar color="primary" class="app-region-drag">
    <v-app-bar-title>
      <div class="wind-h-full wind-flex wind-items-center">
        <img
          src="@/assets/logo.png"
          class="wind-w-[150px] app-region-nodrag"
          :class="{
            'wind-cursor-pointer': ['CONFIG', 'LOGIN'].every((item) => route.name !== item),
          }"
          alt="禁漫天堂"
          @click="toHome"
        />
      </div>
    </v-app-bar-title>
    <template #append>
      <div class="app-region-nodrag">
        <template v-if="route.name && ['CONFIG', 'LOGIN'].every((item) => route.name !== item)">
          <app-header-icon-btn tooltip-text="返回" @click="router.back()">
            <v-icon>
              <i-mdi-arrow-u-left-top />
            </v-icon>
          </app-header-icon-btn>
          <app-header-icon-btn
            v-if="userStore.isLogin"
            tooltip-text="每月签到"
            @click="
              router.push({
                name: 'SIGN_IN',
              })
            "
          >
            <v-icon>
              <i-mdi-calendar-month />
            </v-icon>
          </app-header-icon-btn>
          <template v-if="userStore.isLogin">
            <app-header-icon-btn
              tooltip-text="个人中心"
              @click="
                router.push({
                  name: 'PERSON',
                })
              "
            >
              <v-icon>
                <i-mdi-account />
              </v-icon>
            </app-header-icon-btn>
            <app-header-icon-btn tooltip-text="退出" @click="logout">
              <v-icon>
                <i-mdi-logout />
              </v-icon>
            </app-header-icon-btn>
          </template>
          <app-header-icon-btn
            v-else
            tooltip-text="登录"
            @click="trpcClient.openLoginWindow.query()"
          >
            <v-icon>
              <i-mdi-login />
            </v-icon>
          </app-header-icon-btn>
          <app-header-icon-btn tooltip-text="设置" @click="trpcClient.openSettingWindow.query()">
            <v-icon>
              <i-mdi-cog />
            </v-icon>
          </app-header-icon-btn>
          <app-header-icon-btn
            tooltip-text="下载"
            @click="
              router.push({
                name: 'DOWNLOAD',
              })
            "
          >
            <v-icon>
              <i-mdi-download />
            </v-icon>
          </app-header-icon-btn>
          <app-header-icon-btn tooltip-text="关于" @click="trpcClient.openAboutWindow.query()">
            <v-icon>
              <i-mdi-information />
            </v-icon>
          </app-header-icon-btn>
        </template>
        <app-header-icon-btn tooltip-text="最小化" @click="minimizeWin()">
          <v-icon>
            <i-mdi-minus />
          </v-icon>
        </app-header-icon-btn>
        <app-header-icon-btn tooltip-text="关闭" @click="closeWin()">
          <v-icon>
            <i-mdi-close />
          </v-icon>
        </app-header-icon-btn>
      </div>
    </template>
  </v-app-bar>
</template>
