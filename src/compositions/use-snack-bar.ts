import { inject } from "vue";

import {
  snackbarProviderInjectKey,
  SnackbarProviderInjectValue,
} from "@/types";

export default function useSnackbar() {
  const message = inject<SnackbarProviderInjectValue>(
    snackbarProviderInjectKey,
  );
  if (!message) {
    throw new Error(
      "[useSnackbar]: you must use `useSnackbar` function after using `snackbar-provider` component in your parent component.",
    );
  }
  return message;
}
