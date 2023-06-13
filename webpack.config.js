/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
  mode: process.env.NODE_ENV,
  entry: './src/js/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        sideEffects: true,
      },
      {
        test: /\.(glsl|frag|vert)$/,
        exclude: /node_modules/,
        loader: 'raw-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].[contenthash].js',
  },
  optimization: {
    minimize: false,
    minimizer: ['...', new CssMinimizerPlugin()],
  },
  devServer: {
    open: true,
    static: {
      directory: path.join(__dirname, 'src/public'),
    },
    compress: true,
    port: 3000,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename:
        process.env.NODE_ENV === 'development'
          ? '[name].css'
          : '[name].[hash].css',
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/pages/index.html'),
      filename: 'index.html',
      minify: false,
      inject: 'body',
    }),
    new CopyPlugin({
      patterns: [{ from: path.join(__dirname, 'src/public/'), to: '' }],
    }),
  ],
};
