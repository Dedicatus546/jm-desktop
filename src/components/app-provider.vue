<script setup lang="ts"></script>

<template>
  <v-defaults-provider>
    <v-app>
      <app-dialog-provider>
        <app-snackbar-provider location="top right" :timeout="1500">
          <slot></slot>
          <app-download-notice />
          <app-trpc-notice />
        </app-snackbar-provider>
      </app-dialog-provider>
    </v-app>
  </v-defaults-provider>
</template>
