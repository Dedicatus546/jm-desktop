<script setup lang="ts">
import useAppStore from "@/stores/use-app-store";
import useUserStore from "@/stores/use-user-store";

const userStore = useUserStore();
const appStore = useAppStore();
const userInfo = computed(() => userStore.userInfo);

const activeTabKey = ref<"collect" | "history">("collect");
const tabList = [
  {
    key: "collect",
    tab: "我的收藏",
  },
  {
    key: "history",
    tab: "历史记录",
  },
];
</script>

<template>
  <a-row v-if="userInfo" :gutter="[16, 16]">
    <a-col :span="24">
      <a-card>
        <a-flex vertical align="center">
          <a-flex vertical :gap="8" align="center">
            <a-avatar
              :size="120"
              :src="`${appStore.setting.imgHost}/media/users/${userInfo.avatar}`"
            >
              <template #icon>
                <AntDesignOutlined />
              </template>
            </a-avatar>
            <a-typography-title :level="3">
              {{ userInfo.username }}
            </a-typography-title>
          </a-flex>
          <a-divider />
          <a-row class="self-stretch">
            <a-col :span="6">
              <a-statistic
                class="flex flex-col items-center"
                title="经验值"
                :value="`${userInfo.currentExp}/${userInfo.nextLevelExp}`"
              />
            </a-col>
            <a-col :span="6">
              <a-statistic
                class="flex flex-col items-center"
                title="等级"
                :value="`${userInfo.level[0]}（${userInfo.level[1]}）`"
              />
            </a-col>
            <a-col :span="6">
              <a-statistic
                class="flex flex-col items-center"
                title="J Coins"
                :value="userInfo.jCoin + ''"
              />
            </a-col>
            <a-col :span="6">
              <a-statistic
                class="flex flex-col items-center"
                title="可收藏数量"
                :value="`${userInfo.collectCount}/${userInfo.maxCollectCount}`"
              />
            </a-col>
          </a-row>
        </a-flex>
      </a-card>
    </a-col>
    <a-col :span="24">
      <a-card
        :tab-list="tabList"
        :active-tab-key="activeTabKey"
        @tab-change="(key) => (activeTabKey = key as any)"
      >
        <app-person-collect-comic v-if="activeTabKey === 'collect'" />
        <app-person-history-comic v-else-if="activeTabKey === 'history'" />
      </a-card>
    </a-col>
  </a-row>
</template>

<style scoped></style>
