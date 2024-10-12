<script setup lang="ts">
import dayjs from "dayjs";

import useAppStore from "@/stores/use-app-store";

defineProps<{
  comment: {
    id: number;
    parentId: number;
    nickname: string;
    likeCount: number;
    content: string;
    avatar: string | null;
    avatarColor: string;
    createTime: number;
    replyList?: Array<{
      id: number;
      parentId: number;
      nickname: string;
      likeCount: number;
      createTime: number;
      content: string;
      avatar: string | null;
      avatarColor: string;
    }>;
  };
}>();

const appStore = useAppStore();
const replyListOpen = ref(false);
</script>

<template>
  <a-flex align="start" :gap="16">
    <div class="flex-shrink-0">
      <a-avatar
        v-if="comment.avatar"
        :src="`${appStore.setting.imgHost}/media/users/${comment.avatar}`"
        :size="50"
      />
      <a-avatar
        v-else
        :style="{
          backgroundColor: comment.avatarColor,
        }"
        :size="50"
      >
        {{ comment.nickname[0].toUpperCase() }}
      </a-avatar>
    </div>
    <a-flex vertical :gap="8" class="flex-grow">
      <a-flex vertical>
        <a-typography-text>{{ comment.nickname }}</a-typography-text>
        <a-typography-text type="secondary">
          {{ dayjs(comment.createTime).format("YYYY-MM-DD HH:mm:ss") }}
        </a-typography-text>
      </a-flex>
      <a-typography-text>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-html="comment.content"></div>
      </a-typography-text>
      <!-- <div class="flex items-center gap-2">
        <a-space class="cursor-pointer" @click="likeComment">
          <LikeOutlined />
          {{ comment.likeCount }}
        </a-space>
      </div> -->
      <a-space
        v-if="comment.replyList && comment.replyList.length > 0"
        class="cursor-pointer"
        @click="replyListOpen = !replyListOpen"
      >
        <MessageOutlined />
        {{ comment.replyList.length }}
      </a-space>
      <div v-if="replyListOpen && comment.replyList" class="mt-6">
        <template
          v-for="(subItem, index) of comment.replyList"
          :key="subItem.id"
        >
          <a-divider v-if="index > 0" />
          <comment-item :comment="subItem" />
        </template>
      </div>
    </a-flex>
  </a-flex>
</template>
