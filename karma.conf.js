const webpackConfig = require('./webpack.config');
const reporters = ['progress'];
if (process.env.NODE_ENV === 'coverage') reporters.push('coverage');

module.exports = (config) => {
  config.set({
    basePath: process.cwd(),
    frameworks: ['jasmine'],
    files: [
      'test/*.js',
    ],
    exclude: [],
    preprocessors: {
      'test/*.js': ['webpack', 'sourcemap'],
    },
    webpack: Object.assign({}, webpackConfig, {
      devtool: 'inline-source-map',
      entry: undefined,
      eslint: {
        configFile: './.eslintrc',
      },
      webpackServer: {
        noInfo: true,
      },
    }),
    webpackMiddleware: {
      stats: 'errors-only',
    },
    reporters,
    coverageReporter: {
      type: 'html',
      dir: 'coverage/',
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
  });
};
