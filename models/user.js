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
		name: String,
		date: Date
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
	medicOptions: [{
		cremers: Number,
		speciality: String
	}]
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
