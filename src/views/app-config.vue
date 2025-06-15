<script setup lang="ts">
import { Config } from "@electron/module/config";
import { clone } from "radash";

import { trpcClient } from "@/apis/ipc";
import useSnackbar from "@/compositions/use-snack-bar";
import useAppStore from "@/stores/use-app-store.ts";

const loading = ref(false);
const saveLoading = ref(false);
const appStore = useAppStore();

const formValid = ref<boolean | null>(null);

const formState = reactive<
  Omit<Config, "windowInfo" | "loginUserInfo" | "autoLogin"> & {
    useProxy: boolean;
  }
>({
  theme: "light",
  apiUrl: "",
  apiUrlList: [],
  downloadDir: "",
  readMode: "click",
  zoomFactor: 0,
  proxyInfo: undefined,
  useProxy: false,
});

const getConfig = async () => {
  try {
    const config = await trpcClient.getConfig.query();
    await appStore.updateConfigAction(config);
    Object.assign(formState, clone(appStore.config));
    if (formState.proxyInfo) {
      formState.useProxy = true;
    } else {
      formState.useProxy = false;
    }
  } catch (e) {
    console.error("读取配置文件失败", e);
  }
};

const snackbar = useSnackbar();
const submit = async () => {
  if (!formValid.value) {
    return;
  }
  try {
    await appStore.updateConfigAction(formState, true);
    snackbar.success("更新成功");
  } catch (e) {
    console.error("保存配置失败", e);
  }
};

const onUseProxyChange = (useProxy: boolean) => {
  formState.useProxy = useProxy;
  if (formState.useProxy) {
    formState.proxyInfo = {
      host: "",
      port: 0,
      username: "",
      password: "",
    };
  } else {
    formState.proxyInfo = undefined;
  }
};

onMounted(() => {
  getConfig();
});
</script>

<template>
  <v-card title="软件设置">
    <v-card-text>
      <v-form v-model:model-value="formValid" @submit.prevent="submit">
        <div
          v-if="loading"
          class="wind-flex wind-h-[30vh] wind-items-center wind-justify-center"
        >
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
              :items="formState.apiUrlList"
            >
            </v-select>
          </v-col>
          <v-col :cols="12">
            <v-select
              hide-details
              v-model:model-value="formState.readMode"
              label="阅读模式"
              item-title="text"
              item-value="value"
              :items="[
                {
                  value: 'scroll',
                  text: '竖向滚动',
                },
                {
                  value: 'click',
                  text: '按钮切换',
                },
              ]"
            ></v-select>
          </v-col>
          <v-col :cols="12">
            <app-select-folder-input
              v-model:model-value="formState.downloadDir"
            />
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
              hide-details
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
          <template v-if="formState.useProxy && formState.proxyInfo">
            <v-col :cols="6">
              <v-text-field
                v-model:model-value="formState.proxyInfo.host"
                label="IP"
                placeholder="一般为 127.0.0.1"
                :rules="[(value?: string) => !!value || 'IP 不能为空']"
              ></v-text-field>
            </v-col>
            <v-col :cols="6">
              <v-number-input
                v-model:model-value="formState.proxyInfo.port"
                label="端口"
                placeholder="V2rayN 为 10809"
                :rules="[(value?: number) => !!value || '端口不能为空']"
              ></v-number-input>
            </v-col>
            <v-col :cols="6">
              <v-text-field
                v-model:model-value="formState.proxyInfo.username"
                label="用户名"
                placeholder="一般为空"
              ></v-text-field>
            </v-col>
            <v-col :cols="6">
              <v-text-field
                v-model:model-value="formState.proxyInfo.password"
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
              :loading="saveLoading"
            >
              保存
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>
