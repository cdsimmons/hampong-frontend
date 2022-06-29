/**
 * Webpack main configuration file
 */

const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const glob = require('glob');
const Dotenv = require('dotenv-webpack');

const environment = require('./configuration/environment');

const templatesPath = path.resolve(__dirname, environment.paths.source, 'templates');
const templateFiles = glob.sync('/**/*', {nodir: true, root: templatesPath}); // fs.readdirSync(path.resolve(__dirname, environment.paths.source, 'templates/**/*'));
const htmlPluginEntries = templateFiles.filter(template => !template.includes('/partials/')).map((template) => {
  const reversePath = templatesPath.split('\\').join('/')+'/';
  const filename = template.replace(reversePath, '');

  return new HTMLWebpackPlugin({
    inject: true,
    hash: false,
    filename: filename,
    template: path.resolve(environment.paths.source, 'templates', template),
    favicon: path.resolve(environment.paths.source, 'static', 'favicon.ico'),
  })
});

module.exports = {
  entry: ['@babel/polyfill', path.resolve(environment.paths.source, 'js', 'app.js')],
  output: {
    filename: 'js/[name].js',
    path: environment.paths.output,
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.((c|sa|sc)ss)$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(png|gif|jpe?g|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: 'images/design/[name].[hash:6].[ext]',
              publicPath: '../',
              limit: environment.limits.images,
            },
          },
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: 'fonts/[name].[hash:6].[ext]',
              publicPath: '../',
              limit: environment.limits.fonts,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new Dotenv(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
    new ImageMinimizerPlugin({
      test: /\.(jpe?g|png)$/i,
      deleteOriginalAssets: false,
      filename: '[path][name].webp',
      minimizerOptions: {
        plugins: ['imagemin-webp'],
      },
    }),
    new ImageMinimizerPlugin({
      test: /\.(webp)$/i,
      deleteOriginalAssets: false,
      filename: '[path][name].jpg',
      minimizerOptions: {
        plugins: [['jpegtran', { progressive: true }]],
      },
    }),
    new ImageMinimizerPlugin({
      test: /\.(webp|jpe?g|png|gif|svg)$/i,
      minimizerOptions: {
        // Lossless optimization with custom option
        // Feel free to experiment with options for better result for you
        plugins: [
          ['gifsicle', { interlaced: true }],
          ['jpegtran', { progressive: true }],
          ['optipng', { optimizationLevel: 5 }],
          [
            'svgo',
            {
              plugins: [
                {
                  removeViewBox: false,
                },
              ],
            },
          ],
        ],
      },
    }),
    new CleanWebpackPlugin({
      verbose: true,
      cleanOnceBeforeBuildPatterns: ['**/*', '!stats.json'],
    }),
    // new CopyWebpackPlugin({
    //   patterns: [
    //     {
    //       from: path.resolve(environment.paths.source, 'images', 'content'),
    //       to: path.resolve(environment.paths.output, 'images', 'content'),
    //       toType: 'dir',
    //       globOptions: {
    //         ignore: ['*.DS_Store', 'Thumbs.db'],
    //       },
    //     },
    //   ],
    // }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(environment.paths.source, 'static'),
          to: path.resolve(environment.paths.output),
          toType: 'dir',
          globOptions: {
            ignore: ['.*']
          }
        },
      ],
    }),
  ].concat(htmlPluginEntries),
  target: ['web', 'es5']
};
