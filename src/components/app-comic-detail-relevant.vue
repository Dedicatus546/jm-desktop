<script setup lang="ts">
defineProps<{
  relateList: Array<any>;
}>();
</script>

<template>
  <v-data-iterator :items="relateList">
    <template #default="{ items }">
      <v-row>
        <template v-for="item of items" :key="item.raw.id">
          <v-col cols="6" :sm="4" :md="3" :lg="2">
            <comic-item :comic="item.raw" />
          </v-col>
        </template>
      </v-row>
    </template>
  </v-data-iterator>
</template>
