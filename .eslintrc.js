module.exports = {
  extends: ['eslint:recommended'],
  env: {
    es6: true,
    browser: false,
    node: true
  },
  parser: 'babel-eslint',
  rules: {
    'strict': [2, 'global'],
    'no-debugger': 0,
    'no-console': 0,
    'no-cond-assign': [2, 'except-parens'],
    'comma-dangle': 0,
    'no-undef': 2,
    'no-unused-vars': 2,
    'camelcase': 2,
    'eol-last': 2
  }
};
