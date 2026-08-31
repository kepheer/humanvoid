import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['coverage/**', 'dist/**', 'node_modules/**', 'harness/cypress/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
  },
  {
    files: ['src/client/**/*.ts', 'tests/client/**/*.ts'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['harness/lib/**/*.mjs', 'harness/runners/**/*.mjs'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.{ts,mts,cts}'],
    rules: {
      eqeqeq: 'error',
      curly: ['error', 'all'],
      'no-debugger': 'error',
      'no-eval': 'error',
      'prefer-const': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  prettier,
]
