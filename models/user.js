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
	User.findOne({'_id': mongoose.Types.ObjectId(id)}, 'medicOptions appointments', function(err, docs) {
		if(err) throw err;
		callback(null, docs);
	});
};
