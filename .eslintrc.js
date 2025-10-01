module.exports = {
  extends: ['expo', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/prop-types': 'off',
    'react-native/no-inline-styles': 'warn',
    'prettier/prettier': 'error',
    // Security: Enforce logger usage instead of console
    'no-console': ['error', { allow: [] }], // No console.* allowed
    'no-eval': 'error',
    'no-implied-eval': 'error',
  },
  ignorePatterns: ['node_modules/', '*.config.js', '.expo/', 'dist/', 'build/'],
};