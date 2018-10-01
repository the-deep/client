const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ShellRunPlugin = require('./shellrun-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');

const getEnvVariables = require('./env.js');

const appBase = process.cwd();
const eslintFile = path.resolve(appBase, '.eslintrc-loader');
const appSrc = path.resolve(appBase, 'src/');
const appDist = path.resolve(appBase, 'build/');
const appIndexJs = path.resolve(appBase, 'src/index.js');
const appIndexHtml = path.resolve(appBase, 'public/index.html');
const appFavicon = path.resolve(appBase, 'public/favicon.ico');
const appLogo = path.resolve(appBase, 'public/favicon.png');

module.exports = (env) => {
    const ENV_VARS = getEnvVariables(env);

    return {
        entry: appIndexJs,
        output: {
            path: appDist,
            publicPath: '/',
            chunkFilename: 'js/[name].[chunkhash].js',
            filename: 'js/[name].[chunkhash].js',
            sourceMapFilename: 'sourcemaps/[file].map',
        },

        resolve: {
            alias: {
                'base-scss': path.resolve(appBase, 'src/stylesheets/'),
                'rs-scss': path.resolve(appBase, 'src/vendor/react-store/stylesheets/'),
            },
            symlinks: false,
        },

        mode: 'development',
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
        devtool: 'cheap-module-eval-source-map',
        devServer: {
            host: '0.0.0.0',
            port: 3000,
            overlay: true,
            watchOptions: {
                ignored: /node_modules/,
            },
            // Don't show warnings in browser console
            clientLogLevel: 'none',
        },

        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    include: appSrc,
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
                    test: /\.scss$/,
                    include: appSrc,
                    use: [
                        'style-loader',
                        {
                            loader: require.resolve('css-loader'),
                            options: {
                                importLoaders: 1,
                                modules: true,
                                camelCase: true,
                                localIdentName: '[name]_[local]_[hash:base64]',
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
                    test: /\.(png|jpg|gif|svg)$/,
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
            new webpack.DefinePlugin({
                'process.env': ENV_VARS,
            }),
            new CircularDependencyPlugin({
                exclude: /node_modules/,
                failOnError: false,
                allowAsyncCycles: false,
                cwd: appBase,
            }),
            new CleanWebpackPlugin([appDist], { root: appBase }),
            new HtmlWebpackPlugin({
                template: appIndexHtml,
                filename: './index.html',
                title: 'DEEP',
                favicon: path.resolve(appFavicon),
                chunksSortMode: 'none',
            }),
            new MiniCssExtractPlugin({
                filename: 'css/[name].css',
                chunkFilename: 'css/[id].css',
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
                messageBefore: 'Generating language map.',
                command: `
                    find ${appSrc} -name *.js |
                        xargs gawk -f ${appSrc}/utils/finder.awk > usage.tmp &&
                        mkdir -p ${appSrc}/generated &&
                        rsync -c usage.tmp ${appSrc}/generated/usage.js;
                        rm usage.tmp;
                `,
                messageAfter: 'Done.',
            }),
        ],
    };
};
