'use strict';

// Modules
const path = require("path");
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    name: 'app-test',
    devtool: 'inline-source-map',
    module: {
        rules: [
            //Preloader
            {
                test: /\.js$/,
                enforce: "pre",
                exclude: [
                    /node_modules/,
                    /\.spec\.js$/,
                    /src\/api/
                ],
                loader: 'istanbul-instrumenter-loader',
                query: {
                    esModules: true
                }
            },
            //Delicious ES2015 code, made simple for simpleton browsers.
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components|src\/api)/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015'],
                    plugins: [
                        "transform-async-to-bluebird",
                        "transform-promise-to-bluebird",
                        "transform-flow-strip-types",
                        "transform-runtime"
                    ]
                }
            },
            { test: /\.css$/, loader: 'null-loader' },
            { test: /\.(json|jsd|jsontxt)$/, loader: "hson-loader" },
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=200000&mimetype=application/font-woff&name=[hash].[ext]" },
            { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader?&name=/fonts/[hash].[ext]" },
            { test: /\.(png|jpe?g|gif|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' },
            { test: /\.(html|aspx)$/, loader: 'raw-loader' }
        ]
    },
    output: {},
    plugins: [
        new webpack.LoaderOptionsPlugin({
            options: {
                postcss: [
                    autoprefixer({
                        browsers: ['last 2 version']
                    })
                ]
            }
        })
    ]
};