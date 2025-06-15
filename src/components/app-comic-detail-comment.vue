<script setup lang="ts">
import { usePagination, useRequest } from "alova/client";

import { commentComicApi, getComicCommentListApi } from "@/apis";
import EMPTY_STATE_IMG from "@/assets/empty-state/1.jpg";
import useSnackbar from "@/compositions/use-snack-bar";
import useUserStore from "@/stores/use-user-store";

const props = defineProps<{
  comicId: number;
}>();

const {
  loading,
  page,
  pageCount,
  pageSize,
  data,
  send: refresh,
} = usePagination(
  (page) =>
    getComicCommentListApi({
      page,
      comicId: props.comicId,
    }),
  {
    initialPage: 1,
    initialPageSize: 20,
    data: (res) => res.data.list,
    total: (res) => res.data.total,
  },
);

const userStore = useUserStore();
const formState = reactive({
  content: "",
});
const {
  loading: commentComicLoading,
  send,
  data: commentData,
  onSuccess,
} = useRequest(
  () => commentComicApi(formState.content, userStore.userInfo!.uid),
  {
    immediate: false,
  },
);
const snackbar = useSnackbar();

onSuccess(() => {
  snackbar.success(commentData.value.data.msg);
  refresh(1, 0);
});
</script>

<template>
  <v-form :model="formState" class="wind-mb-4" @submit.prevent="send()">
    <v-row>
      <v-col :cols="12">
        <v-textarea
          v-model:model-value="formState.content"
          size="large"
          placeholder="贤者模式中..."
          hide-details
        >
        </v-textarea>
      </v-col>
      <v-col>
        <v-btn
          :disabled="!formState.content"
          block
          size="large"
          color="primary"
          :loading="commentComicLoading"
          type="submit"
        >
          发送
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
  <v-data-iterator :items="data" :items-per-page="pageSize" :loading="loading">
    <template #loader>
      <div
        class="wind-h-[30vh] wind-flex wind-items-center wind-justify-center"
      >
        <v-progress-circular indeterminate></v-progress-circular>
      </div>
    </template>
    <template #no-data>
      <app-empty-state
        title="这看起来是一部没人评价过的本子"
        :image="EMPTY_STATE_IMG"
      ></app-empty-state>
    </template>
    <template #default="{ items }">
      <v-row>
        <template v-for="item of items" :key="item.raw.id">
          <v-col cols="12">
            <app-comment-list-item :comment="item.raw" />
          </v-col>
          <v-col>
            <v-divider />
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
</template>

<style scoped></style>
