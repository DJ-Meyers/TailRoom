import js from '@eslint/js'
import globals from 'globals'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      'simple-import-sort': simpleImportSort,
      'no-relative-import-paths': noRelativeImportPaths,
      'prefer-arrow-functions': preferArrowFunctions,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        { allowSameFolder: false, prefix: '~', rootDir: 'src' },
      ],
      'prefer-arrow-functions/prefer-arrow-functions': [
        'error',
        { returnStyle: 'implicit' },
      ],
    },
  },
])
