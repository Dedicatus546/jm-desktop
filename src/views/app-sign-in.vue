<script setup lang="ts">
import { useRequest } from "alova/client";
import dayjs from "dayjs";
import { VCalendar } from "vuetify/labs/VCalendar";

import { getSignInDataApi, signInApi } from "@/apis";
import useUserStore from "@/stores/use-user-store";

const userStore = useUserStore();

const currentDate = new Date();
const value = [currentDate];

const { data, send } = useRequest(() =>
  getSignInDataApi(userStore.userInfo?.uid ?? 0),
);
const dateMap = computed(() => {
  if (!data.value) {
    return null;
  }
  return data.value.data.dateMap;
});

const events = computed(() => {
  if (!dateMap.value) {
    return [];
  }
  // 当前月份的天数
  const days = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const events = [];
  for (let i = 1; i <= days; i++) {
    const key = `${i}`.padStart(2, "0");
    const data = dateMap.value[key];
    const d = dayjs(currentDate)
      .date(i)
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0)
      .toDate();
    if (data.hasExtraBonus) {
      events.push({
        type: 1,
        title: "额外奖励",
        start: d,
        end: d,
        color: "primary",
        allDay: true,
      });
    }
    if (data.isLast) {
      if (data.isSign) {
        events.push({
          type: 2,
          title: "已签到",
          start: d,
          end: d,
          color: "success",
          allDay: true,
        });
      }
    }
  }

  return events;
});

const {
  loading: signInLoading,
  onSuccess,
  data: signInData,
  send: signIn,
} = useRequest(
  () => signInApi(userStore.userInfo?.uid ?? 0, data.value.data.id),
  {
    immediate: false,
  },
);
onSuccess(() => {
  // TODO migrate
  // notification.success({
  //   message: "签到",
  //   description: "签到成功，" + signInData.value.data.msg,
  // });
  send();
});
</script>

<template>
  <v-card>
    <v-card-text>
      <v-calendar
        ref="calendar"
        v-model:model-value="value"
        class="signCalendar"
        :events="events"
      >
        <template #header></template>
        <template #event="{ event }">
          <div v-if="event.type === 1" class="m-2">
            <v-chip>
              <template #prepend>
                <v-icon icon="mdi-heart" color="red"></v-icon>
              </template>
              <span class="ml-1">额外奖励</span>
            </v-chip>
          </div>
          <div v-else-if="event.type === 2" class="m-2">
            <v-chip>
              <template #prepend>
                <v-icon icon="mdi-check" color="success"></v-icon>
              </template>
              <span class="ml-1">已签到</span>
            </v-chip>
          </div>
        </template>
      </v-calendar>
      <v-btn
        class="mt-4"
        :loading="signInLoading"
        size="large"
        block
        color="primary"
        @click="signIn()"
      >
        签到
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<style lang="less" scoped>
.signCalendar {
  ::v-deep(.v-calendar-month__day) {
    min-height: 120px;
  }
}
</style>
