<script setup lang="ts">
import { omit, pick } from "radash";

import { getConfigIpc, relaunchAppIpc, updateConfigIpc } from "@/apis";
import useDialog from "@/compositions/use-dialog";
import useIpcRendererInvoke from "@/compositions/use-ipc-renderer-invoke";
import useAppStore from "@/stores/use-app-store";

const appStore = useAppStore();

const formValid = ref<boolean | null>(null);
const formState = reactive<{
  apiUrl: string;
  downloadDir: string;
  readMode: number;
  useProxy: boolean;
  zoomFactor: number;
  proxy: {
    host: string;
    port: number | undefined;
    username: string;
    password: string;
  };
}>({
  apiUrl: "",
  downloadDir: "",
  readMode: 1,
  zoomFactor: 1,
  useProxy: false,
  proxy: {
    host: "",
    port: undefined,
    username: "",
    password: "",
  },
});

const { loading, data, onSuccess, invoke } = useIpcRendererInvoke(() =>
  getConfigIpc(),
);

onSuccess(() => {
  Object.assign(formState, omit(data.value!, ["proxy"]));
  if (data.value!.proxy) {
    formState.useProxy = true;
    Object.assign(formState.proxy, data.value!.proxy);
  }
  appStore.updateConfigAction(data.value!);
});

const { loading: saveConfigLoading, invoke: saveConfig } =
  useIpcRendererInvoke<void>(
    () => {
      const config: any = pick(formState, [
        "apiUrl",
        "downloadDir",
        "readMode",
        "zoomFactor",
      ]);
      if (formState.useProxy) {
        config.proxy = {
          ...formState.proxy,
        };
      } else {
        config.proxy = undefined;
      }
      return updateConfigIpc(config);
    },
    {
      immediate: false,
    },
  );

const dialog = useDialog();
const submit = async () => {
  if (formValid.value) {
    await saveConfig();
    await invoke();
    dialog({
      width: "50%",
      title: "更新成功",
      content: "除下载位置、阅读模式之外的配置重启后生效，是否立即重启？",
      okText: "重启",
      onOk() {
        relaunchAppIpc();
      },
    });
  }
};

const onUseProxyChange = (useProxy: boolean) => {
  formState.useProxy = useProxy;
  formState.proxy = {
    host: "",
    port: undefined,
    username: "",
    password: "",
  };
};
</script>

<template>
  <v-card title="软件设置">
    <v-card-text>
      <v-form v-model:model-value="formValid" @submit.prevent="submit">
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
            <v-select
              v-model:model-value="formState.readMode"
              label="阅读模式"
              item-title="text"
              item-value="value"
              :items="[
                {
                  value: 1,
                  text: '竖向滚动',
                },
                {
                  value: 2,
                  text: '按钮切换',
                },
              ]"
            ></v-select>
          </v-col>
          <v-col :cols="12">
            <v-slider
              v-model:model-value="formState.zoomFactor"
              thumb-label="always"
              :min="1"
              :max="3"
              :step="0.2"
              label="缩放等级"
            ></v-slider>
          </v-col>
          <v-col :cols="12">
            <v-select
              :model-value="formState.useProxy"
              label="代理设置"
              item-title="text"
              item-value="value"
              :items="[
                {
                  value: false,
                  text: '不使用代理',
                },
                {
                  value: true,
                  text: '使用 HTTP 代理',
                },
              ]"
              @update:model-value="onUseProxyChange"
            ></v-select>
          </v-col>
          <template v-if="formState.useProxy">
            <v-col :cols="6">
              <v-text-field
                v-model:model-value="formState.proxy.host"
                label="IP"
                placeholder="一般为 127.0.0.1"
                :rules="[(value) => !!value || 'IP 不能为空']"
              ></v-text-field>
            </v-col>
            <v-col :cols="6">
              <v-number-input
                v-model:model-value="formState.proxy.port"
                label="端口"
                placeholder="V2rayN 为 10809"
                :rules="[(value) => !!value || '端口不能为空']"
              ></v-number-input>
            </v-col>
            <v-col :cols="6">
              <v-text-field
                v-model:model-value="formState.proxy.username"
                label="用户名"
                placeholder="一般为空"
              ></v-text-field>
            </v-col>
            <v-col :cols="6">
              <v-text-field
                v-model:model-value="formState.proxy.password"
                label="密码"
                placeholder="一般为空"
              ></v-text-field>
            </v-col>
          </template>
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
