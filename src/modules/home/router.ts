import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

import AppComicDetail from '@/views/app-comic-detail.vue'
import AppComicRead from '@/views/app-comic-read.vue'
import AppHome from '@/views/app-home.vue'

import { log } from '@/utils/logger'
import { scrollManager } from '@/utils/scroll-manager'

const { info } = log

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'HOME',
    component: AppHome,
  },
  {
    path: '/search',
    name: 'SEARCH',
    component: () => import('@/views/app-search.vue'),
  },
  {
    path: '/quick-search',
    name: 'QUICK_SEARCH',
    props: (to) => ({
      query: to.query.query as string,
    }),
    component: () => import('@/views/app-quick-search.vue'),
  },
  {
    path: '/category',
    name: 'CATEGORY',
    component: () => import('@/views/app-category.vue'),
  },
  {
    path: '/week',
    name: 'WEEK',
    component: () => import('@/views/app-week.vue'),
  },
  {
    path: '/person',
    name: 'PERSON',
    component: () => import('@/views/app-person.vue'),
  },
  {
    path: '/comic-detail/:id(\\d+)',
    name: 'COMIC_DETAIL',
    props: (route) => ({
      id: Number.parseInt(route.params.id as string),
    }),
    component: AppComicDetail,
  },
  {
    path: '/comic-read/:id(\\d+)',
    name: 'COMIC_READ',
    props: (route) => ({
      id: Number.parseInt(route.params.id as string),
    }),
    component: AppComicRead,
  },
  {
    path: '/comic-latest',
    name: 'COMIC_LATEST',
    component: () => import('@/views/app-comic-latest.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: scrollManager.getScrollBehavior(),
})

router.beforeEach((to, from) => {
  info('router.beforeEach', '从', from.fullPath, '跳转到', to.fullPath)
})

router.beforeEach((_to, from) => {
  const scrollEl = document.getElementById('scroll-view') as HTMLDivElement
  if (!scrollEl) {
    return
  }
  scrollManager.setPosition(from.fullPath, {
    top: scrollEl.scrollTop,
    left: scrollEl.scrollLeft,
  })
})

export default router
