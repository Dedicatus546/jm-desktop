import { RouterScrollBehavior } from "vue-router";

const scrollPosition: Record<
  string,
  {
    top: number;
    left: number;
  }
> = {};

const useRecoveryScrollPosition = (
  scrollEl: Ref<ComponentPublicInstance | HTMLElement | null>,
) => {
  const router = useRouter();

  router.beforeEach((_to, from, next) => {
    if (!scrollEl.value) {
      next();
      return;
    }
    const el =
      scrollEl.value instanceof HTMLElement
        ? scrollEl.value
        : (scrollEl.value.$el as HTMLElement);
    scrollPosition[from.path] = {
      top: el.scrollTop,
      left: el.scrollLeft,
    };
    next();
  });
};

export const scrollBehavior: RouterScrollBehavior = async (to) => {
  const scrollView = document.getElementById("scroll-view");
  if (!scrollView) {
    return;
  }
  if (["COMIC_DETAIL", "COMIC_READ"].includes(to.name as string)) {
    await nextTick();
    scrollView.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
    return;
  }
  if (scrollPosition[to.path]) {
    await nextTick();
    scrollView.scrollTo({
      top: scrollPosition[to.path].top,
      left: scrollPosition[to.path].left,
      behavior: "smooth",
    });
  }
};

export default useRecoveryScrollPosition;
