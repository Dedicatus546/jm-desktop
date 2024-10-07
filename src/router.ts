import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/home",
    children: [
      {
        path: "home",
        name: "HOME",
        component: () => import("@/views/app-home.vue"),
      },
      {
        path: "search",
        name: "SEARCH",
        component: () => import("@/views/app-search.vue"),
      },
      {
        path: "person",
        name: "PERSON",
        component: () => import("@/views/app-person.vue"),
      },
      {
        path: "login",
        name: "LOGIN",
        component: () => import("@/views/app-login.vue"),
      },
      {
        path: "config",
        name: "CONFIG",
        component: () => import("@/views/app-config.vue"),
      },
      {
        path: "comic-detail/:id",
        name: "COMIC_DETAIL",
        component: () => import("@/views/app-comic-detail.vue"),
      },
      {
        path: "comic-read/:id",
        name: "COMIC_READ",
        component: () => import("@/views/app-comic-read.vue"),
      },
      {
        path: "download",
        name: "DOWNLOAD",
        component: () => import("@/views/app-download.vue"),
      },
      {
        path: "sign-in",
        name: "SIGN_IN",
        component: () => import("@/views/app-sign-in.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
