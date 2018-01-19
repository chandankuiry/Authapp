'use strict';
const winston = require('winston');
const transports = require('./environments/')(winston);
var logger;

module.exports.init = init;
module.exports.logger = getLogger;
module.exports.stream = getStream;

function init() {
  logger = new winston.Logger({
    transports: transports
  });

  return logger;
}

function getLogger() {
  if (!logger) {
    return init();
  }

  return logger;
}

function getStream() {
  return {
    write: function(message, encoding){
      logger.info(message);
    }
  }
}