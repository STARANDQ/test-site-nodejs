const mongoose = require('mongoose');
const Schema = mongoose.Schema;

userSchema = new Schema( {
	unique_id: Number,
	name: String,
	surname: String,
	patronymic: String,
	role: String,
	password: String,
	username: String,
	createdAt: {
		type: Date,
		default: Date.now
	}
});
User = mongoose.model('User', userSchema);

module.exports = User;