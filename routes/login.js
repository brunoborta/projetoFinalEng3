var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('login', {
        css: '<link rel="stylesheet" type="text/css" href="/stylesheets/login.css">'
    });
});

module.exports = router;
