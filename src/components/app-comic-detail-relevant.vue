<script setup lang="ts">
defineProps<{
  relateList: Array<any>;
}>();
</script>

<template>
  <v-data-iterator :items="relateList" :items-per-page="100">
    <template #no-data>
      <!-- TODO title -->
      <app-empty-state
        title="TODO"
        image="https://vuetifyjs.b-cdn.net/docs/images/logos/v.png"
      ></app-empty-state>
    </template>
    <template #default="{ items }">
      <v-row>
        <template v-for="item of items" :key="item.raw.id">
          <v-col cols="6" :sm="4" :md="3" :lg="2">
            <comic-route-item :comic="item.raw" />
          </v-col>
        </template>
      </v-row>
    </template>
  </v-data-iterator>
</template>
