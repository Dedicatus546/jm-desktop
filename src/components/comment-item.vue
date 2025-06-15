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
  <div class="wind-flex wind-items-start wind-gap-4">
    <div class="wind-flex-shrink-0">
      <v-avatar
        v-if="comment.avatar"
        :image="`${appStore.setting.imgHost}/media/users/${comment.avatar}`"
        :size="50"
      />
      <v-avatar
        v-else
        :style="{
          backgroundColor: comment.avatarColor,
        }"
        :size="50"
      >
        {{ comment.nickname[0].toUpperCase() }}
      </v-avatar>
    </div>
    <div class="wind-flex wind-flex-col wind-gap-2 wind-flex-grow">
      <div class="wind-flex wind-flex-col">
        <div class="wind-text">{{ comment.nickname }}</div>
        <div class="wind-text">
          {{ dayjs(comment.createTime).format("YYYY-MM-DD HH:mm:ss") }}
        </div>
      </div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="comment.content"></div>
      <!-- <div class="flex items-center gap-2">
        <a-space class="cursor-pointer" @click="likeComment">
          <LikeOutlined />
          {{ comment.likeCount }}
        </a-space>
      </div> -->
      <div
        v-if="comment.replyList && comment.replyList.length > 0"
        class="wind-flex wind-gap-2 wind-cursor-pointer"
        @click="replyListOpen = !replyListOpen"
      >
        <v-icon icon="mdi-reply" />
        {{ comment.replyList.length }}
      </div>
      <div v-if="replyListOpen && comment.replyList" class="wind-mt-6">
        <v-row>
          <template
            v-for="(subItem, index) of comment.replyList"
            :key="subItem.id"
          >
            <v-col v-if="index > 0" :cols="12">
              <v-divider />
            </v-col>
            <v-col :cols="12">
              <comment-item :comment="subItem" />
            </v-col>
          </template>
        </v-row>
      </div>
    </div>
  </div>
</template>
