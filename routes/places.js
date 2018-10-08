var express = require('express');
var router = express.Router();
const User = require('../models/place');

/* GET users listing. */
router.get('/', function(req, res, next) {
  place.find().sort('placeid').exec(function(err, places) {
    if (err) {
      return next(err);
    }
    res.send(places);
  });
});

module.exports = router;
