import { trpcClient } from '@/trpc'
import { User } from '@type/index'

const useUserStore = defineStore('user', () => {
  const state: User = reactive({
    uid: 0,
    username: '',
    email: '',
    avatar: '',
    jCoin: 0,
    level: [0, ''],
    currentExp: 0,
    nextLevelExp: 0,
    collectCount: 0,
    maxCollectCount: 0,
  })

  if (APP_STATE.user) {
    Object.assign(state, APP_STATE.user)
  }

  const resetState = () => {
    Object.assign(state, {
      uid: 0,
      username: '',
      email: '',
      avatar: '',
      jCoin: 0,
      level: [0, ''],
      currentExp: 0,
      nextLevelExp: 0,
      collectCount: 0,
      maxCollectCount: 0,
    })
  }

  const isLogin = computed(() => !!state.uid)

  const updateUserAction = async (user: User | null) => {
    await trpcClient.updateUser.mutate(user)
  }

  const updateFromTrpcAction = (user: User | null) => {
    console.log('user', user)
    if (user) {
      Object.assign(state, user)
    } else {
      resetState()
    }
  }

  return {
    state,
    isLogin,
    updateUserAction,
    updateFromTrpcAction,
  }
})

export default useUserStore
