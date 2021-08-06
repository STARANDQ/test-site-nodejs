const mongoose = require('mongoose');
const Schema = mongoose.Schema;

fileDataSchema = new Schema( {
	unique_id: Number,
	fileName: String,
	fileNameUploads: String,
	fileScript: Array,
	fileStatus: String,
	userName: String,
	updateDate: String,
	createdAt: {
		type: Date,
		default: Date.now
	}
});
FileData = mongoose.model('FileData', fileDataSchema);

module.exports = FileData;