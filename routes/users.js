// TODO: DELETE, PATCH

const debug = require('debug');
var express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user');

var router = express.Router();


/* 
 * POST: create a new user 
 */
router.post('/', function(req, res, next) {
  // Create a new document from the JSON in the request body
  const newUser = new User(req.body);
  // Save that document
  newUser.save(function(err, savedUser) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedUser);
  });
});

/* 
 * GET: list all users
 */
router.get('/', function(req, res, next) {
  User.find().sort('userid').exec(function(err, users) {
    if (err) {
      return next(err);
    }
    res.send(users);
  });
});

/* 
 * PATCH: Modify an existing user 
 */
//router.patch('/', function(req, res, next) { });

/* 
 * DELETE: Delete an existing user 
 */
router.delete('/', function(req, res, next) {
    
    // remove the user
    req.user.remove(function(err) {
        if (err) {
            return next(err);
        }
        
        debug('Deleted person "${req.user.userName}"');
        res.sendStatus(204);
    });
});


module.exports = router;