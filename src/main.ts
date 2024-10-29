import "@mdi/font/css/materialdesignicons.css";
import "swiper/swiper-bundle.css";
import "typeface-noto-sans-sc";
import "vuetify/styles";
import "virtual:uno.css";
import "./style.css";

import { createApp } from "vue";
import { createVuetify } from "vuetify";

import App from "./App.vue";
import logger from "./logger";
import router from "./router";
import pinia from "./store";

const vuetify = createVuetify();

const app = createApp(App);

app.config.errorHandler = (err, _instance, info) => {
  logger.error(`[vue] 全局捕获错误，错误码 ${info} 错误信息 ${String(err)}`);
};

app.config.performance = true;

app.use(vuetify).use(pinia).use(router);

app.mount("#root");
