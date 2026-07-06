<script setup lang="ts">
import { useRequest } from 'alova/client'

import { getComicPicListApi } from '@/apis'
import useSnackbar from '@/compositions/use-snack-bar'
import { useConfigStore } from '@/stores/use-config-store'
import { useDownloadStore } from '@/stores/use-download-store'
import { log } from '@/utils/logger'

const props = withDefaults(
  defineProps<{
    comicId: number
    loading?: boolean
    chapterList: Array<{
      id: number
      name: string
    }>
    currentChapterId?: number
    comicName: string
  }>(),
  {
    loading: false,
  },
)

const configStore = useConfigStore()
const downloadStore = useDownloadStore()
const snackbar = useSnackbar()

const { data, send } = useRequest(
  (id: number) => getComicPicListApi(id, configStore.state.currentShuntKey ?? 1),
  {
    immediate: false,
    initialData: {
      list: [],
      scrambleId: 0,
      speed: '',
    },
  },
)

const downloadChapter = async (chapter: { id: number; name: string }) => {
  const item = downloadStore.downloadList.find((item) => item.comicId === chapter.id)
  if (item) {
    if (['downloading', 'pending'].includes(item.status)) {
      snackbar.warning('任务正在下载中，请勿重复点击')
    } else if (item.status === 'complete') {
      snackbar.warning('任务已下载，请勿重复点击')
      // TODO 弹窗重新下载
      // dialog({
      //   width: 300,
      //   title: '确认',
      //   content: '该漫画已下载，是否重新下载？',
      //   async onOk() {
      //     exec()
      //   },
      // })
    }
    return
  }

  const exec = async () => {
    await send(chapter.id)
    await downloadStore.addDownloadItemAction({
      belongComicId: props.comicId,
      comicId: chapter.id,
      comicName: props.comicName,
      chapterName: chapter.name,
      picUrlList: data.value.list,
      scrambleId: data.value.scrambleId,
      speed: data.value.speed,
    })
    snackbar.success('添加下载任务成功')
    log.info('添加 %s %s 下载任务', props.comicName, chapter.name)
  }

  exec()
}
</script>

<template>
  <v-row class="wind-p-1">
    <template v-if="loading">
      <v-col v-for="item of 10" :key="item" :cols="12" :lg="6">
        <div class="wind-flex wind-gap-4">
          <app-skeleten class="wind-flex-grow wind-h-[36px]" />
          <app-skeleten class="wind-h-[36px] wind-w-[100px]" />
          <app-skeleten class="wind-h-[36px] wind-w-[100px]" />
        </div>
      </v-col>
    </template>
    <template v-else>
      <v-col v-for="item of chapterList" :key="item.id" :cols="12" :lg="6">
        <router-link
          v-slot="{ navigate }"
          :to="{ name: 'COMIC_READ', params: { id: item.id } }"
          custom
        >
          <v-row density="compact" class="wind-gap-4 wind-items-center">
            <v-col class="wind-min-w-0">
              <app-scroll-wrapper>
                {{ item.name }}
              </app-scroll-wrapper>
            </v-col>
            <v-col cols="auto">
              <v-btn
                variant="flat"
                class="chapter-btn"
                :color="currentChapterId === item.id ? 'primary' : undefined"
                @click="navigate()"
              >
                <template #prepend>
                  <v-icon>
                    <i-mdi-book-open />
                  </v-icon>
                </template>
                阅读
              </v-btn>
              <!-- TODO fix -->
              <v-btn
                variant="flat"
                :color="
                  downloadStore.downloadingMap[item.id]
                    ? 'info'
                    : downloadStore.completeMap[item.id]
                      ? 'success'
                      : undefined
                "
                class="chapter-btn wind-ml-2"
                :disabled="!!downloadStore.downloadingMap[item.id]"
                @click="downloadChapter(item)"
              >
                <template #prepend>
                  <v-icon>
                    <i-mdi-loading
                      class="wind-animate-spin"
                      v-if="!!downloadStore.downloadingMap[item.id]"
                    />
                    <i-mdi-download v-else />
                  </v-icon>
                </template>
                {{
                  downloadStore.downloadingMap[item.id]
                    ? '正在下载 ' +
                      ((downloadStore.downloadingMap[item.id]!.percent * 100).toFixed(2) + '%')
                    : downloadStore.completeMap[item.id]
                      ? '已下载'
                      : '下载'
                }}
              </v-btn>
            </v-col>
          </v-row>
        </router-link>
      </v-col>
    </template>
  </v-row>
</template>

<style scoped lang="scss">
.chapter-btn {
  ::v-deep(.v-btn__content) {
    min-width: 0;
  }
}
</style>
