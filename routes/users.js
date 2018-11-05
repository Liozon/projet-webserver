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
            //.set('Location',`${config.baseUrl}/users/${savedUser._id}`)
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
 *       "_id": "5be0145e53d9a90016a8ff6d",
 *       "userid": 1,
 *       "email": "user1@email.com",
 *       "password": "$2b$10$0DbA496hz1Fia3/2c.Sd/Oqj6hxBiDrk5t5XK5ge3ngKTPUDWwsK6",
 *       "registrationDate": "2018-11-05T09:58:54.588Z"
 *     }
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
 *
 *     {
 *       "message": "Auth successful",
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGVtYWlsLmNvbSIsInVzZXJpZCI6MSwiaWF0IjoxNTQxNDEyMDM1LCJleHAiOjE1NDIwMTY4MzV9.sgt0kgjVDOALiX4trNA3iuZkdS2dn6om-tWXPI8qAz0"
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
 * @apiDescription Retrieves a list of users sorted by userid (in ascending order).
 *
 * @apiUse UserInResponseBody
 *
 * @apiExample Example
 *     GET /users HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *     Location: https://comem-webserv-2018-2019-e.herokuapp.com/users
 *
 *     [
 *       {
 *         "_id": "5be0145e53d9a90016a8ff6d",
 *         "userid": 1,
 *         "email": "user1@email.com",
 *         "password": "$2b$10$0DbA496hz1Fia3/2c.Sd/Oqj6hxBiDrk5t5XK5ge3ngKTPUDWwsK6",
 *         "registrationDate": "2018-11-05T09:58:54.588Z"
 *       },
 *       {
 *         "_id": "5be0150a53d9a90016a8ff6e",
 *         "userid": 2,
 *         "email": "user2@email.com",
 *         "password": "$2b$10$dXHbPbxQxiKasRnKc7x6tuT9WTsIxqToJM2I8CzdUJTJGO2.PUIse",
 *         "registrationDate": "2018-11-05T10:01:46.546Z"
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
 * @api {get} /users/:userid Retrieve a user
 * @apiName RetrieveUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Retrieves one user.
 *
 * @apiUse UserIdInUrlPath
 * @apiUse UserInResponseBody
 * @apiUse UserNotFoundError
 *
 * @apiExample Example
 *     GET /users/1 HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *     Location: https://comem-webserv-2018-2019-e.herokuapp.com/users/1
 *
 *     {
 *       "_id": "5be0145e53d9a90016a8ff6d",
 *       "userid": 1,
 *       "email": "user1@email.com",
 *       "password": "$2b$10$0DbA496hz1Fia3/2c.Sd/Oqj6hxBiDrk5t5XK5ge3ngKTPUDWwsK6",
 *       "registrationDate": "2018-11-05T09:58:54.588Z"
 *     }
 */
router.get('/:userid', loadUserFromParamsMiddleware, function (req, res, next) {
    const userid = req.params.userid;
    User.findOne({
        userid: userid
    }).exec(function (err, user) {
        if (err) {
            return next(err);
        }
        res
            .status(200)
            .send(user);
    });
});


/**
 * @api {patch} /users/:userid Partially update a user
 * @apiName PartiallyUpdateUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Partially updates a user's data (only the properties found in the request body will be updated).
 * All properties are optional.
 *
 * @apiUse UserIdInUrlPath
 * @apiUse UserInRequestBody
 * @apiUse UserInResponseBody
 * @apiUse UserNotFoundError
 * @apiUse UserValidationError
 *
 * @apiExample Example
 *     PATCH /users/1 HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *       "email": "user1new@email.com"
 *     }
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *       "_id": "5be0145e53d9a90016a8ff6d",
 *       "userid": 1,
 *       "email": "user1new@email.com",
 *       "password": "$2b$10$0DbA496hz1Fia3/2c.Sd/Oqj6hxBiDrk5t5XK5ge3ngKTPUDWwsK6",
 *       "registrationDate": "2018-11-05T09:58:54.588Z"
 *     }
 */
router.patch('/:userid', utils.requireJson, loadUserFromParamsMiddleware, function (req, res, next) {

    // Update properties present in the request body
    if (req.body.email !== undefined) {
        req.user.email = req.body.email;
    }
    if (req.body.password !== undefined) {
        req.user.password = req.body.password;

        // Password Encryption
        let hash = bcrypt.hashSync(req.user.password, 10);
        req.user.password = hash;
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


/**
 * @api {put} /users/:userid Update a user
 * @apiName UpdateUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Replaces all the user's data (the request body must represent a full, valid user).
 *
 * @apiUse UserIdInUrlPath
 * @apiUse UserInRequestBody
 * @apiUse UserInResponseBody
 * @apiUse UserNotFoundError
 * @apiUse UserValidationError
 *
 * @apiExample Example
 *     PUT /users/1 HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *       "email": "user1new@email.com",
 *       "password": "user1newpassword"
 *     }
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *       "_id": "5be0145e53d9a90016a8ff6d",
 *       "userid": 1,
 *       "email": "user1new@email.com",
 *       "password": "$2b$10$f1ZgJx7NRbXOud0PJ01K1ul5iWd659E03ds4Mbl4N8ysNn99vw7Ge",
 *       "registrationDate": "2018-11-05T09:58:54.588Z"
 *     }
 */
router.put('/:userid', utils.requireJson, loadUserFromParamsMiddleware, function (req, res, next) {

    // Update all properties (regardless of whether they are in the request body or not)
    req.user.email = req.body.email;
    req.user.password = req.body.password;

    // Password Encryption
    let hash = bcrypt.hashSync(req.user.password, 10);
    req.user.password = hash;

    req.user.save(function (err, savedUser) {
        if (err) {
            return next(err);
        }

        debug(`Updated user "${savedUser.email}"`);
        res.send(savedUser);
    });
});


/**
 * @api {delete} /users/:userid Delete a user
 * @apiName DeleteUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Permanently deletes a user.
 *
 * @apiUse UserIdInUrlPath
 * @apiUse UserNotFoundError
 *
 * @apiExample Example
 *     DELETE /users/1 HTTP/1.1
 *
 * @apiSuccessExample 204 No Content
 *     HTTP/1.1 204 No Content
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
 * @apiDefine UserIdInUrlPath
 * @apiParam (URL path parameters) {Number} userid The unique identifier of the user to retrieve
 */

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
 * @apiDefine UserNotFoundError
 *
 * @apiError {Object} 404/NotFound No user was found corresponding to the userid in the URL path
 *
 * @apiErrorExample {json} 404 Not Found
 *     HTTP/1.1 404 Not Found
 *     Content-Type: text/plain
 *
 *     No user found with ID 1
 */

/**
 * @apiDefine UserValidationError
 *
 * @apiError (Error 4xx) {Object} 409/Conflict User's email already exists
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