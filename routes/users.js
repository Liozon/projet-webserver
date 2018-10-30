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
// POST: Create a user (without authentication)
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
            //.set('Location',`${config.baseUrl}/api/people/${savedUser._id}`)
            .send(savedUser);
    });
});
*/


/**
 * @api {post} /users/signup Create a user
 * @apiName CreateUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Registers a new user.
 *
 * @apiUse UserInRequestBody
 * @apiUse UserInResponseBody
 * @apiUse UserValidationError
 *
 * @apiExample Example
 *     POST /users/signup HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *       "email": "user1@email.com",
 *       "password": "user1password"
 *     }
 *
 * @apiSuccessExample 201 Created
 *     HTTP/1.1 201 Created
 *     Content-Type: application/json
 *     Location: https://comem-webserv-2018-2019-e.herokuapp.com/users/1
 *
 *     {
 *       "_id": "5bd8b53ffc7de055c4ca07aa",
 *       "userid": 1,
 *       "email": "user1@email.com",
 *       "password": "$2b$10$ju7qmV4h6syfEC313nJ4FeZ11Z5AM/tU6roiRIHytViwUuqdtNZgC",
 *       "registrationDate": "2018-10-30T19:47:11.613Z"
 *     }
 */
router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email})
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


/**
 * @api {post} /users/login Login a user
 * @apiName LoginUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Login an existing user.
 *
 * @apiUse UserInRequestBody
 * @apiUse UserLoginError
 *
 * @apiExample Example
 *     POST /users/login HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *       "email": "user1@email.com",
 *       "password": "user1password"
 *     }
 *
 * @apiSuccessExample 200 Ok
 *     HTTP/1.1 200 Ok
 *     Content-Type: application/json
 *     Location: https://comem-webserv-2018-2019-e.herokuapp.com/users/1
 *
 *     {
 *       "message": "Auth successful",
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGVtYWlsLmNvbSIsInVzZXJpZCI6MSwiaWF0IjoxNTQwOTMwMjE1LCJleHAiOjE1NDE1MzUwMTV9.TGkLNJdB1ls9gI0JhUOdPqoDzSAjqVbI0971BAY1E_o"
 *     }
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


/**
 * @api {get} /users List users
 * @apiName RetrieveUsers
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Retrieves a paginated list of users sorted by userid (in ascending order).
 *
 * @apiUse UserInResponseBody
 *
 * @apiParam (URL query parameters) {String} [gender] Select only people of the specified gender
 *
 * @apiExample Example
 *     GET /user?gender=male&page=2&pageSize=50 HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *     Link: &lt;https://evening-meadow-25867.herokuapp.com/user?page=1&pageSize=50&gt;; rel="first prev"
 *
 *     [
 *       {
 *         "_id": "5bd8b53ffc7de055c4ca07aa",
 *         "userid": 1,
 *         "email": "user1@email.com",
 *         "password": "$2b$10$ju7qmV4h6syfEC313nJ4FeZ11Z5AM/tU6roiRIHytViwUuqdtNZgC",
 *         "registrationDate": "2018-10-30T19:47:11.613Z"
 *       },
 *       {
 *         "_id": "5bd8c61c580be55df4452243",
 *         "userid": 2,
 *         "email": "user2@email.com",
 *         "password": "$2b$10$NWz7jXlfvPH1Bqk09QriSewmnCt780wThfqZQGTcQvMp9MUP9QjwS",
 *         "registrationDate": "2018-10-30T20:59:08.422Z"
 *       }
 *     ]
 */
router.get('/', function (req, res, next) {
    User.find().sort('userid').exec(function (err, users) {
        if (err) {
            return next(err);
        }
        res.send(users);
    });
});


/**
 * @api {get} /users/:userid List one user
 * @apiName RetrieveUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Show one user.
 *
 * @apiUse UserInResponseBody
 *
 * @apiParam (URL query parameters) {String} [gender] Select only people of the specified gender
 *
 * @apiExample Example
 *     GET /user?gender=male&page=2&pageSize=50 HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *     Link: &lt;https://evening-meadow-25867.herokuapp.com/user?page=1&pageSize=50&gt;; rel="first prev"
 *
 *     [
 *       {
 *         "_id": "5bd8b53ffc7de055c4ca07aa",
 *         "userid": 1,
 *         "email": "user1@email.com",
 *         "password": "$2b$10$ju7qmV4h6syfEC313nJ4FeZ11Z5AM/tU6roiRIHytViwUuqdtNZgC",
 *         "registrationDate": "2018-10-30T19:47:11.613Z"
 *       }
 *     ]
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
router.delete('/:userid', loadUserFromParamsMiddleware, function (req, res, next) {
    // remove the user
    req.user.remove(function (err) {
        if (err) {
            return next(err);
        }
        debug(`Deleted user with email: "${req.user.email}"`);
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

/**
 * @apiDefine UserInRequestBody
 * @apiParam (Request body) {String{/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/}} email The email of the user (must be unique)
 * @apiParam (Request body) {String} password The password of the user
 */

/**
 * @apiDefine UserInResponseBody
 * @apiSuccess (Response body) {String} _id A unique identifier for the user generated by the server
 * @apiSuccess (Response body) {Number} userid The unique identifier of the user
 * @apiSuccess (Response body) {String} email The email of the user
 * @apiSuccess (Response body) {String} password The password of the user protected by a cryptographic hash function
 * @apiSuccess (Response body) {Date} registrationDate The date at which the user was registered with default value Date.now
 */

/**
 * @apiDefine UserValidationError
 *
 * @apiError (Error 4xx) {Object} 409/Conflict Error User's email already exists
 * @apiError (Error 5xx) {Object} 500/InternalServerError Some of the user's properties are invalid
 *
 * @apiErrorExample {json} 409 Conflict
 *     HTTP/1.1 409 Conflict
 *     Content-Type: application/json
 *
 *     {
 *       "message": "Mail exists"
 *     }
 *
 * @apiErrorExample {json} 500 Internal Server Error
 *     HTTP/1.1 500 Internal Server Error
 *     Content-Type: application/json
 *
 *     {
 *       "message": "User validation failed",
 *       "error": {
 *          "errors": {
 *              "email": {
 *                    "message": "Please fill a valid email adress",
 *                    "name": "ValidatorError",
 *                    "properties": {
 *                        "message": "Please fill a valid email adress",
 *                        "type": "user defined",
 *                        "path": "email",
 *                        "value": "foo"
 *                    },
 *                    "kind": "user defined",
 *                    "path": "email",
 *                    "value": "foo",
 *                    "$isValidatorError": true
 *                }
 *            },
 *            "_message": "User validation failed",
 *            "message": "User validation failed: email: Please fill a valid email adress",
 *            "name": "ValidationError"
 *       }
 *     }
 */

/**
 * @apiDefine UserLoginError
 *
 * @apiError {Object} 401/Unauthorized Email or password is missing or is not autorized for login
 *
 * @apiErrorExample {json} 401 Unauthorized
 *     HTTP/1.1 401 Unauthorized
 *     Content-Type: application/json
 *
 *     {
 *       "message": "Auth failed"
 *     }
 */

module.exports = router;