var webpack = require('webpack');

module.exports = {
  entry: "./papillon",
  output: {
    path: "./dist/",
    libraryTarget: "umd",
    library: "papillon",
    filename: "papillon-umd.js"
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel' }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({compress: { warnings: false }})
  ],
  devtool: '#source-map'
};
