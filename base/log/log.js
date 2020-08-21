
const log4js = require('log4js');

log4js.configure({
  replaceConsole: true,
  appenders: {
    info: {
      type: 'file',
      filename: 'logs/info/info',
      pattern: 'yyyy-MM-dd.log',
      maxLogSize: 10 * 1024 * 1024, // = 10Mb
      backups: 10, // keep five backup files
      compress: true, // compress the backups
      alwaysIncludePattern: true,
      encoding: 'utf-8',
      mode: 0o0640,
      flags: 'w+'
    },
    error: {
      type: 'dateFile',
      filename: 'logs/error/error',
      pattern: 'yyyy-MM-dd.log',
      backups: 10, // keep five backup files
      compress: true,
      alwaysIncludePattern: true
    },
    out: {
      type: 'stdout'
    }
  },
  categories: {
    default: { appenders: ['info', 'out'], level: 'trace' },
    error: { appenders: ['error', 'out'], level: 'error'},
  }
});

exports.getLogger = function(category) {
  return log4js.getLogger(category);
};