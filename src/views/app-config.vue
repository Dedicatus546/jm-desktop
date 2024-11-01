<script setup lang="ts">
import { getConfigIpc, updateConfigIpc } from "@/apis";
import useIpcRendererInvoke from "@/compositions/use-ipc-renderer-invoke";
import useSnackbar from "@/compositions/use-snack-bar";
import useAppStore from "@/stores/use-app-store";

const appStore = useAppStore();

const formState = reactive<{
  apiUrl: string;
  downloadDir: string;
  readMode: number;
}>({
  apiUrl: "",
  downloadDir: "",
  readMode: 1,
});

const { loading, data, onSuccess, invoke } = useIpcRendererInvoke<{
  apiUrl: string;
  downloadDir: string;
  readMode: number;
}>(() => getConfigIpc());

onSuccess(() => {
  Object.assign(formState, data.value!);
  appStore.updateConfigAction(data.value!);
});

const { loading: saveConfigLoading, invoke: saveConfig } =
  useIpcRendererInvoke<void>(
    () => updateConfigIpc(Object.assign({}, formState)),
    {
      immediate: false,
    },
  );

const snackbar = useSnackbar();
const submit = async () => {
  await saveConfig();
  snackbar.success("更新成功");
  invoke();
};
</script>

<template>
  <v-card title="软件设置">
    <v-card-text>
      <v-form @submit.prevent="submit">
        <div v-if="loading" class="h-[30vh] flex items-center justify-center">
          <v-progress-circular indeterminate></v-progress-circular>
        </div>
        <v-row>
          <v-col :cols="12">
            <v-select
              v-model:model-value="formState.apiUrl"
              hide-details
              label="代理域名"
              placeholder="如果发现无法使用可以切换此处的域名"
              item-title="value"
              item-value="value"
              :items="[
                { value: 'https://www.cdnxxx-proxy.xyz' },
                { value: 'https://www.jmapiproxyxxx.vip' },
                { value: 'https://www.jmeadpoolcdn.life' },
              ]"
            >
            </v-select>
          </v-col>
          <v-col :cols="12">
            <select-folder-input v-model:model-value="formState.downloadDir" />
          </v-col>
          <v-col :cols="12">
            阅读模式
            <v-btn-toggle
              v-model:model-value="formState.readMode"
              mandatory
              divided
              class="ml-2"
            >
              <v-btn :value="1">竖向滚动</v-btn>
              <v-btn :value="2">按钮切换</v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col :cols="12">
            <v-btn
              size="large"
              block
              color="primary"
              type="submit"
              :loading="saveConfigLoading"
            >
              保存
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>
