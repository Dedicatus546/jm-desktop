<script setup lang="ts">
import { usePrefetchDataStore } from '@/stores/use-prefetch-data-store'
import useUserStore from '@/stores/use-user-store'

const userStore = useUserStore()
const prefetchDataStore = usePrefetchDataStore()

const activeTabKey = ref<'collect' | 'history'>('collect')
const tabList = [
  {
    value: 'collect',
    tab: '我的收藏',
  },
  {
    value: 'history',
    tab: '历史记录',
  },
  {
    value: 'comment',
    tab: '评论',
  },
]
</script>

<template>
  <v-row v-if="userStore.isLogin" :gutter="[16, 16]">
    <v-col :cols="12">
      <v-card>
        <v-card-text>
          <div class="wind-flex wind-flex-col wind-gap-4">
            <div class="wind-flex wind-flex-col wind-items-center">
              <v-avatar
                :size="120"
                :image="`${prefetchDataStore.state.imgHost}/media/users/${userStore.state.avatar}`"
              >
              </v-avatar>
              <div class="wind-text-xl">{{ userStore.state.username }}</div>
            </div>
            <v-divider />
            <v-row>
              <v-col :cols="6" :sm="3">
                <div class="wind-flex wind-flex-col wind-items-center">
                  <div>经验值</div>
                  <div>
                    {{ `${userStore.state.currentExp}/${userStore.state.nextLevelExp}` }}
                  </div>
                </div>
              </v-col>
              <v-col :cols="6" :sm="3">
                <div class="wind-flex wind-flex-col wind-items-center">
                  <div>等级</div>
                  <div>
                    {{ `${userStore.state.level[0]}（${userStore.state.level[1]}）` }}
                  </div>
                </div>
              </v-col>
              <v-col :cols="6" :sm="3">
                <div class="wind-flex wind-flex-col wind-items-center">
                  <div>J Coins</div>
                  <div>
                    {{ userStore.state.jCoin }}
                  </div>
                </div>
              </v-col>
              <v-col :cols="6" :sm="3">
                <div class="wind-flex wind-flex-col wind-items-center">
                  <div>可收藏数量</div>
                  <div>
                    {{ `${userStore.state.collectCount}/${userStore.state.maxCollectCount}` }}
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
