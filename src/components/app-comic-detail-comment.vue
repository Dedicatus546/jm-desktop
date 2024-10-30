<script setup lang="ts">
import { usePagination, useRequest } from "alova/client";

import { commentComicApi, getComicCommentListApi } from "@/apis";
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

onSuccess(() => {
  // TODO migrate
  // notification.success({
  //   message: "评论",
  //   description: commentData.value.data.msg,
  // });
  refresh(1, 0);
});
</script>

<template>
  <v-form :model="formState" class="mb-4" @submit.prevent="send()">
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
      <div class="h-[30vh] flex items-center justify-center">
        <v-progress-circular indeterminate></v-progress-circular>
      </div>
    </template>
    <template #default="{ items }">
      <v-row>
        <template v-for="item of items" :key="item.raw.id">
          <v-col cols="12">
            <comment-item :comment="item.raw" />
          </v-col>
          <v-col>
            <v-divider />
          </v-col>
        </template>
      </v-row>
    </template>
    <template #footer>
      <div class="flex justify-end mt-4">
        <v-pagination v-model="page" :length="pageCount"></v-pagination>
      </div>
    </template>
  </v-data-iterator>
</template>

<style scoped></style>
