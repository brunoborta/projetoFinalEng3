var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './public/images/avatar'})

var User = require('../models/user');

/* GET internal patient. */
router.get('/patient/appointments', ensureAuthenticated, isPatient, function(req, res) {
	// The modal was inserted inside the layout because
	//it should be outside the .wrapper div, which's
	//inside the layout
	res.render('patient-appointments', {
		layout: 'layout-patient.hbs',
		title: 'Consultas',
		appointments: true,
		modal: true,
		footer: true
	});
});

router.get('/patient/maps', ensureAuthenticated, isPatient, function(req, res) {
	res.render('patient-maps', {
		layout: 'layout-patient.hbs',
		title: 'A Clinica',
		maps: true,
		js: '<script src="/javascripts/maps.js" type="text/javascript"></script>' +
			'<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&callback=initGoogleMaps"></script>',
			
	});
});

router.get('/patient/profile', ensureAuthenticated, isPatient, function(req, res) {
	var User = req.user;
	res.render('patient-profile', {
		layout: 'layout-patient.hbs',
		title: 'Perfil',
		user: User,
		js: '<script src="/javascripts/jquery.mask.min.js"></script>' +
			'<script src="/javascripts/mask.js" type="text/javascript"></script>',
		footer: true
	});
});

/* POST user profile */
router.post('/patient/profile', ensureAuthenticated, isPatient, upload.single('avatar'), function(req, res) {
	// Always set the avatar image, no matter where it comes from
	var avatar = {};
	(req.file === null || req.file === undefined) 
		? avatar = req.user.avatar
		: avatar = req.file;
	
	var updates = {
		login: req.user.login, // Take the login from the session user
		nome: req.body.nome,
		cpf: req.body.cpf.replace(/\D/g,''), // Strip characters
		telefone: req.body.telefone.replace(/\D/g,''),
		endereco: req.body.endereco,
		email: req.body.email,
		bio: req.body.bio,
		avatar: avatar
	};
	// Validation (Express Validator)
	req.checkBody('nome', 'Nome é um campo obrigatório!').notEmpty();
	req.checkBody('cpf', 'CPF é um campo obrigatório!').notEmpty();
	req.checkBody('telefone', 'Telefone é um campo obrigatório!').notEmpty();
	req.checkBody('endereco', 'Endereço é um campo obrigatório!').notEmpty();
	req.checkBody('email', 'Email é um campo obrigatório!').notEmpty();
	req.checkBody('email', 'Email é inválido!').isEmail();
	req.checkBody('email', 'Email é um campo obrigatório!').notEmpty();
	
	//Errors array
	var errors = req.validationErrors();
	
	//If there's some errors, go back to the profile form
	if(errors) {
		res.render('patient-profile', {
			layout: 'layout-patient.hbs',
			title: 'Perfil',
			user: updates,
			errors: errors,
			js: '<script src="/javascripts/jquery.mask.min.js"></script>' +
				'<script src="/javascripts/mask.js" type="text/javascript"></script>',
			footer: true
		});
	} else { // If not, It will update
		User.findOneAndUpdate({'_id': req.user.id}, updates, function(err) {
			if(err) throw err;
			req.flash('success_msg', 'Seu perfil foi atualizado!');
			res.redirect('/internal/patient/profile');
		});
	}
});



/* GET internal medic. */
router.get('/medic', ensureAuthenticated, isMedic, function(req, res) {
	res.render('medic');
});

router.get('/logout', function(req, res) {
	if(req.isAuthenticated()) {
		req.logout();
		req.flash('success_msg', 'Voce deslogou com sucesso!');
	}
	res.redirect('/users/login');
});


// Middlewares
function ensureAuthenticated(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	} else {
		req.flash('error_msg', 'Você deve se logar para acessar a área interna');
		res.redirect('/users/login');
	}
}

function isPatient(req, res, next) {
	if(req.user.typeUser === 'paciente') {
		return next();
	} else {
		req.flash('error_msg', 'Você deve se logar como paciente para acessar a área de pacientes!');
		res.redirect('/internal/medic/');
	}
}

function isMedic(req, res, next) {
	if(req.user.typeUser === 'medico') {
		return next();
	} else {
		req.flash('error_msg', 'Você deve se logar como médico para acessar a área de médicos!');
		res.redirect('/internal/patient/appointments');
	}
}

module.exports = router;
