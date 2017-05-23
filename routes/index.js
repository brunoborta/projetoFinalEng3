var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
	  css: '<link rel="stylesheet" type="text/css" href="/stylesheets/style.css">',
      js: '<script type="text/javascript" src="/javascripts/index.js"></script>'
  });
});

module.exports = router;
