var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

//User Schema
var UserSchema = mongoose.Schema({
	nome: {
		type: String,
		index: true
	},
	cpf: {
		type: Number
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
	typeUser: {
		type: String,
		default: 'paciente'
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
}
