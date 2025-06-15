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
        tagTypeList: [],
      },
    },
  },
);

const subCategoryList = computed(() => {
  return (
    category.value.data.categoryList.find(
      (item) => item.type === "slug" && item.slug === formState.category,
    )?.subCategoryList ?? []
  );
});

const onCategoryClick = (type: string, slug: string, name: string) => {
  if (type === "slug" || slug === "") {
    formState.subCategory = "";
    formState.category = slug;
  } else {
    router.push({
      name: "QUICK_SEARCH",
      query: {
        query: name,
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
            <div
              v-if="categoryLoading"
              class="wind-h-[30vh] wind-flex wind-items-center wind-justify-center"
            >
              <v-progress-circular indeterminate></v-progress-circular>
            </div>
            <v-form v-else>
              <v-row>
                <v-col :cols="12">
                  <div class="flex gap-2">
                    <div
                      class="wind-h-[30px] wind-leading-[30px] wind-flex-shrink-0"
                    >
                      排序
                    </div>
                    <div class="wind-flex wind-flex-wrap wind-gap-2">
                      <v-chip
                        v-for="item of orderList"
                        :key="item.label"
                        :color="
                          formState.order === item.value ? 'primary' : undefined
                        "
                        @click="formState.order = item.value"
                      >
                        {{ item.label }}
                      </v-chip>
                    </div>
                  </div>
                </v-col>
                <v-col :cols="12">
                  <div class="wind-flex wind-gap-2">
                    <div
                      class="wind-h-[30px] wind-leading-[30px] wind-flex-shrink-0"
                    >
                      分类
                    </div>
                    <div class="wind-flex wind-flex-wrap wind-gap-2">
                      <v-chip
                        v-for="item of category.data.categoryList"
                        :key="item.id"
                        :color="
                          (item.slug === '' || item.type === 'slug') &&
                          formState.category === item.slug
                            ? 'primary'
                            : undefined
                        "
                        @click="
                          onCategoryClick(item.type, item.slug, item.name)
                        "
                      >
                        {{ item.name }}
                      </v-chip>
                    </div>
                  </div>
                </v-col>
                <v-col v-if="subCategoryList.length > 0" :cols="12">
                  <div class="wind-flex wind-gap-2">
                    <div
                      class="wind-h-[30px] wind-leading-[30px] wind-flex-shrink-0"
                    >
                      子分类
                    </div>
                    <div class="wind-flex wind-flex-wrap wind-gap-2">
                      <v-chip
                        v-for="item of subCategoryList"
                        :key="item.id"
                        :color="
                          formState.subCategory === item.slug
                            ? 'primary'
                            : undefined
                        "
                        @click="formState.subCategory = item.slug"
                      >
                        {{ item.name }}
                      </v-chip>
                    </div>
                  </div>
                </v-col>
                <v-col
                  v-for="item of category.data.tagTypeList"
                  :key="item.title"
                  :cols="12"
                >
                  <div class="wind-flex wind-gap-2">
                    <div
                      class="wind-h-[30px] wind-leading-[30px] wind-flex-shrink-0"
                    >
                      {{ item.title }}
                    </div>
                    <div class="wind-flex wind-flex-wrap wind-gap-2">
                      <router-link
                        v-for="tag of item.list"
                        :key="tag"
                        custom
                        :to="{ name: 'QUICK_SEARCH', query: { query: tag } }"
                      >
                        <template #default="{ navigate }">
                          <v-chip @click="navigate()">
                            {{ tag }}
                          </v-chip>
                        </template>
                      </router-link>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-form>
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
