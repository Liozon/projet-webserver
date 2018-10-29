const debug = require('debug')('travelLog');
const express = require('express');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const User = require('../models/user');
const utils = require('./utils');
const router = express.Router();
const config = require('../config');


/* 
 * POST: create a new user 
 */
router.post('/', utils.requireJson, function (req, res, next) {

    //Validate request
    if (!req.body) {
        res.status(400);
    }

    // Create a new document from the JSON in the request body
    const newUser = new User(req.body);
    // Save that document
    newUser.save(function (err, savedUser) {
        if (err) {
            res.status(500);
            return next(err);
        }
        debug(`Created user "${savedUser.userName}"`);
        // Send the saved document in the response
        res
            .status(201)
            .set('Location',`${config.baseUrl}/users/${savedUser.userid}`)
            .send(savedUser);
    });
});

/* 
 * GET: list all users
 */
router.get('/', function (req, res, next) {
    
    User.find().sort('userid').exec(function (err, users) {
        if (err) {
            res.status(404);
            return next(err);
        }
        res
            .status(200)
            .send(users);
    });
});

/* 
 * GET: list one user
 */
router.get('/:userid', function (req, res, next) {
    const userid = req.params.userid;
    User.findOne({
        userid: userid
    }).exec(function (err, user) {
        if (err) {
            res.status(404);
            return next(err);
        }
        res
            .status(200)
            .send(user);
    });
});


/* 
 * PATCH: Modify an existing user 
 */
router.patch('/:userid', utils.requireJson, loadUserFromParamsMiddleware, function (req, res, next) {

    // Update properties present in the request body
    if (req.body.userName !== undefined) {
        req.user.userName = req.body.userName;
    }
    if (req.body.email !== undefined) {
        req.user.email = req.body.email;
    }
    if (req.body.password !== undefined) {
        req.user.password = req.body.password;
    }

    req.user.save(function (err, savedUser) {
        if (err) {
            return next(err);
        }

        debug(`Updated User "${savedUser.userName}"`);
        res
            .status(200)
            .send(savedUser);
    });
});

/* 
 * DELETE: Delete an existing user 
 */
router.delete('/:_id', loadUserFromParamsMiddleware, function (req, res, next) {

    // remove the user
    req.user.remove(function (err) {
        if (err) {
            return next(err);
        }

        debug(`Deleted person "${req.user.userName}"`);
        res.sendStatus(200);
    });
});

/**
 * Middleware that loads the user corresponding to the ID in the URL path.
 * Responds with 404 Not Found if the ID is not valid or the user doesn't exist.
 */
function loadUserFromParamsMiddleware(req, res, next) {

    const userid = req.params.userid;

    let query = User.findOne({
        userid: userid
    });

    query.exec(function (err, user) {
        if (err) {
            return next(err);
        } else if (!user) {
            return userNotFound(res, userid);
        }

        req.user = user;
        next();
    });
}

/**
 * Responds with 404 Not Found and a message indicating that the user with the specified ID was not found.
 */
function userNotFound(res, userid) {
    return res.status(404).type('text').send(`No user found with ID ${userid}`);
}


/* 
 * GET: list all trips of one user
 */
/*function countTripsFromUser(user, callback) {

    // Do not perform the aggregation query if there are no user to retrieve trips for
    if (user.length <= 0) {
        return callback(undefined, []);
    }

    // Aggregate trips count by user (i.e. user ID)
    Trip.aggregate([
        {
            $match: { // Select only trips directed by the user we are interested in
                creator: {
                    $in: user.map(user => user.userid)
                }
            }
    },
        {
            $group: { // Count trips by creator
                _id: '$creator',
                tripsCount: {
                    $sum: 1
                }
            }
    }
  ], callback);
}*/

module.exports = router;
