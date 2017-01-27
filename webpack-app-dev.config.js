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
    debug: true,
    devtool: 'cheap-module-eval-source-map',
    entry: {
        'vendor': ['babel-polyfill', 'core-js', './src/vendor.js'],
        'app': './src/app.js'
    },
    module: {
        preLoaders: [],
        loaders: [
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
            { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!postcss-loader') },
            { test: /\.json$/, loader: "hson-loader" },
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=200000&mimetype=application/font-woff&name=[hash].[ext]" },
            { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader?name=fonts/[hash].[ext]" },
            { test: /\.(png|jpe?g|gif|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' },
            { test: /\.(html|aspx)$/, loader: 'raw-loader' }
        ]
    },
    output: {
        path: path.join(__dirname, '/dist'),
        assetsPublicPath: 'http://localhost:8080/',
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

        new webpack.optimize.CommonsChunkPlugin("vendor", "scripts/vendor.bundle.js"),
        new ExtractTextPlugin('styles/[name].[hash].css', { disable: true }),
        new DashboardPlugin(),
        new OpenBrowserPlugin({ url: 'http://localhost:8080' })
    ],
    postcss: [
        autoprefixer({
            browsers: ['last 2 version']
        })
    ],
    devServer: {
        contentBase: './src/assets',
        historyApiFallback: true,
        inline: true,
        stats: 'minimal',
        headers: { "P3P": "CP=\"ALL IND DSP COR ADM CONo CUR CUSo IVAo IVDo PSA PSD TAI TELo OUR SAMo CNT COM INT NAV ONL PHY PRE PUR UNI\"" }
    }
};