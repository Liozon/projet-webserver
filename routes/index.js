var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'COMEM+ Web Development Express REST Projet Web Server' });
});

module.exports = router;
