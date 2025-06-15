import mitt from "mitt";

export const emitter = mitt<{
  onProxyInfoChange: void;
}>();
