import { globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import unocss from '@unocss/eslint-config/flat'
import stylistic from '@stylistic/eslint-plugin'
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort'
import autoImportJson from './.eslintrc-auto-import.json' with { type: 'json' }
import defineImportJson from './.eslintrc-define-import.json' with { type: 'json' }
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default tseslint.config([
  globalIgnores(['data/**', 'release/**', 'public/**', 'dist/**', 'dist-electron/**', 'node_modules/**']),
  {
    files: ['src/**/*.{vue,ts}', 'electron/**/*.ts'],
    plugins: {
      'simple-import-sort': eslintPluginSimpleImportSort,
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
        extraFileExtensions: ["vue"]
      },
      globals: Object.assign(
        {},
        autoImportJson.globals,
        defineImportJson.globals,
      ),
    },
  },
  {
    files: ['src/**/*.{vue,ts}'],
    languageOptions: {
      globals: Object.assign({}, globals.browser)
    }
  },
  {
    files: ['electron/**/*.ts'],
    languageOptions: {
      globals: Object.assign({}, globals.node)
    }
  },
  {
    files: ['src/**/*.vue'],
    extends: [unocss,pluginVue.configs['flat/essential']],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  stylistic.configs.recommended,
  stylistic.configs.customize({
    
  }),
])
