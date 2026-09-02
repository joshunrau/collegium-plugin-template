import js from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import perfectionist from 'eslint-plugin-perfectionist';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['**/node_modules']
  },
  {
    extends: [js.configs.recommended],
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.es2021,
        ...globals.node
      },
      sourceType: 'module'
    },
    rules: {
      'max-depth': ['error', { max: 4 }],
      'no-alert': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-var': 'error',
      'prefer-const': 'error'
    }
  },
  {
    files: ['**/*.js', '**/*.ts'],
    plugins: {
      'import-x': importX
    },
    rules: {
      'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import-x/exports-last': 'error',
      'import-x/no-duplicates': 'error'
    }
  },
  {
    extends: [perfectionist.configs['recommended-natural']],
    files: ['**/*.js', '**/*.ts'],
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          groups: [
            ['value-builtin', 'type-builtin'],
            ['value-external', 'type-external'],
            ['value-internal', 'type-internal'],
            ['value-index', 'value-sibling', 'value-parent'],
            'type-import',
            'style',
            ['side-effect', 'side-effect-style'],
            'unknown'
          ],
          newlinesBetween: 1,
          type: 'natural'
        }
      ],
      'perfectionist/sort-modules': 'off'
    }
  },
  {
    extends: [tseslint.configs.recommendedTypeChecked, tseslint.configs.stylisticTypeChecked],
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@typescript-eslint/consistent-indexed-object-style': ['error', 'index-signature'],
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/prefer-nullish-coalescing': ['error', { ignorePrimitives: { boolean: true } }],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowBoolean: true, allowNever: true, allowNumber: true }
      ]
    }
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off'
    }
  }
);
