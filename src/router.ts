import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

import { scrollBehavior } from "@/compositions/use-recovery-scroll-position";
import AppComicDetail from "@/views/app-comic-detail.vue";
import AppComicRead from "@/views/app-comic-read.vue";
import AppHome from "@/views/app-home.vue";

import { createLogger } from "./logger";

const { info } = createLogger("router");

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "HOME",
    component: AppHome,
  },
  {
    path: "/search",
    name: "SEARCH",
    component: () => import("@/views/app-search.vue"),
  },
  {
    path: "/quick-search",
    name: "QUICK_SEARCH",
    props: (to) => ({
      query: to.query.query as string,
    }),
    component: () => import("@/views/app-quick-search.vue"),
  },
  {
    path: "/category",
    name: "CATEGORY",
    component: () => import("@/views/app-category.vue"),
  },
  {
    path: "/week",
    name: "WEEK",
    component: () => import("@/views/app-week.vue"),
  },
  {
    path: "/person",
    name: "PERSON",
    component: () => import("@/views/app-person.vue"),
  },
  {
    path: "/login",
    name: "LOGIN",
    component: () => import("@/views/app-login.vue"),
  },
  {
    path: "/config",
    name: "CONFIG",
    component: () => import("@/views/app-config.vue"),
  },
  {
    path: "/comic-detail/:id(\\d+)",
    name: "COMIC_DETAIL",
    props: (route) => ({
      id: Number.parseInt(route.params.id as string),
    }),
    component: AppComicDetail,
  },
  {
    path: "/comic-read/:id(\\d+)",
    name: "COMIC_READ",
    props: (route) => ({
      id: Number.parseInt(route.params.id as string),
    }),
    component: AppComicRead,
  },
  {
    path: "/sign-in",
    name: "SIGN_IN",
    component: () => import("@/views/app-sign-in.vue"),
  },
  {
    path: "/comic-latest",
    name: "COMIC_LATEST",
    component: () => import("@/views/app-comic-latest.vue"),
  },
  {
    path: "/about",
    name: "ABOUT",
    component: () => import("@/views/app-about.vue"),
  },
  {
    path: "/download",
    name: "DOWNLOAD",
    component: () => import("@/views/app-download.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior,
});

router.beforeEach((to, from, next) => {
  info("router.beforeEach", "从", from.fullPath, "跳转到", to.fullPath);
  next();
});

export default router;
