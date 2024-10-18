<script setup lang="ts">
import { useRequest } from "alova/client";

import { loginApi } from "@/apis";
import useNotification from "@/compositions/use-notification";
import useUserStore from "@/stores/use-user-store";

const router = useRouter();
const userStore = useUserStore();
const notification = useNotification();

const formState = reactive({
  username: "",
  password: "",
});
const formRules = {
  username: [{ required: true, message: "用户名不能为空" }],
  password: [{ required: true, message: "密码不能为空" }],
};

const { loading, data, onSuccess, onError, send } = useRequest(
  () => loginApi(formState.username, formState.password),
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
  router.push({ name: "PERSON" });
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
      <a-form-item>
        <a-button type="primary" html-type="submit" block :loading="loading">
          登录
        </a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<style scoped></style>
