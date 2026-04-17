<script setup lang="ts">
const modelValue = defineModel<boolean>('modelValue')

const formState = reactive({
  url: '',
})

const formRules = {
  urlRules: [
    (value: string) => {
      if (/^https?:\/\//.test(value)) {
        return true
      }
      return '接口地址无效，请重新输入！'
    },
  ],
}

const submit = () => {}
</script>

<template>
  <v-dialog v-model:model-value="modelValue" width="50%">
    <v-card title="新增接口地址">
      <v-card-text>
        <v-form
          validate-on="input"
          :model="formState"
          class="wind-mb-4"
          @submit.prevent="submit()"
          v-slot:default="{ isValid }"
        >
          <v-row density="comfortable">
            <v-col :cols="12">
              <v-text-field
                color="primary"
                variant="outlined"
                v-model:model-value="formState.url"
                placeholder="请输入一个可用的接口地址"
                :rules="formRules.urlRules"
              >
              </v-text-field>
            </v-col>
            <v-col :cols="12">
              <v-btn
                :disabled="isValid === false"
                block
                size="large"
                variant="flat"
                color="primary"
                type="submit"
              >
                确认添加
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
