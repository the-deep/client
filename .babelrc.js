module.exports = {
    'env': {
        'test': {
            'plugins': [
                'babel-plugin-dynamic-import-node',
            ],
        },
    },
    'presets': [
        '@babel/preset-typescript',
        '@babel/preset-react',
        ['@babel/preset-env', {
            'useBuiltIns': 'usage',
            'corejs': 3,
            'debug': false,
        }],
    ],
    'plugins': [
        [
            '@babel/plugin-transform-runtime',
            {
                'regenerator': true,
            },
        ],
        // Stage 2
        ['@babel/plugin-proposal-decorators', { 'legacy': true }],
        '@babel/plugin-proposal-function-sent',
        '@babel/plugin-proposal-export-namespace-from',
        '@babel/plugin-proposal-numeric-separator',
        '@babel/plugin-proposal-throw-expressions',

        // Stage 3
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-syntax-import-meta',
        ['@babel/plugin-proposal-class-properties', { 'loose': false }],
        '@babel/plugin-proposal-json-strings',

        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-nullish-coalescing-operator',

        [
            'module-resolver',
            {
                'root': ['.'],
                'extensions': ['.js', '.jsx', '.ts', '.tsx'],
                'alias': {
                    '#components': './src/components',
                    '#dui': './src/components/ui',
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
                    '#widgetComponents': './src/widgetComponents',
                    '#widgets': './src/widgets',
                    '#typings': './src/typings',
                    '#qbc': './src/components/questionnaire-builder',
                },
            },
        ],
    ],
};
