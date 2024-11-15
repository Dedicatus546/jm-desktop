<script setup lang="tsx">
import { version } from "@@/package.json";
</script>

<template>
  <v-card title="关于">
    <v-card-text>
      <v-list>
        <v-list-item title="版本">
          <template #append>
            {{ version }}
          </template>
        </v-list-item>
        <v-list-item title="仓库地址">
          <template #append>
            <a href="https://github.com/Dedicatus546/jm-desktop">
              https://github.com/Dedicatus546/jm-desktop
            </a>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>
