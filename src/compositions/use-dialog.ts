import { dialogProviderInjectKey, DialogProviderInjectType } from "@/types";

export default function useDialog() {
  const fn = inject<DialogProviderInjectType>(dialogProviderInjectKey);
  if (!fn) {
    throw new Error(
      "[useDialog]: you must use `useDialog` function after using `dialog-provider` component in your parent component.",
    );
  }
  return fn;
}
