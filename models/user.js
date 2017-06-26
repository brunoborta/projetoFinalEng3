var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

//User Schema
var UserSchema = mongoose.Schema({
	nome: {
		type: String,
		index: true
	},
	cpf: {
		type: String
	},
	telefone: {
		type: Number
	},
	endereco: {
		type: String
	},
	email: {
		type: String
	},
	login: {
		type: String
	},
	password:{
		type: String
	},
	bio: String,
	typeUser: {
		type: String,
		default: 'paciente'
	},
	appointments: [{
		_idUser: mongoose.Schema.Types.ObjectId,
		nome: String,
		date: Date,
		status: String
	}],
	avatar: {
		fieldname: String,
		originalname: String,
		encoding: String,
		mimetype: String,
		destination: String,
		filename: String,
		path: String,
		size: Number
	},
	medicOptions: {
		creme: Number,
		speciality: Number,
		workingDayStart: Number,
		workingDayEnd: Number,
		workingHourStart: Number,
		workingMinutesStart: Number,
		workingHourEnd: Number,
		workingMinutesEnd: Number
	}
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback) {
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(newUser.password, salt, function(err, hash) {
			newUser.password = hash;
			newUser.save(callback);
		});
	});
};

module.exports.getUserByLogin = function(login, callback) {
	var query = {login: login};
	User.findOne(query, callback);
};

module.exports.comparePasswords = function(password, hash, callback) {
	bcrypt.compare(password, hash, function(err, isMatch) {
		if(err) throw err;
		callback(null, isMatch);
	})
};

module.exports.getUserById = function(id, callback) {
	User.findById(id, callback);
};

module.exports.getMedicsBySpeciality = function(speciality, callback) {
	User.find({'medicOptions.speciality': speciality, "typeUser":"medico"}, 'nome', function(err, docs) {
		if(err) throw err;
		callback(null, docs);
	});
};

module.exports.getWorkingDays = function(id, callback) {
	User.findOne({'_id': mongoose.Types.ObjectId(id)}, 'medicOptions.workingDayStart medicOptions.workingDayEnd', function(err, docs) {
		if(err) throw err;
		callback(null, docs);
	});
};

module.exports.getWorkingHoursAvailable = function(id, date, callback) {
	// db.users.aggregate({$match : {"_id":ObjectId("592a4dff997e5e0f82546edf") }}, { $project : { appointments : { $filter: {input: "$appointments", as: "appointment", cond: { $and: [ { $gte : [ "$$appointment.date", new Date ('2017-06-26')] }, { $lt : [ "$$appointment.date", new Date ('2017-06-27') ] } ] } } } } } ).pretty();
	var chosenDate = new Date(date);
	var nextDay = new Date(date);
	nextDay.setDate(nextDay.getDate() + 1);
	User.aggregate([
		{
			$match: {
				'_id': mongoose.Types.ObjectId(id)
			}
		},
		{ 
			$project: { 
				medicOptions: 1,
				appointments: {
					$filter: {
						input: "$appointments",
						as: "appointment",
						cond: {
							$and: [ 
								{ $gte : [ "$$appointment.date", chosenDate] },
								{ $lt : [ "$$appointment.date", nextDay ] }
							] 
						} 
					} 
				} 
			} 
		}
	], function(err, docs) {
		if(err) throw err;
		callback(null, docs[0]);
	});
};

module.exports.setNewAppointment = function(idMedic, patient, date, callback) {
	var dateAppointment = new Date();
	dateAppointment.setTime(date);
	// Find the medic and set the appointment for both
	User.findById(idMedic, function(err,Medic) {
		var appointmentPatient = {
			_id: Medic._id,
			nome: Medic.nome,
			date: dateAppointment,
			status: 'Confirmada'
		};
		var appointmentMedic = {
			_id: patient._id,
			nome: patient.nome,
			date: dateAppointment,
			status: 'Confirmada'
		};
		User.findOneAndUpdate({'_id': mongoose.Types.ObjectId(patient._id)}, {$push: {"appointments":appointmentPatient}}, function(err) {
			if(err) throw err;
			User.findOneAndUpdate({'_id': mongoose.Types.ObjectId(Medic._id)}, {$push: {"appointments": appointmentMedic}}, function(err) {
				callback(null, Medic);
			});
		});
	});
};
