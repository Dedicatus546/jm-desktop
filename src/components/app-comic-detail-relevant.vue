<script setup lang="ts">
import EMPTY_STATE_IMG from '@/assets/empty-state/2.jpg'

withDefaults(defineProps<{
  loading?: boolean
  relateList: Array<any>
}>(), {
  loading: false,
})
</script>

<template>
  <v-data-iterator :loading="loading" :items="relateList" :items-per-page="100">
    <template #loader>
      <v-row>
        <v-col v-for="item of 12" :key="item" cols="6" :sm="4" :md="3" :lg="2">
          <app-comic-skeleten-list-item />
        </v-col>
      </v-row>
    </template>
    <template #no-data>
      <v-empty-state
        title="一个相关都没有的小众宝藏本子"
        :image="EMPTY_STATE_IMG"
      ></v-empty-state>
    </template>
    <template #default="{ items }">
      <v-row>
        <v-col v-for="item of items" :key="item.raw.id" cols="6" :sm="4" :md="3" :lg="2">
          <app-comic-list-item :comic="item.raw" />
        </v-col>
      </v-row>
    </template>
  </v-data-iterator>
</template>
