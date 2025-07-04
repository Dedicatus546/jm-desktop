import { useRequest } from "alova/client";

import { loginApi } from "@/apis";
import { info } from "@/logger";
import useUserStore from "@/stores/use-user-store";

export default function useRefreshUser() {
  const userStore = useUserStore();
  const { data, send, onSuccess, onError } = useRequest(
    (username: string, password: string) => loginApi({ username, password }),
    {
      immediate: false,
    },
  );
  onSuccess(() => {
    userStore.updateUserInfoAction(data.value!.data);
  });
  onError(() => {
    userStore.logoutAction();
  });
  const { resume, pause } = useIntervalFn(
    () => {
      info("刷新用户信息中...");
      const { username, password } = userStore.loginInfo!;
      send(username, password);
    },
    5 * 60 * 1000,
    {
      immediate: false,
    },
  );
  watch(
    () => userStore.isLogin,
    (isLogin) => {
      if (isLogin) {
        info("检测到已登录，开始定时刷新用户，防止登录信息失效。");
        resume();
      } else {
        info("检测未登录或退出登录，关闭定时刷新用户。");
        pause();
      }
    },
    {
      immediate: true,
    },
  );
}
