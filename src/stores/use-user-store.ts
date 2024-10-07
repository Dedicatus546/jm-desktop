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
}

const useUserStore = defineStore("user", () => {
  const state = reactive<State>({
    userInfo: null,
  });

  const updateUserInfoAction = (userInfo: NonNullable<State["userInfo"]>) => {
    if (state.userInfo) {
      Object.assign(state.userInfo, userInfo);
      return;
    }
    state.userInfo = Object.assign({}, userInfo);
  };

  const logoutAction = () => {
    state.userInfo = null;
  };

  return {
    ...toRefs(state),
    updateUserInfoAction,
    logoutAction,
  };
});

export default useUserStore;
