import { Config } from "@/type";

interface State {
  signIn: {
    modalOpen: boolean;
    info: {
      id: number;
      name: string;
      threeDaysCoinCount: number;
      threeDaysExpCount: number;
      sevenDaysCoinCount: number;
      sevenDaysExpCount: number;
      pcBackground: string;
      mobileBackground: string;
      currentProgress: number;
      dateMap: Record<
        string,
        {
          isNextDaySign: boolean;
          isLastDaySign: boolean;
          isSign: boolean;
          hasExtraBonus: boolean;
        }
      > | null;
    };
  };
  config: Config;
  setting: {
    logoPath: string;
    webHost: string;
    imgHost: string;
    baseUrl: string;
    cnBaseUrl: string;
    version: string;
    storeLink: {
      google: string;
      web: string;
    };
    shuntList: Array<{ title: string; key: number }>;
  };
}

const useAppStore = defineStore("app", () => {
  const state = reactive<State>({
    signIn: {
      modalOpen: false,
      info: {
        id: 0,
        name: "",
        threeDaysCoinCount: 0,
        threeDaysExpCount: 0,
        sevenDaysCoinCount: 0,
        sevenDaysExpCount: 0,
        pcBackground: "",
        mobileBackground: "",
        currentProgress: 0,
        dateMap: null,
      },
    },
    config: {
      mode: "light",
      apiUrl: "",
      downloadDir: "",
      readMode: 1,
      currentShuntKey: undefined,
    },
    setting: {
      logoPath: "",
      webHost: "",
      imgHost: "",
      baseUrl: "",
      cnBaseUrl: "",
      version: "",
      storeLink: {
        google: "",
        web: "",
      },
      shuntList: [],
    },
  });

  const updateSettingAction = (setting: Partial<State["setting"]>) => {
    Object.assign(state.setting, setting);
  };

  const updateConfigAction = (config: Partial<State["config"]>) => {
    Object.assign(state.config, config);
  };

  return {
    ...toRefs(state),
    updateSettingAction,
    updateConfigAction,
  };
});

export default useAppStore;
