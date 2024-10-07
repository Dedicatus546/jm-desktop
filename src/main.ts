import "swiper/swiper-bundle.css";
import "dayjs/locale/zh-cn";
import "typeface-noto-sans-sc";
import "ant-design-vue/dist/reset.css";
import "virtual:uno.css";
import "./style.css";

import dayjs from "dayjs";
import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";
import pinia from "./store";

dayjs.locale("zh-cn");

const app = createApp(App);

app.use(pinia).use(router);

app.mount("#root");
