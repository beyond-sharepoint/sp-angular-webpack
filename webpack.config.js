'use strict';

// Modules
const path = require("path");
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
const ENV = process.env.npm_lifecycle_event;
const isTest = ENV === 'test' || ENV === 'test-watch';
const isProd = ENV === 'build';

module.exports = function makeWebpackConfig() {

  var config = {};

  config.entry = isTest ? {} : {
    'vendor': './src/vendor.js',
    'app': './src/app.js'
  };

  config.output = isTest ? {} : {
    path: path.join(__dirname, '/dist'),
    publicPath: isProd ? '/' : 'http://localhost:8080/',
    filename: isProd ? '/scripts/[name].[hash].js' : '/scripts/[name].bundle.js',
    chunkFilename: isProd ? '/scripts/[name].[hash].js' : '/scripts/[name].bundle.js'
  };

  if (isTest) {
    config.devtool = 'inline-source-map';
  } else if (isProd) {
    config.devtool = 'source-map';
  } else {
    config.devtool = 'eval-cheap-source-map';
  }

  config.module = {
    preLoaders: [],
    loaders: [
      //Delicious ES2015 code, made simple for simpleton browsers.
      { test: /\.js$/, loader: 'babel-loader', exclude: /(node_modules|bower_components)/},
      { test: /\.css$/, loader: isTest ? 'null-loader' : ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!postcss-loader') },
      { test: /\.json$/, loader: "json-loader" },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=200000&mimetype=application/font-woff&name=[hash].[ext]" },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader?&name=/fonts/[hash].[ext]" },
      { test: /\.(png|jpe?g|gif|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' },
      { test: /\.(html|aspx)$/, loader: 'raw-loader' }
    ]
  };

  if (isTest) {
    config.module.preLoaders.push({
      test: /\.js$/,
      exclude: [
        /node_modules/,
        /\.spec\.js$/
      ],
      loader: 'istanbul-instrumenter',
      query: {
        esModules: true
      }
    })
  }

  config.postcss = [
    autoprefixer({
      browsers: ['last 2 version']
    })
  ];


  config.plugins = [];

  if (!isTest) {
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: './src/index.aspx',
        inject: 'body'
      }),

      new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.bundle.js"),

      new ExtractTextPlugin('/styles/[name].[hash].css', { disable: !isProd })
    )
  }

  // When building for prod, ensure more things.
  if (isProd) {
    config.plugins.push(
      new webpack.NoErrorsPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin(),
      new CopyWebpackPlugin([{
        from: path.join(__dirname, '/src/assets')
      }])
    )
  }

  config.devServer = {
    contentBase: './src/assets',
    historyApiFallback: true,
    inline: true,
    stats: 'minimal'
  };

  return config;
} ();