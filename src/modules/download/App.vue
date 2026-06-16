<script setup lang="ts">
import { DownloadItem } from '@main/module/download'

import { trpcClient } from '@/trpc'
import EMPTY_STATE_IMG_1 from '@/assets/empty-state/1.jpg'
import EMPTY_STATE_IMG_2 from '@/assets/empty-state/2.jpg'
import { useDownloadStore } from '@/stores/use-download-store'

const downloadStore = useDownloadStore()

const openFile = (item: DownloadItem) => {
  trpcClient.showItemInFolder.mutate({
    path: item.filepath,
  })
}
</script>

<template>
  <app-provider>
    <v-app-bar color="primary" class="app-region-drag">
      <v-app-bar-title>下载</v-app-bar-title>
      <template #append>
        <div class="app-region-nodrag">
          <v-btn flat icon @click="trpcClient.minimizeWindow.mutate()">
            <v-icon>
              <i-mdi-minus />
            </v-icon>
          </v-btn>
          <v-btn flat icon @click="trpcClient.closeWindow.mutate()">
            <v-icon>
              <i-mdi-close />
            </v-icon>
          </v-btn>
        </div>
      </template>
      <template #extension>
        <v-tabs
          class="app-region-nodrag"
          v-model:model-value="downloadStore.activeTabKey"
          bg-color="primary"
        >
          <v-tab value="downloading">正在下载</v-tab>
          <v-tab value="complete">下载完成</v-tab>
        </v-tabs>
      </template>
    </v-app-bar>
    <v-main>
      <div
        class="wind-h-full wind-w-full wind-overflow-y-auto wind-p-4"
        style="height: calc(100vh - var(--v-layout-top, 0px))"
      >
        <v-tabs-window v-model:model-value="downloadStore.activeTabKey">
          <v-tabs-window-item value="downloading">
            <v-table>
              <colgroup>
                <col style="width: auto" />
                <col style="min-width: 300px" />
              </colgroup>
              <thead>
                <tr>
                  <th class="text-left">名称</th>
                  <th class="text-left">状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="downloadStore.downloadingList.length === 0">
                  <td colspan="3">
                    <v-empty-state title="空空如也" :image="EMPTY_STATE_IMG_1" />
                  </td>
                </tr>
                <tr v-for="item in downloadStore.downloadingList" :key="item.id">
                  <td>
                    <template v-if="item.type === 'comic'">
                      {{ item.comicName }}
                      <template v-if="item.chapterName !== item.comicName">
                        - {{ item.chapterName }}
                      </template>
                    </template>
                  </td>
                  <td>
                    <template v-if="item.status === 'pending'"> 等待中... </template>
                    <template v-else>
                      <v-row align="center">
                        <v-col cols="auto">正在下载中</v-col>
                        <v-col>
                          <v-progress-linear
                            rounded
                            height="25"
                            color="primary"
                            :model-value="item.percent * 100"
                            size="large"
                          >
                            <template #default="{ value }">
                              <strong>{{ value.toFixed(2) }}%</strong>
                            </template>
                          </v-progress-linear>
                        </v-col>
                      </v-row>
                    </template>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-tabs-window-item>
          <v-tabs-window-item value="complete">
            <v-table>
              <colgroup>
                <col style="width: auto" />
                <col style="min-width: 300px" />
              </colgroup>
              <thead>
                <tr>
                  <th class="text-left">名称</th>
                  <th class="text-left">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="downloadStore.completeList.length === 0">
                  <td colspan="3">
                    <v-empty-state title="空空如也" :image="EMPTY_STATE_IMG_2" />
                  </td>
                </tr>
                <tr v-for="item in downloadStore.completeList" :key="item.id">
                  <td>
                    <template v-if="item.type === 'comic'">
                      {{ item.comicName }}
                      <template v-if="item.chapterName !== item.comicName">
                        - {{ item.chapterName }}
                      </template>
                    </template>
                  </td>
                  <td>
                    <v-btn variant="text" color="primary" @click="openFile(item)"> 打开文件 </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-tabs-window-item>
        </v-tabs-window>
      </div>
    </v-main>
  </app-provider>
</template>

<style scoped lang="scss"></style>
