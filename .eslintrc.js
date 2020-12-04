module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'jsx-a11y/media-has-caption': 0,
    'react/jsx-filename-extension': 0,
    'no-unused-vars': 0,
    'no-nested-ternary': 0,
    'no-console': 0,
  },
};
