var express = require('express');
var router = express.Router();

/* GET users login. */
router.get('/login', function(req, res, next) {
    res.render('login', {
        css: '<link rel="stylesheet" type="text/css" href="/stylesheets/login.css">'
    });
});

/* GET users register */
router.get('/register', function(req, res, next) {
	res.render('register', {
		css: '<link rel="stylesheet" type="text/css" href="/stylesheets/register.css">'
	});
});

module.exports = router;
