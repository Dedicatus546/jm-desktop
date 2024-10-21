<script setup lang="ts">
import { useRequest } from "alova/client";

import { loginApi, updateConfigIpc } from "@/apis";
import useDecodeUserInfo from "@/compositions/use-decode-user-info";
import useIpcRendererInvoke from "@/compositions/use-ipc-renderer-invoke";
import useNotification from "@/compositions/use-notification";
import useUserStore from "@/stores/use-user-store";

const router = useRouter();
const userStore = useUserStore();
const notification = useNotification();

const formState = reactive({
  username: "",
  password: "",
  autoLogin: false,
});
const formRules = {
  username: [{ required: true, message: "用户名不能为空" }],
  password: [{ required: true, message: "密码不能为空" }],
};

const { encrypt } = useDecodeUserInfo();
const { loading, data, onSuccess, onError, send } = useRequest(
  () => loginApi(formState.username, formState.password),
  {
    immediate: false,
  },
);

const { invoke } = useIpcRendererInvoke(
  (autoLogin: boolean, loginUserInfo: string) =>
    updateConfigIpc({
      autoLogin,
      loginUserInfo,
    }),
  {
    immediate: false,
  },
);

onSuccess(() => {
  notification.info({
    message: "登录",
    description: "登录成功",
  });
  userStore.updateUserInfoAction(data.value.data);
  if (formState.autoLogin) {
    const encryptStr = encrypt({
      username: formState.username,
      password: formState.password,
    });
    invoke(true, encryptStr);
  }
  router.replace({ name: "PERSON" });
});

onError((e) => {
  notification.error({
    message: "登录",
    description: (e.error as Error).message,
  });
});
</script>

<template>
  <a-card title="登录">
    <a-form
      :model="formState"
      :rules="formRules"
      name="login"
      :required-mark="false"
      autocomplete="off"
      size="large"
      @finish="send()"
    >
      <a-form-item name="username" :colon="false">
        <a-input
          v-model:value="formState.username"
          placeholder="请输入用户名"
        />
      </a-form-item>
      <a-form-item name="password" :colon="false">
        <a-input-password
          v-model:value="formState.password"
          placeholder="请输入密码"
        />
      </a-form-item>
      <a-form-item name="autoLogin" :colon="false">
        <a-checkbox v-model:checked="formState.autoLogin">自动登录</a-checkbox>
        <a-alert show-icon type="warning" class="mt-3" message="警告">
          <template #description>
            <a-flex vertical>
              <a-typography-text>
                1.自动登录会使用对称加密的方式将你的账号和密码写在本地，如果不希望这么做请勿开启。
              </a-typography-text>
              <a-typography-text>
                2.建议修改密码（通过谷歌生成随机密码）后再开启此功能。
              </a-typography-text>
            </a-flex>
          </template>
        </a-alert>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" block :loading="loading">
          登录
        </a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<style scoped></style>
