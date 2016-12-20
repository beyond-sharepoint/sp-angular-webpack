'use strict';

// Modules
const path = require("path");
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    name: 'app-dev',
    devtool: 'eval-source-map',
    entry: {
        'vendor': './src/vendor.js',
        'app': './src/app.js'
    },
    module: {
        preLoaders: [],
        loaders: [
            //Delicious ES2015 code, made simple for simpleton browsers.
            { test: /\.js$/, loader: 'babel-loader', exclude: /(node_modules|bower_components)/ },
            { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!postcss-loader') },
            { test: /\.json$/, loader: "json-loader" },
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=200000&mimetype=application/font-woff&name=[hash].[ext]" },
            { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader?&name=/fonts/[hash].[ext]" },
            { test: /\.(png|jpe?g|gif|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' },
            { test: /\.(html|aspx)$/, loader: 'raw-loader' }
        ]
    },
    output: {
        path: path.join(__dirname, '/dist'),
        publicPath: 'http://localhost:8080/',
        filename: '/scripts/[name].bundle.js',
        chunkFilename: '/scripts/[name].bundle.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.aspx',
            inject: 'body'
        }),

        new webpack.optimize.CommonsChunkPlugin("vendor", "/scripts/vendor.bundle.js"),
        new ExtractTextPlugin('/styles/[name].[hash].css', { disable: true })
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
        stats: 'minimal'
    }
};