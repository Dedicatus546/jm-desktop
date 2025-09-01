import { RouterScrollBehavior } from 'vue-router'

const scrollPosition: Record<
  string,
  {
    top: number
    left: number
  }
> = {}

const useRecoveryScrollPosition = (
  scrollEl: Ref<ComponentPublicInstance | HTMLElement | null>,
) => {
  const router = useRouter()

  router.beforeEach((_to, from, next) => {
    if (!scrollEl.value) {
      next()
      return
    }
    const el
      = scrollEl.value instanceof HTMLElement
        ? scrollEl.value
        : (scrollEl.value.$el as HTMLElement)
    scrollPosition[from.fullPath] = {
      top: el.scrollTop,
      left: el.scrollLeft,
    }
    next()
  })
}

export const scrollBehavior: RouterScrollBehavior = async (to) => {
  const scrollView = document.getElementById('scroll-view')
  if (!scrollView) {
    return
  }
  const { shouldRecoveryScoll } = to.meta
  if (scrollPosition[to.fullPath] && shouldRecoveryScoll) {
    const { promise, resolve } = Promise.withResolvers<void>()
    to.meta.scrollPromise = resolve
    await promise
    scrollView.scrollTo({
      top: scrollPosition[to.fullPath].top,
      left: scrollPosition[to.fullPath].left,
      behavior: 'smooth',
    })
  }
}

export default useRecoveryScrollPosition
