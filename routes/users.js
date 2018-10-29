const debug = require('debug')('travelLog');
const express = require('express');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const User = require('../models/user');
const utils = require('./utils');
const router = express.Router();
const config = require('../config');

const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
//Retrieve the secret key from our configuration
const secretKey = process.env.JWT_KEY || 'dfjsf';

/* 
 * POST: create a new user 
 */
router.post('/', utils.requireJson, function (req, res, next) {
    // Create a new document from the JSON in the request body
    const newUser = new User(req.body);
    // Save that document
    newUser.save(function (err, savedUser) {
        if (err) {
            return next(err);
        }
        debug(`Created user "${savedUser.email}"`);
        // Send the saved document in the response
        res.status(201)
            //.set('Location',`${config.baseUrl}/api/people/${savedPerson._id}`)
            .send(savedUser);
    });
});

/* 
 * POST: create a new user 
 */
/*router.post('/', utils.requireJson, function(req, res, next) {
  // Create a new document from the JSON in the request body
  let newUser = req.body;
  bcrypt.hash(newUser.password, saltRounds, function (err, hash){
      newUser.password = hash;
       const newUserDocument = new User (newUser);
      
        // Save that document
  newUserDocument.save(function(err, savedUser) {
    if (err) {
      return next(err);
    }
      debug(`Created user "${savedUser.email}"`);
    // Send the saved document in the response
      
    res
        .status(201)
 //.set('Location',`${config.baseUrl}/api/people/${savedPerson._id}`)
        .send(savedUser);
  });
  })  
});
*/

/* 
 * POST: signup
 */
router.post('/signup', (req, res, next) => {
    User.find({
            email: req.body.email
        })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "Mail exists"
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            userid: req.body.userid,
                            email: req.body.email,
                            password: hash
                        });
                        user.save().then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'User created'
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                });
            }
        });
});

/* 
 * POST: create a new user 
 
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
*/

/* 
 * POST: login
 */
router.post("/login", (req, res, next) => {
    User.find({
            email: req.body.email
        })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: "Auth failed"
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: "Auth failed"
                    });
                }
                if (result) {
                    const token = jwt.sign({
                            email: user[0].email,
                            userid: user[0].userid
                        },
                        secretKey, {
                            expiresIn: "168h"
                        }
                    );
                    return res.status(200).json({
                        message: "Auth successful",
                        token: token
                    });
                }
                res.status(401).json({
                    message: "Auth failed"
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });

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
        });
});


/* 
 * GET: list all users
 */
router.get('/', function (req, res, next) {
    User.find().sort('userid').exec(function (err, users) {
        if (err) {
            return next(err);
        }
        res.send(users);
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
        debug(`Updated User "${savedUser.email}"`);
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
        debug(`Deleted person "${req.user.email}"`);
        res.sendStatus(204);
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

/**
 *  JWT authentication middleware
 */
function authenticate(req, res, next) {
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
    })
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
