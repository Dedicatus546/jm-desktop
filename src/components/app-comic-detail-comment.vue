<script setup lang="ts">
import { usePagination, useRequest } from "alova/client";

import { commentComicApi, getComicCommentListApi } from "@/apis";
import useNotification from "@/compositions/use-notification";
import useUserStore from "@/stores/use-user-store";

const props = defineProps<{
  comicId: number;
}>();

const {
  loading,
  page,
  total,
  data,
  send: refresh,
} = usePagination(
  (page) =>
    getComicCommentListApi({
      page,
      comicId: props.comicId,
    }),
  {
    data: (res) => res.data.list,
    total: (res) => res.data.total,
  },
);

const notification = useNotification();
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
  notification.success({
    message: "评论",
    description: commentData.value.data.msg,
  });
  refresh(1, 0);
});
</script>

<template>
  <a-form :model="formState" @finish="send()">
    <a-form-item
      name="content"
      :rules="{ required: true, message: '评论不能为空' }"
    >
      <a-textarea
        v-model:value="formState.content"
        size="large"
        placeholder="贤者模式中..."
      />
    </a-form-item>
    <a-form-item class="mb-0">
      <a-button
        block
        size="large"
        type="primary"
        :loading="commentComicLoading"
        html-type="submit"
      >
        发送
      </a-button>
    </a-form-item>
  </a-form>
  <a-list
    item-layout="vertical"
    size="large"
    :loading="loading"
    :pagination="{
      current: page,
      onChange: (newPage: number) => (page = newPage),
      total,
      pageSize: 10,
      showSizeChanger: false,
    }"
    :data-source="data"
  >
    <template #renderItem="{ item }">
      <a-divider />
      <comment-item :key="item.id" :comment="item" />
    </template>
  </a-list>
</template>

<style scoped></style>
