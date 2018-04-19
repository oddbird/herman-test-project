'use strict';

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const SassDocPlugin = require('./sassdoc-webpack-plugin');
const webpack = require('webpack');

let outputPath = path.join(__dirname, 'dist');
let jsOutput = '[name].bundle.js';
let styleOutput = '[name].bundle.css';
let mediaOutput = '[name].[ext]';
let devtool = 'cheap-module-inline-source-map';

// Override settings if running in production
if (process.env.NODE_ENV === 'production') {
  outputPath = path.join(__dirname, 'dist', 'min');
  jsOutput = '[name].bundle.[chunkhash].min.js';
  styleOutput = '[name].bundle.[chunkhash].min.css';
  mediaOutput = '[name].[hash].[ext]';
  devtool = 'source-map';
}

const extractAppCSS = new ExtractTextPlugin(styleOutput);
const extractDocCSS = new ExtractTextPlugin(styleOutput);
const sassdocPath = path.join(outputPath, 'docs');

const sassDocOpts = {
  src: './sass/**/*.scss',
  dest: sassdocPath,
  theme: 'herman',
  verbose: true,
  display: { alias: true },
  herman: {
    extraLinks: [
      {
        name: 'Accoutrement-Color',
        url: 'http://oddbird.net/accoutrement-color/',
      },
      {
        name: 'Accoutrement-Scale',
        url: 'http://oddbird.net/accoutrement-scale/',
      },
      {
        name: 'Accoutrement-Type',
        url: 'http://oddbird.net/accoutrement-type/',
      },
    ],
    fontpath: path.join(__dirname, 'fonts'),
  },
};

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  // context for entry points
  context: path.join(__dirname, 'src'),
  // define all the entry point bundles
  entry: {
    main: './main.js',
    css: ['main.scss'],
    docs: ['docs.scss'],
    sass_json: ['json.scss'],
  },
  output: {
    path: outputPath,
    filename: jsOutput,
  },
  resolve: {
    // where to look for "required" modules
    modules: ['src', 'sass', 'node_modules'],
    alias: {
      '@': path.join(__dirname, 'src', 'components'),
    },
  },
  plugins: [
    // ignore flycheck and Emacs special files when watching
    new webpack.WatchIgnorePlugin([/flycheck_/, /\.#/, /#$/]),
    new webpack.LoaderOptionsPlugin({
      debug: process.env.NODE_ENV !== 'production',
    }),
    extractAppCSS,
    extractDocCSS,
    new SassDocPlugin(sassDocOpts, {
      assetPaths: [
        { entry: 'docs', optPath: 'herman.customCSS' },
        { entry: 'sass_json', optPath: 'herman.sass.jsonfile' },
      ],
      outputPath,
    }),
    new CleanWebpackPlugin([outputPath], {
      root: __dirname,
      verbose: true,
    }),
    // generate dynamic base template
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'index.html'),
      favicon: path.join(__dirname, 'images', 'favicon.ico'),
      inject: false,
    }),
  ],
  module: {
    rules: [
      {
        test: /src\/.*\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
          },
        ],
      },
      {
        test: /\.woff$|\.woff2$|\.ttf$|\.eot$/,
        use: [
          {
            loader: 'file-loader',
            options: { name: mediaOutput },
          },
        ],
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$|\.svg$/,
        use: [
          {
            loader: 'file-loader',
            options: { name: mediaOutput },
          },
          {
            loader: 'img-loader',
            options: {
              mozjpeg: { progressive: true },
            },
          },
        ],
      },
      {
        test: /main\.scss$/,
        use: extractAppCSS.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                minimize: process.env.NODE_ENV === 'production',
              },
            },
            {
              loader: 'sass-loader',
              options: { sourceMap: true },
            },
          ],
        }),
      },
      {
        test: /\.scss$/,
        exclude: /main\.scss$/,
        use: extractDocCSS.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                minimize: process.env.NODE_ENV === 'production',
                url: false,
              },
            },
            {
              loader: 'sass-loader',
              options: { sourceMap: true },
            },
          ],
        }),
      },
    ],
  },
  devtool,
};
