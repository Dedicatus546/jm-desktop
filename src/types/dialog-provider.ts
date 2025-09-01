export const injectKey = Symbol('vuetify-dialog')

export const dialogProviderInjectKey = Symbol('vuetify-dialog')

export type DialogInstanceOptions = {
  id: number
  modelValue: boolean
  width: number | string | undefined
  title: string
  content: string
  okLoading: boolean
  okText: string
  cancelLoading: boolean
  cancelText: string
  onOk: () => Promise<void> | void
  onCancel: () => Promise<void> | void
}

export type DialogProviderUserOptions = Omit<
  DialogInstanceOptions,
  | 'id'
  | 'modelValue'
  | 'width'
  | 'okLoading'
  | 'cancelLoading'
  | 'okText'
  | 'cancelText'
  | 'onOk'
  | 'onCancel'
>
& Partial<
    Pick<
      DialogInstanceOptions,
      'width' | 'okText' | 'cancelText' | 'onOk' | 'onCancel'
    >
  >

export type DialogProviderInjectType = (
  options: DialogProviderUserOptions,
) => void
