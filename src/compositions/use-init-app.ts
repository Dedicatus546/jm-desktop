import { useRequest } from "alova/client";
import { isString } from "radash";

import { getConfigIpc, getSettingApi, loginApi, updateConfigIpc } from "@/apis";
import logger from "@/logger";
import useAppStore from "@/stores/use-app-store";
import useUserStore from "@/stores/use-user-store";
import { Config } from "@/types/base";

import useDecodeUserInfo from "./use-decode-user-info";
import useIpcRendererInvoke from "./use-ipc-renderer-invoke";

const delay = (time: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

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
      return send().catch(() => {
        throw new Error("读取网址设置失败");
      });
    },
  };
};

const useInitConfig = () => {
  const appStore = useAppStore();
  const { data, onSuccess, invoke } = useIpcRendererInvoke<Config>(
    () => getConfigIpc(),
    {
      immediate: false,
    },
  );
  const { invoke: updateConfigInvoke } = useIpcRendererInvoke(
    (shuntKey: number) => updateConfigIpc({ currentShuntKey: shuntKey }),
    {
      immediate: false,
    },
  );

  onSuccess(() => {
    appStore.updateConfigAction(data.value!);
    if (appStore.setting.shuntList.length > 0) {
      if (
        // 第一次启动未选择图源
        appStore.config.currentShuntKey === undefined ||
        // 接口的图源列表可能发生变化，回退到第一个图源
        appStore.setting.shuntList.every(
          (item) => item.key !== appStore.config.currentShuntKey,
        )
      ) {
        appStore.updateConfigAction({
          currentShuntKey: appStore.setting.shuntList[0].key,
        });
        updateConfigInvoke(appStore.config.currentShuntKey);
      }
    }
  });

  return {
    init: async () => {
      return invoke().catch(() => {
        throw new Error("读取应用设置失败");
      });
    },
  };
};

const useAutoLogin = () => {
  const userStore = useUserStore();
  const appStore = useAppStore();
  const { send, onSuccess, data } = useRequest(
    (username: string, password: string) => loginApi(username, password),
    {
      immediate: false,
    },
  );
  const { decrypt } = useDecodeUserInfo();
  onSuccess(() => {
    userStore.updateUserInfoAction(data.value.data);
  });
  return {
    init: async () => {
      const { username, password } = decrypt(appStore.config.loginUserInfo);
      return send(username, password).catch(() => {
        logger.error("自动登录失败，跳过");
      });
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
