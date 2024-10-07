<script setup lang="ts">
import useIpcRendererInvoke from "@/compositions/use-ipc-renderer-invoke";
import useAppStore from "@/stores/use-app-store";

const appStore = useAppStore();

const formState = reactive<{
  apiUrl: string;
  downloadDir: string;
}>({
  apiUrl: "",
  downloadDir: "",
});

const { loading, data, onSuccess } = useIpcRendererInvoke<{
  apiUrl: string;
  downloadDir: string;
}>("app/config");

onSuccess(() => {
  Object.assign(formState, data.value!);
  appStore.updateConfigAction(data.value!);
});
</script>

<template>
  <a-card title="软件设置">
    <a-spin :spinning="loading">
      <a-form :model="formState" size="large" layout="vertical">
        <a-form-item label="目标域名" name="apiUrl">
          <a-select
            v-model:value="formState.apiUrl"
            placeholder="如果发现无法使用可以切换此处的域名"
          >
            <a-select-option value="https://www.jmeadpoolcdn.life">
              https://www.jmeadpoolcdn.life
            </a-select-option>
            <a-select-option value="https://www.cdnxxx-proxy.xyz">
              https://www.cdnxxx-proxy.xyz
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="下载位置">
          <select-folder-input v-model:value="formState.downloadDir" />
        </a-form-item>
        <a-form-item class="mb-0">
          <a-button block type="primary" html-type="submit">保存</a-button>
        </a-form-item>
        <!-- <a-form-item class="mb-4">
          <a-button block>重置</a-button>
        </a-form-item> -->
      </a-form>
    </a-spin>
  </a-card>
</template>
