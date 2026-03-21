import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import jsdoc from 'eslint-plugin-jsdoc';
import jsonc from 'eslint-plugin-jsonc';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsoncParser from 'jsonc-eslint-parser';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const typedTsConfigs = [
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.strictTypeChecked,
].map((config) => ({
  ...config,
  files: ['**/*.{ts,tsx,mts,cts}'],
  ignores: [
    '**/*.config.{js,cjs,mjs,ts,cts,mts}',
    '**/vite.config.*',
    '**/vitest.config.*',
    '**/eslint.config.*',
  ],
}));

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.nx/**',
      '**/build',
      '**/.react-router',
      '**/vite.config.*.timestamp*',
      '**/vite.config.{ts,mts,js,mjs,cjs}',
      '**/vitest.config.{ts,mts,js,mjs,cjs}',
      '**/eslint.config.{ts,mts,js,mjs,cjs}',
      '**/react-router.config.{ts,mts,js,mjs,cjs}',
      '**/vitest.config.*.timestamp*',
    ],
  },
  js.configs.recommended,
  ...typedTsConfigs,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.es2022,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      jsdoc,
    },
    rules: {
      // Type-safety baseline
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            arguments: false,
          },
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-unused-vars': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "Program > :matches(VariableDeclaration[kind='const'],ExportNamedDeclaration:has(> VariableDeclaration[kind='const']),FunctionDeclaration,ExportNamedDeclaration:has(> FunctionDeclaration),ExportDefaultDeclaration:has(> FunctionDeclaration)) ~ :matches(TSInterfaceDeclaration,TSTypeAliasDeclaration,ExportNamedDeclaration:has(> TSInterfaceDeclaration),ExportNamedDeclaration:has(> TSTypeAliasDeclaration))",
          message:
            'Keep top-level declaration order as: exported types, local types, constants, exported functions, local functions.',
        },
        {
          selector:
            "Program > :matches(FunctionDeclaration,ExportNamedDeclaration:has(> FunctionDeclaration),ExportDefaultDeclaration:has(> FunctionDeclaration)) ~ :matches(VariableDeclaration[kind='const'],ExportNamedDeclaration:has(> VariableDeclaration[kind='const']))",
          message:
            'Keep top-level declaration order as: exported types, local types, constants, exported functions, local functions.',
        },
        {
          selector:
            'Program > :matches(TSInterfaceDeclaration,TSTypeAliasDeclaration) ~ :matches(ExportNamedDeclaration:has(> TSInterfaceDeclaration),ExportNamedDeclaration:has(> TSTypeAliasDeclaration))',
          message: 'Place exported types before non-exported types.',
        },
        {
          selector:
            'Program > FunctionDeclaration ~ :matches(ExportNamedDeclaration:has(> FunctionDeclaration),ExportDefaultDeclaration:has(> FunctionDeclaration))',
          message: 'Place exported functions before non-exported functions.',
        },
      ],

      // Public methods must have documented intent
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: false,
            MethodDefinition: true,
          },
        },
      ],
      'jsdoc/require-description': 'error',
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    files: ['**/*.{spec,test}.{ts,tsx,mts,cts}'],
    rules: {
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['**/*.{tsx,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      'react/jsx-uses-vars': 'error',
      'react/self-closing-comp': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    files: ['**/*.{json,jsonc}'],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      jsonc,
    },
    rules: {
      'jsonc/indent': ['error', 2],
      'jsonc/key-name-casing': 'off',
      'jsonc/no-comments': 'off',
    },
  },
  prettierConfig,
];
