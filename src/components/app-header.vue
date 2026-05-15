<script setup lang="ts">
import { trpcClient } from '@/apis'
import { useConfigStore } from '@/stores/use-config-store'
import useUserStore from '@/stores/use-user-store'

const configStore = useConfigStore()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
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

const logout = () => {
  userStore.logoutAction()
  configStore.updateConfigAction(
    {
      autoLogin: false,
      loginUserInfo: '',
    },
    true,
  )
  router.push({ name: 'LOGIN' })
}

const minimizeWin = () => {
  trpcClient.minimizeWin.mutate()
}

const closeWin = () => {
  trpcClient.closeWin.mutate()
}
</script>

<template>
  <v-app-bar color="primary" class="app-region-drag">
    <v-app-bar-title>
      <div class="wind-h-full wind-flex wind-items-center">
        <img
          src="@/assets/logo.png"
          class="wind-w-[150px] wind-cursor-pointer app-region-nodrag"
          alt="禁漫天堂"
          @click="router.push('/')"
        />
      </div>
    </v-app-bar-title>
    <template #append>
      <div class="app-region-nodrag">
        <template v-if="route.name !== 'CONFIG'">
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
          <template v-if="userInfo">
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
            @click="
              router.push({
                name: 'LOGIN',
              })
            "
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
          <app-header-icon-btn
            tooltip-text="关于"
            @click="
              router.push({
                name: 'ABOUT',
              })
            "
          >
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
