const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ShellRunPlugin = require('./shellrun-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const getEnvVariables = require('./env.js');

const appBase = process.cwd();
const eslintFile = path.resolve(appBase, '.eslintrc-loader');
const appSrc = path.resolve(appBase, 'src/');
const appDist = path.resolve(appBase, 'build/');
const staticContent = path.resolve(appBase, 'static/');
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
        },

        mode: 'production',
        devtool: 'source-map',
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
                        name: 'vendors',
                        chunks: 'all',
                    },
                },
            },
            runtimeChunk: true,
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
                        MiniCssExtractPlugin.loader,
                        {
                            loader: require.resolve('css-loader'),
                            options: {
                                importLoaders: 1,
                                modules: true,
                                camelCase: true,
                                localIdentName: '[name]_[local]_[hash:base64]',
                                minimize: true,
                                sourceMap: true,
                            },
                        },
                        require.resolve('sass-loader'),
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
            new CopyWebpackPlugin([{ from: staticContent, to: appDist }]),
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
                messageBefore: 'Generating language map.',
                command: `
                    find ${appSrc} -name *.js |
                        xargs /usr/bin/gawk -f ${appSrc}/utils/finder.awk > ${appSrc}/usage.tmp &&
                        mkdir -p ${appSrc}/generated &&
                        rsync -c ${appSrc}/usage.tmp ${appSrc}/generated/usage.js;
                        rm ${appSrc}/usage.tmp;
                `,
                messageAfter: 'Done.',
            }),
        ],
    };
};
