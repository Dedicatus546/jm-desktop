import mitt from "mitt";

export const emitter = mitt<{
  RefreshCompleteDownloadList: void;
}>();
