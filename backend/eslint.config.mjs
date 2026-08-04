import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

import js from '@eslint/js';
export default [
  js.configs.recommended,

  ...tseslint.configs.recommended,

  prettier,

  {
    files: ['**/*.ts'],

    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
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
