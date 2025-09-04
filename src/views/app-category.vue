<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'
import { usePagination } from 'alova/client'

import { getCategoryFilterListApi } from '@/apis'
import EMPTY_STATE_IMG from '@/assets/empty-state/2.jpg'
import useAppStore from '@/stores/use-app-store'

const appStore = useAppStore()
const router = useRouter()

const order = useRouteQuery<string, string>('order', appStore.data.categoryOrderList[0].value)
const category = useRouteQuery<string, string>('category', '')
const subCategory = useRouteQuery<string, string>('subCategory', '')

const routePage = useRouteQuery<string, number>('page', '1', {
  transform: {
    get: val => Number.parseInt(val),
    // 这里必须转为 string ，不然和默认值不同会导致 page 为 1 时地址出现 page=1 ，进而影响路由历史
    set: val => String(val),
  },
  mode: 'push',
})
const { loading, pageCount, pageSize, data, page } = usePagination(
  page =>
    getCategoryFilterListApi({
      page,
      category: [category.value, subCategory.value]
        .filter(Boolean)
        .join('_'),
      order: order.value,
    }),
  {
    initialPage: 1,
    initialPageSize: 80,
    watchingStates: [
      order,
      category,
      subCategory,
    ],
    data: res => res.data.list,
    total: res => res.data.total,
  },
)
syncRef(page, routePage)

const tagList = computed(() =>
  appStore.data.categoryTagList.flatMap(item => item.list),
)

const subCategoryList = computed(() => {
  return (
    appStore.data.categoryCategoryList.find(
      item => item.type === 'slug' && item.slug === category.value,
    )?.subCategoryList ?? []
  )
})

const onCategoryClick = (slug: string) => {
  const item = appStore.data.categoryCategoryList.find(
    item => item.slug == slug,
  )
  if (!item) {
    return
  }
  if (item.type === 'slug' || item.id === 0) {
    subCategory.value = ''
    category.value = item.slug
  }
  else {
    router.push({
      name: 'QUICK_SEARCH',
      query: {
        query: item.name,
      },
    })
  }
}
</script>

<template>
  <v-card>
    <v-card-text>
      <v-data-iterator
        :items="data"
        :items-per-page="pageSize"
        :loading="loading"
      >
        <template #loader>
          <v-row>
            <v-col :cols="6" :sm="4" :md="3" :lg="2" v-for="item of pageSize" :key="item">
              <app-comic-skeleten-list-item />
            </v-col>
          </v-row>
        </template>
        <template #header>
          <div class="wind-mb-4">
            <v-chip-group
              color="primary"
              v-model:model-value="order"
              column
              filter
            >
              <v-chip
                v-for="item of appStore.data.categoryOrderList"
                :key="item.value"
                :value="item.value"
              >
                {{ item.title }}
              </v-chip>
            </v-chip-group>
            <v-divider />
            <v-chip-group
              color="primary"
              :model-value="category"
              @update:model-value="onCategoryClick"
              column
              filter
            >
              <v-chip
                v-for="item of appStore.data.categoryCategoryList"
                :key="item.slug"
                :value="item.slug"
              >
                {{ item.name }}
              </v-chip>
            </v-chip-group>
            <template v-if="subCategoryList.length > 0">
              <v-divider />
              <v-chip-group
                color="primary"
                v-model:model-value="subCategory"
                column
                filter
              >
                <v-chip
                  v-for="item of subCategoryList"
                  :key="item.slug"
                  :value="item.slug"
                >
                  {{ item.name }}
                </v-chip>
              </v-chip-group>
            </template>
            <v-divider />
            <v-chip-group color="primary" column>
              <router-link
                v-for="item of tagList"
                :key="item"
                custom
                :to="{ name: 'QUICK_SEARCH', query: { query: item } }"
              >
                <template #default="{ navigate }">
                  <v-chip @click="navigate()">
                    {{ item }}
                  </v-chip>
                </template>
              </router-link>
            </v-chip-group>
            <v-divider />
          </div>
        </template>
        <template #no-data>
          <v-empty-state
            title="来到了一个无人区"
            :image="EMPTY_STATE_IMG"
          ></v-empty-state>
        </template>
        <template #default="{ items }">
          <v-row>
            <template v-for="item of items" :key="item.raw.id">
              <v-col cols="6" :sm="4" :md="3" :lg="2">
                <app-comic-list-item :comic="item.raw" />
              </v-col>
            </template>
          </v-row>
        </template>
        <template #footer>
          <div class="wind-mt-4 wind-flex wind-justify-end">
            <v-pagination
              color="primary"
              v-model="page"
              :length="pageCount"
              :disabled="loading"
              :total-visible="8"
            ></v-pagination>
          </div>
        </template>
      </v-data-iterator>
    </v-card-text>
  </v-card>
</template>
