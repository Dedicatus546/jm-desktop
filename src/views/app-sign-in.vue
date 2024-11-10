<script setup lang="ts">
import { useRequest } from "alova/client";
import dayjs from "dayjs";
import { VCalendar } from "vuetify/labs/VCalendar";

import { getSignInDataApi, signInApi } from "@/apis";
import useSnackbar from "@/compositions/use-snack-bar";
import useUserStore from "@/stores/use-user-store";

const userStore = useUserStore();

const currentDate = new Date();
const value = [currentDate];

const { data, send } = useRequest(() =>
  getSignInDataApi(userStore.userInfo?.uid ?? 0),
);
const sliderTickMap = computed(() => {
  const o = {
    3: "三",
    6: "七",
  };
  if (data.value) {
    o["3"] +=
      `(${data.value.data.threeDaysCoinCount},${data.value.data.threeDaysExpCount})`;
    o["6"] +=
      `(${data.value.data.sevenDaysCoinCount},${data.value.data.sevenDaysExpCount})`;
  }
  return {
    1: "一",
    2: "二",
    3: o["3"],
    4: "四",
    5: "五",
    6: "六",
    7: o["6"],
  };
});
const continuousSignInDay = computed(() => {
  if (!data.value) {
    return 1;
  }
  const dateArr = Object.values(data.value.data.dateMap);
  return dateArr.reduce(
    (r, item) => {
      if (item.isSign) {
        r.current++;
        r.max = Math.max(r.max, r.current);
      } else {
        r.current = 0;
      }
      return r;
    },
    { current: 0, max: 0 },
  ).max;
});
const signInSumDay = computed(() => {
  if (!data.value) {
    return 0;
  }
  const dateArr = Object.values(data.value.data.dateMap);
  return dateArr.reduce((r, item) => {
    if (item.isSign) {
      return r + 1;
    }
    return r;
  }, 0);
});
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
const snackbar = useSnackbar();
onSuccess(() => {
  snackbar.primary(signInData.value.data.msg);
  send();
});
</script>

<template>
  <v-card>
    <v-card-text>
      <div class="flex flex-col gap-4">
        <v-calendar
          ref="calendar"
          :model-value="value"
          class="signCalendar"
          :events="events"
        >
          <template #header>
            <div class="text-h6 text-center mb-4">
              本月已签到 {{ signInSumDay }} 天
            </div>
          </template>
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
        <v-slider
          readonly
          label="连续签到进度"
          :model-value="continuousSignInDay"
          :min="1"
          :max="7"
          :step="1"
          show-ticks="always"
          :ticks="sliderTickMap"
          :tick-size="7"
        ></v-slider>
        <v-alert type="info" title="连续签到奖励">
          <template #text>
            <div class="text">
              连续签到三天额外得 {{ data?.data.threeDaysCoinCount ?? 0 }} JCoins
              和 {{ data?.data.threeDaysExpCount ?? 0 }} 经验
            </div>
            <div class="text">
              连续签到七天额外得 {{ data?.data.sevenDaysCoinCount ?? 0 }} JCoins
              和 {{ data?.data.sevenDaysExpCount ?? 0 }} 经验
            </div>
          </template>
        </v-alert>
        <v-btn
          :loading="signInLoading"
          size="large"
          block
          color="primary"
          @click="signIn()"
        >
          签到
        </v-btn>
      </div>
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
