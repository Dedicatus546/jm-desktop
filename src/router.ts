import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

import AppComicDetail from "@/views/app-comic-detail.vue";
import AppComicRead from "@/views/app-comic-read.vue";
import AppConfig from "@/views/app-config.vue";
import AppDownload from "@/views/app-download.vue";
import AppHome from "@/views/app-home.vue";
import AppLogin from "@/views/app-login.vue";
import AppPerson from "@/views/app-person.vue";
import AppSearch from "@/views/app-search.vue";
import AppSignIn from "@/views/app-sign-in.vue";

import { scrollBehavior } from "./compositions/use-recovery-scroll-position";
import AppCategory from "./views/app-category.vue";
import AppComicLatest from "./views/app-comic-latest.vue";
import AppQuickSearch from "./views/app-quick-search.vue";
import AppWeek from "./views/app-week.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/home",
    children: [
      {
        path: "home",
        name: "HOME",
        component: AppHome,
      },
      {
        path: "search",
        name: "SEARCH",
        component: AppSearch,
      },
      {
        path: "quick-search",
        name: "QUICK_SEARCH",
        props: (to) => ({
          query: to.query.query as string,
        }),
        component: AppQuickSearch,
      },
      {
        path: "category",
        name: "CATEGORY",
        component: AppCategory,
      },
      {
        path: "week",
        name: "WEEK",
        component: AppWeek,
      },
      {
        path: "person",
        name: "PERSON",
        component: AppPerson,
      },
      {
        path: "login",
        name: "LOGIN",
        component: AppLogin,
      },
      {
        path: "config",
        name: "CONFIG",
        component: AppConfig,
      },
      {
        path: "comic-detail/:id(\\d+)",
        name: "COMIC_DETAIL",
        props: (to) => ({
          id: Number.parseInt(to.params.id as string),
        }),
        component: AppComicDetail,
      },
      {
        path: "comic-read/:id(\\d+)",
        name: "COMIC_READ",
        props: (to) => ({
          id: Number.parseInt(to.params.id as string),
        }),
        component: AppComicRead,
      },
      {
        path: "download",
        name: "DOWNLOAD",
        component: AppDownload,
      },
      {
        path: "sign-in",
        name: "SIGN_IN",
        component: AppSignIn,
      },
      {
        path: "comic-latest",
        name: "COMIC_LATEST",
        component: AppComicLatest,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior,
});

export default router;
