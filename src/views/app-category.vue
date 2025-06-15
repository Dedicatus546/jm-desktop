<script setup lang="ts">
import { usePagination, useRequest } from "alova/client";

import { getCategoryFilterListApi, getCategoryListApi } from "@/apis";
import EMPTY_STATE_IMG from "@/assets/empty-state/2.jpg";

const router = useRouter();

const formState = reactive({
  order: "",
  category: "",
  subCategory: "",
});

const orderList = [
  { label: "最新", value: "" },
  { label: "最多爱心", value: "tf" },
  { label: "总排行", value: "mv" },
  { label: "月排行", value: "mv_m" },
  { label: "周排行", value: "mv_w" },
  { label: "日排行", value: "mv_t" },
];

const { loading, pageCount, pageSize, data, page } = usePagination(
  (page) =>
    getCategoryFilterListApi({
      page,
      category: [formState.category, formState.subCategory]
        .filter(Boolean)
        .join("_"),
      order: formState.order,
    }),
  {
    initialPage: 1,
    initialPageSize: 80,
    watchingStates: [
      () => formState.order,
      () => formState.category,
      () => formState.subCategory,
    ],
    data: (res) => res.data.list,
    total: (res) => res.data.total,
  },
);

const { loading: categoryLoading, data: category } = useRequest(
  () => getCategoryListApi(),
  {
    initialData: {
      data: {
        categoryList: [],
        // TODO fix 这里这个 tagTypeList 好像服务器没返回了？
        tagTypeList: [],
      },
    },
  },
);

const tagList = category.value.data.tagTypeList.flatMap((item) => item.list);

const subCategoryList = computed(() => {
  return (
    category.value.data.categoryList.find(
      (item) => item.type === "slug" && item.slug === formState.category,
    )?.subCategoryList ?? []
  );
});

const onCategoryClick = (slug: string) => {
  const item = category.value.data.categoryList.find(
    (item) => item.slug == slug,
  );
  if (!item) {
    return;
  }
  if (item.type === "slug") {
    formState.subCategory = "";
    formState.category = item.slug;
  } else {
    router.push({
      name: "QUICK_SEARCH",
      query: {
        query: item.name,
      },
    });
  }
};
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
          <div
            class="wind-h-[30vh] wind-flex wind-items-center wind-justify-center"
          >
            <v-progress-circular indeterminate></v-progress-circular>
          </div>
        </template>
        <template #header>
          <div class="wind-mb-4">
            <template v-if="!categoryLoading">
              <v-chip-group
                color="primary"
                v-model:model-value="formState.order"
                column
                filter
              >
                <v-chip
                  v-for="item of orderList"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </v-chip>
              </v-chip-group>
              <v-divider />
              <v-chip-group
                color="primary"
                :model-value="formState.category"
                @update:model-value="onCategoryClick"
                column
                filter
              >
                <v-chip
                  v-for="item of category.data.categoryList"
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
                  v-model:model-value="formState.subCategory"
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
            </template>
          </div>
        </template>
        <template #no-data>
          <app-empty-state
            title="出现这个就大概率是出 BUG 了，请提 issue"
            :image="EMPTY_STATE_IMG"
          ></app-empty-state>
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
          <div class="wind-flex wind-justify-end wind-mt-4">
            <v-pagination
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
