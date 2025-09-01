<script setup lang="ts">
import EMPTY_STATE_IMG from '@/assets/empty-state/2.jpg'

defineProps<{
  relateList: Array<any>
}>()
</script>

<template>
  <v-data-iterator :items="relateList" :items-per-page="100">
    <template #no-data>
      <v-empty-state
        title="一个相关都没有的小众宝藏本子"
        :image="EMPTY_STATE_IMG"
      ></v-empty-state>
    </template>
    <template #default="{ items }">
      <v-row>
        <template v-for="item of items" :key="item.raw.id">
          <v-col cols="6" :sm="4" :md="3" :lg="2">
            <app-comic-list-item :comic="item.raw" />
          </v-col>
        </template>
      </v-row>
    </template>
  </v-data-iterator>
</template>
