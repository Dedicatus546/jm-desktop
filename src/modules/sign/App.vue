<script setup lang="ts">
import { useRequest } from 'alova/client'
import { set } from 'date-fns'

import { getSignInDataApi, signInApi } from '@/apis'
import useUserStore from '@/stores/use-user-store'
import { trpcClient } from '@/trpc'
import { useSyncUserTrpc } from '@/compositions/use-sync-user-trpc'
import { useSyncConfigTrpc } from '@/compositions/use-sync-config-trpc'

useSyncConfigTrpc()
useSyncUserTrpc()
const userStore = useUserStore()

const currentDate = new Date()
const value = new Date(currentDate)

const { loading, data, send, error } = useRequest(() => getSignInDataApi(userStore.state.uid))
const sliderTickMap = computed(() => {
  const o = {
    3: '三',
    6: '七',
  }
  if (data.value) {
    o['3'] += `(${data.value.data.threeDaysCoinCount},${data.value.data.threeDaysExpCount})`
    o['6'] += `(${data.value.data.sevenDaysCoinCount},${data.value.data.sevenDaysExpCount})`
  }
  return {
    1: '一',
    2: '二',
    3: o['3'],
    4: '四',
    5: '五',
    6: '六',
    7: o['6'],
  }
})
const continuousSignInDay = computed(() => {
  if (!data.value) {
    return 1
  }
  const dateArr = Object.entries(data.value.data.dateMap)
    .sort((i1, i2) => +i1[0] - +i2[0])
    .map((i) => i[1])
  return dateArr.reduce(
    (r, item) => {
      if (item.isSign) {
        r.current++
        r.max = Math.max(r.max, r.current)
      } else {
        r.current = 0
      }
      return r
    },
    { current: 0, max: 0 },
  ).max
})
const signInSumDay = computed(() => {
  if (!data.value) {
    return 0
  }
  const dateArr = Object.values(data.value.data.dateMap)
  return dateArr.reduce((r, item) => {
    if (item.isSign) {
      return r + 1
    }
    return r
  }, 0)
})
const dateMap = computed(() => {
  if (!data.value) {
    return null
  }
  return data.value.data.dateMap
})

const events = computed(() => {
  if (!dateMap.value) {
    return []
  }
  // 当前月份的天数
  const days = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const events = []
  for (let i = 1; i <= days; i++) {
    const key = `${i}`.padStart(2, '0')
    const data = dateMap.value[key]
    const d = set(currentDate, {
      date: i,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    })
    if (data.hasExtraBonus) {
      events.push({
        name: '额外奖励',
        title: '额外奖励',
        start: d,
        end: d,
        color: 'primary',
        timed: false,
      })
    }
    if (data.isLast) {
      if (data.isSign) {
        events.push({
          name: '已签到',
          title: '已签到',
          start: d,
          end: d,
          color: 'success',
          timed: false,
        })
      }
    }
  }

  return events
})

const {
  loading: signInLoading,
  onSuccess,
  data: signInData,
  send: signIn,
} = useRequest(() => signInApi(userStore.state.uid, data.value.data.id), {
  immediate: false,
})

onSuccess(() => {
  $snackbar.primary(signInData.value.data.msg)
  send()
})

const retry = () => {
  error.value = undefined
  send()
}
</script>

<template>
  <app-provider>
    <v-app-bar color="primary" class="app-region-drag">
      <v-app-bar-title>签到</v-app-bar-title>
      <template #append>
        <div class="app-region-nodrag">
          <v-btn flat icon @click="trpcClient.minimizeWindow.mutate()">
            <v-icon>
              <i-mdi-minus />
            </v-icon>
          </v-btn>
          <v-btn flat icon @click="trpcClient.closeWindow.mutate()">
            <v-icon>
              <i-mdi-close />
            </v-icon>
          </v-btn>
        </div>
      </template>
    </v-app-bar>
    <v-main>
      <div
        class="wind-h-full wind-w-full wind-overflow-y-auto wind-p-4"
        style="height: calc(100vh - var(--v-layout-top, 0px))"
      >
        <app-error :error="error" v-if="error" @retry="retry" />
        <v-card v-else :loading="loading">
          <v-card-text>
            <div class="wind-flex wind-flex-col wind-gap-4">
              <div class="wind-text-xl wind-text-center">本月已签到 {{ signInSumDay }} 天</div>
              <v-calendar
                style="height: 500px"
                ref="calendar"
                :model-value="value"
                class="signCalendar"
                :events="events"
              >
                <template #event="{ eventParsed }">
                  <span class="wind-px-2">{{ eventParsed.input.name }}</span>
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
                  <div class="wind-text">
                    连续签到三天额外得 {{ data?.data.threeDaysCoinCount ?? 0 }} JCoins 和
                    {{ data?.data.threeDaysExpCount ?? 0 }} 经验
                  </div>
                  <div class="wind-text">
                    连续签到七天额外得 {{ data?.data.sevenDaysCoinCount ?? 0 }} JCoins 和
                    {{ data?.data.sevenDaysExpCount ?? 0 }} 经验
                  </div>
                </template>
              </v-alert>
              <v-btn
                :disabled="loading"
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
      </div>
    </v-main>
  </app-provider>
</template>
