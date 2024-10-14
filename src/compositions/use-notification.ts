import { NotificationInstance } from "ant-design-vue/es/notification";

export const injectNotificationKey = Symbol("notification");

const useNotification = () => {
  const api = inject<NotificationInstance>(injectNotificationKey);
  if (api === undefined) {
    throw new Error("无法找到全局的 notification 实例");
  }
  return api;
};

export default useNotification;
