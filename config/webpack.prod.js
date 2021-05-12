const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const ShellRunPlugin = require('./shellrun-plugin');
const getEnvVariables = require('./env.js');

const appBase = process.cwd();
const eslintFile = path.resolve(appBase, '.eslintrc-loader.js');
const nodeModulesSrc = path.resolve(appBase, 'node_modules');
const appSrc = path.resolve(appBase, 'src/');
const appDist = path.resolve(appBase, 'build/');
const appIndexJs = path.resolve(appBase, 'src/index.js');
const appIndexHtml = path.resolve(appBase, 'public/index.html');
const appFavicon = path.resolve(appBase, 'public/favicon.ico');
const appLogo = path.resolve(appBase, 'public/favicon.png');
const staticContent = path.resolve(appBase, 'static/');

const smp = new SpeedMeasurePlugin({
    outputFormat: 'humanVerbose',
    loaderTopFiles: 20,
    disable: !process.env.MEASURE,
    // granularLoaderData: true,
});

module.exports = (env) => {
    const ENV_VARS = getEnvVariables(env);

    return smp.wrap({
        entry: appIndexJs,
        output: {
            path: appDist,
            publicPath: '/',
            chunkFilename: 'js/[name].[chunkhash].js',
            filename: 'js/[name].[chunkhash].js',
            sourceMapFilename: 'sourcemaps/[file].map',
        },

        node: {
            fs: 'empty',
        },

        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            alias: {
                'base-scss': path.resolve(appBase, 'src/stylesheets/'),
                'rs-scss': path.resolve(appBase, 'src/vendor/react-store/stylesheets/'),
            },
            symlinks: false,
        },

        mode: 'production',
        devtool: 'source-map',

        performance: {
            hints: 'warning',
        },

        stats: {
            assets: true,
            colors: true,
            errors: true,
            errorDetails: true,
            hash: true,
        },

        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    sourceMap: true,
                    parallel: true,
                    uglifyOptions: {
                        mangle: true,
                        compress: { typeofs: false },
                    },
                }),
                new OptimizeCssAssetsPlugin({
                    cssProcessorOptions: {
                        safe: true,
                    },
                }),
            ],
            splitChunks: {
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        /*
                        name(module) {
                            // get the name. E.g. node_modules/packageName/not/this/part.js
                            // or node_modules/packageName
                            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

                            // npm package names are URL-safe, but some servers don't like @ symbols
                            return `npm.${packageName.replace('@', '')}`;
                        },
                        enforce: true,
                        */
                        chunks: 'all',
                    },
                },
            },
            runtimeChunk: true,
        },

        module: {
            rules: [
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    include: appSrc,
                    exclude: nodeModulesSrc,
                    use: [
                        'babel-loader',
                        {
                            loader: 'eslint-loader',
                            options: {
                                configFile: eslintFile,
                            },
                        },
                    ],
                },
                {
                    test: /\.s?css$/,
                    include: appSrc,
                    sideEffects: true,
                    exclude: nodeModulesSrc,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: require.resolve('css-loader'),
                            options: {
                                importLoaders: 1,
                                modules: true,
                                // camelCase: true,
                                localsConvention: 'camelCase',
                                // localIdentName: '[name]_[local]_[hash:base64]',
                                sourceMap: true,
                            },
                        },
                        {
                            loader: require.resolve('sass-loader'),
                            options: {
                                sourceMap: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.(css|scss)$/,
                    include: nodeModulesSrc,
                    use: [
                        MiniCssExtractPlugin.loader,
                        require.resolve('css-loader'),
                    ],
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    exclude: nodeModulesSrc,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'assets/[hash].[ext]',
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new webpack.ProgressPlugin({
                // activeModules: true,
                // entries: true,
                // modules: true,
                // modulesCount: 5000,
                // profile: false,
                // dependencies: true,
                // dependenciesCount: 10000,
                // percentBy: null,
            }),
            new webpack.DefinePlugin({
                'process.env': ENV_VARS,
            }),
            new CircularDependencyPlugin({
                exclude: /node_modules/,
                failOnError: false,
                allowAsyncCycles: false,
                cwd: appBase,
            }),
            new HtmlWebpackPlugin({
                template: appIndexHtml,
                filename: './index.html',
                title: 'DEEP',
                favicon: path.resolve(appFavicon),
                chunksSortMode: 'none',
            }),
            new MiniCssExtractPlugin({
                filename: 'css/[name].[hash].css',
                chunkFilename: 'css/[id].[hash].css',
            }),
            new WebpackPwaManifest({
                name: 'DEEP',
                short_name: 'DEEP',
                description: 'DEEP is an open source, community driven web application to intelligently collect, tag, analyze and export secondary data.',
                background_color: '#e0e0e0',
                start_url: '.',
                display: 'standalone',
                theme_color: '#008975',
                icons: [
                    {
                        src: path.resolve(appLogo),
                        sizes: [96, 128, 192, 256, 384, 512],
                    },
                ],
            }),
            new ShellRunPlugin({
                messageBefore: 'Started generating language map.',
                command: `
                    find "${appSrc}/" -regex ".*\\.\\(js\\|ts\\|tsx\\|jsx\\)" |
                        xargs gawk -f "${appSrc}/utils/finder.awk" > "${appSrc}/usage.tmp" &&
                        mkdir -p "${appSrc}/generated" &&
                        rsync -c "${appSrc}/usage.tmp" "${appSrc}/generated/usage.js";
                        rm "${appSrc}/usage.tmp";
                `,
                messageAfter: 'Finished generating language map.',
            }),
            new CopyWebpackPlugin({
                patterns: [{ from: staticContent, to: appDist }],
            }),
            new CleanWebpackPlugin(),
        ],
    });
};
