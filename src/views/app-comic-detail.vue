<script setup lang="ts">
import { breakpointsAntDesign } from '@vueuse/core'
import { useRequest } from 'alova/client'

import { collectComicApi, getComicDetailApi, getComicPicListApi, likeComicApi } from '@/apis'
import useSnackbar from '@/compositions/use-snack-bar'
import { log } from '@/utils/logger'
import { useDownloadStore } from '@/stores/use-download-store'
import useUserStore from '@/stores/use-user-store'
import { useConfigStore } from '@/stores/use-config-store'
import { usePrefetchDataStore } from '../stores/use-prefetch-data-store'

const props = defineProps<{
  id: number
}>()
const snackbar = useSnackbar()
const configStore = useConfigStore()
const prefetchDataStore = usePrefetchDataStore()
const userStore = useUserStore()
const downloadStore = useDownloadStore()
const breakpoints = useBreakpoints(breakpointsAntDesign)
const isGreaterMd = breakpoints.greater('md')
const buttonCols = computed(() => {
  if (!userStore.isLogin) {
    return [12, 12, 12, 12]
  }
  if (isGreaterMd.value) {
    return [12, 12, 6, 6]
  }
  return [12, 12, 12, 12]
})

const {
  loading,
  data: comicInfo,
  onSuccess,
  error,
  send,
} = useRequest(() => getComicDetailApi(props.id))

watch(
  () => props.id,
  () => {
    send()
  },
)

const activeTabKey = ref<'relevant' | 'comment' | 'chapter'>('relevant')
const tabList = computed(() => {
  const list = [
    {
      value: 'relevant',
      tab: '相关漫画',
    },
    {
      value: 'comment',
      tab:
        comicInfo.value && comicInfo.value.data.commentCount > 0
          ? comicInfo.value.data.commentCount + '条评论'
          : '评论',
    },
  ]
  if (loading.value || !comicInfo.value) {
    return list
  }
  if (comicInfo.value.data.seriesList.length > 1) {
    list.unshift({
      value: 'chapter',
      tab: '目录',
    })
  }
  return list
})

onSuccess(() => {
  if (comicInfo.value.data.seriesList.length > 1) {
    activeTabKey.value = 'chapter'
  }
})

const currentSeriesName = computed(() => {
  if (comicInfo.value.data.currentSeriesId && comicInfo.value.data.seriesList.length > 1) {
    const item = comicInfo.value.data.seriesList.find(
      (item) => item.id === comicInfo.value.data.currentSeriesId,
    )
    return item?.name
  }
  return undefined
})

const {
  loading: likeComicLoading,
  send: likeComic,
  onSuccess: likeComicOnSuccess,
  data: likeComicData,
} = useRequest(() => likeComicApi(props.id), {
  immediate: false,
})

likeComicOnSuccess(() => {
  comicInfo.value.data.isLike = true
  snackbar.primary(likeComicData.value.data.msg)
})

const {
  loading: collectComicLoading,
  send: collectComic,
  onSuccess: collectComicSuccess,
  data: collectComicData,
} = useRequest(() => collectComicApi(props.id), {
  immediate: false,
})

collectComicSuccess(() => {
  comicInfo.value.data.isCollect = true
  snackbar.primary(collectComicData.value.data.msg)
})

const toQuickQueryPage = (query: string) => {
  return { name: 'QUICK_SEARCH', query: { query } }
}

const cover = computed(() =>
  import.meta.env.VITE_NSFW === 'on'
    ? '/360x640.svg'
    : `${prefetchDataStore.state.imgHost}/media/albums/${comicInfo.value.data.id}_3x4.jpg`,
)

const { data, send: getComicPicList } = useRequest(
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

const id = computed(() =>
  // TODO 这里 currentSeriesId 似乎不会根据点击阅读而记录
  // 目前只会指向第一话
  // 似乎还缺少接口？
  comicInfo.value.data.currentSeriesId > 0
    ? comicInfo.value.data.currentSeriesId
    : comicInfo.value.data.id,
)
const item = computed(() => downloadStore.downloadList.find((item) => item.comicId === id.value))

const download = async () => {
  const chapterName = currentSeriesName.value ?? comicInfo.value.data.name
  const item = downloadStore.downloadList.find((item) => item.comicId === id.value)
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
    await getComicPicList(id.value)
    await downloadStore.addDownloadItemAction({
      belongComicId: id.value,
      comicId: id.value,
      comicName: comicInfo.value.data.name,
      chapterName,
      picUrlList: data.value.list,
      scrambleId: data.value.scrambleId,
      speed: data.value.speed,
    })
    snackbar.success('添加下载任务成功')
    log.info('添加 %s %s 下载任务', comicInfo.value.data.name, chapterName)
  }
  exec()
}

const retry = () => {
  error.value = undefined
  send()
}
</script>

<template>
  <app-error :error="error" v-if="error" @retry="retry" />
  <v-row v-else>
    <v-col :cols="12">
      <v-card :loading="loading">
        <v-card-text>
          <app-comic-detail-skeleten v-if="loading" />
          <div class="wind-flex wind-gap-4" v-else>
            <div class="wind-flex-shrink-0 wind-max-w-[300px] wind-min-w-[200px] wind-w-1/4">
              <v-card variant="text">
                <v-img :aspect-ratio="3 / 4" cover alt="" :src="cover" />
              </v-card>
            </div>
            <div class="wind-leading-6 wind-flex wind-flex-grow wind-flex-col wind-gap-4">
              <div class="wind-flex wind-flex-col wind-gap-2">
                <div class="wind-text-xl">{{ comicInfo.data.name }}</div>
                <div
                  class="wind-flex wind-flex-wrap wind-gap-2"
                  v-if="comicInfo.data.tagList.length > 0"
                >
                  <router-link
                    custom
                    v-slot="{ navigate }"
                    v-for="item of comicInfo.data.tagList"
                    :key="item"
                    :to="toQuickQueryPage(item)"
                  >
                    <v-chip color="primary" @click="navigate()">{{ item }}</v-chip>
                  </router-link>
                </div>
              </div>
              <div>
                <v-row density="compact" class="wind-gap-2">
                  <v-col v-if="comicInfo.data.authorList.length > 0" :cols="12">
                    <div class="wind-flex">
                      <div class="wind-text-nowrap">作者：</div>
                      <div class="wind-flex wind-flex-wrap wind-gap-2">
                        <router-link
                          custom
                          v-slot="{ navigate }"
                          v-for="item of comicInfo.data.authorList"
                          :key="item"
                          :to="toQuickQueryPage(item)"
                        >
                          <span class="wind-cursor-pointer wind-font-bold" @click="navigate">
                            {{ item }}
                          </span>
                        </router-link>
                      </div>
                    </div>
                  </v-col>
                  <v-col :cols="12">
                    <div class="wind-flex wind-gap-1">
                      <div class="wind-text-nowrap">车牌：</div>
                      <div>
                        <span class="wind-font-bold"> JM{{ comicInfo.data.id }} </span>
                      </div>
                    </div>
                  </v-col>
                  <v-col :cols="12">
                    <div class="wind-flex">
                      <div class="wind-text-nowrap">喜欢人数：</div>
                      <div>{{ comicInfo.data.likeCount }}人</div>
                    </div>
                  </v-col>
                  <v-col v-if="comicInfo.data.workList.length > 0" :cols="12">
                    <div class="wind-flex wind-gap-1">
                      <div class="wind-leading-[30px] wind-h-[30px] wind-text-nowrap">作品：</div>
                      <div class="wind-flex wind-flex-wrap wind-gap-2">
                        <router-link
                          custom
                          v-slot="{ navigate }"
                          v-for="item of comicInfo.data.workList"
                          :key="item"
                          :to="toQuickQueryPage(item)"
                        >
                          <v-chip color="primary" @click="navigate()">{{ item }}</v-chip>
                        </router-link>
                      </div>
                    </div>
                  </v-col>
                  <v-col v-if="comicInfo.data.roleList.length > 0" :cols="12">
                    <div class="wind-flex wind-gap-1">
                      <div class="wind-leading-[30px] wind-h-[30px] wind-text-nowrap">
                        登场人物：
                      </div>
                      <div class="wind-flex wind-flex-wrap wind-gap-2">
                        <router-link
                          custom
                          v-slot="{ navigate }"
                          v-for="item of comicInfo.data.roleList"
                          :key="item"
                          :to="toQuickQueryPage(item)"
                        >
                          <v-chip color="primary" @click="navigate()">{{ item }}</v-chip>
                        </router-link>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>
              <div class="wind-mt-auto">
                <v-row>
                  <v-col :cols="buttonCols[0]">
                    <router-link
                      v-slot="{ navigate }"
                      :to="{ name: 'COMIC_READ', params: { id } }"
                      custom
                    >
                      <v-btn color="primary" variant="flat" size="large" block @click="navigate()">
                        <template #prepend>
                          <v-icon>
                            <i-mdi-book-open />
                          </v-icon>
                        </template>
                        {{
                          comicInfo.data.currentSeriesId
                            ? '从' + currentSeriesName + '阅读'
                            : '阅读'
                        }}
                      </v-btn>
                    </router-link>
                  </v-col>
                  <v-col :cols="buttonCols[1]">
                    <v-btn
                      :color="
                        item?.status === 'downloading'
                          ? 'info'
                          : item?.status === 'complete'
                            ? 'success'
                            : 'primary'
                      "
                      variant="flat"
                      size="large"
                      block
                      :disabled="item?.status === 'downloading'"
                      @click="download"
                    >
                      <template #prepend>
                        <v-icon>
                          <i-mdi-loading
                            class="wind-animate-spin"
                            v-if="item?.status === 'downloading'"
                          />
                          <i-mdi-download v-else />
                        </v-icon>
                      </template>
                      {{
                        item?.status === 'downloading'
                          ? '正在下载 ' + ((item!.percent * 100).toFixed(2) + '%')
                          : item?.status === 'complete'
                            ? '已下载'
                            : '下载' + (comicInfo.data.currentSeriesId ? currentSeriesName : '')
                      }}
                    </v-btn>
                  </v-col>
                  <template v-if="userStore.isLogin">
                    <v-col :cols="buttonCols[2]">
                      <v-btn
                        color="primary"
                        variant="flat"
                        :loading="likeComicLoading"
                        size="large"
                        block
                        :disabled="comicInfo.data.isLike"
                        @click="likeComic()"
                      >
                        <template #prepend>
                          <v-icon :color="comicInfo.data.isLike ? 'red' : undefined">
                            <i-mdi-heart />
                          </v-icon>
                        </template>
                        {{ comicInfo.data.isLike ? '已喜欢' : '喜欢' }}
                      </v-btn>
                    </v-col>
                    <v-col :cols="buttonCols[3]">
                      <v-btn
                        color="primary"
                        variant="flat"
                        :loading="collectComicLoading"
                        size="large"
                        block
                        @click="collectComic()"
                      >
                        <template #prepend>
                          <v-icon :color="comicInfo.data.isCollect ? '#834e00' : undefined">
                            <i-mdi-book-heart />
                          </v-icon>
                        </template>
                        {{ comicInfo.data.isCollect ? '已收藏' : '收藏' }}
                      </v-btn>
                    </v-col>
                  </template>
                </v-row>
              </div>
            </div>
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
            <v-tabs-window-item value="chapter">
              <app-comic-detail-chapter
                :loading="loading"
                :comic-id="comicInfo?.data.id"
                :comic-name="comicInfo?.data.name ?? ''"
                :chapter-list="comicInfo?.data.seriesList ?? []"
                :current-chapter-id="comicInfo?.data.currentSeriesId"
              />
            </v-tabs-window-item>
            <v-tabs-window-item value="relevant">
              <app-comic-detail-relevant
                :loading="loading"
                :relate-list="comicInfo?.data.relateList ?? []"
              />
            </v-tabs-window-item>
            <v-tabs-window-item value="comment">
              <app-comic-detail-comment :comic-id="id" />
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
