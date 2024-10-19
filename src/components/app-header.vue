<script setup lang="ts">
import { closeWinIpc, minimizeWinIpc, openLinkIpc } from "@/apis";
import useAppStore from "@/stores/use-app-store";
import useUserStore from "@/stores/use-user-store";

const appStore = useAppStore();
const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);
const router = useRouter();

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
</script>

<template>
  <a-config-provider :get-popup-container="getPopupContainer">
    <a-layout-header
      class="app-header flex items-center justify-between ps-4! pe-4! app-region-drag"
    >
      <div class="text-[1.5rem] font-bold app-region-nodrag">
        <router-link to="/">
          <img src="@/assets/logo.png" class="block w-[150px]" alt="jm" />
        </router-link>
      </div>
      <div class="leading-none flex items-center gap-2 app-region-nodrag">
        <a-tooltip title="返回">
          <div
            class="p-3 hover:bg-[#00000008] cursor-pointer transition rounded-lg"
            @click="router.back()"
          >
            <RollbackOutlined />
          </div>
        </a-tooltip>
        <router-link v-if="userInfo" :to="{ name: 'SIGN_IN' }">
          <a-tooltip title="每月签到">
            <div
              class="p-3 hover:bg-[#00000008] cursor-pointer transition rounded-lg"
            >
              <CalendarOutlined />
            </div>
          </a-tooltip>
        </router-link>
        <router-link :to="{ name: 'SEARCH' }">
          <a-tooltip title="本子搜索">
            <div
              class="p-3 hover:bg-[#00000008] cursor-pointer transition rounded-lg"
            >
              <SearchOutlined />
            </div>
          </a-tooltip>
        </router-link>
        <router-link :to="{ name: 'CATEGORY' }">
          <a-tooltip title="本子分类">
            <div
              class="p-3 hover:bg-[#00000008] cursor-pointer transition rounded-lg"
            >
              <TagsOutlined />
            </div>
          </a-tooltip>
        </router-link>
        <a-dropdown>
          <div
            class="p-3 hover:bg-[#00000008] cursor-pointer transition rounded-lg"
          >
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
              <div
                class="p-3 hover:bg-[#00000008] cursor-pointer transition rounded-lg"
              >
                <UserOutlined />
              </div>
            </a-tooltip>
          </router-link>
          <a-tooltip title="退出">
            <div
              class="p-3 hover:bg-[#00000008] cursor-pointer transition rounded-lg"
              @click="
                userStore.logoutAction();
                router.push({ name: 'LOGIN' });
              "
            >
              <LogoutOutlined />
            </div>
          </a-tooltip>
        </template>
        <router-link v-else :to="{ name: 'LOGIN' }">
          <a-tooltip title="登录">
            <div
              class="p-3 hover:bg-[#00000008] cursor-pointer transition rounded-lg"
            >
              <LoginOutlined />
            </div>
          </a-tooltip>
        </router-link>
        <router-link :to="{ name: 'CONFIG' }">
          <a-tooltip title="设置">
            <div
              class="p-3 hover:bg-[#00000008] cursor-pointer transition rounded-lg"
            >
              <SettingOutlined />
            </div>
          </a-tooltip>
        </router-link>
        <router-link :to="{ name: 'DOWNLOAD' }">
          <a-tooltip title="下载">
            <div
              class="p-3 hover:bg-[#00000008] cursor-pointer transition rounded-lg"
            >
              <CloudDownloadOutlined />
            </div>
          </a-tooltip>
        </router-link>
        <div
          class="p-3 hover:bg-[#00000008] cursor-pointer transition rounded-lg"
          @click="minimizeWinIpc()"
        >
          <MinusOutlined />
        </div>
        <div
          class="p-3 hover:bg-[#00000008] cursor-pointer transition rounded-lg"
          @click="closeWinIpc()"
        >
          <CloseOutlined />
        </div>
      </div>
    </a-layout-header>
  </a-config-provider>
</template>

<style lang="less" scoped>
.app-header {
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
