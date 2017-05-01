var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

/* GET users login. */
router.get('/login', function(req, res) {
	if(req.isAuthenticated() && req.user.typeUser === 'paciente') {
		res.redirect('/internal/patient');
	} else if(req.isAuthenticated() && req.user.typeUser === 'medico') {
		res.redirect('/internal/medic');
	} else {
		res.render('login', {
			css: '<link rel="stylesheet" type="text/css" href="/stylesheets/login.css">'
		});
	}
});

/* GET users register */
router.get('/register', function(req, res) {
	if(req.isAuthenticated() && req.user.typeUser === 'paciente') {
		res.redirect('/internal/patient');
	} else if(req.isAuthenticated() && req.user.typeUser === 'medico') {
		res.redirect('/internal/medico');
	} else {
		res.render('register', {
			css: '<link rel="stylesheet" type="text/css" href="/stylesheets/register.css">',
			js: '<script src="/javascripts/jquery.mask.min.js"></script>' +
				'<script src="/javascripts/mask.js"></script>'
		});
	}
});

/* POST user registration */
router.post('/register', function(req, res, next) {
	var nome = req.body.nome;
	var cpf = req.body.cpf;
	var telefone = req.body.telefone;
	var endereco = req.body.endereco;
	var email = req.body.email;
	var login = req.body.login;
	var password = req.body.password;
	
	// Validation (Express Validator)
	req.checkBody('nome', 'Nome é um campo obrigatório!').notEmpty();
	req.checkBody('cpf', 'CPF é um campo obrigatório!').notEmpty();
	req.checkBody('telefone', 'Telefone é um campo obrigatório!').notEmpty();
	req.checkBody('endereco', 'Endereço é um campo obrigatório!').notEmpty();
	req.checkBody('email', 'Email é um campo obrigatório!').notEmpty();
	req.checkBody('email', 'Email é inválido!').isEmail();
	req.checkBody('login', 'Login é um campo obrigatório!').notEmpty();
	req.checkBody('password', 'Senha é um campo obrigatório!').notEmpty();
	req.checkBody('password2', 'Os campos de senha estao diferentes!').equals(req.body.password);
	
	//Errors array
	var errors = req.validationErrors();
	
	//If there's some errors, it'll be spit out on the register form
	if(errors) {
		res.render('register', {
			css: '<link rel="stylesheet" type="text/css" href="/stylesheets/register.css">',
			js: '<script src="/javascripts/jquery.mask.min.js"></script>' +
			'<script src="/javascripts/mask.js"></script>',
			errors: errors,
			// Send back the fields already filled
			nome: nome,
			cpf: cpf,
			telefone: telefone,
			endereco: endereco,
			email: email,
			login: login
		});
	} else {
		var newUser = new User({
			nome: nome,
			cpf: cpf.replace(/\D/g,''), // Strip characters
			telefone: telefone.replace(/\D/g,''),
			endereco: endereco,
			email: email,
			login: login,
			password: password
		});
		
		User.createUser(newUser, function(err, user) {
			if(err) throw err;
		});
		
		req.flash('success_msg', 'Você foi registrado com sucesso e agora pode se logar!');
		res.redirect('/users/login');
	}
});

passport.use(new LocalStrategy({
		usernameField: 'login',
	},
	function(login, password, done) {
		User.getUserByLogin(login, function(err, user) {
			if(err) throw err;
			if(!user) {
				return done(null, false, {message: 'Usuário inválido'});
			}
			User.comparePasswords(password, user.password, function(err, isMatch) {
				if(err) throw err;
				if(isMatch) {
					return done(null, user);
				} else {
					return done(null, false, {message: 'Senha inválida'});
				}
			});
		});
	}
));

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

/* POST user login - passport */
router.post('/login',
	passport.authenticate('local', {failureRedirect: '/users/login', 
									failureFlash: true}),
	function(req, res) {
		if(req.user.typeUser === 'medico') {
			res.redirect('/internal/medic');
		} else {
			res.redirect('/internal/patient');
		}
	}
);
module.exports = router;
