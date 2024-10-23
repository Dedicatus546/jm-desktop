<script setup lang="ts">
import { usePagination, useRequest } from "alova/client";

import { getCategoryFilterListApi, getCategoryListApi } from "@/apis";

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

const { loading, data, page, total } = usePagination(
  (page) =>
    getCategoryFilterListApi({
      page,
      category: [formState.category, formState.subCategory]
        .filter(Boolean)
        .join("_"),
      order: formState.order,
    }),
  {
    watchingStates: [
      () => formState.order,
      () => formState.category,
      () => formState.subCategory,
    ],
    data: (res) => res.data.list,
    total: (res) => res.data.total,
  },
);

const {
  loading: categoryLoading,
  data: category,
  onSuccess,
} = useRequest(() => getCategoryListApi(), {
  initialData: {
    data: {
      categoryList: [],
      tagTypeList: [],
    },
  },
});

const subCategoryList = computed(() => {
  return (
    category.value.data.categoryList.find(
      (item) => item.type === "slug" && item.slug === formState.category,
    )?.subCategoryList ?? []
  );
});

onSuccess(() => {});
</script>

<template>
  <a-row :gutter="[16, 16]">
    <a-col :span="24">
      <a-card>
        <a-flex
          v-if="categoryLoading"
          align="center"
          justify="center"
          class="min-h-[200px]"
        >
          <a-spin />
        </a-flex>
        <a-form v-else>
          <a-form-item label="排序" class="mb-1">
            <a-flex wrap="wrap" :gap="4">
              <a-button
                v-for="item of orderList"
                :key="item.label"
                size="small"
                :type="formState.order === item.value ? 'primary' : undefined"
                @click="formState.order = item.value"
              >
                {{ item.label }}
              </a-button>
            </a-flex>
          </a-form-item>
          <a-form-item label="分类" class="mb-1">
            <a-flex wrap="wrap" :gap="4">
              <a-button
                v-for="item of category.data.categoryList"
                :key="item.id"
                size="small"
                :type="
                  (item.slug === '' || item.type === 'slug') &&
                  formState.category === item.slug
                    ? 'primary'
                    : undefined
                "
                @click="
                  formState.subCategory = '';
                  formState.category = item.slug;
                "
              >
                {{ item.name }}
              </a-button>
            </a-flex>
          </a-form-item>
          <a-form-item
            v-if="subCategoryList.length > 0"
            label="子分类"
            class="mb-1"
          >
            <a-flex wrap="wrap" :gap="4">
              <a-button
                v-for="item of subCategoryList"
                :key="item.id"
                size="small"
                :type="
                  formState.subCategory === item.slug ? 'primary' : undefined
                "
                @click="formState.subCategory = item.slug"
              >
                {{ item.name }}
              </a-button>
            </a-flex>
          </a-form-item>
          <a-form-item
            v-for="item of category.data.tagTypeList"
            :key="item.title"
            :label="item.title"
            class="mb-1"
          >
            <a-flex wrap="wrap" :gap="4">
              <router-link
                v-for="tag of item.list"
                :key="tag"
                custom
                :to="{ name: 'QUICK_SEARCH', query: { query: tag } }"
              >
                <template #default="{ navigate }">
                  <a-button size="small" @click="navigate()">
                    {{ tag }}
                  </a-button>
                </template>
              </router-link>
            </a-flex>
          </a-form-item>
        </a-form>
      </a-card>
    </a-col>
    <a-col v-if="!categoryLoading" :span="24">
      <a-card>
        <a-spin :spinning="loading">
          <a-row v-if="total" :gutter="[16, 16]">
            <a-col v-for="item of data" :key="item.id" :sm="8" :xl="6" :xxl="4">
              <comic-item :comic="item" />
            </a-col>
            <a-col :span="24">
              <a-pagination
                v-model:current="page"
                align="right"
                :page-size="80"
                :total="total"
                show-quick-jumper
                :show-size-changer="false"
              />
            </a-col>
          </a-row>
          <a-col v-else :span="24">
            <a-empty></a-empty>
          </a-col>
        </a-spin>
      </a-card>
    </a-col>
  </a-row>
</template>
