import { useRequest } from "alova/client";
import { isString } from "radash";

import { getSettingApi, loginApi, trpcClient } from "@/apis";
import { error, info, warn } from "@/logger";
import useAppStore from "@/stores/use-app-store";
import useUserStore from "@/stores/use-user-store";
import { delay } from "@/utils";
import { decryptLoginUser } from "@/utils/login-user-info";

const useInitSetting = () => {
  const appStore = useAppStore();
  const { data, onSuccess, send } = useRequest(() => getSettingApi(), {
    immediate: false,
  });
  onSuccess(() => {
    appStore.updateSettingAction(data.value.data);
  });

  return {
    init: async () => {
      return send().catch((e) => {
        error(e);
        throw new Error("读取网址设置失败");
      });
    },
  };
};

const useInitConfig = () => {
  const appStore = useAppStore();
  return {
    init: async () => {
      info("开始读取本地配置文件");
      try {
        const config = await trpcClient.getConfig.query();
        appStore.updateConfigAction(config);
        info("读取本地配置文件成功");
        if (appStore.setting.shuntList.length > 0) {
          if (
            // 第一次启动未选择图源
            appStore.config.currentShuntKey === undefined ||
            // 接口的图源列表可能发生变化，回退到第一个图源
            appStore.setting.shuntList.every(
              (item) => item.key !== appStore.config.currentShuntKey,
            )
          ) {
            info("检测到未选择图源，默认选择第一个");
            appStore.updateConfigAction({
              currentShuntKey: appStore.setting.shuntList[0].key,
            });
            appStore.updateConfigAction(
              {
                currentShuntKey: appStore.config.currentShuntKey,
              },
              true,
            );
          }
        }
      } catch (e) {
        error("读取本地配置文件失败，原因", e);
        throw new Error("读取本地配置文件失败");
      }
    },
  };
};

const useAutoLogin = () => {
  const userStore = useUserStore();
  const appStore = useAppStore();
  let username = "",
    password = "";
  const { send, onSuccess, data } = useRequest(
    (username: string, password: string) =>
      loginApi({
        username,
        password,
      }),
    {
      immediate: false,
    },
  );
  onSuccess(() => {
    userStore.updateUserInfoAction(data.value.data);
    userStore.updateLoginInfoAction(username, password);
  });
  return {
    init: async () => {
      // 开发环境下读 env 直接登录，该 env 为 .local ，不上传仓库
      info("开始处理自动登录");
      if (
        import.meta.env.DEV &&
        import.meta.env.VITE_AUTO_LOGIN_DEV === "1" &&
        import.meta.env.VITE_LOGIN_USERNAME &&
        import.meta.env.VITE_LOGIN_PASSWORD
      ) {
        info("检测到开发环境且配置了自动登录开关以及用户信息，使用该信息登录");
        username = import.meta.env.VITE_LOGIN_USERNAME;
        password = import.meta.env.VITE_LOGIN_PASSWORD;
      } else if (appStore.config.loginUserInfo) {
        info("检测到本地配置中开启了自动登录，使用本地配置中的用户信息");
        const loginInfo = decryptLoginUser(appStore.config.loginUserInfo);
        username = loginInfo.username;
        password = loginInfo.password;
      } else {
        return Promise.resolve().then(() => {
          warn("未读取到相应的用户信息，跳过自动登录");
        });
      }
      return send(username, password).then(
        () => {
          info("自动登录成功");
        },
        (e) => {
          error("自动登录失败，跳过自动登录，原因：", e);
        },
      );
    },
  };
};

const useInitApp = () => {
  const appStore = useAppStore();
  const setting = useInitSetting();
  const config = useInitConfig();
  const autoLogin = useAutoLogin();
  const loading = ref(true);
  const currentStatus = ref<string | null>(null);
  const error = ref<string | null>(null);

  const init = async () => {
    loading.value = true;
    error.value = null;
    try {
      currentStatus.value = "获取网址设置";
      await setting.init();
      await delay(300);
      currentStatus.value = "获取应用配置";
      await config.init();
      await delay(300);
      if (appStore.config.autoLogin && appStore.config.loginUserInfo) {
        currentStatus.value = "自动登录";
        await autoLogin.init();
        await delay(300);
      }
    } catch (e) {
      if (isString(e)) {
        error.value = e;
      } else if (e instanceof Error) {
        error.value = e.message;
      }
    }
    loading.value = false;
  };

  onMounted(() => {
    init();
  });

  return {
    currentStatus,
    loading,
    error,
    init,
  };
};

export default useInitApp;
