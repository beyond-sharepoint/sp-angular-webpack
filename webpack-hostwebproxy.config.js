'use strict'

const path = require("path");
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const proxyConfig = require('./src/config.json');

module.exports = {
    name: 'host-web-proxy',
    entry: './src/HostWebProxy.js',
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
                    plugins: ["transform-runtime", "transform-async-to-generator"]
                }
            },
            { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!postcss-loader') },
            {
                test: /\.aspx$/,
                loader: 'string-replace',
                query: {
                    search: '{{siteUrl}}',
                    replace: proxyConfig.siteUrl
                }
            },
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
        new webpack.optimize.UglifyJsPlugin()
    ],
    postcss: [
        autoprefixer({
            browsers: ['last 2 version']
        })
    ],
};