<script setup lang="ts">
import useAppStore from "@/stores/use-app-store";
import useUserStore from "@/stores/use-user-store";

const appStore = useAppStore();
const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);
const router = useRouter();

const minus = () => {
  ipcRenderer.minimizeWin();
};

const close = () => {
  ipcRenderer.closeWin();
};

const openLink = (link: string) => {
  ipcRenderer.send("app/openLink", link);
};
</script>

<template>
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
      <a-dropdown>
        <div
          class="p-3 hover:bg-[#00000008] cursor-pointer transition rounded-lg"
        >
          <LinkOutlined />
        </div>
        <template #overlay>
          <a-menu>
            <!-- TODO -->
            <!-- ipcMain shell.openExternal(url) -->
            <a-menu-item>
              <span
                :data-href="appStore.setting.webHost"
                @click="openLink(appStore.setting.webHost)"
              >
                官方站点
              </span>
            </a-menu-item>
            <a-menu-item>
              <span
                :data-href="appStore.setting.storeLink.web"
                @click="openLink(appStore.setting.storeLink.web)"
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
        @click="minus"
      >
        <MinusOutlined />
      </div>
      <div
        class="p-3 hover:bg-[#00000008] cursor-pointer transition rounded-lg"
        @click="close"
      >
        <CloseOutlined />
      </div>
    </div>
  </a-layout-header>
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
