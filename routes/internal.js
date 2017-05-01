var express = require('express');
var router = express.Router();

/* GET internal patient. */
router.get('/patient', ensureAuthenticated, function(req, res) {
	if(req.user.typeUser === 'paciente') {
		res.render('patient');
	} else {
		res.redirect('/internal/medic/');
	}
});

/* GET internal patient. */
router.get('/medic', ensureAuthenticated, function(req, res) {
	if(req.user.typeUser === 'medico') {
		res.render('medic');
	} else {
		res.redirect('/internal/patient/');
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
