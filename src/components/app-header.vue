<script setup lang="ts">
import { useTheme } from "vuetify";

import { trpcClient } from "@/apis";
import useAppStore from "@/stores/use-app-store";
import useUserStore from "@/stores/use-user-store";

defineProps<{
  simple: boolean;
}>();

const appStore = useAppStore();
const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);
const router = useRouter();
const gTheme = useTheme();

onKeyStroke(
  "Escape",
  () => {
    router.back();
  },
  {
    dedupe: true,
  },
);

const changeMode = (theme: "dark" | "light") => {
  appStore.updateConfigAction({ theme }, true);
  gTheme.global.name.value = theme;
};

const logout = () => {
  userStore.logoutAction();
  appStore.updateConfigAction(
    {
      autoLogin: false,
      loginUserInfo: "",
    },
    true,
  );
  router.push({ name: "LOGIN" });
};

const minimizeWin = () => {
  trpcClient.minimizeWin.query();
};

const closeWin = () => {
  trpcClient.closeWin.query();
};
</script>

<template>
  <v-app-bar color="primary" class="app-region-drag">
    <v-app-bar-title>
      <img
        src="@/assets/logo.png"
        class="wind-w-[150px] wind-cursor-pointer app-region-nodrag"
        alt="jm"
        @click="router.push('/')"
      />
    </v-app-bar-title>
    <template #append>
      <div class="app-region-nodrag">
        <template v-if="!simple">
          <app-header-icon-btn
            tooltip-text="返回"
            icon="mdi-arrow-u-left-top"
            @click="router.back()"
          />
          <app-header-icon-btn
            :tooltip-text="`切换${appStore.config.theme === 'dark' ? '日间模式' : '夜间模式'}`"
            icon="mdi-swap-horizontal"
            @click="
              changeMode(appStore.config.theme === 'dark' ? 'light' : 'dark')
            "
          />
          <app-header-icon-btn
            tooltip-text="每月签到"
            icon="mdi-calendar-month"
            @click="
              router.push({
                name: 'SIGN_IN',
              })
            "
          />
          <app-header-icon-btn
            tooltip-text="本子搜索"
            icon="mdi-magnify"
            @click="
              router.push({
                name: 'SEARCH',
              })
            "
          />
          <app-header-icon-btn
            tooltip-text="本子分类"
            icon="mdi-tag"
            @click="
              router.push({
                name: 'CATEGORY',
              })
            "
          />
          <app-header-icon-btn
            tooltip-text="每周必看"
            icon="mdi-eye"
            @click="
              router.push({
                name: 'WEEK',
              })
            "
          />
          <v-menu>
            <template #activator="{ props }">
              <v-btn v-bind="props" icon="mdi-link"></v-btn>
            </template>
            <v-list>
              <v-list-item
                @click="
                  trpcClient.openLink.query({ url: appStore.setting.webHost })
                "
              >
                <v-list-item-title>官方站点</v-list-item-title>
              </v-list-item>
              <v-list-item
                @click="
                  trpcClient.openLink.query({
                    url: appStore.setting.storeLink.web,
                  })
                "
              >
                <v-list-item-title>下载页面</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <template v-if="userInfo">
            <app-header-icon-btn
              tooltip-text="个人中心"
              icon="mdi-account"
              @click="
                router.push({
                  name: 'PERSON',
                })
              "
            />
            <app-header-icon-btn
              tooltip-text="退出"
              icon="mdi-logout"
              @click="logout"
            />
          </template>
          <app-header-icon-btn
            v-else
            tooltip-text="登录"
            icon="mdi-login"
            @click="
              router.push({
                name: 'LOGIN',
              })
            "
          />
        </template>
        <app-header-icon-btn
          tooltip-text="设置"
          icon="mdi-cog"
          @click="
            router.push({
              name: 'CONFIG',
            })
          "
        />
        <app-header-icon-btn
          tooltip-text="关于"
          icon="mdi-information"
          @click="
            router.push({
              name: 'ABOUT',
            })
          "
        />
        <app-header-icon-btn
          tooltip-text="最小化"
          icon="mdi-minus"
          @click="minimizeWin()"
        />
        <app-header-icon-btn
          tooltip-text="关闭"
          icon="mdi-close"
          @click="closeWin()"
        />
      </div>
    </template>
  </v-app-bar>
</template>

<style lang="less" scoped></style>
