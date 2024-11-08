import { ExtractPropTypes, VNodeChild } from "vue";
import { VSnackbar } from "vuetify/components";

export const snackbarProviderInjectKey = Symbol("vuetify-snackbar");

export type TextType = string | (() => VNodeChild);

export interface closable {
  close: () => void;
}

export type VSnackbarProps = ExtractPropTypes<VSnackbar>;

export type SnackbarLocation =
  | "top left"
  | "top center"
  | "top right"
  | "bottom left"
  | "bottom center"
  | "bottom right";

export interface SnackbarOptions {
  color?: VSnackbarProps["color"];
  location?: SnackbarLocation;
  timeout?: VSnackbarProps["timeout"];
  variant?: VSnackbarProps["variant"];
}

export interface SnackbarBaseInstance extends Required<SnackbarOptions> {
  id: number;
  modelValue: boolean;
  text: TextType;
  top?: number;
  bottom?: number;
}

export interface SnackbarTopInstance extends SnackbarBaseInstance {
  location: Extract<SnackbarLocation, `top ${string}`>;
  top: number;
}

export interface SnackbarBottomInstance extends SnackbarBaseInstance {
  location: Extract<SnackbarLocation, `bottom ${string}`>;
  bottom: number;
}

export type SnackbarInstance = SnackbarTopInstance | SnackbarBottomInstance;

export const isSnackbarTopInstance = (
  inst: SnackbarBaseInstance,
): inst is SnackbarTopInstance => {
  return inst.location.startsWith("top");
};

export interface Snackbar<T = any> {
  (
    text: TextType,
    config?: T extends string
      ? Omit<SnackbarOptions, "color">
      : SnackbarOptions,
  ): closable;
}

export interface SnackbarProviderInjectValue extends Snackbar<void> {
  primary: Snackbar<"primary">;
  success: Snackbar<"success">;
  warning: Snackbar<"warning">;
  error: Snackbar<"error">;
}
