<script setup lang="ts">
import useAppStore from "@/stores/use-app-store";
import useUserStore from "@/stores/use-user-store";

const userStore = useUserStore();
const appStore = useAppStore();
const userInfo = computed(() => userStore.userInfo);

const activeTabKey = ref<"collect" | "history">("collect");
const tabList = [
  {
    value: "collect",
    tab: "我的收藏",
  },
  {
    value: "history",
    tab: "历史记录",
  },
  {
    value: "comment",
    tab: "评论",
  },
];
</script>

<template>
  <v-row v-if="userInfo" :gutter="[16, 16]">
    <v-col :cols="12">
      <v-card>
        <v-card-text>
          <div class="wind-flex wind-flex-col wind-gap-4">
            <div class="wind-flex wind-flex-col wind-items-center">
              <v-avatar
                :size="120"
                :image="`${appStore.setting.imgHost}/media/users/${userInfo.avatar}`"
              >
              </v-avatar>
              <div class="text-h6">{{ userInfo.username }}</div>
            </div>
            <v-divider />
            <v-row>
              <v-col :cols="6" :sm="3">
                <div class="wind-flex wind-flex-col wind-items-center">
                  <div>经验值</div>
                  <div>
                    {{ `${userInfo.currentExp}/${userInfo.nextLevelExp}` }}
                  </div>
                </div>
              </v-col>
              <v-col :cols="6" :sm="3">
                <div class="wind-flex wind-flex-col wind-items-center">
                  <div>等级</div>
                  <div>
                    {{ `${userInfo.level[0]}（${userInfo.level[1]}）` }}
                  </div>
                </div>
              </v-col>
              <v-col :cols="6" :sm="3">
                <div class="wind-flex wind-flex-col wind-items-center">
                  <div>J Coins</div>
                  <div>
                    {{ userInfo.jCoin }}
                  </div>
                </div>
              </v-col>
              <v-col :cols="6" :sm="3">
                <div class="wind-flex wind-flex-col wind-items-center">
                  <div>可收藏数量</div>
                  <div>
                    {{ `${userInfo.collectCount}/${userInfo.maxCollectCount}` }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col :cols="12">
      <v-card>
        <v-tabs v-model:model-value="activeTabKey" bg-color="primary">
          <v-tab v-for="item of tabList" :key="item.value" :value="item.value">
            {{ item.tab }}
          </v-tab>
        </v-tabs>
        <v-card-text>
          <v-tabs-window v-model:model-value="activeTabKey">
            <v-tabs-window-item value="collect">
              <app-person-collect-comic />
            </v-tabs-window-item>
            <v-tabs-window-item value="history">
              <app-person-history-comic />
            </v-tabs-window-item>
            <v-tabs-window-item value="comment">
              <app-person-history-comment />
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped></style>
