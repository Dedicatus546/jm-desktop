import { useRequest } from "alova/client";
import { isString } from "radash";

import { getConfigIpc, getSettingApi, loginApi, updateConfigIpc } from "@/apis";
import useAppStore from "@/stores/use-app-store";
import useUserStore from "@/stores/use-user-store";
import { Config } from "@/type";

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
        throw "读取网址设置失败";
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

  onSuccess(() => {
    appStore.updateConfigAction(data.value!);
  });

  return {
    init: async () => {
      return invoke().catch(() => {
        throw "读取应用设置失败";
      });
    },
  };
};

// TODO 是否要做自动登录？
const useAutoLogin = () => {
  const userStore = useUserStore();
  const { send, onSuccess, data } = useRequest(() => loginApi("", ""), {
    immediate: false,
  });
  onSuccess(() => {
    userStore.updateUserInfoAction(data.value.data);
  });
  return {
    init: async () => {
      return send().catch(() => console.warn("自动登录失败"));
    },
  };
};

const useInitApp = () => {
  const setting = useInitSetting();
  const config = useInitConfig();
  useAutoLogin();
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
      // currentStatus.value = "自动登录";
      // await autoLogin.init();
      // await delay(300);
    } catch (e) {
      if (isString(e)) {
        error.value = e;
      } else {
        error.value = String(e);
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
