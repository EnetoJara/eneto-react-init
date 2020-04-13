"use strict";

const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const InlineChunkHtmlPlugin = require("react-dev-utils/InlineChunkHtmlPlugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const InterpolateHtmlPlugin = require("react-dev-utils/InterpolateHtmlPlugin");
const WatchMissingNodeModulesPlugin = require("react-dev-utils/WatchMissingNodeModulesPlugin");
const ModuleNotFoundPlugin = require("react-dev-utils/ModuleNotFoundPlugin");
const vars = require('./var');
const postcssNormalize = require("postcss-normalize");
const env = vars();

const imageInlineSizeLimit = 1000;
module.exports = {
    mode: "development",
    bail: false,
    devtool: "source-map",
    name: "client",
    target: "web",
    entry: [
        'webpack/hot/poll?100',
        require.resolve("@babel/register"),
        require.resolve("core-js"),
        require.resolve("@babel/runtime/regenerator"),
        require.resolve("react-hot-loader/patch"),
        require.resolve("es6-promise/auto"),
        require.resolve(path.join(__dirname, '../src/dev.ts'))
    ],
    output: {
        path:  path.resolve(__dirname, "../public/"),
        pathinfo: true,
        filename: "static/js/[name]-bundle.js",
        futureEmitAssets: true,
        chunkFilename: "static/js/[name].chunk.js",
        publicPath: "/",
        devtoolModuleFilenameTemplate: info =>
            path.resolve(info.absoluteResourcePath).replace(/\\/g, "/"),
        jsonpFunction: `webpackJsonp-eneto-app`,
        globalObject: "this",
    },
    devServer: {
        port: Number(process.env.PORT),
        contentBase: 'public',
        hot: true,
        stats:{
            colors: true
        },
        quiet: false,
        host: "localhost",
        overlay: true,
        historyApiFallback: {
            disableDotRule: true,
        },
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                use: [{ loader: 'babel-loader' }]
            },
            {
                test: /\.(scss)$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: "postcss",
                            plugins: () => [
                                require("postcss-flexbugs-fixes"),
                                require("postcss-preset-env")({
                                    autoprefixer: {
                                        flexbox: "no-2009",
                                    },
                                    stage: 3,
                                }),

                                postcssNormalize(),
                            ],
                            sourceMap: true,
                        }
                    },
                    { loader: 'sass-loader' },
                ]
            }
            ,
            {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                loader: require.resolve("url-loader"),
                options: {
                    limit: imageInlineSizeLimit,
                    name: "static/media/[name].[ext]",
                },
            },
            {
                loader: require.resolve("file-loader"),

                exclude: [
                    /\.(js|mjs|jsx|ts|tsx)$/,
                    /\.html$/,
                    /\.json$/,
                    /\.scss$/,
                    /\.css$/,
                ],
                options: {
                    name: "static/media/[name].[ext]",
                },
            },

        ]
    },
    plugins: [
        new HtmlWebpackPlugin(
            Object.assign(
                {},
                {
                    inject: true,
                    template: path.join(__dirname, '../public/index.html'),
                }
            )
        ),

        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]),

        new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),

        new ModuleNotFoundPlugin(path.join(__dirname, "../src/")),

        new webpack.DefinePlugin(env.stringified),

        new webpack.HotModuleReplacementPlugin(),

        new CaseSensitivePathsPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new WatchMissingNodeModulesPlugin(path.join(__dirname, "../node_modules/")),

        new ManifestPlugin({
            fileName: "asset-manifest.json",
            publicPath: process.env.PUBLIC_URL,
            generate: (seed, files, entrypoints) => {
                const manifestFiles = files.reduce((manifest, file) => {
                    manifest[file.name] = file.path;
                    return manifest;
                }, seed);
                const entrypointFiles = entrypoints.main.filter(
                    fileName => !fileName.endsWith(".map")
                );

                return {
                    files: manifestFiles,
                    entrypoints: entrypointFiles,
                };
            },
        }),

        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ].filter(Boolean),

    node: {
        module: "empty",
        dgram: "empty",
        dns: "mock",
        fs: "empty",
        http2: "empty",
        net: "empty",
        tls: "empty",
        child_process: "empty",
    },

    performance: false,
}
