const mongoose = require('mongoose');
const Schema = mongoose.Schema;

scriptSchema = new Schema( {
	unique_id: Number,
	name: String,
	script: Array,
	status: String,
	createdAt: {
		type: Date,
		default: Date.now
	}
});
Script = mongoose.model('Script', scriptSchema);

module.exports = Script;