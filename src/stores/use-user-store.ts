import { LoginInfo, User } from '@type/index'
import { assign, clone } from 'radash'

const useUserStore = defineStore('user', () => {
  const state = reactive<{
    userInfo: User | null
    loginInfo: LoginInfo | null
  }>({
    userInfo: null,
    loginInfo: null,
  })

  const isLogin = computed(() => !!state.userInfo)

  const updateUserInfoAction = (userInfo: NonNullable<User>) => {
    if (state.userInfo) {
      assign(state.userInfo, userInfo)
      return
    }
    state.userInfo = clone(userInfo)
  }

  const updateLoginInfoAction = (username: string, password: string) => {
    state.loginInfo = {
      username,
      password,
    }
  }

  const logoutAction = () => {
    state.userInfo = null
    state.loginInfo = null
  }

  const updateFromTrpcAction = (user: User | null, loginInfo: LoginInfo | null) => {
    if (state.userInfo) {
      if (user) {
        assign(state.userInfo, user)
      } else {
        state.userInfo = user
      }
    } else {
      state.userInfo = user
    }
    if (state.loginInfo) {
      if (loginInfo) {
        assign(state.loginInfo, loginInfo)
      } else {
        state.loginInfo = loginInfo
      }
    } else {
      state.loginInfo = loginInfo
    }
  }

  return {
    ...toRefs(state),
    isLogin,
    updateUserInfoAction,
    updateLoginInfoAction,
    logoutAction,
    updateFromTrpcAction,
  }
})

export default useUserStore
