const config = require('../config');
const formatLinkHeader = require('format-link-header');

/**
 * Responds with 415 Unsupported Media Type if the request does not have the Content-Type application/json.
 */
exports.requireJson = function(req, res, next) {
  if (req.is('application/json')) {
    return next();
  }

  const error = new Error('This resource only has an application/json representation');
  error.status = 415; // 415 Unsupported Media Type
  next(error);
};