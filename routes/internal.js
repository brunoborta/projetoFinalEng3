var express = require('express');
var router = express.Router();

/* GET internal patient. */
router.get('/patient/appointments', ensureAuthenticated, function(req, res) {
	if(req.user.typeUser === 'paciente') {
		res.render('patient-appointments', {
			css: '<link href="/stylesheets/material-dashboard.css" rel="stylesheet"/>',
			js: '<script src="/javascripts/material.min.js" type="text/javascript"></script>' +
				'<script src="/javascripts/material-dashboard.js" type="text/javascript"></script>'
		});
	} else {
		res.redirect('/internal/medic/');
	}
});

router.get('/patient/maps', ensureAuthenticated, function(req, res) {
	if(req.user.typeUser === 'paciente') {
		res.render('patient-maps', {
			css: '<link href="/stylesheets/material-dashboard.css" rel="stylesheet"/>',
			js: '<script src="/javascripts/material.min.js" type="text/javascript"></script>' +
				'<script src="/javascripts/material-dashboard.js" type="text/javascript"></script>' +
				'<script src="/javascripts/maps.js" type="text/javascript"></script>' +
				'<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&callback=initGoogleMaps"></script>'
				
		});
	} else {
		res.redirect('/internal/medic/');
	}
});

/* GET internal patient. */
router.get('/medic', ensureAuthenticated, function(req, res) {
	if(req.user.typeUser === 'medico') {
		res.render('medic');
	} else {
		res.redirect('/internal/patient/appointments');
	}
});

router.get('/logout', function(req, res) {
	if(req.isAuthenticated()) {
		req.logout();
		req.flash('success_msg', 'Voce deslogou com sucesso!');
	}
	res.redirect('/users/login');
});

function ensureAuthenticated(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	} else {
		req.flash('error_msg', 'Você deve se logar para acessar a área interna');
		res.redirect('/users/login');
	}
}

module.exports = router;
