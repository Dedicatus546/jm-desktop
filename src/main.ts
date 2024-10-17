import "swiper/swiper-bundle.css";
import "dayjs/locale/zh-cn";
import "typeface-noto-sans-sc";
import "ant-design-vue/dist/reset.css";
import "virtual:uno.css";
import "./style.css";

import dayjs from "dayjs";
import { createApp } from "vue";

import App from "./App.vue";
import logger from "./logger";
import router from "./router";
import pinia from "./store";

dayjs.locale("zh-cn");

const app = createApp(App);

app.config.errorHandler = (err, _instance, info) => {
  logger.error(`[vue] 全局捕获错误，错误码 ${info} 错误信息 ${String(err)}`);
};

app.config.performance = true;

app.use(pinia).use(router);

app.mount("#root");
