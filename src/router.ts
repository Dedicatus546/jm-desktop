import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/home",
    children: [
      {
        path: "home",
        component: () => import("@/views/app-home.vue"),
      },
      {
        path: "search",
        component: () => import("@/views/app-search.vue"),
      },
      {
        path: "person",
        component: () => import("@/views/app-person.vue"),
      },
      {
        path: "login",
        component: () => import("@/views/app-login.vue"),
      },
      {
        path: "config",
        component: () => import("@/views/app-config.vue"),
      },
      {
        path: "comic-detail/:id",
        component: () => import("@/views/app-comic-detail.vue"),
      },
      {
        path: "comic-read/:id",
        component: () => import("@/views/app-comic-read.vue"),
      },
      {
        path: "download",
        component: () => import("@/views/app-download.vue"),
      },
      {
        path: "sign-in",
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
