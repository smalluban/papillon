module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'node_modules/core-js/client/core.js',
      { pattern: 'test/**/*.js', watched: false }
    ],
    exclude: [],
    preprocessors: {
      'test/**/*.js': ['webpack']
    },
    webpack: {
      module: {
        loaders: [
          { test: /\.js$/, loader: 'babel' }
        ]
      },
      devtool: "#inline-source-map"
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false
  });
};
