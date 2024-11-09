interface State {
  userInfo: {
    uid: number;
    username: string;
    email: string;
    avatar: string;
    jCoin: number;
    level: [number, string];
    currentExp: number;
    nextLevelExp: number;
    collectCount: number;
    maxCollectCount: number;
  } | null;
  loginInfo: {
    username: string;
    password: string;
  } | null;
}

const useUserStore = defineStore("user", () => {
  const state = reactive<State>({
    userInfo: null,
    loginInfo: null,
  });

  const updateUserInfoAction = (userInfo: NonNullable<State["userInfo"]>) => {
    if (state.userInfo) {
      Object.assign(state.userInfo, userInfo);
      return;
    }
    state.userInfo = Object.assign({}, userInfo);
  };

  const updateLoginInfoAction = (username: string, password: string) => {
    state.loginInfo = {
      username,
      password,
    };
  };

  const logoutAction = () => {
    state.userInfo = null;
    state.loginInfo = null;
  };

  return {
    ...toRefs(state),
    updateUserInfoAction,
    updateLoginInfoAction,
    logoutAction,
  };
});

export default useUserStore;
