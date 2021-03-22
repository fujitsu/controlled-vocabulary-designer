/**
 * webpack.config.js COPYRIGHT FUJITSU LIMITED 2021
 */
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const path = require('path')

module.exports = (env, argv) => {
  // const MODE_CONF = 'development';
  const MODE_CONF = 'production';
  const IS_DEVELOPMENT = MODE_CONF === 'development';

  return {
    mode: MODE_CONF,
    entry: ['./client/app.js',
            '@babel/polyfill',
            'whatwg-fetch'],
    output: {
        path: path.resolve(__dirname, './public/app/js/'),
        filename: 'app.js'
    },
    module: {
        rules: [
        {
            test: /\.js$/,
            exclude:[ /node_modules/ ],
            use: {
                loader: 'babel-loader',
                options: {
                  plugins: [
                    'react-html-attrs',
                    [require('@babel/plugin-proposal-decorators'), {legacy: true}],
                    [require('@babel/plugin-proposal-class-properties'), {loose: true }]
                  ],
                  presets: ['@babel/preset-react', '@babel/preset-env']
                }
            }
        },
        {
            test: /\.css$/i,
            loaders: ['style-loader', 'css-loader']
        },
        {
            test: /\.(jpe?g|png|gif)$/i,
            use: [
              {
                loader: 'url-loader',
                options: {
                  name: 'img/[name].[ext]'
                },
              },
            ],
        }
      ]
    },
    devtool: IS_DEVELOPMENT ? 'inline-source-map' : 'none',
    optimization: {
      minimizer: IS_DEVELOPMENT
        ? []
        : [
            new TerserPlugin({
              terserOptions: {
                compress: { drop_console: true }
              }
            })
          ]
    }
  }
};
