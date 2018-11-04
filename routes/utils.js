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

/**
 *  JWT authentication middleware
 */

exports.authenticate = function(req, res, next) {
    // Ensure the header is present.
    const authorization = req.get('Authorization');
    if (!authorization) {
        return res.status(401).send('Authorization header is missing');
    }
    // Check that the header has the correct format.
    const match = authorization.match(/^Bearer (.+)$/);
    if (!match) {
        return res.status(401).send('Authorization header is not a bearer token');
    }
    // Extract and verify the JWT.
    const token = match[1];
    jwt.verify(token, secretKey, function (err, payload) {
        if (err) {
            return res.status(401).send('Your token is invalid or has expired');
        } else {
            req.currentUserid = payload.sub;
            next(); // Pass the ID of the authenticated user to the next middleware.
        }
    });
};
