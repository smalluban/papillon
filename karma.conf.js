module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['browserify','jasmine'],
    files: [
      { pattern: 'test/**/*.js', watched: false }
    ],
    exclude: [],
    preprocessors: {
      'test/**/*.js': ['browserify']
    },
    browserify: {
      debug: true,
      transform: ['babelify']
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Firefox'],
    singleRun: false
  });
};
