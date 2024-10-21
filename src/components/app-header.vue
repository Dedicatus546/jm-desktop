<script setup lang="ts">
import { theme } from "ant-design-vue";

import {
  closeWinIpc,
  minimizeWinIpc,
  openLinkIpc,
  updateConfigIpc,
} from "@/apis";
import useIpcRendererInvoke from "@/compositions/use-ipc-renderer-invoke";
import useAppStore from "@/stores/use-app-store";
import useUserStore from "@/stores/use-user-store";

const appStore = useAppStore();
const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);
const router = useRouter();
const { useToken } = theme;
const { token } = useToken();

const getPopupContainer = () => {
  return document.body;
};

onKeyStroke(
  "Escape",
  () => {
    router.back();
  },
  {
    dedupe: true,
  },
);

const { invoke } = useIpcRendererInvoke(
  (mode: "light" | "dark") => updateConfigIpc({ mode }),
  {
    immediate: false,
  },
);

const { invoke: cancelAutoLogin } = useIpcRendererInvoke(
  () =>
    updateConfigIpc({
      autoLogin: false,
      loginUserInfo: "",
    }),
  {
    immediate: false,
  },
);

const onModeChange = (mode: any) => {
  appStore.updateConfigAction({ mode });
  invoke(mode);
};

const logout = () => {
  userStore.logoutAction();
  cancelAutoLogin();
  router.replace({ name: "LOGIN" });
};
</script>

<template>
  <a-config-provider :get-popup-container="getPopupContainer">
    <a-layout-header class="app-header">
      <div class="text-[1.5rem] font-bold app-region-nodrag">
        <router-link to="/">
          <img src="@/assets/logo.png" class="block w-[150px]" alt="jm" />
        </router-link>
      </div>
      <div class="leading-none flex items-center gap-2 app-region-nodrag">
        <div>
          <a-switch
            :checked-value="'dark'"
            :un-checked-value="'light'"
            :checked="appStore.config.mode"
            @update:checked="onModeChange"
          >
            <template #checkedChildren>
              <svg viewBox="0 0 24 24" fill="#2d3f54">
                <path
                  d="M12.1,22c-0.3,0-0.6,0-0.9,0c-5.5-0.5-9.5-5.4-9-10.9c0.4-4.8,4.2-8.6,9-9c0.4,0,0.8,0.2,1,0.5c0.2,0.3,0.2,0.8-0.1,1.1c-2,2.7-1.4,6.4,1.3,8.4c2.1,1.6,5,1.6,7.1,0c0.3-0.2,0.7-0.3,1.1-0.1c0.3,0.2,0.5,0.6,0.5,1c-0.2,2.7-1.5,5.1-3.6,6.8C16.6,21.2,14.4,22,12.1,22zM9.3,4.4c-2.9,1-5,3.6-5.2,6.8c-0.4,4.4,2.8,8.3,7.2,8.7c2.1,0.2,4.2-0.4,5.8-1.8c1.1-0.9,1.9-2.1,2.4-3.4c-2.5,0.9-5.3,0.5-7.5-1.1C9.2,11.4,8.1,7.7,9.3,4.4z"
                ></path>
              </svg>
            </template>
            <template #unCheckedChildren>
              <svg viewBox="0 0 24 24" fill="#f7a215">
                <path
                  d="M12,18c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6S15.3,18,12,18zM12,8c-2.2,0-4,1.8-4,4c0,2.2,1.8,4,4,4c2.2,0,4-1.8,4-4C16,9.8,14.2,8,12,8z"
                ></path>
                <path
                  d="M12,4c-0.6,0-1-0.4-1-1V1c0-0.6,0.4-1,1-1s1,0.4,1,1v2C13,3.6,12.6,4,12,4z"
                ></path>
                <path
                  d="M12,24c-0.6,0-1-0.4-1-1v-2c0-0.6,0.4-1,1-1s1,0.4,1,1v2C13,23.6,12.6,24,12,24z"
                ></path>
                <path
                  d="M5.6,6.6c-0.3,0-0.5-0.1-0.7-0.3L3.5,4.9c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l1.4,1.4c0.4,0.4,0.4,1,0,1.4C6.2,6.5,5.9,6.6,5.6,6.6z"
                ></path>
                <path
                  d="M19.8,20.8c-0.3,0-0.5-0.1-0.7-0.3l-1.4-1.4c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l1.4,1.4c0.4,0.4,0.4,1,0,1.4C20.3,20.7,20,20.8,19.8,20.8z"
                ></path>
                <path
                  d="M3,13H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h2c0.6,0,1,0.4,1,1S3.6,13,3,13z"
                ></path>
                <path
                  d="M23,13h-2c-0.6,0-1-0.4-1-1s0.4-1,1-1h2c0.6,0,1,0.4,1,1S23.6,13,23,13z"
                ></path>
                <path
                  d="M4.2,20.8c-0.3,0-0.5-0.1-0.7-0.3c-0.4-0.4-0.4-1,0-1.4l1.4-1.4c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-1.4,1.4C4.7,20.7,4.5,20.8,4.2,20.8z"
                ></path>
                <path
                  d="M18.4,6.6c-0.3,0-0.5-0.1-0.7-0.3c-0.4-0.4-0.4-1,0-1.4l1.4-1.4c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-1.4,1.4C18.9,6.5,18.6,6.6,18.4,6.6z"
                ></path>
              </svg>
            </template>
          </a-switch>
        </div>
        <a-tooltip title="返回">
          <div class="app-nav-btn" @click="router.back()">
            <RollbackOutlined />
          </div>
        </a-tooltip>
        <router-link v-if="userInfo" :to="{ name: 'SIGN_IN' }">
          <a-tooltip title="每月签到">
            <div class="app-nav-btn">
              <CalendarOutlined />
            </div>
          </a-tooltip>
        </router-link>
        <router-link :to="{ name: 'SEARCH' }">
          <a-tooltip title="本子搜索">
            <div class="app-nav-btn">
              <SearchOutlined />
            </div>
          </a-tooltip>
        </router-link>
        <router-link :to="{ name: 'CATEGORY' }">
          <a-tooltip title="本子分类">
            <div class="app-nav-btn">
              <TagsOutlined />
            </div>
          </a-tooltip>
        </router-link>
        <router-link :to="{ name: 'WEEK' }">
          <a-tooltip title="每周必看">
            <div class="app-nav-btn">
              <ThunderboltOutlined />
            </div>
          </a-tooltip>
        </router-link>
        <a-dropdown>
          <div class="app-nav-btn">
            <LinkOutlined />
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item>
                <span
                  :data-href="appStore.setting.webHost"
                  @click="openLinkIpc(appStore.setting.webHost)"
                >
                  官方站点
                </span>
              </a-menu-item>
              <a-menu-item>
                <span
                  :data-href="appStore.setting.storeLink.web"
                  @click="openLinkIpc(appStore.setting.storeLink.web)"
                >
                  下载页面
                </span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
        <template v-if="userInfo">
          <router-link :to="{ name: 'PERSON' }">
            <a-tooltip title="个人中心">
              <div class="app-nav-btn">
                <UserOutlined />
              </div>
            </a-tooltip>
          </router-link>
          <a-tooltip title="退出">
            <div class="app-nav-btn" @click="logout">
              <LogoutOutlined />
            </div>
          </a-tooltip>
        </template>
        <router-link v-else :to="{ name: 'LOGIN' }">
          <a-tooltip title="登录">
            <div class="app-nav-btn">
              <LoginOutlined />
            </div>
          </a-tooltip>
        </router-link>
        <router-link :to="{ name: 'CONFIG' }">
          <a-tooltip title="设置">
            <div class="app-nav-btn">
              <SettingOutlined />
            </div>
          </a-tooltip>
        </router-link>
        <router-link :to="{ name: 'DOWNLOAD' }">
          <a-tooltip title="下载">
            <div class="app-nav-btn">
              <CloudDownloadOutlined />
            </div>
          </a-tooltip>
        </router-link>
        <div class="app-nav-btn" @click="minimizeWinIpc()">
          <MinusOutlined />
        </div>
        <div class="app-nav-btn" @click="closeWinIpc()">
          <CloseOutlined />
        </div>
      </div>
    </a-layout-header>
  </a-config-provider>
</template>

<style lang="less" scoped>
.app-header {
  background-color: v-bind("token.colorBgContainer");
  --uno: "flex items-center justify-between ps-4! pe-4! app-region-drag";

  .app-nav-btn {
    // color: v-bind("token.colorTextLightSolid");
    --uno: "p-3 cursor-pointer transition rounded-lg";

    &:hover {
      background-color: v-bind("token.colorBgTextHover");
    }
  }
  a {
    &:hover,
    &:active {
      color: inherit;
    }
  }
  .anticon {
    font-size: 18px;
  }
}
</style>
