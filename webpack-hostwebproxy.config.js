'use strict'

const path = require("path");
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    name: 'host-web-proxy',
    entry: ['babel-polyfill', 'whatwg-fetch', './src/HostWebProxy.js'],
    module: {
        preLoaders: [],
        loaders: [
            //Delicious ES2015 code, made simple for simpleton browsers.
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
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
            {
                test: /\.aspx$/,
                loader: 'raw-loader'
            }
        ]
    },
    output: {
        path: path.join(__dirname, '/dist'),
        publicPath: '/',
        filename: 'HostWebProxy.js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/HostWebProxy.aspx',
            filename: 'HostWebProxy.aspx',
            inject: 'body',
            inlineSource: '.(js|css)$' // embed all javascript and css inline
        }),
        new HtmlWebpackInlineSourcePlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } })
    ],
    postcss: [
        autoprefixer({
            browsers: ['last 2 version']
        })
    ],
};