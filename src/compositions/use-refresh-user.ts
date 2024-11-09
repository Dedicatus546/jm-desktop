import { useRequest } from "alova/client";

import { loginApi } from "@/apis";
import logger from "@/logger";
import useUserStore from "@/stores/use-user-store";

export default function useRefreshUser() {
  const userStore = useUserStore();
  const { data, send, onSuccess, onError } = useRequest(
    (username: string, password: string) => loginApi(username, password),
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
      logger.info("刷新用户信息中...");
      const { username, password } = userStore.loginInfo!;
      send(username, password);
    },
    5 * 60 * 1000,
    {
      immediate: false,
    },
  );
  watchEffect(() => {
    if (userStore.userInfo && userStore.loginInfo) {
      logger.info("检测到已登录，开始定时刷新用户，防止登录信息失效。");
      resume();
    } else {
      logger.info("检测到退出登录，关闭定时刷新用户。");
      pause();
    }
  });
}
