module.exports = {
    extends: [
        'airbnb',
        'plugin:css-modules/recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    env: {
        browser: true,
        jest: true,
    },
    globals: {
        chrome: true,
    },
    plugins: [
        'react',
        'react-hooks',
        'import',
        'css-modules',
        '@typescript-eslint',
    ],
    settings: {
        'import/resolver': {
            'babel-module': {
                root: ['.'],
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
                alias: {
                    '#components': './src/components',
                    '#config': './src/config',
                    '#constants': './src/constants',
                    '#cs': './src/cs',
                    '#entities': './src/entities',
                    '#notify': './src/notify',
                    '#redux': './src/redux',
                    '#request': './src/request',
                    '#resources': './src/resources',
                    '#rest': './src/rest',
                    '#hooks': './src/hooks',
                    '#rsca': './src/vendor/react-store/components/Action',
                    '#rscg': './src/vendor/react-store/components/General',
                    '#rsci': './src/vendor/react-store/components/Input',
                    '#rscv': './src/vendor/react-store/components/View',
                    '#rscz': './src/vendor/react-store/components/Visualization',
                    '#rsk': './src/vendor/react-store/constants',
                    '#rsu': './src/vendor/react-store/utils',
                    '#schema': './src/schema',
                    '#store': './src/store',
                    '#theme': './src/theme',
                    '#ts': './src/ts',
                    '#utils': './src/utils',
                    '#views': './src/views',
                    '#newViews': './src/newViews',
                    '#newComponents': './src/newComponents',
                    '#widgetComponents': './src/widgetComponents',
                    '#widgets': './src/widgets',
                    '#typings': './src/typings',
                    '#qbc': './src/components/questionnaire-builder',
                },
            },
        },
        react: {
            version: 'detect',
        },
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        ecmaFeatures: {
            jsx: true,
        },
        sourceType: 'module',
        allowImportExportEverywhere: true,
    },
    rules: {
        strict: 0,
        indent: ['error', 4, { SwitchCase: 1 }],
        'no-console': 0,

        camelcase: 'warn',

        'react/jsx-indent': [2, 4],
        'react/jsx-indent-props': [2, 4],
        'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
        'react/prop-types': [1, { ignore: [], customValidators: [], skipUndeclared: false }],
        'react/forbid-prop-types': [1],

        'jsx-a11y/anchor-is-valid': ['error', {
            components: ['Link'],
            specialLink: ['to'],
        }],

        'import/extensions': ['off', 'never'],
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],

        'css-modules/no-unused-class': [1, { camelCase: true }],
        'css-modules/no-undef-class': [1, { camelCase: true }],

        'prefer-destructuring': 'warn',
        'function-paren-newline': ['warn', 'consistent'],
        'object-curly-newline': [2, {
            ObjectExpression: { consistent: true },
            ObjectPattern: { consistent: true },
            ImportDeclaration: { consistent: true },
            ExportDeclaration: { consistent: true },
        }],

        'jsx-a11y/label-has-for': [ 'error', {
            'required': {
                'some': [ 'nesting', 'id'  ],
            },
        }],

        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],

        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error'],

        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error'],

        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        'react/sort-comp': 'off',

        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/camelcase': 'off',

        'react/prefer-stateless-function': 'warn',
        'import/no-named-as-default': 'warn',

        'react/no-unused-state': 'warn',
        'react/default-props-match-prop-types': ['warn', {
            allowRequiredDefaults: true,
        }],
        'react/require-default-props': ['warn', {
            ignoreFunctionalComponents: true,
        }],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
    },
};
