var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './public/images/avatar'})

var User = require('../models/user');

/* GET internal patient. */
router.get('/patient/appointments', ensureAuthenticated, isPatient, function(req, res) {
	User.getAppointments(req.user._id, function(err, docs) {
		if(err) throw err;
		var appointments = [];
		for(var i = 0; i < docs.appointments.length; i++) {
			var data = docs.appointments[i].date;
			appointments.push({
				id: docs.appointments[i]._id,
				nome: docs.appointments[i].nome,
				data: data.getBrazilianDateFormat(),
				hora: data.getFormattedTime(),
				dataTempo: data.getTime()
			});
		}
		// The modal was inserted inside the layout because
		//it should be outside the .wrapper div, which's
		//inside the layout
		res.render('patient-appointments', {
			layout: 'layout-patient.hbs',
			title: 'Consultas',
			js: '<script src="/javascripts/appointments-handler.js" type="text/javascript"></script>' +
			'<script src="/javascripts/jquery.validate.min.js" type="text/javascript"></script>',
			appointmentsBlock: true,
			appointments: appointments,
			modal: true,
			footer: true
		});
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
		User.findOneAndUpdate({'_id': req.user.id}, {$set: updates}, function(err) {
			if(err) throw err;
			req.flash('success_msg', 'Seu perfil foi atualizado!');
			res.redirect('/internal/patient/profile');
		});
	}
});


/* AJAX */

router.post('/ajax/medicsAvailable', ensureAuthenticated, isPatient, function(req, res) {
	var speciality = req.body.speciality;
	User.getMedicsBySpeciality(speciality, function(err, medics) {
		if(err) throw err;
		res.end(JSON.stringify(medics));
	});
});

router.post('/ajax/daysAvailable', ensureAuthenticated, isPatient, function(req, res) {
	var id = req.body.idMedico;
	User.getWorkingDays(id, function(err, docs) {
		if(err) throw err;
		res.end(JSON.stringify(docs));
	});
});

router.post('/ajax/hoursAvailable', ensureAuthenticated, isPatient, function(req, res) {
	var id = req.body.idMedico;
	var date = req.body.date;
	User.getWorkingHoursAvailable(id, date, function(err, docs) {
		if(err) throw err;
		var medicOptions = docs.medicOptions;
		var appointments = docs.appointments;
		var showingDates = getWorkingHours(medicOptions, appointments, date);
		res.end(JSON.stringify(showingDates));
	});
});

router.post('/ajax/setAppointment', ensureAuthenticated, isPatient, function(req, res) {
	var idMedic = req.body.idMedico;
	var date = new Date();
	date.setTime(req.body.date);
	User.setNewAppointment(idMedic, req.user, date, function(err, Medic) {
		if(err) throw err;
		var ajaxReturn = {
			id: Medic._id,
			nome: Medic.nome,
			data: date
		};
		res.end(JSON.stringify(ajaxReturn));
	});
});

router.post('/ajax/cancelAppointment', ensureAuthenticated, isPatient, function(req, res) {
	var idMedic = req.body.idMedico;
	var date = new Date();
	date.setTime(req.body.dateTime);
	User.removeAppointment(idMedic, req.user, date, function(err) {
		if(err) throw err;
		res.end(JSON.stringify(true));
	});
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

/* Prepare the hours to exhibit in the Hora field */
function getWorkingHours(medicOptions, appointments, date) {
	// A generic date is used to make the calculations
	//The starting date will iterate until find the leaving hour 
	var dateAux = new Date(date);
	dateAux.setUTCHours(medicOptions.workingHourStart);
	dateAux.setUTCMinutes(medicOptions.workingMinutesStart);
	var dateEnd = new Date(date);
	dateEnd.setUTCHours(medicOptions.workingHourEnd);
	dateEnd.setUTCMinutes(medicOptions.workingMinutesEnd);
	var showingDates = [];
	
	while(dateAux.getTime() !== dateEnd.getTime()) {
		var flagCanPush = true;
		if(appointments.length > 0) {
			for(var i = 0; i < appointments.length; i++) {
				if(dateAux.getTime() === appointments[i].date.getTime()) {
					//pop the date from the appointment array for performance purposes 
					appointments.splice(i,1);
					flagCanPush = false;
				}
			}
		}
		if(flagCanPush === true) {
			showingDates.push(new Date(dateAux));
		}
		dateAux.setUTCMinutes(dateAux.getMinutes() + 30);
	}
	return showingDates;
	// console.log(appointments.length);
	// while(dateAux.getTime() !== dateEnd.getTime()) {
	// 	if(appointments.length > 0) {
	//		
	// 	}
	// 	showingDates.push(new Date(dateAux));
	// 	dateAux.setUTCMinutes(dateAux.getMinutes() + 30);
	// }
}

/* New methods for the Date object */

Date.prototype.getBrazilianDateFormat = function() {
	var dat = new Date(this.valueOf());
	// string containing brazilian date (dd/mm/yyyy)
	return ('0' + dat.getDate()).slice(-2) + '/' +
		('0' + (dat.getMonth() + 1)).slice(-2) + '/' +
		dat.getFullYear();
};

Date.prototype.getFormattedTime = function() {
	var dat = new Date(this.valueOf());
	// string containing time formatted HH:MM
	return dat.getUTCHours() + ':' + ('0' + dat.getUTCMinutes()).slice(-2);
};

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
