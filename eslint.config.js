import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist', 'node_modules'] }, // Added node_modules

  // Configuration for React/Browser files
  {
    files: ['src/**/*.{js,jsx}'], // Target files inside src
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser, // Use browser globals
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  // Configuration for Node.js files (e.g., server.js, config files)
  {
    files: ['*.js', 'api/**/*.js'], // Target root JS files and files in api/
    languageOptions: {
      ecmaVersion: 2022, // Use a recent ECMAScript version
      globals: {
        ...globals.node, // Use Node.js globals
      },
      sourceType: 'module', // Assuming you use ES modules in server.js
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
];
