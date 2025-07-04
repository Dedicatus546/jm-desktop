<script setup lang="ts">
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
    createTime: string;
    replyList?: Array<{
      id: number;
      parentId: number;
      nickname: string;
      likeCount: number;
      createTime: string;
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
  <div class="wind-flex wind-gap-4 wind-items-start">
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
    <div class="wind-flex wind-flex-grow wind-flex-col wind-gap-2">
      <div class="wind-flex wind-flex-col">
        <div class="wind-text-base">{{ comment.nickname }}</div>
        <div class="wind-text-sm wind-text-gray-400">
          {{ comment.createTime }}
        </div>
      </div>
      <div v-html="comment.content"></div>
      <!-- <div class="flex items-center gap-2">
        <a-space class="cursor-pointer" @click="likeComment">
          <LikeOutlined />
          {{ comment.likeCount }}
        </a-space>
      </div> -->
      <v-row no-gutters class="wind-gap-2">
        <v-col
          cols="auto"
          v-if="comment.replyList && comment.replyList.length > 0"
        >
          <v-btn
            variant="tonal"
            size="small"
            @click="replyListOpen = !replyListOpen"
          >
            {{ replyListOpen ? "收起评论" : "查看评论" }}
          </v-btn>
        </v-col>
      </v-row>
      <div v-if="replyListOpen && comment.replyList">
        <v-row>
          <template v-for="subItem of comment.replyList" :key="subItem.id">
            <v-col :cols="12">
              <v-divider />
            </v-col>
            <v-col :cols="12">
              <app-comment-list-item :comment="subItem" />
            </v-col>
          </template>
        </v-row>
      </div>
    </div>
  </div>
</template>
