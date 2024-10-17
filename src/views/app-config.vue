<script setup lang="ts">
import { getConfigIpc, updateConfigIpc } from "@/apis";
import useIpcRendererInvoke from "@/compositions/use-ipc-renderer-invoke";
import useNotification from "@/compositions/use-notification";
import useAppStore from "@/stores/use-app-store";

const appStore = useAppStore();
const notification = useNotification();

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

const onFinish = async () => {
  await saveConfig();
  notification.info({
    message: "应用配置",
    description: "保存成功",
  });
  invoke();
};
</script>

<template>
  <a-card title="软件设置">
    <a-spin :spinning="loading">
      <a-form
        :model="formState"
        size="large"
        layout="vertical"
        @finish="onFinish"
      >
        <a-form-item label="目标域名" name="apiUrl">
          <a-select
            v-model:value="formState.apiUrl"
            placeholder="如果发现无法使用可以切换此处的域名"
          >
            <a-select-option value="https://www.cdnxxx-proxy.xyz">
              https://www.cdnxxx-proxy.xyz
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="下载位置" name="downloadUrl">
          <select-folder-input v-model:value="formState.downloadDir" />
        </a-form-item>
        <a-form-item label="阅读模式" name="readMode">
          <a-radio-group
            v-model:value="formState.readMode"
            button-style="solid"
          >
            <a-radio-button :value="1">竖向滚动</a-radio-button>
            <a-radio-button :value="2">按钮切换</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item class="mb-0">
          <a-button
            block
            type="primary"
            html-type="submit"
            :loading="saveConfigLoading"
          >
            保存
          </a-button>
        </a-form-item>
        <!-- <a-form-item class="mb-4">
          <a-button block>重置</a-button>
        </a-form-item> -->
      </a-form>
    </a-spin>
  </a-card>
</template>
