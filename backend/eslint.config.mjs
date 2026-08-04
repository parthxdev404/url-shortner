import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

import js from '@eslint/js';
export default [
  js.configs.recommended,

  ...tseslint.configs.recommended,

  prettier,

  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  {
    files: ['**/*.ts'],

    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
      },
    },

    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/no-explicit-any': 'warn',

      'no-console': 'off',
    },
  },
];
