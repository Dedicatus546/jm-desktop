import { inject } from "vue";

import { injectKey, SnackbarInjectValue } from "@/types";

export default function useSnackbar() {
  const message = inject<SnackbarInjectValue>(injectKey);
  if (!message) {
    throw new Error(
      "[useSnackbar]: you must use `useSnackbar` function after using `snackbar-provider` component in your parent component.",
    );
  }
  return message;
}
