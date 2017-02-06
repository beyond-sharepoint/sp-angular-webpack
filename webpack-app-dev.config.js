'use strict';

// Modules
const path = require("path");
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');

module.exports = {
    name: 'app-dev',
    devtool: 'cheap-module-eval-source-map',
    entry: {
        'vendor': ['babel-polyfill', 'whatwg-fetch', './src/vendor.js'],
        'app': './src/app.js'
    },
    module: {
        rules: [
            //Delicious ES2015 code, made simple for simpleton browsers.
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /(node_modules|bower_components)/,
                query: {
                    presets: ['es2015'],
                    plugins: [
                        "transform-runtime",
                        "transform-async-to-generator",
                        "transform-flow-strip-types"
                    ]
                }
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader?sourceMap',
                        'postcss-loader'
                    ]
                })
            },
            { test: /\.json$/, loader: "hson-loader" },
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=200000&mimetype=application/font-woff&name=[hash].[ext]" },
            { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader?name=fonts/[hash].[ext]" },
            { test: /\.(png|jpe?g|gif|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' },
            { test: /\.(html|aspx)$/, loader: 'raw-loader' }
        ]
    },
    output: {
        path: path.join(__dirname, '/dist'),
        publicPath: 'http://localhost:8080/',
        filename: 'scripts/[name].bundle.js',
        chunkFilename: 'scripts/[name].bundle.js',
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
        pathinfo: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.aspx',
            inject: 'body'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: "vendor",
            filename: "scripts/vendor.bundle.[hash].js",
            minChunks: Infinity,
        }),
        new ExtractTextPlugin({
            filename: 'styles/[name].[hash].css',
            disable: true
        }),
        new webpack.LoaderOptionsPlugin({
            options: {
                context: __dirname,
                output: { path: './' },
                postcss: [
                    autoprefixer({
                        browsers: ['last 2 version']
                    })
                ]
            }
        }),
        new DashboardPlugin()
    ],
    devServer: {
        contentBase: './src/assets',
        historyApiFallback: true,
        inline: true,
        stats: 'minimal',
        headers: { "P3P": "CP=\"ALL IND DSP COR ADM CONo CUR CUSo IVAo IVDo PSA PSD TAI TELo OUR SAMo CNT COM INT NAV ONL PHY PRE PUR UNI\"" }
    }
};