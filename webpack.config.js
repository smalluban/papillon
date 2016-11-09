const webpack = require('webpack'); /* eslint import/no-extraneous-dependencies: 0 */

module.exports = {
  entry: {
    './dist/papillon.js': './papillon.js',
    './dist/papillon.min.js': './papillon.js',
  },
  output: {
    path: './',
    filename: '[name]',
    libraryTarget: 'umd',
    library: 'papillon',
    sourceMapFilename: '[file].map',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel', 'eslint'],
      },
    ],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true,
      mangle: false,
    }),
  ],
  devtool: 'source-map',
};
