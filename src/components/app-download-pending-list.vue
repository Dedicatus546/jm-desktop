<script setup lang="ts">
import EMPTY_STATE_IMG from "@/assets/empty-state/4.jpg";
import useDownloadStore from "@/stores/use-download-store";

const downloadStore = useDownloadStore();
</script>

<template>
  <v-card>
    <v-card-text>
      <v-data-iterator :items="downloadStore.pendingList" :items-per-page="30">
        <template #loader>
          <div class="wind-h-[30vh] wind-flex wind-items-center wind-justify-center">
            <v-progress-circular indeterminate></v-progress-circular>
          </div>
        </template>
        <template #no-data>
          <app-empty-state
            title="空空如也"
            :image="EMPTY_STATE_IMG"
          ></app-empty-state>
        </template>
        <template #default="{ items }">
          <v-row>
            <template v-for="item of items" :key="item.raw.id">
              <v-col cols="6" :sm="4" :md="3" :lg="2">
                <comic-download-pending-item :comic="item.raw" />
              </v-col>
            </template>
          </v-row>
        </template>
      </v-data-iterator>
    </v-card-text>
  </v-card>
</template>
