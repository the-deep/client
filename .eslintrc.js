module.exports = {
    'extends': [
        'airbnb',
        'plugin:css-modules/recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    'env': {
        'browser': true,
        'jest': true,
    },
    'globals': {
        'chrome': true,
    },
    'plugins': [
        'react',
        'react-hooks',
        'import',
        'css-modules',
        '@typescript-eslint',
    ],
    'settings': {
        'import/resolver': {
            'babel-module': {},
        },
        'react': {
            'version': 'detect',
        },
    },
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 2018,
        'ecmaFeatures': {
            'jsx': true,
        },
        'sourceType': 'module',
        'allowImportExportEverywhere': true,
    },
    'rules': {
        'strict': 0,
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'no-unused-vars': [1, { 'vars': 'all', 'args': 'after-used', 'ignoreRestSiblings': false }],
        'no-console': 0,

        'camelcase': 'warn',

        'react/jsx-indent': [2, 4],
        'react/jsx-indent-props': [2, 4],
        'react/jsx-filename-extension': ['error', {'extensions': ['.js', '.jsx', '.ts', '.tsx'] }],
        'react/prop-types': [1, { 'ignore': [], 'customValidators': [], 'skipUndeclared': false }],
        'react/forbid-prop-types': [1],
        'react/sort-comp': 'warn',

        'jsx-a11y/anchor-is-valid': [ 'error', {
            'components': [ 'Link' ],
            'specialLink': [ 'to' ],
        }],

        'import/extensions': ['off', 'never'],
        'import/no-extraneous-dependencies': ['error', {'devDependencies': true }],

        'css-modules/no-unused-class': [1, { 'camelCase': true }],
        'css-modules/no-undef-class': [1, { 'camelCase': true }],

        'prefer-destructuring': 'warn',
        'function-paren-newline': ['warn', 'consistent'],
        'object-curly-newline': [2, {
            'ObjectExpression': { 'consistent': true },
            'ObjectPattern': { 'consistent': true },
            'ImportDeclaration': { 'consistent': true },
            'ExportDeclaration': { 'consistent': true },
        }],

        'jsx-a11y/label-has-for': 'warn',

        '@typescript-eslint/no-empty-interface': 0,
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/camelcase': 0,
        '@typescript-eslint/no-empty-function': 'warn',

        'react/no-unused-state': 'warn',
        'react/default-props-match-prop-types': ['warn', {
            'allowRequiredDefaults': true,
        }],
        'react/require-default-props': 'warn',

        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
    },
};
