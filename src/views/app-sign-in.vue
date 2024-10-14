<script setup lang="ts">
import { useRequest } from "alova/client";
import dayjs, { type Dayjs } from "dayjs";

import { getSignInDataApi, signInApi } from "@/apis";
import useNotification from "@/compositions/use-notification";
import useUserStore from "@/stores/use-user-store";

const userStore = useUserStore();
const notification = useNotification();

const currentDate = ref(dayjs());
const validRange = computed<[Dayjs, Dayjs]>(() => {
  const start = currentDate.value
    .set("date", 1)
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(0);
  const end = currentDate.value
    .add(1, "month")
    .set("date", 1)
    .add(-1, "day")
    .hour(23)
    .minute(59)
    .second(59)
    .millisecond(999);
  return [start, end];
});
const disabledDate = (date: Dayjs) => {
  const [start, end] = validRange.value;
  return date.isBefore(start) || date.isAfter(end);
};

const isCurrentMonthDate = (date: Dayjs) => {
  return date.month() === currentDate.value.month();
};

const { loading, data, send } = useRequest(() =>
  getSignInDataApi(userStore.userInfo?.uid ?? 0),
);
const dateMap = computed(() => {
  if (!data.value) {
    return null;
  }
  return data.value.data.dateMap;
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
  notification.success({
    message: "签到",
    description: "签到成功，" + signInData.value.data.msg,
  });
  send();
});
</script>

<template>
  <a-spin :spinning="loading">
    <a-card>
      <a-flex vertical :gap="16">
        <a-calendar
          :value="currentDate"
          :valid-range="validRange"
          :disabled-date="disabledDate"
          class="calendar"
        >
          <template #headerRender></template>
          <template #dateFullCellRender="{ current }">
            <a-flex
              v-if="isCurrentMonthDate(current)"
              align="center"
              justify="center"
              :gap="8"
              class="my-1 h-full min-h-[40px] aspect-ratio-[16/9]"
              :class="
                dateMap
                  ? {
                      signed:
                        (current.isBefore(currentDate) ||
                          current.isSame(currentDate)) &&
                        dateMap[current.format('DD')].isSign,
                      unSign:
                        (current.isBefore(currentDate) ||
                          current.isSame(currentDate)) &&
                        !dateMap[current.format('DD')].isSign,
                      lastDaySign: dateMap[current.format('DD')].isLastDaySign,
                      nextDaySign: dateMap[current.format('DD')].isNextDaySign,
                    }
                  : {}
              "
            >
              <span>{{ current.get("date") }}</span>
              <HeartFilled
                v-if="dateMap && dateMap[current.format('DD')]?.hasExtraBonus"
                class="text-pink"
              />
            </a-flex>
          </template>
        </a-calendar>
        <a-button
          :loading="signInLoading"
          size="large"
          block
          type="primary"
          @click="signIn()"
        >
          签到
        </a-button>
      </a-flex>
    </a-card>
  </a-spin>
</template>

<style lang="less" scoped>
.calendar {
  :deep(.ant-picker-content) {
    & > thead {
      & > tr {
        & > th {
          text-align: center;
          padding-inline-end: 0 !important;
          padding-bottom: 0 !important;
          height: 80px !important;
          min-height: auto !important;
        }
      }
    }
  }

  .signed {
    background: @colorPrimary;
    color: white;
    border-radius: unit(@borderRadiusOuter, px);
  }
  .lastDaySign {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  .nextDaySign {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .unSign {
    opacity: 0.5;
  }
}
</style>
